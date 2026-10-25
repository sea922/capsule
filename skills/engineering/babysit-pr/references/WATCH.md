# Observation and resume

Use Python 3.10+ and authenticated `gh`. Resolve the PR once to an explicit host, owner/repository and number. Keep this identity on every subsequent command, including mutations; for a fork PR the PR belongs to the base repository while pushes target its head repository/ref.

Create a private run directory outside tracked source, keyed by host/repository/PR. Keep `observed.json` for the helper and `run.md` for decisions. Before starting, inspect an existing run and active process/task ownership; join or hand off rather than starting a competing writer. The helper does not enforce a cross-session writer lock.

Run `scripts/watch_pr.py --help` from this skill for available arguments. Example, replacing placeholders and using the absolute script path:

```text
python <skill>/scripts/watch_pr.py --host github.com --repo owner/repo --pr 123 --state <private-run>/observed.json --once
python <skill>/scripts/watch_pr.py --host github.com --repo owner/repo --pr 123 --state <private-run>/observed.json
```

The helper only reads GitHub and writes its local observation file. It returns JSON on initial observation, change, remote closure/merge, or periodic timeout. It gathers paginated REST comments/reviews, paginated GraphQL thread resolution metadata and the CLI PR/check summary. It detects a head/base change during collection and fails instead of mixing revisions. Unsubmitted (`PENDING`) reviews and their inline comments are left out until submitted. No author allowlist is applied. API failures exit nonzero and preserve the previous observation.

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
