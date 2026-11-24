---
name: database-migrations
description: Plan, write, and verify database schema and data changes that survive a live deploy without losing data or locking tables. Use when adding, changing, renaming, or dropping columns, tables, indexes, or constraints, writing a migration or backfill, reviewing one, or checking that a migration did what it claimed. Designing the schema, index, or query belongs to database-design; slow queries to performance; a migration's surrounding release to ship-it.
---

# Database migrations

A migration changes a shared, stateful system that old and new code read at the same time. Plan for the deploy in the middle, not only for the start and end states, and never call a change reversible when its data is not.

## 1. Read the current state

Identify the database, its version, and the migration tool from the repository, because locking and transaction rules differ between them. Read the live schema or its latest definition, the migration history, and every reader and writer of the objects you will touch: application code, jobs, reports, and other services. A deployed older version may still read a column this repository no longer mentions. Name the readers you found, and say when you could not list them all.

Writing and rehearsing migrations locally is in scope. Running anything against a shared or production database is a separate, explicit authorization.

**Complete when:** the engine, tool, affected objects, their readers and writers, and the edit authority are written down.

## 2. Classify and sequence

Sort each change:

- **Additive:** a new table, a nullable column, or a new index. Safe as one step.
- **Rewriting:** a type change, a new `NOT NULL` or unique constraint on existing data, a rename, or a drop.
- **Data only:** a backfill or correction.

Sequence everything that is not additive as expand, migrate, contract, across separate deploys:

1. **Expand:** add the new shape, nullable and unused. Old code is unaffected.
2. **Dual-write:** deploy code that writes both shapes, and wait until every running instance is on it.
3. **Backfill** historic rows (step 4).
4. **Switch reads** to the new shape, and watch.
5. **Contract:** drop the old shape in a later migration, once no supported version reads it.

Keep schema changes and data changes in separate migrations. Never edit a migration that has already run anywhere; add a new one.

**Complete when:** every change is classified and each non-additive change has its ordered steps and the deploy each one belongs to.

## 3. Make each statement lock-safe

Every statement takes a lock; what matters is which lock, for how long, and what queues behind it.

- Set a short lock timeout and statement timeout for the migration session, so blocked DDL fails fast and can be retried.
- Build indexes with the engine's online option. On PostgreSQL a concurrent build cannot run in a transaction, and a failed one leaves an invalid index to drop before retrying.
- Add foreign keys and check constraints unvalidated, then validate in a separate statement.
- On MySQL, confirm the operation is online for that version and storage engine, or use online schema-change tooling.
- Do not assume adding a column is free: whether it rewrites the table depends on the engine, the version, and the default.

**Complete when:** each statement's lock and expected duration are known, or the unknown is stated.

## 4. Batch the backfill

Update in bounded primary-key ranges, committed per batch, resumable from a recorded position, with a pause between batches. One statement across a large table holds locks throughout, bloats the write-ahead log, and cannot be stopped halfway. Backfill in SQL where the transform allows; pushing rows back through application code re-runs its side effects.

**Complete when:** the backfill is batched, resumable, and safe to run twice.

## 5. State the rollback honestly

Write the way back for each step, and say what it cannot recover. Dropping a column you just added is a real rollback. A down migration after a destructive step restores the shape, not the data: that rollback is a restore from backup, so name the backup and how long a restore takes.

**Complete when:** every step has a rollback, and every irreversible step is labelled irreversible.

## 6. Rehearse, then stop

Run the migration on a copy with realistic volume. Record how long each statement took and what it locked; timings from a small dataset say nothing about production. Capture the before-state the verification will need, such as row counts, aggregate checksums of columns that move, and constraint state, because it cannot be recovered afterwards.

Then stop. Present the plan, rehearsal timings, rollback and its limits, and ask before anything runs on a shared or production database.

**Complete when:** rehearsal results and the before-state are recorded, and the production run awaits the user's decision.

## 7. Verify what ran

Applying is not verifying. After a run:

- compare the database's migration history with the repository's files; a clean exit is not the record;
- compare row counts with the predicted change, and checksum the columns that moved against the before-state, over whole tables or a stated sample;
- read the catalog to confirm each new constraint is validated and each index is valid, and read the query plan to confirm the index is used;
- run invariant queries that return offending rows: orphaned foreign keys, unexpected nulls, duplicates, out-of-range values;
- exercise the application's real read and write path against the migrated database.

Without a captured before-state you can check the result against the schema and invariants, but you cannot show that nothing was lost. Say so in those words.

**Complete when:** each claim about the migration is backed by a query result, or is reported as unverified.

## 8. Review a migration

When asked to review a migration or schema change, or when `code-review` deep mode delegates, use the read-only `database-migrations-reviewer` agent when available, or the same checks directly. A risk is a finding only with the table size, deploy order, or concurrent writer that makes it real.

**Complete when:** each finding names its trigger, its impact, and the safe alternative.
