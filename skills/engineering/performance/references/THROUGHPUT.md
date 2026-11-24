# Bulk data movement

Read this when the slow thing is moving, transforming, or loading a lot of
data: ingestion, backfill, export, ETL, warehouse loads, or keeping two tables
in step. The goal is correct data landed sooner, with proof that it is all
there. A faster job that loses or duplicates rows is a regression.

A backfill or rewrite on a live application schema belongs to
`database-migrations`, which owns batching against locks and the deploy
sequence. Use this reference for the movement itself.

## Find the true bottleneck

Measure each stage's rate on its own, in rows or bytes per second, before
tuning anything:

| Stage | Signs it is the limiter |
| --- | --- |
| Source extraction | Slow or unindexed reads, API rate limits, paging by offset, one small request per item |
| Network transfer | Rate tracks bandwidth or distance; uncompressed or row-at-a-time transfer |
| Transform | A CPU core pinned in the worker; per-row lookups; repeated parsing |
| Sink load | Row-by-row inserts, a commit per row, index and constraint upkeep, lock waits |
| Serving refresh | Data has landed but the table users read is rebuilt late |

Also measure how fast new data arrives while the job runs. A job can be quick
and still never catch up when the tail grows faster than the final window
closes, so report backlog and live tail separately.

## Variants worth benchmarking

Benchmark on a representative sample or one partition, changing one thing at a
time, and use `benchmark` when the comparison needs to be defended.

- **Batch size:** larger batches cut round trips until memory, transaction
  size, or lock time becomes the limit. Find the knee instead of guessing.
- **Parallelism:** add workers until the slowest stage saturates. Partition the
  work by key or file so workers do not contend, and watch the sink for lock
  waits.
- **Bulk-load paths:** the engine's native bulk loader or staged-file load is
  usually far faster than generic inserts. Check what it skips, such as
  triggers or some validation.
- **Where the work runs:** transforming inside the system that already holds
  the data avoids pulling it out and pushing it back.
- **Indexes and constraints:** loading into a staging table and building
  indexes afterwards can be faster. Dropping or disabling them on a table that
  is in use removes protection other writers rely on, so treat that as a schema
  change for `database-migrations`.
- **File grouping:** many small files or requests cost more in overhead than in
  data. Combine them.
- **Layout:** partitioning and sort order that match how the data is appended
  and read.

## Make reruns safe

A long job will be interrupted. Design for that before making it fast:

- Record progress in a checkpoint or manifest so finished files or key ranges
  are skipped on restart.
- Make writes idempotent with unique keys, upserts, or a staging table swapped
  in whole, so a retried batch does not duplicate rows.
- Record failed items with the reason. Never skip them silently.
- Keep raw, derived, and serving data separately countable, so a discrepancy
  can be traced to one step.

## Prove it with an accounting block

End every run, including the benchmark runs, with figures read back from the
source and the target:

```text
Source items discovered:   <count>
Items processed this run:  <count>   failed: <count, listed>
Rows read / rows written:  <count> / <count>   (difference explained)
Target min / max timestamp: <values>, matching the source range
Checksum or sampled compare: <result>
Remaining tail at readback: <count>
Runtime and rate:          <seconds>, <rows per second>
```

Row counts alone miss wrong values, so add a checksum over key columns or a
sampled row-by-row comparison. Explain every expected difference, such as
filtered or deduplicated rows, with its own count. The job is complete only
when the checkpoint and the target agree.

## Then make it repeatable

Promote the fastest variant whose accounting holds, write it down as a
command, scheduled job, or runbook, and run the accounting again on the
codified path, since the benchmark measured a different invocation.

## Limits

- Do not delete or truncate raw data to make a number look better.
- Do not report backfill progress as live freshness, or the reverse.
- Runs against shared or production data need the user's go-ahead, and
  regulated or customer-affecting data needs its replay evidence kept.
