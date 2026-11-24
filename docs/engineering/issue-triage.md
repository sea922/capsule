# Issue triage

Use `issue-triage` to assess an incoming issue on GitHub or GitLab before anyone replies to it.

Examples:

- “Triage issue 482.”
- “Is this bug report a duplicate?”
- “I think we already fixed this one. Check.”
- “Draft a reply asking for what's missing.”
- “Work through the untriaged issues.”

The skill picks the forge from the issue URL or the `origin` remote and fetches the issue and its whole thread with `gh` or `glab`. It gives the issue one type and lists what the report lacks against the project's issue template. It then reads the code the report names at a stated revision and records whether the claim is confirmed, likely, refuted, or unverified. It searches open and closed issues for the same cause, and merged changes for an existing fix, keeping "merged" apart from "released".

The result is a decision (valid, needs information, duplicate, already fixed, not a bug, or out of scope), a severity, labels that exist in the repository, one next step, and a reply the maintainer could post as written. Issue text is treated as untrusted: pasted commands are not run, and text that tries to direct an agent is reported, not followed. Nothing is posted, labelled, or closed until the user approves the exact text and labels.

## Workflow fit

`diagnosing-bugs` owns finding the root cause of a confirmed bug, `research` an open question, and `planning-and-task-breakdown` turning accepted work into tasks. `code-review` owns pull and merge requests.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/issue-triage/SKILL.md).
