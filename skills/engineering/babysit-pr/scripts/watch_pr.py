"""Read-only GitHub PR / GitLab MR change detector. No third-party Python dependencies."""

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
from urllib.parse import quote


FIELDS = (
    "url,number,state,mergedAt,isDraft,headRefName,headRefOid,baseRefName,"
    "baseRefOid,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,"
    "autoMergeRequest"
)
MR_FIELDS = (
    "web_url", "iid", "state", "merged_at", "draft", "source_branch", "target_branch",
    "source_project_id", "target_project_id", "sha", "diff_refs", "detailed_merge_status",
    "has_conflicts", "blocking_discussions_resolved", "merge_when_pipeline_succeeds",
)
# Running jobs report live durations; keeping them would wake the watcher on every read.
JOB_FIELDS = ("id", "name", "stage", "status", "allow_failure", "failure_reason", "web_url")
APPROVAL_FIELDS = ("approved", "approvals_required", "approvals_left", "approved_by")
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


def glab(host, endpoint, paginate=False):
    command = ["glab", "api", "--hostname", host, endpoint]
    if paginate:
        command.append("--paginate")
    result = subprocess.run(
        command, capture_output=True, text=True, encoding="utf-8", timeout=90, check=False,
    )
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or "GitLab CLI request failed")
    return json.loads(result.stdout)


def pick(item, fields):
    return {field: item.get(field) for field in fields}


def snapshot(host, repo, number, forge="github"):
    if forge == "gitlab":
        return gitlab_snapshot(host, repo, number)
    return github_snapshot(host, repo, number)


def github_snapshot(host, repo, number):
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


def gitlab_snapshot(host, repo, number):
    merge_request = f"projects/{quote(repo, safe='')}/merge_requests/{number}"

    def view():
        found = glab(host, merge_request)
        pipeline = found.get("head_pipeline")
        return {**pick(found, MR_FIELDS), "head_pipeline":
                pick(pipeline, ("id", "project_id", "sha", "status")) if pipeline else None}

    before = view()
    if before["state"] in ("merged", "closed"):
        return {"pr": before}
    discussions = glab(host, f"{merge_request}/discussions?per_page=100", paginate=True)
    if not isinstance(discussions, list):
        raise RuntimeError("Unexpected discussions pagination response")
    threads = []
    for discussion in discussions:
        notes = [note for note in discussion.get("notes", []) if not note.get("system")]
        if notes:
            threads.append({**discussion, "notes": notes})
    approvals = pick(glab(host, f"{merge_request}/approvals"), APPROVAL_FIELDS)
    jobs = []
    pipeline = before["head_pipeline"]
    if pipeline:
        listed = glab(host, f"projects/{pipeline['project_id']}/pipelines/{pipeline['id']}"
                            "/jobs?per_page=100", paginate=True)
        if not isinstance(listed, list):
            raise RuntimeError("Unexpected jobs pagination response")
        jobs = [pick(job, JOB_FIELDS) for job in listed]
    after = view()
    moved = any(before[key] != after[key]
                for key in ("sha", "diff_refs", "source_branch", "target_branch"))
    if moved or (pipeline or {}).get("id") != (after["head_pipeline"] or {}).get("id"):
        raise RuntimeError("MR head/base moved during collection; take a fresh snapshot")
    return {"pr": after, "discussions": threads, "approvals": approvals, "jobs": jobs}


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


def watch(host, repo, number, path, interval, timeout, once=False, forge="github"):
    target = f"{host}/{repo}/{number}"
    previous = None
    if path.exists():
        previous = json.loads(path.read_text(encoding="utf-8"))
        if previous.get("target") != target:
            raise RuntimeError("Observation file belongs to another PR; use a separate path")
    deadline = time.monotonic() + timeout
    while True:
        current = snapshot(host, repo, number, forge)
        fingerprint = digest(current)
        terminal = current["pr"]["state"].upper() in ("MERGED", "CLOSED")
        changed = previous is None or previous.get("digest") != fingerprint
        if terminal or changed or once or time.monotonic() >= deadline:
            reason = "terminal" if terminal else "changed" if changed else "unchanged"
            result = {"target": target, "reason": reason, "digest": fingerprint,
                      "observed_at": time.time(), "snapshot": current}
            save(path, result)
            return result
        time.sleep(min(interval, max(0, deadline - time.monotonic())))


def detect_forge(host):
    host = host.lower()
    if host == "github.com" or host.endswith(".ghe.com") or "github" in host:
        return "github"
    return "gitlab"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--forge", choices=("github", "gitlab"),
                        help="Default: github for github.com, *.ghe.com and hosts naming github; "
                             "otherwise gitlab")
    parser.add_argument("--host", default="github.com")
    parser.add_argument("--repo", required=True,
                        help="Base repository: owner/name, or a GitLab group/subgroup/project path")
    parser.add_argument("--pr", "--mr", dest="pr", type=int, required=True,
                        help="PR number or MR IID")
    parser.add_argument("--state", type=Path, required=True, help="Private observation JSON path")
    parser.add_argument("--interval", type=float, default=30, help="Seconds between reads")
    parser.add_argument("--timeout", type=float, default=300, help="Seconds before periodic wake")
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args()
    forge = args.forge or detect_forge(args.host)
    repo_pattern = r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+" + ("(/[A-Za-z0-9_.-]+)*" if forge == "gitlab" else "")
    if (not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9.-]*", args.host)
            or not re.fullmatch(repo_pattern, args.repo)
            or args.pr <= 0 or not 1 <= args.interval <= 3600
            or not 1 <= args.timeout <= 3600):
        parser.error("Use a hostname, repository path, positive PR/MR, and 1-3600 second intervals")
    try:
        print(json.dumps(watch(args.host, args.repo, args.pr, args.state,
                               args.interval, args.timeout, args.once, forge), ensure_ascii=False))
    except (OSError, ValueError, KeyError, TypeError, RuntimeError, subprocess.TimeoutExpired) as exc:
        print(json.dumps({"error": str(exc), "monitoring": "stopped"}), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
