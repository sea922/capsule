#!/usr/bin/env python3
"""Report selected literal and Markdown-structure drift between prose files."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path


FRONTMATTER_RE = re.compile(r"\A---[ \t]*\n.*?^---[ \t]*$", re.MULTILINE | re.DOTALL)
FENCE_OPEN_RE = re.compile(
    r"^[ \t]{0,3}(?P<fence>`{3,}|~{3,})[^\n]*(?:\n|$)", re.MULTILINE
)
BLOCKQUOTE_RE = re.compile(r"^(?:>[ \t]?.*(?:\n|$))+", re.MULTILINE)
INLINE_CODE_RE = re.compile(r"(?<!`)(`+)(?!`)[^\n]+?(?<!`)\1(?!`)")
LINK_START_RE = re.compile(r"!?\[[^\]\n]*\]\(")
REFERENCE_LINK_RE = re.compile(
    r"""^[ \t]{0,3}\[[^\]\n]+\]:[ \t]*
    (?:<(?P<angle>[^>\n]+)>|(?P<plain>\S+))
    (?:[ \t]+(?:"[^"\n]*"|'[^'\n]*'|\([^\n)]*\)))?[ \t]*$""",
    re.MULTILINE | re.VERBOSE,
)
BARE_URL_RE = re.compile(r"https?://[^\s<>\]]*[A-Za-z0-9/#]")
PATH_RE = re.compile(
    r"(?<![\w@])(?:"
    r"(?:[A-Za-z]:\\|\\\\[^\\\s]+\\[^\\\s]+\\|/|\./|\.\./)"
    r"(?:[\w.@+-]+[\\/])*[\w.@+-]+"
    r"|(?:[\w.@+-]+[\\/])+[\w.@+-]+\.[A-Za-z0-9]{1,10}"
    r")(?!\w)"
)
HASH_RE = re.compile(
    r"\b(?:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
    r"|(?=[0-9a-fA-F]*\d)[0-9a-fA-F]{7,64})\b"
)
MONTH = (
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
    r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|"
    r"Dec(?:ember)?)"
)
DATE_RE = re.compile(
    rf"\b(?:\d{{4}}-\d{{2}}-\d{{2}}|{MONTH}\.?[ \t]+\d{{1,2}}"
    rf"(?:,[ \t]*\d{{4}})?|\d{{1,2}}[ \t]+{MONTH}\.?(?:[ \t]+\d{{4}})?)\b",
    re.IGNORECASE,
)
TIME_RE = re.compile(
    r"\b(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?"
    r"(?:[ \t]*(?:UTC|GMT|[APap]\.?[Mm]\.?)\b)?"
)
VERSION_RE = re.compile(
    r"\bv?\d+(?:\.\d+){2,}(?:[-+][0-9A-Za-z.-]+)?\b", re.IGNORECASE
)
NUMBER_RE = re.compile(
    r"(?<![\w.])(?:[$€£]|R[ \t]*)?[+\-−]?(?:\d[\d,]*(?:\.\d+)?|\.\d+)"
    r"(?:%|[A-Za-z]{1,4})?(?![\w.-])"
)
HEADING_RE = re.compile(r"^#{1,6}[ \t]+\S.*$", re.MULTILINE)
TABLE_ROW_RE = re.compile(r"^[ \t]*\|.*\|[ \t]*$", re.MULTILINE)


@dataclass(frozen=True)
class Finding:
    category: str
    change: str
    value: str
    fingerprint: str
    before_count: int
    after_count: int


