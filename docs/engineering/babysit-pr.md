# Babysit PR

`babysit-pr` carries an existing GitHub pull request or GitLab merge request through review feedback, CI failures and completion. It is model-invoked for requests to babysit or resume a PR or MR, and can also be invoked explicitly.

The default endpoint is confirmed merge. That endpoint does not grant permission to merge: the skill retains the user's existing action scope and performs the final merge when authorized. Ask to stop at merge-ready when you want that earlier endpoint. It continues independent repairs while another item needs a decision and reports a precise handback when no autonomous work remains.

## Examples

- “Babysit this PR; fix CI and review findings, commit and push the repairs. I'll merge it.”
- “Babysit PR 123 and merge when ready using the repository's normal method.”
- “Get this PR merge-ready, then stop.”
- “Resume babysitting this PR from the saved run record.”

Replies, thread resolution and other externally visible actions follow the established user scope and host rules. Repeated permission prompts are unnecessary once the relevant action is authorized. Whatever the scope, the skill marks its replies as automated and leaves reviews, draft and open state, and threads other people have joined to the humans involved unless you name them. It adds new commits with hooks running rather than amending or bypassing hooks.

## When it stops

Without a deadline from you, a run is capped at 5 repair waves and 8 hours of active watch time. Restarts and resumes do not reset the count, and you can raise either limit. Reaching the cap saves the run as paused, with what remains and a resume command.

It also stops changing a stream that is not converging: a check or finding an earlier wave fixed that comes back on a later head. That stream is handed to you with its history while independent repairs continue. Feedback about product or design choices, architecture, conflicts with your stated intent, security, auth, billing, data or migrations, and questions that only need an answer are parked for you the same way. Five consecutive failed forge reads pause the run with an infrastructure handback.

The final report starts with a one-line status, then gives budget use (retries, waves, active time), mergeability, and findings it dismissed with reasons.

## How it works

The agent observes the PR, evaluates feedback, diagnoses failures, verifies a batch of repairs, pushes it within scope and resumes observation. A green build or queue entry remains progress until the selected endpoint is verified. Required reviews, conflicts, late bot feedback and failures on a newer commit can reopen work.

When several reviewers, bots or people, have commented, the agent sorts the feedback before repairing anything. It drops status banners and summaries, merges findings that several bots raised about the same defect, and takes human comments first. Each finding then gets one outcome: fix, dismiss with a reason, or escalate to you. The agent records what it handled, so a later round neither repeats a reply nor re-argues a decision already made. It fixes at most five bot findings per round.

A bundled Python helper reads GitHub through authenticated `gh`, or GitLab through authenticated `glab`, including paginated feedback and thread metadata. It leaves unsubmitted pending reviews and GitLab draft notes out, detects changes and returns periodic snapshots while quiet. The helper never edits, posts, reruns CI or merges. The agent verifies required gates separately before declaring readiness.

Requirements are Python 3.10+ and GitHub CLI or GitLab CLI with access to the target PR or MR. GitHub Enterprise and self-managed GitLab hosts are supported explicitly. A GitLab reference maps each GitHub surface the skill relies on (threads, approvals, pipelines, merge trains, replies) to its GitLab equivalent. Other forges require equivalent native observation tools; they have no bundled adapter. State lives in a private directory outside tracked source, with observations separate from decisions and pending writes.

Monitoring is session-bound unless a supported durable scheduler is explicitly established. The skill saves a resume record when interrupted and does not claim that a stopped watcher is still active. The first version owns one PR; it does not manage stacks or scan every authored PR. Single-writer ownership is coordinated by the agent, not enforced by a distributed lock.

## Composition and evidence

The skill composes diagnosis, implementation and verification without duplicating their full workflows. It follows the writing-for-agents hierarchy: the common loop stays in SKILL.md, watch mechanics and recovery branches live in references.

The [research report](../research/pr-babysitter-2026-09-12/report.md) records all nine preferred sources and compares the relevant OpenAI, pstack and Compound Engineering workflows. This is an original implementation; no upstream watcher is vendored. The [stop-conditions comparison](../research/2026-10-22-babysit-pr-stop-conditions.md) is the source of the run budget, non-convergence trigger, escalation classes and reporting rules. The [review-bot triage design](../research/2026-10-22-review-bot-comment-triage.md) is the source of the feedback triage.

Run helper regression tests with:

```text
python -m unittest discover -s skills/engineering/babysit-pr/scripts -p test_watch_pr.py -v
```

The skill directory also contains agent evaluation scenarios for late feedback, authority, races, retries, interruption, budgets, non-convergence, escalation, social limits, commit hygiene, API outages, reporting, pending reviews, description refresh and multi-reviewer triage. Those scenarios are specifications until exercised in a controlled agent harness; passing helper tests does not establish end-to-end agent performance.
