---
name: git-worktrees
description: Git worktree lifecycle - selecting, creating, preparing, retiring, and recovering isolated checkouts. Use whenever setting up or cleaning up a worktree, when a task needs its own checkout, when parallel tasks or agents need separate working directories, when cleaning up a worktree after a merge, or when a worktree was moved, archived, or has stale metadata. Branch, commit, and integration work belongs to git-workflow.
---

# Git worktrees

Own the checkout a task runs in: choose or create it, make it usable, and retire
or recover it without displacing another owner's work.

## 1. Select or prepare

Inspect existing worktrees and host attachments before creating another. Reuse a
suitable free checkout when its changes are accounted for and no task or process
depends on it. An existing name need not match the new task; prepare the correct
branch/base instead of replacing the checkout for its name.

Establish that it is free from host task/attachment status, repository status,
and known processes using the checkout. Unresolved ownership means retain it and
choose another checkout; a clean Git status alone is insufficient.

Prefer the host's managed worktree tools. Use Git directly when those tools are
unavailable or the user asks for it. With Git, inspect `git worktree list
--porcelain` and repository metadata; a `.git` file alone also occurs in submodules
and is insufficient to identify a linked worktree. For a new checkout, resolve
the start point and path explicitly; base and branch choice follow `git-workflow`.
Check that a repository-local worktree path is ignored before populating it.

Worktree creation normally excludes uncommitted changes. If the task requires
them, use a supported transfer mechanism and verify its contents, including
untracked and needed ignored files. Keep the original work recoverable.

**Complete when:** one checkout is selected or created at a verified base, with
no other owner displaced.

## 2. Make isolation usable

Before setup or concurrent builds/tests, read [environments](references/environments.md)
for dependencies, configuration, and shared-resource ownership.

Run all edits and checks against the selected absolute directory. Verify branch
or detached HEAD and base before work begins. Establish dependencies, required
environment files, fixtures, and an appropriate baseline check in that checkout.
Record existing failures separately from regressions.

Worktrees separate working files and indexes while sharing repository state.
Assign separate ports, databases, and other writable external resources when
concurrent tasks could collide. Track which task owns each checkout and process.

**Complete when:** the decisive build/test can run in the checkout with known
resource ownership, or a concrete unavailable dependency is reported.

## 3. Retire or recover

A merged PR is a lifecycle checkpoint, not an automatic deletion instruction.
Retain checkouts needed by review, follow-up work, running processes, or the user.
Before retirement inspect the exact target, changes, unpushed commits, untracked
files, and needed ignored assets. Preserve pinned, shared, or in-use worktrees.

Use managed archival when supported; verify its snapshot and exclusions. Preserve
needed ignored assets separately if archival omits them: use a durable location
outside the retiring checkout, record its path for the owner, and verify the
preserved contents before removal. For ordinary Git,
preserve needed changes and use `git worktree remove` once the checkout is free
and safe to remove. Force removal or discarding work requires explicit authority.
Branch deletion is a separate decision: verify reachability and preservation,
especially after squash merges. `prune` removes stale metadata, not live work.

For recovery, use the host's restore operation when available. Verify restored
files and HEAD; a restored snapshot may contain formerly uncommitted changes as
committed content. Use Git repair for moved checkout metadata only after verifying
the real paths. Do not restore archives merely to obtain a checkout for new work.

**Complete when:** retirement or recovery is confirmed by a fresh worktree
inventory, with all needed work preserved and no active owner displaced. Report
the checkout path, its state, and anything retained and why.
