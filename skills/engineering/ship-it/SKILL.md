---
name: ship-it
description: Coordinates delivery of finished changes. Use when asked to ship completed work, take it to a merge-ready or merged PR, or resume an interrupted delivery across local work and a PR. A request only to commit or push belongs to git-workflow; only to create or open a PR, or write its title or description, to pr-description; an existing PR watch to babysit-pr; product or UX audits to code-review or specialist review.
---

# Ship it

Carry the finished change to the requested delivery endpoint. Keep ownership across
local verification, publication and remote follow-through; loading another skill
is a route through the work, not evidence that the work finished.

## 1. Establish the delivery contract

Read repository instructions and the current task context. Inspect the branch,
base, staged and unstaged changes, untracked files, and any existing PR. Identify
the task-owned change and preserve unrelated work, including its staging state.

Resolve the endpoint from the user's request and prior decisions. For a bare
"ship it" on finished work, state the default: **a merge-ready PR**. An explicit
request to open a PR stops at publication; a request to land or merge continues
through confirmed merge. When deployment is requested, read
[deployment](references/DEPLOYMENT.md) before preparing that transition.

An imperative shipping request authorizes scoped repairs, verification, commits,
pushes and PR creation or updates within repository and host policy. Carry forward
existing merge, deployment and messaging authority separately. Questions about
shipping remain read-only. Ask only for missing decisions that change scope or
authority; complete independent authorized work before presenting a blocked action.

**Complete when:** the owned change, existing PR or intended base, endpoint, and
action scope are known, with consequential unknowns isolated.

## 2. Close local gaps

Required routes, loaded when their condition applies:

| Condition | Owner and return evidence |
| --- | --- |
| Delivery diff needs review | `code-review`: supported findings against intent and repository standards |
| A finding has an unknown cause | `diagnosing-bugs`: established cause and repair scope |
| A supported finding needs repair | `implement`: scoped correction and affected checks |
| Final local result needs proof | `verification-before-completion`: fresh evidence for the final changed artifacts |

Reuse a completed review when it covers the current diff. Otherwise review the
delivery diff and address supported blockers. After a repair or base update,
refresh affected review and verification evidence. Resolve check failures through
their cause; keep unavailable checks explicit. Select specialist audits or product
checks when the change or repository requires them. Select `simplify` only for a
useful, authorized cleanup within this change.

**Complete when:** supported local blockers are resolved and scope-appropriate
checks cover the final change. If a required check is blocked, report it and
continue only work that does not depend on its result.

## 3. Publish the reviewed change

Required: use `git-workflow` for branch/base preparation, focused commits and
push, and `pr-description` for the PR title and body. Follow repository versioning and release-document policy.
Reuse the existing PR for this work and write its description from the final diff
and verification results. If publication preparation changes the code or its base,
return to step 2 for affected checks before pushing.

**Complete when:** the remote branch and PR reflect the intended revision, owned
changes and correct base. A PR URL proves publication only.

## 4. Follow through and verify the endpoint

For merge-ready or merged delivery, required: run `babysit-pr` with the PR identity,
current head, checkout, selected endpoint (**ready** or **merged**), evidence and
action scope. Preserve this explicit endpoint across the handoff; the receiving
skill's default does not replace it. Continue through its observation and repair
loop until it verifies that endpoint or identifies a concrete blocker.

When a sibling skill is unavailable, perform its equivalent scoped work with
native tools. If the tools cannot establish required evidence, name the missing
capability and retain the unresolved state. A handoff, queued merge, scheduled
check or older green revision is progress, not completion.

For deployed delivery, continue through the deployment reference. At an actual
pause, use `handoff` to preserve the PR, revision, completed checks, pending actions
and next observation. State whether monitoring remains active.

**Complete when:** fresh target-system evidence establishes the selected endpoint,
or no independent authorized work remains and a specific blocker is reported.

Report the observed state (published, ready, merged, or deployed), PR or release
link, revision, decisive checks and remaining gaps. Reserve "shipped" for the
selected endpoint; a blocked delivery includes the next action and its owner.
