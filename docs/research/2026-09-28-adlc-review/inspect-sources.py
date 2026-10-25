"""Read pinned preferred-source files; print bounded excerpts for review.

Metadata is saved in this research directory. Upstream files are not vendored.
Requires an authenticated gh CLI. No remote writes.
"""
import concurrent.futures
import json
from pathlib import Path
import re
import subprocess
import sys

SOURCES = {
    "mattpocock/skills": ["skills/engineering/to-spec/SKILL.md", "skills/engineering/wayfinder/SKILL.md"],
    "obra/superpowers": ["skills/brainstorming/SKILL.md", "skills/writing-plans/SKILL.md"],
    "addyosmani/agent-skills": ["skills/spec-driven-development/SKILL.md"],
    "cursor/plugins": ["pstack/skills/principle-never-block-on-the-human/SKILL.md", "pstack/skills/principle-prove-it-works/SKILL.md"],
    "DietrichGebert/ponytail": ["skills/ponytail-review/SKILL.md"],
    "mvanhorn/last30days-skill": ["README.md"],
    "anthropics/skills": ["skills/skill-creator/SKILL.md", "skills/doc-coauthoring/SKILL.md"],
    "trailofbits/skills": ["plugins/differential-review/skills/differential-review/SKILL.md", "plugins/property-based-testing/skills/property-based-testing/SKILL.md"],
    "EveryInc/compound-engineering-plugin": ["skills/ce-plan/SKILL.md", "skills/ce-compound-refresh/SKILL.md"],
    "garrytan/gstack": ["spec/SKILL.md.tmpl", "autoplan/SKILL.md.tmpl"],
    "affaan-m/ECC": ["skills/intent-driven-development/SKILL.md", "skills/operator-approval-loop/SKILL.md", "skills/delivery-gate/SKILL.md"],
    "wshobson/agents": ["plugins/conductor/skills/workflow-patterns/SKILL.md"],
    "nahid-sparktales/agent-dispatcher": ["skills/agent-dispatcher/VERIFICATION.md", "skills/agent-dispatcher/CONTROLS.md"],
}

def api(path, raw=False):
    args = ["gh", "api", path]
    if raw:
        args += ["-H", "Accept: application/vnd.github.raw+json"]
    result = subprocess.run(args, capture_output=True, encoding="utf-8", timeout=60)
    if result.returncode:
        raise RuntimeError(result.stderr.strip())
    return result.stdout if raw else json.loads(result.stdout)

def inspect(entry):
    repo, paths = entry
    try:
        commit = api(f"repos/{repo}/commits/HEAD")
        sha = commit["sha"]
        tree = api(f"repos/{repo}/git/trees/{sha}?recursive=1")
        available = {item["path"] for item in tree["tree"]}
        record = {"repository": repo, "revision": sha, "commit_date": commit["commit"]["committer"]["date"], "files": []}
        displays = []
        for path in paths:
            if path not in available:
                candidates = [p for p in available if p.endswith(path)]
                if len(candidates) == 1:
                    path = candidates[0]
            if path not in available:
                record["files"].append({"path": path, "error": "not present at revision"})
                continue
            content = api(f"repos/{repo}/contents/{path}?ref={sha}", raw=True)
            lines = content.splitlines()
            selected = set(range(min(8, len(lines))))
            for i, line in enumerate(lines):
                if re.search(r"approval|epoch|hash|revision|evidence|rollback|fresh|counterfactual|reus|scope|baseline|gate|condition|verif", line, re.I):
                    selected.update(range(max(0, i-1), min(len(lines), i+2)))
            excerpt = "\n".join(f"{i+1}: {lines[i]}" for i in sorted(selected))[:5500]
            record["files"].append({"path": path, "url": f"https://github.com/{repo}/blob/{sha}/{path}", "lines": len(lines)})
            displays.append(f"{path}\n{excerpt}")
        return record, f"\nREPOSITORY {repo} {sha}\n" + "\n".join(displays)
    except Exception as error:
        return {"repository": repo, "error": str(error)}, f"{repo}: {error}"

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(inspect, SOURCES.items()))
    Path(__file__).with_name("source-ledger.json").write_text(json.dumps([r[0] for r in results], indent=2) + "\n", encoding="utf-8")
    print("\n".join(r[1] for r in results))
