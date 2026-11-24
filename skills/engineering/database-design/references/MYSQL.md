# MySQL and MariaDB

Defaults for schema and query work on InnoDB. Identify the engine and version first with `SELECT VERSION()`: MySQL and MariaDB have diverged, and the same statement can be current on one and deprecated or missing on the other. The project's own conventions win.

## Where the two differ

- In `INSERT ... ON DUPLICATE KEY UPDATE`, MySQL 8 prefers a row alias (`AS new ... SET col = new.col`) and deprecates `VALUES(col)`; MariaDB uses `VALUES(col)`.
- JSON is a native binary type in MySQL and an alias for a text column with a validity check in MariaDB.
- `SKIP LOCKED`, window functions, common table expressions, check constraints that are actually enforced, and functional indexes arrived in different releases on each. Confirm against the running version before relying on one.

## Types

| For | Default | Avoid, and why |
| --- | --- | --- |
| Surrogate keys | `BIGINT UNSIGNED AUTO_INCREMENT` | `INT` on a table that can pass two billion rows |
| UUID keys | `BINARY(16)`, time-ordered | `VARCHAR(36)` as the primary key of a hot table |
| Text | `utf8mb4` character set, one collation across joined columns | `utf8`, which is the three-byte `utf8mb3` |
| Money, exact quantities | `DECIMAL(p, s)` | `FLOAT` and `DOUBLE` |
| Instants | `DATETIME` holding UTC by convention, or `TIMESTAMP` | Assuming `DATETIME` stores a zone; `TIMESTAMP` converts by session zone and has a limited range |
| Status sets that grow | `VARCHAR` with a check constraint, or a lookup table | `ENUM` when values change often |
| Optional attributes | `JSON` | JSON for fields that are filtered, joined, or constrained |

Set strict SQL mode. Without it the server truncates or coerces values that do not fit and reports only a warning.

## The clustered primary key

InnoDB stores each table in primary-key order, and every secondary index carries a copy of the primary key. Two consequences shape the design:

- A short, monotonic primary key keeps inserts at the end of the tree. A random one causes page splits and fragmentation.
- A wide primary key makes every secondary index wide.

A secondary index therefore already covers the primary-key columns.

## Indexes

- Composite order: equality columns, then the range or sort column. An index serves its leftmost prefix only.
- InnoDB creates an index on a foreign key's referencing column when none exists. Check that it also suits the queries, and replace it with a composite when it does not.
- For a queried JSON path, add a generated column and index that column.
- Soft-deleted tables need the deletion marker in the indexes that live queries use, since there are no partial indexes.
- A long text prefix index cannot cover or sort. Prefer a hash or generated column for equality on long strings.
- Built-in `FULLTEXT` search suits simple matching. Typo tolerance, facets, or custom ranking need a search engine.
- Comparing columns of different character sets or collations, or a string column to a number, converts per row and skips the index.

## Queries

- Page by keyset on an indexed order such as `(created_at, id)`. A deep `OFFSET` reads and discards every skipped row.
- Claim queue rows with `SELECT ... FOR UPDATE SKIP LOCKED` in a short transaction, for queue work only.
- Batch large updates and deletes by primary-key range. One huge statement holds locks, grows undo history, and delays replicas.
- Select named columns on hot paths, and bind values as parameters.

## Reading a plan

Use `EXPLAIN` for the estimate and, where the version has it, `EXPLAIN ANALYZE` (MySQL) or `ANALYZE` (MariaDB) for the measured run. Both measured forms execute the statement, so run them on a replica or a non-production copy and never on a write in production.

| Field | Concern |
| --- | --- |
| `type` | `ALL` on a large table is a full scan |
| `key` | `NULL` although a selective predicate exists |
| `rows` | A high estimate on an interactive path |
| `Extra` | `Using temporary` or `Using filesort` on a hot query |

The slow query log and the `performance_schema` statement digests rank what to look at.

## Transactions and locks

The default isolation is repeatable read. Under it InnoDB takes gap and next-key locks on range scans, so an `UPDATE` or `DELETE` whose predicate has no index can lock far more rows than it changes.

- Index the predicates of every `UPDATE`, `DELETE`, and locking read.
- Lock rows in one deterministic order across code paths, and keep external calls outside the transaction.
- On deadlock the server rolls one transaction back. Retry the whole transaction a bounded number of times.
- Read `SHOW ENGINE INNODB STATUS` soon after a deadlock, as only the latest is kept.
- Most DDL commits implicitly, so a schema change cannot be rolled back with the surrounding transaction. Hand online changes to `database-migrations`.

## Connections and replication

Recycle pooled connections sooner than the server's `wait_timeout`, and validate a connection on checkout, or the pool hands out sockets the server already closed. Total pool size across all instances must stay under `max_connections` with room for administration.

Replicas lag. Keep a read that follows the user's own write on the primary, and route to replicas only reads that tolerate staleness. Watch lag before trusting a replica for anything time-sensitive.

Settings worth a deliberate value: `innodb_buffer_pool_size`, `max_connections`, `wait_timeout`, `innodb_lock_wait_timeout`, `long_query_time` with the slow log on, and `sql_mode`.

## Accounts

Give the runtime account only the statements it runs on its own schema, never `ALL PRIVILEGES` or `*.*`. Use a separate account for migrations, require TLS across hosts, and manage users with `CREATE USER` and `ALTER USER`, not by editing grant tables.
