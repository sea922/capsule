Skills live under `skills/`, grouped into bucket folders when useful.

Every skill must contain a `SKILL.md` whose `name` matches its directory name.
Keep skill instructions, supporting references, scripts, and assets together in
the skill directory.

Each agent lives with the skill that owns it, at
`skills/<bucket>/<skill>/assets/claude-agents/<name>.md`, and is listed under
`agents` in `.claude-plugin/plugin.json` and in the `agents/README.md` index.

Rules live under `rules/<set>/`, at most 80 lines each. A stack rule starts with
a `paths:` header; a `common` rule has none. Rules state defaults that yield to
the project and point to skills instead of repeating them.

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
