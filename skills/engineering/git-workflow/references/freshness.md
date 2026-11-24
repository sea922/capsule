# Branch freshness

Read when asked whether a branch or PR is up to date, whether its changes
already landed through a merged or incoming PR, or whether an old PR should
still exist. Decide the verdict before syncing: a clean rebase proves only that
Git found no textual conflict, not that the work still belongs on the base.

The leading word is **residual**: what landing the branch would still change on
the current base. A branch with no residual has nothing left to deliver.

## 1. Fix the identities

Fetch the base repository and the branch's remote. Record the actual base, the
branch head SHA, the upstream state, and the merge base. The base is the PR's
base when one exists, matched to its remote by repository identity, otherwise
the remote's default branch; ask when neither settles it. An upstream shown as
`[gone]` in `git branch -vv` is a hint that the branch was merged and deleted,
not proof. Treat uncommitted changes as user-owned and leave them untouched.

**Complete when:** base tip, head, merge base, and upstream state come from a
fresh fetch.

## 2. Find where the work went

Collect the evidence below. Stop early only when a conclusive signal accounts
for every commit on the branch.

| Evidence | How to read it | Conclusive for |
| --- | --- | --- |
| Forge record | `gh pr list --head BRANCH --state all` and the PR's merge commit | This head was merged, closed, or is still open |
| Ancestry | `git merge-base --is-ancestor HEAD BASE` succeeds | Merged by merge commit or fast-forward |
| Patch equivalence | `git cherry BASE HEAD`: a `-` line means that commit's patch is on the base | Cherry-picks, rebase merges, single-commit squashes |
| Synthetic squash | `git commit-tree HEAD^{tree} -p MERGE_BASE -m probe`, then `git cherry BASE PROBE` | A multi-commit squash, which plain `git cherry` reports as all `+` |
| Residual | `git merge-tree --write-tree BASE HEAD`, then `git diff --name-status BASE TREE` | What landing the branch would still change |
| Other PRs | Merged PRs since the merge base and open PRs that touch the same paths, issue, or behavior | Superseded or competing work |

Patch equivalence matches only identical diffs, so a squash edited during
review, or followed by later base changes, can fail it while the work has
still landed. The residual answers that case. `merge-tree --write-tree` needs
Git 2.38 or later; it writes objects only and never touches the checkout.

Classify every residual path:

- **Still new:** the branch adds something the base lacks. This is real
  remaining work.
- **Reintroduction:** the base changed or removed the path after the merge
  base, for example a release step that consumed a changeset. Check with
  `git log --oneline MERGE_BASE..BASE -- PATH`. Landing it would undo the base.
- **Conflict:** `merge-tree` exits 1. Both sides changed the same behavior;
  read both intents before calling it either of the above.

A residual can be still new and still wrong. Ask whether the base changed
something the branch relies on, even in files the branch never touches: a
renamed helper, a contract the branch's tests assume, a bug the branch fixes
that the base fixed another way, or a recorded decision that went the other
way. Read the changelog and commit messages for `MERGE_BASE..BASE`, not only
the diff. A yes points to **REWORK** or **SUPERSEDED**, however cleanly the
rebase would apply.

For other people's PRs, compare goals, not just lines. A merged PR that solved
the same user-facing problem another way supersedes the branch even when no
line overlaps. Confirm the claim from that PR's diff and behavior, not its title
or the files it touches.

**Complete when:** every commit on the branch is accounted for as landed,
superseded, or residual, and each claim names its evidence.

## 3. Choose the verdict

| Verdict | Condition | Action |
| --- | --- | --- |
| **CURRENT** | Residual is all still-new work and nothing competes with it | Sync under [branching](branching.md) policy, rerun affected checks, publish under [integration pitfalls](integration.md) |
| **PARTIAL** | Some commits landed and still-new residual remains | When rebasing is authorized under [branching](branching.md) and published-rewrite rules in [integration pitfalls](integration.md), rebase to drop commits whose patch is already upstream, confirm with `git range-diff` that only the residual remains, and explain every hunk it shows as changed |
| **LANDED** | Residual is empty or only reintroductions | Name the PR or commit that carried the work; do not push or open a PR; offer retirement through `git-worktrees` |
| **SUPERSEDED** | Another merged or open PR covers the same goal | Name it and recommend closing or joining it instead of rebasing |
| **REWORK** | The goal still matters, but the base changed APIs, types, or architecture so a mechanical rebase keeps the wrong shape | Describe the smallest credible rewrite and stop before pushing unless the rework was requested |

Before any rebase, check the branch's range for merge commits with
`git rev-list --merges MERGE_BASE..HEAD`. A plain rebase drops a conflict
resolution made in a merge commit, and `git range-diff` compares only
non-merge patches, so the loss would not show. Stop and turn that work into
ordinary commits first. During the rebase, resolve conflicts by the branch's
intent and keep the author's commits as theirs, with your fixes as separate
commits on top. A changed hunk you cannot explain is lost intent.

Age is not evidence in either direction, and effort already spent is not a
reason to keep a branch. When the evidence cannot separate two verdicts, report
both with what would decide between them.

## 4. Act within the granted authority

A freshness check authorizes fetching and reading. "Pull latest" or "update
it" authorizes syncing the local branch as repository policy dictates; a
published rewrite still follows the lease rules in
[integration pitfalls](integration.md). Closing a PR, deleting a branch, or
retargeting a base needs explicit permission.

Syncing a **LANDED** branch delivers nothing and can resurrect reintroductions.
When the user asked to pull latest while on one, update the local base branch
instead and offer to switch to it, leaving the landed branch in place.

**Complete when:** the action taken matches the verdict and the authority, and
any remaining decision is presented with its evidence.

## Report

Lead with the verdict and its reason. Then give, in order: how far the base
moved (behind and ahead counts), where each commit went with PR or commit
links, the residual and its classification, what was synced or pushed, checks
run, and what could not be verified.

Primary references: [git cherry](https://git-scm.com/docs/git-cherry),
[git merge-tree](https://git-scm.com/docs/git-merge-tree),
[git range-diff](https://git-scm.com/docs/git-range-diff),
[git rebase](https://git-scm.com/docs/git-rebase).
