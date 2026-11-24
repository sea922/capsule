# PostgreSQL

Defaults for schema and query work on PostgreSQL. Check the server version first; several features below depend on it. The project's own conventions win.

## Types

| For | Default | Avoid, and why |
| --- | --- | --- |
| Surrogate keys | `bigint generated always as identity` | `int` runs out; `serial` carries legacy ownership quirks |
| Ids generated outside the database | `uuid`, time-ordered (version 7) where available | Random UUIDs as the key of a large, hot table scatter index writes |
| Text | `text`, with a `CHECK` on length when a limit is a real rule | `char(n)` pads; `varchar(255)` is a habit, not a rule |
| Instants | `timestamptz` | `timestamp` drops the zone and misreads across sessions |
| Money, exact quantities | `numeric(p, s)` | `float`, `double precision`, and the `money` type |
| Flags | `boolean not null` | Integers or strings standing in for booleans |
| Small fixed sets | `text` with a `CHECK`, or a lookup table | A native enum when the values change often |
| Optional attributes | `jsonb` | `json`, and `jsonb` for fields that are filtered or constrained |

Use lowercase `snake_case` identifiers. A quoted mixed-case name must be quoted forever.

## Constraints

- A unique constraint allows several `NULL`s unless declared `NULLS NOT DISTINCT` (version 15 and later).
- A `CHECK` passes when its expression is `NULL`, so pair it with `NOT NULL`.
- State `ON DELETE` on every foreign key. PostgreSQL indexes the referenced key, not the referencing column: add that index yourself, or deletes and joins on the parent scan the child.
- An `EXCLUDE` constraint with a GiST index prevents overlapping ranges, such as double bookings.

## Indexes

| Query shape | Index |
| --- | --- |
| Equality, range, sort | B-tree, the default |
| `a = ? AND b > ?` | Composite `(a, b)`: equality first, then range |
| A few columns read on a hot path | Covering, with `INCLUDE (...)`, for an index-only scan |
| A stable subset, such as live rows | Partial, with `WHERE deleted_at IS NULL` |
| `lower(email) = ?` | Expression index on the same expression |
| `jsonb` containment, arrays, full-text | GIN |
| Ranges, geometry, exclusion | GiST |
| Very large append-only tables ordered by time | BRIN |

A query predicate must match a partial or expression index for the planner to use it. On a table that is already in use, building an index is a migration: hand it to `database-migrations`.

## Queries

- Upsert with `INSERT ... ON CONFLICT (cols) DO UPDATE SET col = EXCLUDED.col`, backed by a unique constraint on those columns.
- Page by keyset: `WHERE (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC LIMIT n`.
- Claim queue work with `FOR UPDATE SKIP LOCKED` inside a short transaction. It is right for queues and wrong for reads that need a consistent view.
- Use `RETURNING` instead of a second read after a write.
- Bulk-load with multi-row `INSERT` or `COPY`, not a statement per row.
- Prefer `= ANY(?)` with an array parameter over a long literal list.

## Reading a plan

Run `EXPLAIN (ANALYZE, BUFFERS)` on realistic data. `ANALYZE` executes the statement, so wrap a write in a transaction and roll it back.

- A sequential scan on a large table with a selective filter points at a missing or unusable index.
- Estimated rows far from actual rows: run `ANALYZE` on the table, then look for correlated columns or an expression the planner cannot estimate.
- A sort or hash that spills to disk points at `work_mem` or a missing ordered index.
- A nested loop over many outer rows is often the plan-level form of an N+1.

`pg_stat_statements` ranks statements by total time. The catalog views `pg_stat_user_tables` and `pg_stat_user_indexes` show dead tuples, last vacuum, and indexes that are never scanned.

## Transactions and locks

The default isolation is read committed: each statement sees a fresh snapshot, so a read followed by a write can race. Use `SELECT ... FOR UPDATE`, a single conditional `UPDATE`, or `SERIALIZABLE` with retry on a serialisation failure. Lock rows in a consistent order, such as by id.

MVCC keeps old row versions until vacuum removes them. A transaction left open blocks that cleanup for the whole database, so set `idle_in_transaction_session_timeout`. Frequent updates to wide rows bloat tables; keep hot counters and large rarely read columns apart.

## Row-level security

Enable it on tenant tables and index the columns its policies filter on. Wrap a per-request function call in a scalar subquery, as in `(SELECT current_setting('app.tenant_id'))`, so it is evaluated once and not per row. Superusers and roles with `BYPASSRLS` always bypass policies, and the table owner does unless the table has `FORCE ROW LEVEL SECURITY`, so the application must connect as neither.

## Connections and settings

Each connection is a server process. Keep `max_connections` modest and put a pooler in front for many clients. Transaction-mode pooling breaks session state: session-level `SET`, advisory locks held across statements, and, depending on the pooler, prepared statements.

Settings worth a deliberate value: `statement_timeout` and `lock_timeout` per role, `idle_in_transaction_session_timeout`, and `work_mem`, which applies per sort or hash node and not per connection. Revoke default privileges on the `public` schema from `PUBLIC` and grant the runtime role only what it uses.

## Traps

- A partitioned table needs the partition key in its primary key and unique constraints. Partition only when queries filter on the key or old data is dropped by partition.
- Sequence and identity values have gaps after rollbacks. Do not treat them as a count.
- `count(*)` on a large table scans it. Use an estimate from statistics when exactness is not needed.
- `NOT IN` with a subquery that can return `NULL` returns no rows. Use `NOT EXISTS`.
