# Production readiness

Use `production-readiness` for a read-only review of whether a system or release is ready for real users.

Examples:

- “Are we ready to launch on Monday?”
- “Go or no-go for today's release?”
- “What will break in production?”
- “Review our rollout and rollback plan for the new checkout.”

The skill fixes what is being judged, then gathers evidence from the repository: CI, tests, migrations, configuration, health checks, logging, deploy and rollback scripts, and runbooks. It assesses security and access, data integrity, payments and external callbacks, operations, rollout and rollback, and user experience. Missing evidence is recorded as missing. It gives one verdict: block, ship with caveats, or ship. Hard stops, such as missing access control on sensitive data, a payment callback that is not idempotent, exposed secrets, or no rollback path, force a block.

The verdict covers only what was examined, and the report lists what was not. The read-only `production-readiness-auditor` agent does the evidence sweep.

## Workflow fit

`ship-it` delivers the change. `containers-and-deploys` builds the pipeline, rollout, and rollback this skill reviews, and `observability` adds the logs, metrics, and alerts a launch needs. `security-review`, `database-migrations`, `accessibility`, and `performance` take the areas that need depth.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-adoption-research.md), and the [skill instructions](../../skills/engineering/production-readiness/SKILL.md).
