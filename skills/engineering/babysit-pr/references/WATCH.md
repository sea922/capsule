# Observation and resume

Use Python 3.10+ and authenticated `gh` for GitHub or `glab` for GitLab. Resolve the PR once to an explicit forge, host, repository (a GitLab project path may nest groups) and number (the MR IID on GitLab). Keep this identity on every subsequent command, including mutations; for a fork PR the PR belongs to the base repository while pushes target its head repository/ref.

Create a private run directory outside tracked source, keyed by host/repository/PR. Keep `observed.json` for the helper and `run.md` for decisions. Before starting, inspect an existing run and active process/task ownership; join or hand off rather than starting a competing writer. The helper does not enforce a cross-session writer lock.

Run `scripts/watch_pr.py --help` from this skill for available arguments. Example, replacing placeholders and using the absolute script path:

```text
python <skill>/scripts/watch_pr.py --host github.com --repo owner/repo --pr 123 --state <private-run>/observed.json --once
python <skill>/scripts/watch_pr.py --host github.com --repo owner/repo --pr 123 --state <private-run>/observed.json
python <skill>/scripts/watch_pr.py --forge gitlab --host gitlab.example.com --repo group/sub/project --mr 45 --state <private-run>/observed.json
```

`--forge` defaults to `github` for `github.com`, `*.ghe.com` and hosts whose name contains `github`, and to `gitlab` for every other host. Pass `--forge github` for a GitHub Enterprise Server on any other hostname.

The helper only reads the forge and writes its local observation file. It returns JSON on initial observation, change, remote closure/merge, or periodic timeout. On GitHub it gathers paginated REST comments/reviews, paginated GraphQL thread resolution metadata and the CLI PR/check summary. On GitLab it gathers the MR, paginated discussions without system notes, approvals and the head pipeline's jobs, keeping only stable fields so a running job does not wake it on every read. It detects a head/base change during collection and fails instead of mixing revisions. Unsubmitted reviews (GitHub `PENDING` reviews, GitLab draft notes) and their inline comments are left out until submitted. On GitLab, a new head pipeline during collection also fails the read. No author allowlist is applied. API failures exit nonzero and preserve the previous observation.

Start it with the host's process tool, then wait on the returned process handle in responsive intervals. After handling output, launch it again using the same state file. A timeout returns the unchanged snapshot: reconsider pending work and readiness, then rearm. The bounded helper lifetime is a wakeup interval, not the task deadline. Keep one watcher; avoid adding another polling loop alongside it. Use a longer interval when quiet and respect rate-limit reset information on failures.

The snapshot is observation, not proof of complete checks or permission to mutate. Independently query required gates before readiness, and inspect the relevant provider's logs/workflow attempts when diagnosing CI. A resolved thread flag does not prove a repair; a review dismissal or approval change must be reconciled with the forge's current requirements.

## Decision record

Maintain these fields in `run.md` after each wave:

- Target URL, endpoint, permitted actions and their source in the conversation.
- Run budget and usage: waves, active watch time (excluding paused intervals) and consecutive failed observations.
- Checkout path, active owner/task and watcher process handle, latest head/base SHAs.
- Feedback IDs with body revision or digest, disposition, reason, and fix evidence.
- Failing check identities, affected SHAs, retry totals and recurring failure history.
- Pending mutation: target, expected head, intended result, and outcome evidence.
- Remaining decisions, next observation/action and exact resume invocation.

On resume, read the record and take a fresh snapshot before acting. Revisit all outstanding items even if the helper reports no change. Its file means **observed**, never **handled**. Reconcile a recorded pending write with the remote system before retrying it. Preserve the original budget, its usage and retry history.

State may contain private PR content; store it locally with the workspace's privacy controls. A scheduler needs this same record and action scope, plus single-writer ownership. Use the active harness's supported scheduler rather than inventing one from detached shell processes. A session-bound watcher alone cannot promise overnight continuation.
