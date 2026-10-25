# Git worktrees

`git-worktrees` owns the lifecycle of isolated checkouts: selecting or creating
one, making it usable, and retiring or recovering it. It is model-invoked and can
also be requested directly.

Try: “Set up a worktree for this task,” “Give two agents separate checkouts so
they can work in parallel,” or “Clean up the worktree for the PR that just
merged.”

The skill reuses a free checkout before creating another, and treats unresolved
ownership as a reason to leave a checkout alone; a clean `git status` is not
enough. It prepares dependencies, configuration, ports, and databases so the
decisive build or test can run in the new checkout. Cleanup depends on ownership
and recoverability rather than happening automatically after every merge. Needed
ignored files are preserved before removal, and branch deletion is a separate
decision from removing the checkout.

Base and branch choice, commits, and integration belong to
[git-workflow](git-workflow.md).

## References

| Need | Reference |
| --- | --- |
| Prepare dependencies, secrets, ports, databases, submodules, and LFS | [Worktree environments](../../skills/engineering/git-worktrees/references/environments.md) |

## Design and evidence

This skill was split out of `git-workflow` so checkout requests trigger on their
own and `orchestrate` can reach it for parallel work; the
[split record](../research/2026-10-09-git-workflow-split.md) explains the
boundary. Superpowers informed native worktree reuse and ownership, as recorded
in the [git-workflow research](../research/2026-09-26-git-workflow.md) and
[preferred-source audit](../research/2026-09-26-git-workflow-preferred-sources.md).
