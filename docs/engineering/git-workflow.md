# Git workflow

`git-workflow` handles commits, branches, rebases and syncs, stacks, backports,
local integration, and recovery from interrupted Git operations. It is
model-invoked and can also be requested directly.

Try: “Commit my fix without the other staged files,” “Rebase this stack after
the parent squash-merged,” “Backport this fix to release/2,” “I committed to the
wrong branch,” or “Choose a branching policy for our release process.”

The skill establishes repository state and the requested endpoint, then loads
only the relevant references. It follows existing repository policy and user
authorization, preserves unrelated work and staging, and confirms the resulting
state. Commits credit the human author only; agent "Generated with" lines and
agent co-author trailers are left out unless a repository policy requires AI-use
disclosure.

Adjacent work has its own owner: isolated checkouts go to
[git-worktrees](git-worktrees.md), PR titles and bodies to
[pr-description](pr-description.md), and CI repair, review feedback, and merging
the PR to [babysit-pr](babysit-pr.md). Code implementation and review keep their
existing owners.

## Kit references

| Need | Reference |
| --- | --- |
| Run local inspection or create a commit message draft | [Runnable tooling and templates](../../skills/engineering/git-workflow/references/tooling.md) |
| Discover rules or choose a branch/merge policy | [Repository policy](../../skills/engineering/git-workflow/references/policy.md) |
| Start, review, commit selected paths, sync, backport, or maintain a stack | [Common recipes](../../skills/engineering/git-workflow/references/recipes.md) |
| Recover misplaced commits or interrupted Git operations | [Recovery](../../skills/engineering/git-workflow/references/recovery.md) |
| Handle squash ancestry, leases, stale checks, and merge queues | [Integration pitfalls](../../skills/engineering/git-workflow/references/integration.md) |

Each reference has a loading condition and a completion criterion. Command
patterns require verified repository values; the kit does not execute them
automatically. [Evaluation instructions](../../skills/engineering/git-workflow/evals/README.md)
separate blind agent scenarios from local Git mechanics tests.

The bundled `git-kit.mjs` offers `status` and `template` commands. It requires
Node.js 20+ and Git, with no npm dependencies. Git operations are read-only;
template output creates a new file only when requested and refuses overwrite.
Two assets cover plain and Conventional Commit messages. It installs no Git
configuration.

## Design and evidence

The [skill](../../skills/engineering/git-workflow/SKILL.md) contains the common
steps; branching, policy, and recovery are selectively loaded references. PR
writing and worktree lifecycle were split into their own skills; the
[split record](../research/2026-10-09-git-workflow-split.md) explains why.
The [research report](../research/2026-09-26-git-workflow.md) and
[preferred-source audit](../research/2026-09-26-git-workflow-preferred-sources.md)
record the sources and limitations. The instructions are an original synthesis:
Addy Osmani and ECC informed branching tradeoffs. Repository-specific approval
rituals, fixed thresholds, and destructive command recipes were not adopted as
universal rules.

The [kit expansion record](../research/2026-09-26-git-workflow-kit.md) adds official
Git references. The [validation record](../research/2026-09-26-git-workflow-validation.md)
documents a blind scenario comparison and six executable local Git exercises,
including their limits.