def _normalise(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def _preview(value: str, limit: int = 120) -> str:
    compact = re.sub(r"\s+", " ", value).strip()
    return compact if len(compact) <= limit else compact[: limit - 1] + "…"


def _fingerprint(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:12]


def _mask(text: str, pattern: re.Pattern[str]) -> tuple[str, list[re.Match[str]]]:
    matches = list(pattern.finditer(text))
    if not matches:
        return text, []
    chars = list(text)
    for match in matches:
        for index in range(match.start(), match.end()):
            if chars[index] != "\n":
                chars[index] = " "
    return "".join(chars), matches


def _mask_spans(text: str, spans: list[tuple[int, int]]) -> str:
    chars = list(text)
    for start, end in spans:
        for index in range(start, end):
            if chars[index] != "\n":
                chars[index] = " "
    return "".join(chars)


def _fenced_spans(text: str) -> list[tuple[int, int]]:
    spans: list[tuple[int, int]] = []
    position = 0
    while opener := FENCE_OPEN_RE.search(text, position):
        fence = opener.group("fence")
        closer_re = re.compile(
            rf"^[ \t]{{0,3}}{re.escape(fence[0])}{{{len(fence)},}}[ \t]*(?:\n|$)",
            re.MULTILINE,
        )
        closer = closer_re.search(text, opener.end())
        end = closer.end() if closer else len(text)
        spans.append((opener.start(), end))
        position = end
    return spans


def _link_target_spans(text: str) -> list[tuple[int, int, str]]:
    spans: list[tuple[int, int, str]] = []

    for match in LINK_START_RE.finditer(text):
        start = match.end()
        while start < len(text) and text[start] in " \t":
            start += 1
        if start >= len(text):
            continue

        if text[start] == "<":
            end = text.find(">", start + 1)
            if end != -1:
                spans.append((start + 1, end, text[start + 1 : end]))
            continue

        depth = 0
        index = start
        while index < len(text):
            char = text[index]
            if char == "\\" and index + 1 < len(text):
                index += 2
                continue
            if char == "(":
                depth += 1
            elif char == ")":
                if depth == 0:
                    break
                depth -= 1
            elif char.isspace() and depth == 0:
                break
            index += 1
        if index > start:
            spans.append((start, index, text[start:index]))

    for match in REFERENCE_LINK_RE.finditer(text):
        group = "angle" if match.group("angle") is not None else "plain"
        start, end = match.span(group)
        spans.append((start, end, match.group(group)))

    return spans


def _count_unescaped_pipes(row: str) -> int:
    count = 0
    for index, char in enumerate(row):
        if char != "|":
            continue
        backslashes = 0
        cursor = index - 1
        while cursor >= 0 and row[cursor] == "\\":
            backslashes += 1
            cursor -= 1
        if backslashes % 2 == 0:
            count += 1
    return count


def _table_shapes(text: str) -> list[str]:
    rows = TABLE_ROW_RE.findall(text)
    if not rows:
        return []

    groups: list[list[int]] = []
    current: list[int] = []
    previous_end = -2
    for match in TABLE_ROW_RE.finditer(text):
        line_start = text.count("\n", 0, match.start())
        if line_start != previous_end + 1 and current:
            groups.append(current)
            current = []
        current.append(max(0, _count_unescaped_pipes(match.group(0)) - 1))
        previous_end = line_start
    if current:
        groups.append(current)
    return [f"rows={len(group)}; columns={','.join(map(str, group))}" for group in groups]


def inventory(text: str) -> dict[str, Counter[str]]:
    text = _normalise(text)
    masked = text
    values: dict[str, list[str]] = {}

    masked, matches = _mask(masked, FRONTMATTER_RE)
    values["frontmatter"] = [text[match.start() : match.end()] for match in matches]

    fenced_spans = _fenced_spans(masked)
    values["fenced-code"] = [text[start:end] for start, end in fenced_spans]
    masked = _mask_spans(masked, fenced_spans)

    for category, pattern in (
        ("blockquote", BLOCKQUOTE_RE),
        ("inline-code", INLINE_CODE_RE),
    ):
        masked, matches = _mask(masked, pattern)
        values[category] = [text[match.start() : match.end()] for match in matches]

    link_targets = _link_target_spans(masked)
    values["link-target"] = [value for _, _, value in link_targets]
    masked = _mask_spans(masked, [(start, end) for start, end, _ in link_targets])

    for category, pattern in (
        ("bare-url", BARE_URL_RE),
        ("path", PATH_RE),
        ("hash-or-id", HASH_RE),
        ("date", DATE_RE),
        ("time", TIME_RE),
        ("version", VERSION_RE),
        ("number", NUMBER_RE),
    ):
        masked, matches = _mask(masked, pattern)
        values[category] = [match.group(0) for match in matches]

    values["heading"] = HEADING_RE.findall(masked)
    values["table-shape"] = _table_shapes(masked)
    return {category: Counter(items) for category, items in values.items()}


def compare(before: str, after: str, allowed: set[str] | None = None) -> list[Finding]:
    allowed = allowed or set()
    before_inventory = inventory(before)
    after_inventory = inventory(after)
    findings: list[Finding] = []

    for category in sorted(set(before_inventory) | set(after_inventory)):
        if category in allowed:
            continue
        old = before_inventory.get(category, Counter())
        new = after_inventory.get(category, Counter())
        for value in sorted(set(old) | set(new)):
            before_count = old[value]
            after_count = new[value]
            if before_count == after_count:
                continue
            findings.append(
                Finding(
                    category=category,
                    change="removed" if before_count > after_count else "added",
                    value=_preview(value),
                    fingerprint=_fingerprint(value),
                    before_count=before_count,
                    after_count=after_count,
                )
            )
    return findings


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Report selected protected literal and Markdown-structure drift."
    )
    parser.add_argument("before", type=Path, help="Original UTF-8 text file")
    parser.add_argument("after", type=Path, help="Revised UTF-8 text file")
    parser.add_argument(
        "--allow-category",
        action="append",
        default=[],
        help="Ignore an intentional category change; may be repeated",
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    return parser.parse_args()


def main() -> int:
    args = _parse_args()
    try:
        before = args.before.read_text(encoding="utf-8")
        after = args.after.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    findings = compare(before, after, set(args.allow_category))
    if args.json:
        print(json.dumps({"ok": not findings, "findings": [asdict(item) for item in findings]}, indent=2))
    elif findings:
        print(f"preservation check: {len(findings)} change(s) need review")
        for item in findings:
            print(
                f"- {item.category}: {item.change} {item.value!r} "
                f"({item.before_count} -> {item.after_count}, {item.fingerprint})"
            )
    else:
        print("preservation check: no protected literal or structure drift found")
    return 1 if findings else 0


if __name__ == "__main__":
    raise SystemExit(main())
