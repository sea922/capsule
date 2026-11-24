# Git safety

- Commit and push only when asked. Branch first when on the default branch.
- Never bypass hooks: no `--no-verify`, no `core.hooksPath` override, no
  `HUSKY=0`. Fix what the hook reports.
- Never rewrite published history or force-push without the user's explicit
  agreement for that push. Prefer `--force-with-lease` with an expected commit.
- Never discard work you did not create: no `reset --hard`, `clean -f`,
  `checkout .`, or `restore .` on a dirty tree without asking. Look before
  deleting or overwriting.
- Keep one logical change per commit, with a message that says what changed and
  why. Follow the project's message format when it has one.
- Never commit secrets, credentials, or `.env` files. If one is found in
  history, stop and tell the user: it needs rotating, not only removing.

Use the `git-workflow` skill for branches, rebases, stacks, and recovery.
