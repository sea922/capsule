# Branching and integration

## Choose the branch

Discover the repository's integration model from instructions, branch rules,
remote default, existing PRs, and release configuration. Resolve a base explicitly; a local branch named `main` does
not establish that it is the intended or current integration target.

Reuse the task's branch when its scope and ancestry still fit. For a new change,
create a descriptive branch from the intended base after fetching the relevant
remote when available. Check for name collisions before creation. If the current
checkout holds another task's work, use `git-worktrees` for an isolated checkout.

When designing or resolving missing policy, read [repository policy](policy.md).
For feature setup, isolated PR review, selective commits, branch/fork updates,
backports, or stacks, read the applicable [common recipe](recipes.md).

## Keep the change reviewable

Group commits by coherent intent. Inspect task-owned changes and the staged diff
before committing; preserve unrelated staged content through path-scoped staging
and committing that is verified to include only the intended paths. If mixed
hunks cannot be separated safely, resolve ownership before committing.

A commit should explain its purpose, with implementation details only where they
clarify it. Split unrelated changes while
keeping required dependencies and useful review context together.

## Update and integrate

Use merge or rebase according to repository policy and branch ownership. Rebasing
rewrites commit identities: coordinate with anyone relying on a published branch.
For an authorized rewrite, record the previous head and establish recoverability.
When pushing rewritten history, verify the expected remote head and use an
explicit lease; a rejected lease requires inspecting the new remote state.
Protected/shared integration history stays intact unless its rewrite is
explicitly authorized.

Before a published rewrite, stack integration, merge eligibility decision, or
post-merge branch retirement, read [integration pitfalls](integration.md).

Resolve conflicts from both sides' intent, relevant history, and tests. Inspect
the resulting diff for lost behavior, finish the merge/rebase, and rerun checks
affected by the resolution. Take a whole side only when the other side's change
is deliberately superseded.

A local merge is distinct from a remote PR merge. Merging a PR on its forge,
including queues and auto-merge, belongs to `babysit-pr`; report the endpoint
actually reached.

**Complete when:** branch ancestry and change scope match the task, any in-progress
Git operation is resolved or explicitly reported, and the requested publication
or integration state is independently confirmed.
