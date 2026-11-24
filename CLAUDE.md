Skills live under `skills/`, grouped into bucket folders when useful.

Every skill must contain a `SKILL.md` whose `name` matches its directory name.
Keep skill instructions, supporting references, scripts, and assets together in
the skill directory.

Each agent lives with the skill that owns it, at
`skills/<bucket>/<skill>/assets/claude-agents/<name>.md`, and is listed under
`agents` in `.claude-plugin/plugin.json` and in the `docs/agents.md` index.

Rules live under `rules/<set>/`, at most 250 lines each, adapted from ECC (see
`rules/THIRD-PARTY-NOTICE.md`). A stack rule starts with a `paths:` header; a
`common` rule has none. Rules state defaults that yield to the project and name
only skills and agents capsule has.

Hooks live in `hooks/`, each with a test and a `CAPSULE_HOOKS_DISABLED` id,
registered in `hooks/hooks.json` and the README table.

Store all research in `docs/research/`. Before researching a skill, read
`docs/source-repos.md`. Consult every relevant preferred repository and record
its influence, or why it was not applicable, in the research report. Treat the
ordered list as personal preferences and update it only when the user changes
those preferences.

Published skills must have:

- an entry in the top-level `README.md`
- an entry in the relevant bucket `README.md`
- an entry in `.claude-plugin/plugin.json`
- a human-facing page under `docs/`

Keep `.claude-plugin/plugin.json` and `package.json` versions synchronized.
After changing either plugin manifest, run:

```bash
claude plugin validate . --strict
```

To list repository skills, run `scripts/list-skills.sh`.
To link repository skills into local agent harnesses, run
`scripts/link-skills.sh`.

The optional status line lives in `statusline/`, with its installer and tests. It reads only the JSON Claude Code passes it and `git status`.

Each skill's `evals/evals.json` is the source for its evals. To run them with
Claude Code's eval runner, generate cases into the git-ignored
`evals-generated/` and run them with and without the plugin:

```bash
npm run evals:build -- <skill> [<skill>...]
claude plugin eval . --eval-dir evals-generated --runs 2 --no-publish
```

In GitHub Actions, the manual **Skill evals** workflow runs the same thing for
the skills you name, or for the skills changed on the branch. It needs an
`ANTHROPIC_API_KEY` repository secret, stops at a cost ceiling, writes a
summary to the run page, and never blocks a merge.

