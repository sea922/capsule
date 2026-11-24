# Database design

Use `database-design` to design schemas and write queries that fit the workload.

Examples:

- “Design the tables for this feature.”
- “Which index does this query need?”
- “Should this id be a UUID or a bigint?”
- “Review this query before it ships.”
- “How should we key this cache in Redis?”

The skill starts from the access patterns: each read with its filter, sort, and page size, each write, and the expected volume. From those it models the data, picks keys and types for meaning, and lets the database enforce invariants with constraints. Indexes are written from the queries, with equality columns before range and sort columns, and each one is tied to the query it exists for. Queries are checked against the plan the engine chose on realistic data. The skill also covers transaction scope and isolation, and sizing a connection pool against what the database can serve.

Engine-specific defaults load on demand from references for PostgreSQL, MySQL and MariaDB, Redis, and ClickHouse.

## Workflow fit

`database-migrations` owns applying a change to a live database, and its `database-migrations-reviewer` agent reviews the migration. `performance` owns finding which query is the limiter; this skill owns the fix once the query is known. `security-review` owns access control beyond least-privilege defaults.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/database-design/SKILL.md).
