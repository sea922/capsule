# Database migrations

Use `database-migrations` to plan, write, review, and verify schema and data changes.

Examples:

- “Rename this column without downtime.”
- “Add a NOT NULL constraint to an 80-million-row table.”
- “Review this migration.”
- “Confirm last night's migration lost nothing.”

The skill reads the current schema and every reader of the objects involved, then classifies each change as additive, rewriting, or data only. Anything that is not additive is sequenced as expand, dual-write, backfill, switch reads, and contract across separate deploys. Statements are made lock-safe with timeouts, online index builds, and constraints validated separately. Backfills run in resumable batches. Each step has a rollback, and irreversible steps are labelled as such. The migration is rehearsed on realistic volume, and the skill stops before any shared or production run.

After a run it verifies with evidence: migration history, row counts and checksums against a captured before-state, constraint and index validity, and invariant queries. The read-only `database-migrations-reviewer` agent reviews migrations, and `code-review` deep mode reuses it.

## Workflow fit

`database-design` owns designing the schema, index, or query, `performance` owns slow queries, `ship-it` the surrounding release, and `production-readiness` the launch decision.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-adoption-research.md), and the [skill instructions](../../skills/engineering/database-migrations/SKILL.md).
