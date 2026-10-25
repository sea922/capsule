# Recovery

Use this when Git state differs from the task's intent. First inspect status,
HEAD, index/worktree differences, and the operation Git reports in progress.
Preserve valuable files and record relevant revisions before repair. A rescue
branch protects commits, not unstaged, untracked, or ignored data; preserve those
separately when a repair might overwrite them.

| Situation | Inspection and recovery | Completion evidence |
| --- | --- | --- |
| Commits on the wrong branch | Preserve their tip on a rescue branch. Identify the intended base and transfer only task commits to the correct branch. Correct the original branch separately: public/shared history usually needs a coordinated revert, while a local rewind needs established authority and preserved work. | Correct branch contains intended changes; original branch and unrelated work are accounted for |
| Detached HEAD with useful commits | Record HEAD and create a named branch at that exact revision before leaving it. | Branch resolves to the rescued tip |
| Missing commit after rewrite | Inspect local reflogs and candidate commits with `git show`; create a rescue ref at the verified candidate before further edits. Reflogs are local and expire, so recovery is not guaranteed. | Recovered files and commit identity match the lost work |
| Interrupted merge/rebase/cherry-pick | Follow the operation named by `git status`. Either resolve, stage, and continue that operation, or preserve new resolution work and use its matching abort command when returning to the starting state is intended. | No unexpected operation remains; intended files, index, and history verified |
| Push rejected | Read the rejection. For divergence or a lease failure, fetch and compare remote/local history. For policy/auth failures, address the named requirement. | Remote target contains the intended authorized result; collaborator commits preserved |

For an interrupted merge begun with local edits, abort may not reconstruct all
pre-operation changes. Preserve them before aborting and compare afterwards.
Never expire reflogs or run pruning garbage collection as part of recovering
lost work. If the candidate or ownership is ambiguous, retain all candidates and
ask for the missing decision rather than choosing by recency alone. A moved
worktree or stale worktree metadata belongs to `git-worktrees`.

**Complete when:** recovered work is reachable or safely preserved, the intended
state is verified, and any irrecoverable or uncertain data is stated explicitly.

Primary references: [reflog](https://git-scm.com/docs/git-reflog),
[merge](https://git-scm.com/docs/git-merge).
