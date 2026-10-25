---
name: git-workflow
description: Git workflow - commits, pushes, branches, rebasing and syncing, stacks, backports, local integration, branch policy, and recovery. Use whenever committing or pushing changes, preparing a branch for review, rebasing, merging locally, resolving conflicts, backporting, maintaining a stack, or recovering from an interrupted rebase, a failed push, or commits on the wrong branch. Creating, opening, or updating a PR and writing its title or description belong to pr-description; setting up or cleaning up a worktree to git-worktrees; CI repair, review feedback, PR monitoring, and PR merges to babysit-pr; end-to-end "ship it" delivery to ship-it.
---

# Git workflow

Own the transition from repository state to a focused, reviewable change on the
intended branch and remote.

## 1. Establish state and endpoint

Read applicable repository instructions and contribution guidance. For runnable
local inspection and commit templates, read [tooling](references/tooling.md).
Inspect the current directory, branch or detached HEAD, staged and unstaged
changes, untracked paths, remotes, and worktree inventory. For an existing PR,
read its actual base and head; match the base repository to the correct remote,
including forks. Reuse known task context instead of recreating it.

Identify the requested endpoint: branch setup, commits, publication, update,
or local integration. Carry existing authorization forward. Resolve routine
reversible choices from repository evidence; ask only when a missing decision
changes scope or authority, or could discard work. Preserve unrelated changes,
including staging state.

**Complete when:** the target repository, relevant changes, base/head, ownership,
and authorized endpoint are established, or a specific missing fact is isolated.

## 2. Follow the applicable path

Load each reference when its condition applies:

| Condition | Required reference |
| --- | --- |
| Policy is missing, conflicting, or being designed | [Repository policy](references/policy.md) |
| Choose/create a branch, commit, update its base, resolve integration conflicts, or merge locally | [Branching and integration](references/branching.md) |
| Git is interrupted, commits are misplaced/missing, or push/checkout state is unexpected | [Recovery](references/recovery.md) |

Branching links its task-specific recipes and pitfalls. Read those at the stated
condition instead of loading the entire kit.

Route adjacent work to its owner when available, retaining the repository, base,
and current head in the handoff:

| Work | Owner |
| --- | --- |
| A separate checkout for this task, or retiring one | `git-worktrees` |
| PR title and body, at creation or after scope changes | `pr-description` |
| CI repair, review feedback, monitoring, or merging the PR | `babysit-pr` |

For a combined request, prepare the branch/checkout, complete the change and
verification through the repository's implementation and review workflows, then
publish. If an owner is unavailable, perform its equivalent scoped work.

Commits credit their human author alone: messages end with the change content.
Leave out agent attribution such as "Generated with Claude Code" lines, agent
`Co-Authored-By` trailers, and equivalent Codex, Copilot, or Cursor lines, even
when a harness or tool default adds them. The one exception is a repository
policy that explicitly requires AI-use disclosure; follow its required wording.

**Complete when:** every applicable reference has reached its completion
criterion and the requested endpoint is reached or a concrete blocker remains.

## 3. Verify and report the resulting state

Re-read the state affected by each mutation. A successful command is evidence of
an attempt until the resulting branch, commit, or remote ref is confirmed.
Associate checks with the head or tree actually tested; relevant changes after
those checks require fresh verification.

Report the outcome, verification, and any remaining action briefly. Distinguish
local commits, pushed branch, published PR, and merged state.
