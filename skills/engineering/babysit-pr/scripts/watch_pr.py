"""Read-only GitHub PR change detector. No third-party Python dependencies."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time


FIELDS = (
    "url,number,state,mergedAt,isDraft,headRefName,headRefOid,baseRefName,"
    "baseRefOid,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,"
    "autoMergeRequest"
)
THREADS = """
query($owner:String!,$name:String!,$number:Int!,$endCursor:String) {
  repository(owner:$owner,name:$name) {
    pullRequest(number:$number) {
      reviewThreads(first:100,after:$endCursor) {
        nodes { id isResolved isOutdated
          comments(first:1) { nodes { databaseId } }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
}
"""


def gh(*args):
    result = subprocess.run(
        ["gh", *args], capture_output=True, text=True, encoding="utf-8",
        timeout=90, check=False,
    )
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or "GitHub CLI request failed")
    return json.loads(result.stdout)


def snapshot(host, repo, number):
    target = f"{host}/{repo}"

    def view():
        return gh("pr", "view", str(number), "--repo", target, "--json", FIELDS)

    before = view()
    if before["state"] in ("MERGED", "CLOSED"):
        return {"pr": before}
    feedback = {}
    for kind, endpoint in (
        ("comments", f"issues/{number}/comments"),
        ("inline_comments", f"pulls/{number}/comments"),
        ("reviews", f"pulls/{number}/reviews"),
    ):
        pages = gh("api", "--hostname", host, "--method", "GET",
                   f"repos/{repo}/{endpoint}?per_page=100", "--paginate", "--slurp")
        if not isinstance(pages, list) or any(not isinstance(p, list) for p in pages):
            raise RuntimeError(f"Unexpected {kind} pagination response")
        feedback[kind] = [item for page in pages for item in page]
    pending = {r.get("id") for r in feedback["reviews"] if r.get("state") == "PENDING"}
    feedback["reviews"] = [r for r in feedback["reviews"] if r.get("id") not in pending]
    feedback["inline_comments"] = [c for c in feedback["inline_comments"]
                                   if c.get("pull_request_review_id") not in pending]
    owner, name = repo.split("/")
    pages = gh("api", "graphql", "--hostname", host, "--paginate", "--slurp",
               "-f", f"query={THREADS}", "-f", f"owner={owner}",
               "-f", f"name={name}", "-F", f"number={number}")
    threads = []
    for page in pages:
        if page.get("errors"):
            raise RuntimeError("GraphQL returned incomplete thread data")
        connection = page["data"]["repository"]["pullRequest"]["reviewThreads"]
        threads.extend(connection["nodes"])
    if not pages or connection["pageInfo"]["hasNextPage"]:
        raise RuntimeError("Thread pagination incomplete")
    after = view()
    for key in ("headRefOid", "baseRefOid", "headRefName", "baseRefName"):
        if before[key] != after[key]:
            raise RuntimeError("PR head/base moved during collection; take a fresh snapshot")
    return {"pr": after, "feedback": feedback, "threads": threads}


def digest(value):
    raw = json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(dir=path.parent, prefix=".observation-")
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            json.dump(value, stream, ensure_ascii=False, indent=2)
            stream.write("\n")
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def watch(host, repo, number, path, interval, timeout, once=False):
    target = f"{host}/{repo}/{number}"
    previous = None
    if path.exists():
        previous = json.loads(path.read_text(encoding="utf-8"))
        if previous.get("target") != target:
            raise RuntimeError("Observation file belongs to another PR; use a separate path")
    deadline = time.monotonic() + timeout
    while True:
        current = snapshot(host, repo, number)
        fingerprint = digest(current)
        terminal = current["pr"]["state"] in ("MERGED", "CLOSED")
        changed = previous is None or previous.get("digest") != fingerprint
        if terminal or changed or once or time.monotonic() >= deadline:
            reason = "terminal" if terminal else "changed" if changed else "unchanged"
            result = {"target": target, "reason": reason, "digest": fingerprint,
                      "observed_at": time.time(), "snapshot": current}
            save(path, result)
            return result
        time.sleep(min(interval, max(0, deadline - time.monotonic())))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="github.com")
    parser.add_argument("--repo", required=True, help="Base repository: owner/name")
    parser.add_argument("--pr", type=int, required=True)
    parser.add_argument("--state", type=Path, required=True, help="Private observation JSON path")
    parser.add_argument("--interval", type=float, default=30, help="Seconds between reads")
    parser.add_argument("--timeout", type=float, default=300, help="Seconds before periodic wake")
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args()
    if (not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9.-]*", args.host)
            or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", args.repo)
            or args.pr <= 0 or not 1 <= args.interval <= 3600
            or not 1 <= args.timeout <= 3600):
        parser.error("Use a hostname, owner/repo, positive PR, and 1-3600 second intervals")
    try:
        print(json.dumps(watch(args.host, args.repo, args.pr, args.state,
                               args.interval, args.timeout, args.once), ensure_ascii=False))
    except (OSError, ValueError, KeyError, TypeError, RuntimeError, subprocess.TimeoutExpired) as exc:
        print(json.dumps({"error": str(exc), "monitoring": "stopped"}), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
