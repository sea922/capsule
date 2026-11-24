---
name: database-design
description: Design database schemas and write queries that fit the workload, covering keys, types, constraints, indexes, query plans, transactions, and connection pooling, with engine references for PostgreSQL, MySQL and MariaDB, Redis, and ClickHouse. Use when modelling new tables or key spaces, choosing a data type or index, writing or reviewing a query, picking an isolation level, or sizing a pool. Changing a live schema safely belongs to database-migrations; diagnosing a measured slowdown to performance.
---

# Database design

A schema is a set of promises about what the data can be, and an index is a bet on which questions will be asked. Design from the questions the application asks, let the database enforce what must always be true, and check each query against the plan the engine actually chose.

## 1. Read the workload first

Identify the engine and its version from the repository or the running instance, since types, index kinds, and locking differ between them. Then list the access patterns before drawing any table:

- each read the application makes, with its filter, sort, and page size
- each write, how often it happens, and whether it must be atomic with another
- expected row counts now and at the growth horizon the project plans for
- which reads are interactive and which are batch or analytical
- what must never be wrong, such as balances, uniqueness, or ownership

Read existing schemas, models, and query code for the conventions already in use, and follow them. Say which volumes and patterns are measured and which are assumed. A design made without the access patterns is a guess, so ask for them when they cannot be read from the code.

## 2. Model the data

Start normalised: one fact in one place, each table about one thing. Denormalise only for a read that is known to be too slow or too frequent to join, and name who keeps the copy in step.

Give every table a primary key. Default to a compact, monotonic surrogate key, because random keys scatter writes across the index; use a time-ordered identifier when ids must be generated outside the database or must not reveal counts. Keep natural keys as unique constraints.

Model relationships with foreign keys and decide each delete rule deliberately. Keep tenancy, ownership, and lifecycle fields as real columns. Semi-structured columns suit optional attributes nobody filters on; a field that is filtered, joined, or constrained deserves a column.

## 3. Choose types and constraints

Pick the narrowest type that holds the real range of values, and choose it for meaning:

- exact decimals for money and quantities, never binary floats
- a time type with a clear zone rule, storing instants in UTC
- integer keys wide enough for the table's lifetime
- booleans for flags, and a constrained text column or lookup table for a status set that will grow

Let the database enforce invariants: `NOT NULL` wherever absence has no meaning, unique constraints for identity, foreign keys for references, and check constraints for ranges and allowed values. A rule enforced only in application code holds until a second writer, a script, or a race breaks it.

## 4. Index for the queries

Write the index from the query, not from the table:

- Index columns used to filter, join, and sort on paths that matter.
- In a composite index, place equality columns first, then the range or sort column. An index serves queries that use its leading columns.
- Add the referencing column of a foreign key when the engine does not index it for you.
- Use a covering index when a hot read needs only a few columns, and a partial or filtered index when queries touch a small, stable subset.
- A function or implicit cast on an indexed column, or a leading wildcard, usually stops the index being used.

Every index slows writes and takes space. Remove one that no query uses, and prefer extending an existing index over adding a near duplicate.

## 5. Write the query and read its plan

Select the columns needed. Page with a keyset on an indexed, unique order instead of a deep offset. Fetch related rows in one query or one batch per level instead of one query per row. Write multi-row inserts and bounded batches for bulk work. Always pass values as parameters.

Then read the plan on data of realistic size and distribution, because a plan on an empty table says nothing. Check the access method for each table, the estimated against the actual row counts, and any sort or temporary structure. A wide gap between estimate and actual usually means stale statistics or a predicate the planner cannot see through. Change one thing and read the plan again.

## 6. Transactions and isolation

Group writes that must succeed or fail together, and keep the transaction short: no network calls, user waits, or large loops while it is open. Know the engine's default isolation level and what it permits; for a read-then-write that must not race, use a locking read, an atomic conditional update, or a stricter level, and expect to retry on a serialisation failure or deadlock. Take locks in one consistent order across code paths. Make retried writes idempotent with a unique key or an upsert.

## 7. Connections and limits

Use a pool, and size it from what the database can serve across every application instance, not per instance. More connections than the database has capacity for makes everything slower. Set acquisition, statement, and idle-in-transaction timeouts so one stuck request cannot hold the rest, and recycle connections before the server's idle limit closes them. Send a read to a replica only when it tolerates lag, and keep a read that follows the user's own write on the primary. The runtime account gets the privileges the application needs and no more, with schema changes under a separate one.

## 8. Load the engine reference

Read the one that matches the engine before finalising types, indexes, or settings:

- [PostgreSQL](references/POSTGRES.md)
- [MySQL and MariaDB](references/MYSQL.md)
- [Redis](references/REDIS.md) for caches, counters, locks, and streams
- [ClickHouse](references/CLICKHOUSE.md) for analytical tables

For an engine not listed, apply the steps above and check its own documentation for index kinds, default isolation, and locking behaviour.

## 9. Report

Give the design as schema or query text, then state the access patterns it serves, the indexes with the query each one exists for, the invariants the database enforces, and the assumptions about volume that would change the answer. Include the plan evidence for queries you checked, and say which you could not run.

## Boundaries

- `database-migrations` owns applying a change to a live database: lock-safe statements, backfills, and expand and contract sequencing. Design the target here, then hand over the path to it. Its `database-migrations-reviewer` agent reviews the migration.
- `performance` owns a measured slowdown: establishing the baseline and proving which query is the limiter. Use this skill for the fix once the query is known.
- `security-review` owns access control, injection, and secrets beyond the least-privilege defaults above.
- `codebase-design` owns where data access sits in the application.
