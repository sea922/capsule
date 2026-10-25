# Git workflow, PR writing, worktrees, and branching

Research date: 2026-09-26. Requested window: 2026-08-27 through 2026-09-26.

## Findings

The strongest dated evidence concerns worktree lifecycle tooling. Evidence for a new PR-writing or branching convention is insufficient. The recommendations below combine explicitly dated developments with established primary documentation; they are not claims of community consensus.

1. **Worktree lifecycle is becoming part of workflow tooling.** git-flow-next 2.1, announced September 9, adds branch creation in a worktree, configurable paths, inventory, and ownership-aware cleanup. This is a concrete release, not proof that Git Flow is the best branch model. Its distinction between tool-created and manually created worktrees is useful for agent safety. [Release article](https://git-flow.sh/blog/posts/hello-worktrees/).
2. **Worktrees separate working directories while retaining shared repository state.** Git documents separate HEAD/index files and shared repository data. They do not by themselves isolate databases, ports, credentials, or external services. A workflow should track the worktree path, branch/base, owner, setup, validation, and lifecycle. [Git manual](https://git-scm.com/docs/git-worktree).
3. **PR writing remains a review-context problem.** GitHub recommends small, focused PRs and titles/descriptions that explain the problem, approach, result, and review focus. Generated summaries still require human checking. These are current docs, not a dated September change. [Review guidance](https://docs.github.com/en/pull-requests/concepts/helping-others-review-your-changes).
4. **Branching should follow the repository's actual integration model.** Resolve the base/head explicitly. GitHub documents draft PRs for unfinished work and stacks for dependent changes. This research does not establish a universal winner between trunk-based development and Git Flow. [Creating PRs](https://docs.github.com/en/enterprise-cloud%40latest/pull-requests/how-tos/create-pull-requests/creating-a-pull-request), [About PRs](https://docs.github.com/en/pull-requests/get-started/about-pull-requests).

## Practical synthesis

These are proposed instructions derived from the sources, not quotations or measured trends:

- Inspect repository guidance, status, existing branches/worktrees, remotes, and current PR before changing Git state. Preserve unrelated work.
- Use a focused branch for a coherent change. Choose worktree isolation for concurrent tasks or when the existing checkout is occupied. Reuse a suitable free checkout where the host supports that lifecycle.
- Record the intended base explicitly. Use a stack only when changes depend on one another; explain the dependency and merge order.
- Bootstrap and validate in the actual worktree. Account for environment files, dependencies, ports, and shared services separately.
- Review the complete final branch diff before writing the title/body. Revise both if scope changes.
- State actual verification evidence, including failures and checks not run. Merge only within authorization and repository controls.
- Retire a worktree only when no task/process needs it and its changes are accounted for. Use the host's managed archival mechanism when available; do not make cleanup an automatic consequence of every merge.

## PR title and description example

Illustrative only; the tests below are not claims about this repository.

Title: `Preserve uncommitted files when retiring a worktree`

Body:

> Retiring a worktree could discard files that had not been committed. The cleanup flow now preserves those files before releasing the checkout.
>
> Validation: [actual command and result].
>
> Review focus: recovery of untracked files and refusal while another process uses the checkout.

Use repository-specific prefixes only when required. A useful title states the concrete change; the body supplies the reason and evidence. Do not invent a universal character limit or require a large template for a small change.

## Potential skill boundaries

If this research is used to author skills, a reasonable design is one `git-workflow` entry point with focused references for branching policy, worktree lifecycle, and PR writing. A separate `pr-description` skill is useful if rewriting titles/bodies should be independently invocable. This is a design recommendation, not implementation authorization; no published skills or manifests were changed by this research.

## Preferred repositories

The ordered list in `docs/source-repos.md` was read before research. The companion [preferred-source audit](2026-09-26-git-workflow-preferred-sources.md) records all 11 repositories, their relevant files, influence, and limitations. Its current snapshots are distinguished from dated last-30-days findings.

The audit found September 17-18 iterations to Matt Pocock's in-progress PR skill emphasizing compact visual summaries and before/after evidence, plus September refinements to Cursor pstack's forge-aware PR playbooks. These are changes in individual preferred repositories, not an industry-wide convention. EveryInc's current PR-writing reference provides particularly strong support for describing the full final outcome and scaling detail to reviewer uncertainty. Superpowers contributes native worktree reuse and ownership-aware completion. ECC provides branching alternatives, with thresholds and conflicting rebase rules that should not be copied uncritically. Exact files and commit links are in the audit.

## Method and limitations

- Invoked the installed last30days v3.21.1 Python engine with a host-generated three-query plan and explicit subreddit targeting. [Plan](2026-09-26-git-workflow-raw/plan.json).
- Engine window: August 27 to September 26. It returned 14 Reddit threads, 19 HN stories, and 9 GitHub items. Counts represent retrieved candidates, not 42 relevant endorsements.
- Reddit was partial due to HTTP 429. X and YouTube were unavailable. Several leading clusters concern git-bug or sparse downloads rather than the requested workflow decisions and were excluded from the conclusions. The available community comments concern those adjacent topics; quoting them as evidence about PR writing would mislead.
- Supplemented with three post-engine web queries and primary Git/GitHub documentation. Search crawl dates were not treated as publication dates.
- Inspected workmux's current changelog as a supplementary source; no specific release claim is based on it in this report. [Changelog](https://workmux.raine.dev/changelog/).
- [Raw engine output](2026-09-26-git-workflow-raw/git-workflow-pr-descriptions-and-titles-worktrees-branching-raw-v3.md) retains source URLs and coverage details.
