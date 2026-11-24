# Git Workflow

## Safety

- Commit and push only when asked. Branch first when on the default branch.
- Never bypass hooks: no `--no-verify`, no `core.hooksPath` override, no
  `HUSKY=0`. Fix what the hook reports.
- Never rewrite published history or force-push without the user's explicit
  agreement for that push. Prefer `--force-with-lease` with an expected commit.
- Never discard work you did not create: no `reset --hard`, `clean -f`,
  `checkout .`, or `restore .` on a dirty tree without asking. Look before
  deleting or overwriting.
- Never commit secrets, credentials, or `.env` files. If one is found in
  history, stop and tell the user: it needs rotating, not only removing.

## Commit Message Format

Follow the project's format. Where it has none:

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Keep one logical change per commit, and say what changed and why. Add an
AI co-author trailer only if the project or user wants one.

## Pull Request Workflow

When creating PRs (GitLab: merge requests):
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Write the title and body with the `pr-description` skill
4. Include how the change was tested
5. Push with `-u` flag if new branch

Use the `git-workflow` skill for branches, rebases, stacks, and recovery, and
`babysit-pr` to carry a PR or MR through review and CI to merge.

> For the full development process (planning, TDD, code review) before git operations,
> see [development-workflow.md](./development-workflow.md).
