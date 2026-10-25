#!/usr/bin/env python3
"""Static quality checks for standalone HTML write-ups."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from dataclasses import asdict, dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


@dataclass
class Finding:
    severity: str
    code: str
    message: str


class DocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tags: Counter[str] = Counter()
        self.headings: list[int] = []
        self.ids: list[str] = []
        self.fragments: list[str] = []
        self.external_resource_urls: list[str] = []
        self.embedded_resource_text: list[str] = []
        self.images_without_alt = 0
        self.img_roles_without_name = 0
        self.table_count = 0
        self.scoped_headers = 0
        self.has_charset = False
        self.has_viewport = False
        self.html_lang = ""
        self._in_title = False
        self._in_resource_block = False
        self.title = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tags[tag] += 1
        values = {key.lower(): value or "" for key, value in attrs}
        if tag == "html":
            self.html_lang = values.get("lang", "").strip()
        if tag == "meta":
            self.has_charset |= bool(values.get("charset"))
            self.has_viewport |= values.get("name", "").lower() == "viewport"
        if tag == "title":
            self._in_title = True
        if re.fullmatch(r"h[1-6]", tag):
            self.headings.append(int(tag[1]))
        if values.get("id"):
            self.ids.append(values["id"])
        href = values.get("href", "")
        if href.startswith("#") and len(href) > 1:
            self.fragments.append(href[1:])
        resource_attributes = {
            "audio": ("src",),
            "embed": ("src",),
            "iframe": ("src",),
            "image": ("href",),
            "img": ("src", "srcset"),
            "input": ("src",),
            "link": ("href",),
            "object": ("data",),
            "script": ("src",),
            "source": ("src", "srcset"),
            "track": ("src",),
            "use": ("href",),
            "video": ("src", "poster"),
        }
        for attr in resource_attributes.get(tag, ()):
            for value in values.get(attr, "").split(","):
                url = value.strip().split()[0] if value.strip() else ""
                if url.startswith(("http://", "https://", "//")):
                    self.external_resource_urls.append(url)
        style = values.get("style", "")
        if style:
            self.embedded_resource_text.append(style)
        if tag == "style" or (tag == "script" and values.get("type", "").lower() == "importmap"):
            self._in_resource_block = True
        if tag == "img" and "alt" not in values:
            self.images_without_alt += 1
        if values.get("role") == "img" and not (values.get("aria-label") or values.get("aria-labelledby")):
            self.img_roles_without_name += 1
        if tag == "table":
            self.table_count += 1
        if tag == "th" and values.get("scope") in {"row", "col", "rowgroup", "colgroup"}:
            self.scoped_headers += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        if tag in {"style", "script"}:
            self._in_resource_block = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data
        if self._in_resource_block:
            self.embedded_resource_text.append(data)


def inspect(path: Path) -> list[Finding]:
    text = path.read_text(encoding="utf-8")
    parser = DocumentParser()
    parser.feed(text)
    findings: list[Finding] = []

    def add(severity: str, code: str, message: str) -> None:
        findings.append(Finding(severity, code, message))

    if not re.search(r"<!doctype\s+html", text, re.I):
        add("error", "doctype", "Add an HTML doctype.")
    if not parser.html_lang:
        add("error", "html-lang", "Set the document language on <html>.")
    if not parser.has_charset:
        add("error", "charset", "Add <meta charset>.")
    if not parser.has_viewport:
        add("error", "viewport", "Add a viewport meta tag.")
    if not parser.title.strip():
        add("error", "title", "Add a non-empty <title>.")
    if parser.tags["main"] != 1:
        add("error", "main", f"Expected one <main>; found {parser.tags['main']}.")
    if parser.tags["h1"] != 1:
        add("error", "h1", f"Expected one <h1>; found {parser.tags['h1']}.")

    for previous, current in zip(parser.headings, parser.headings[1:]):
        if current > previous + 1:
            add("error", "heading-order", f"Heading level jumps from h{previous} to h{current}.")
            break

    duplicate_ids = sorted(value for value, count in Counter(parser.ids).items() if count > 1)
    if duplicate_ids:
        add("error", "duplicate-id", f"Duplicate IDs: {', '.join(duplicate_ids)}.")
    missing_fragments = sorted(set(parser.fragments) - set(parser.ids))
    if missing_fragments:
        add("error", "broken-fragment", f"Internal links target missing IDs: {', '.join(missing_fragments)}.")
    if parser.images_without_alt:
        add("error", "image-alt", f"{parser.images_without_alt} image(s) have no alt attribute.")
    if parser.img_roles_without_name:
        add("error", "diagram-name", f"{parser.img_roles_without_name} role=img element(s) lack an accessible name.")
    if parser.table_count and not parser.scoped_headers:
        add("warning", "table-scope", "Tables are present but no <th> has a scope attribute.")

    placeholders = []
    for pattern, label in (
        (r"\{\{[^{}]+\}\}", "template braces"),
        (r"\bLorem ipsum\b", "Lorem ipsum"),
        (r"\[PLACEHOLDER\]", "placeholder marker"),
    ):
        if re.search(pattern, text, re.I):
            placeholders.append(label)
    if placeholders:
        add("error", "placeholder", f"Unresolved content: {', '.join(placeholders)}.")

    if not re.search(r"color-scheme|prefers-color-scheme", text, re.I):
        add("warning", "theme", "Declare a colour scheme or explicit theme handling.")
    if not re.search(r"@media\s+print", text, re.I):
        add("warning", "print", "Add print rules so the document remains complete on paper.")
    has_motion = bool(re.search(r"\b(animation|transition)\s*:", text, re.I))
    if has_motion and not re.search(r"prefers-reduced-motion", text, re.I):
        add("error", "reduced-motion", "Motion is present without a prefers-reduced-motion fallback.")

    urls = set(parser.external_resource_urls)
    embedded_text = "\n".join(parser.embedded_resource_text)
    urls.update(re.findall(r"(?:https?:)?//[^\s\"')<>]+", embedded_text))
    if urls:
        hosts = sorted({urlparse(url if not url.startswith("//") else f"https:{url}").netloc for url in urls})
        add("warning", "network", f"External requests make the file network-dependent: {', '.join(hosts)}.")
    if any("fonts." in url or "font" in urlparse(url).netloc for url in urls):
        add("error", "remote-font", "Use local system fonts instead of a remote font service.")

    return findings


def main() -> int:
    argp = argparse.ArgumentParser(description=__doc__)
    argp.add_argument("html", type=Path)
    argp.add_argument("--json", action="store_true")
    args = argp.parse_args()
    if not args.html.is_file():
        print(f"error: file not found: {args.html}", file=sys.stderr)
        return 2
    try:
        findings = inspect(args.html)
    except (OSError, UnicodeError) as exc:
        print(f"error: could not inspect {args.html}: {exc}", file=sys.stderr)
        return 2

    errors = sum(item.severity == "error" for item in findings)
    warnings = sum(item.severity == "warning" for item in findings)
    if args.json:
        print(
            json.dumps(
                {
                    "file": str(args.html.resolve()),
                    "errors": errors,
                    "warnings": warnings,
                    "findings": [asdict(item) for item in findings],
                },
                indent=2,
            )
        )
    else:
        for item in findings:
            print(f"{item.severity.upper():7} {item.code}: {item.message}")
        print(f"{args.html}: {errors} error(s), {warnings} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
