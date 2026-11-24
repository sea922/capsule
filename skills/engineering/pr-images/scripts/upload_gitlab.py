"""Upload the images a Markdown body references to a GitLab project and rewrite the references.

No third-party Python dependencies. Writes <body>.uploaded.md beside the body and never posts it.
"""

import argparse
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import quote


EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".mp4", ".mov", ".webm"}
MAX_BYTES = 100 * 1024 * 1024
HOST = re.compile(r"[a-z0-9][a-z0-9.-]*(?::\d{1,5})?")
SEGMENT = re.compile(r"[A-Za-z0-9_.][A-Za-z0-9_.-]*")
CODE = re.compile(r"(```.*?```|~~~.*?~~~|`[^`\n]*`)", re.S)
REFERENCE = re.compile(
    r"(?P<lead>!?\[[^\]\n]*\]\()(?P<path>\./[^)\s]+)(?P<tail>[^)\n]*\))"
    r"|(?P<html><img\b[^>]*?\bsrc=[\"'])(?P<html_path>\./[^\"'\s]+)"
    r"|(?P<definition>^\[[^\]\n]+\]:[ \t]*)(?P<definition_path>\./\S+)",
    re.M,
)


def check_target(host, repo):
    segments = repo.split("/")
    if not HOST.fullmatch(host):
        raise ValueError("The host must be a hostname, optionally with :port")
    if len(segments) < 2 or any(not SEGMENT.fullmatch(part) or set(part) == {"."} for part in segments):
        raise ValueError("The project must be group/project, nested groups allowed, without '.' or '..' segments")


def prose_spans(text):
    position = 0
    for code in CODE.finditer(text):
        yield False, text[position:code.start()]
        yield True, code.group(0)
        position = code.end()
    yield False, text[position:]


def referenced_paths(text):
    paths = []
    for is_code, span in prose_spans(text):
        if is_code:
            continue
        for match in REFERENCE.finditer(span):
            path = match.group("path") or match.group("html_path") or match.group("definition_path")
            if path not in paths:
                paths.append(path)
    return paths


def resolve_file(directory, path):
    name = path[2:]
    if "/" in name or "\\" in name or name in ("", ".", ".."):
        raise ValueError(f"{path}: reference images directly beside the body as ./name")
    file = directory / name
    if file.suffix.lower() not in EXTENSIONS:
        raise ValueError(f"{name}: not an image or video type GitLab renders")
    if not file.is_file():
        raise ValueError(f"{name}: no such file beside the body")
    if file.stat().st_size > MAX_BYTES:
        raise ValueError(f"{name}: larger than the {MAX_BYTES // (1024 * 1024)} MB limit")
    return file


def upload(host, repo, file):
    command = ["glab", "api", "--hostname", host, "--method", "POST",
               f"projects/{quote(repo, safe='')}/uploads", "--form", f"file=@{file}"]
    result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8",
                            timeout=300, check=False)
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or "GitLab upload failed")
    return json.loads(result.stdout)["url"]


def rewrite(text, urls):
    def replace(match):
        for prefix, key in (("lead", "path"), ("html", "html_path"), ("definition", "definition_path")):
            if match.group(key) and match.group(key) in urls:
                suffix = match.group("tail") if key == "path" else ""
                return match.group(prefix) + urls[match.group(key)] + suffix
        return match.group(0)
    return "".join(span if is_code else REFERENCE.sub(replace, span) for is_code, span in prose_spans(text))


def upload_body(host, repo, body):
    check_target(host, repo)
    text = body.read_text(encoding="utf-8")
    paths = referenced_paths(text)
    files = {path: resolve_file(body.parent, path) for path in paths}
    urls, failed = {}, []
    for path in paths:
        try:
            urls[path] = upload(host, repo, files[path])
        except (OSError, ValueError, KeyError, RuntimeError, subprocess.TimeoutExpired) as exc:
            failed.append({"file": files[path].name, "error": str(exc)})
            break
    output = body.with_name(f"{body.stem}.uploaded{body.suffix}")
    output.write_text(rewrite(text, urls), encoding="utf-8")
    done = len(urls) + len(failed)
    return {"body": str(output), "uploaded": [files[path].name for path in urls],
            "failed": failed, "not_attempted": [files[path].name for path in paths[done:]]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="gitlab.com", help="GitLab hostname[:port]")
    parser.add_argument("--repo", required=True, help="Project holding the MR or issue: group/subgroup/project")
    parser.add_argument("--body", type=Path, required=True, help="Markdown body referencing ./image files beside it")
    args = parser.parse_args()
    try:
        result = upload_body(args.host.lower(), args.repo, args.body)
    except (OSError, ValueError) as exc:
        print(json.dumps({"error": str(exc), "uploaded": []}), file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False))
    return 1 if result["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())
