# Common recipes

Use the applicable recipe after establishing state in the main skill. Commands
below are patterns: replace every uppercase placeholder with a verified value,
quote shell arguments, and execute in the intended checkout. Read
[branching](branching.md) for authority and history rules and
[recovery](recovery.md) if an operation is already interrupted.

For executable state inspection and commit templates, use
[tooling](tooling.md). Mutating recipes below remain deliberate workflow steps.

## Start a feature

**Preconditions:** intended base/remote known; existing work accounted for.

1. Fetch the relevant remote and inspect the resolved base commit.
2. Reuse the task branch, or create a collision-free descriptive branch at that
   commit. Use `git-worktrees` when isolation is needed.
3. Establish setup and baseline evidence before changing behavior.

**Done:** checkout path, branch, starting commit, and baseline are verified.

## Commit selected paths with unrelated staging present

**Preconditions:** all working-tree changes in the selected paths belong in this
commit; mixed staged/unstaged hunks in those paths have been inspected.

Record `git diff --cached` for unrelated paths. For tracked task paths,
`git commit --only -m "MESSAGE" -- PATH...` commits their working-tree contents
while leaving other staged paths out. It does not mean “commit only the staged
hunks in these paths.” Add new task files explicitly before including them.
When task and unrelated work share a file, isolate the intended hunks first with
a reviewed patch/index procedure instead of applying the whole-path recipe.

**Done:** inspect the new commit and confirm unrelated index/worktree content
remains unchanged. See the [commit manual](https://git-scm.com/docs/git-commit).

## Review a PR in isolation

**Preconditions:** base repository and exact PR head known; fetch source trusted.

Fetch that head through the forge's supported mechanism. Use a free checkout or
a detached worktree at the verified revision; record the merge base used for
review. Prepare it through `git-worktrees` and run scoped checks. A detached
review checkout needs a branch before keeping new commits as task work.

**Done:** findings and checks identify the reviewed revision; retire the review
checkout through `git-worktrees`.

## Update a branch or sync a fork

**Preconditions:** destination branch, upstream remote, local work, and collaborators known.

Fetch the base repository. Compare histories, then merge or rebase according to
policy. A fork's `origin` often names the contributor's fork, so resolve upstream
by repository identity. Keep fork-base synchronization separate from feature
integration and push only to the intended writable remote.

**Done:** inspect ancestry and final diff, resolve any conflicts, and verify the
new tree. Rewritten pushes follow [integration pitfalls](integration.md).

## Backport a fix

**Preconditions:** fix revision and target release line confirmed; determine whether
the fix depends on earlier changes or already exists on that line.

Create a focused branch from the release target, then cherry-pick the selected
fix. Use `-x` when provenance is useful and policy allows it. For a merge commit,
inspect parent relationships and choose the mainline parent that represents the
release line's history. Adapt to the release's API/dependency versions and run its relevant tests.

**Done:** release-targeted PR explains provenance, adaptations, and actual
verification. See the [cherry-pick manual](https://git-scm.com/docs/git-cherry-pick).

## Maintain a stack

**Preconditions:** each child PR's parent and old parent tip recorded; rewrites authorized.

Before a parent rewrite or squash merge, preserve the boundary separating parent
commits from child-only work. After the parent lands, transplant the child's
unique commits onto the new base. For a simple linear stack, the pattern is
`git rebase --onto NEW_BASE OLD_PARENT_TIP CHILD_BRANCH`. Inspect the range first;
merge-heavy histories need an explicit plan. Retarget the PR, then repeat for
descendants in dependency order, preserving each old boundary before rewriting it.

**Done:** each PR shows only its intended change against its current parent,
checks cover the new heads, and dependency links are accurate. See the
[rebase manual](https://git-scm.com/docs/git-rebase).
