# ClickHouse

Defaults for analytical tables on ClickHouse. It is a column store built for scanning and aggregating many rows over a few columns. It is not a transactional database: there are no multi-statement transactions to rely on, row updates and deletes are heavy background rewrites, and point lookups by arbitrary column are slow. Keep the system of record elsewhere and load events and facts into ClickHouse.

## Engine choice

| Engine | Use for |
| --- | --- |
| `MergeTree` | Append-only facts and events; the default |
| `ReplacingMergeTree` | Latest version per key, deduplicated eventually |
| `SummingMergeTree`, `AggregatingMergeTree` | Pre-aggregated rollups, usually fed by a materialized view |
| `CollapsingMergeTree` and its versioned form | State changes expressed as cancel and replace rows |
| `Replicated*` variants | Any of the above on a replicated cluster |

Merges run in the background at times you do not control. Until parts merge, a replacing or aggregating table still holds duplicates and partial states, so queries must aggregate again (`argMax`, `sum`, `-Merge` combinators). `FINAL` forces the merge at read time and is costly on large tables; use it only where the cost is measured and acceptable.

## Sorting key

`ORDER BY` is the most important design decision, and changing it means rebuilding the table. It defines the sparse primary index and how data sits on disk.

- Lead with the columns nearly every query filters on.
- Among those, order from lower to higher cardinality, such as tenant, then event type, then time. This keeps the index selective and improves compression.
- Stop at the columns that filters actually use. A row-unique id at the front makes the index useless for everything else.
- The index is sparse: it finds ranges of granules, not rows. A filter that skips the leading key columns scans the table.

For a secondary filter pattern, add a data-skipping index (bloom filter, min-max, set) or a projection with a different order, and confirm in the query log that it reduces rows read.

## Partitioning

Partition by a coarse time unit, usually month, and only to manage data lifecycle: dropping or moving old partitions, and TTL. Partitioning is not the main query speed-up; the sorting key is. Many small partitions, such as by day on a low-volume table or by a high-cardinality column, create too many parts and slow inserts and merges.

## Types

- Use the smallest numeric type that fits, and `DateTime` over `DateTime64` when sub-second precision is not needed.
- `LowCardinality(String)` for strings with up to some thousands of distinct values.
- Avoid `Nullable` unless absence must differ from a default; it adds a separate column and slows processing.
- `Decimal` for money. Floats aggregate with rounding error.
- Extract fields that are filtered or grouped from JSON into real columns at insert time.
- Choose codecs for big columns where storage matters, such as delta encoding for monotonic values.

## Inserts

Each insert creates a part, and too many parts stall the table with a "too many parts" error.

- Insert in large batches, thousands to hundreds of thousands of rows, at most about once a second per table.
- When clients can only send small writes, enable asynchronous inserts or put a queue or buffer in front.
- Inserts are not deduplicated by key. Retried batches are deduplicated only when identical and on replicated tables, so make loaders retry the same batch, or dedupe with a replacing engine.
- Batches that span many partitions create a part per partition.

## Queries

- Select only the columns needed. `SELECT *` reads every column file.
- Filter on the leading sorting-key columns and on the partition key so parts and granules are skipped.
- Prefer approximate functions (`uniq`, `quantile`) when exactness is not required; exact distinct counts and quantiles use far more memory.
- Joins load the right-hand table into memory by default. Put the smaller table on the right, filter both sides first, and use a dictionary for small dimension lookups. Denormalise dimensions that are joined on every query.
- `GROUP BY` on a high-cardinality key can exhaust memory. Set limits and allow spilling to disk for such queries.

## Materialized views

A materialized view is an insert trigger: it transforms each inserted block and writes the result to a target table. It sees only new blocks, never existing data, and it does not react to updates or deletes in the source. Backfill the target explicitly, write the target as an aggregating table with `-State` functions, and read it with `-Merge`. A failing view fails the insert to the source.

## Changing data

`ALTER TABLE ... UPDATE` and `DELETE` are mutations that rewrite whole parts asynchronously. Use them for rare corrections, not routine writes. Model change as new rows with a version column, and remove old data by partition drop or TTL. Lightweight deletes mark rows and still cost merges later.

## Checking a query

`EXPLAIN indexes = 1` shows which parts and granules the keys select. `system.query_log` records rows read, bytes read, memory, and duration for every query; compare rows read with rows returned. `system.parts` shows part counts and sizes per partition, the first place to look when inserts slow down.

## Traps

- Treating the primary key as unique. It is not enforced.
- Expecting read-your-writes consistency across replicas of a distributed table without configuring for it.
- Syncing from a transactional database by row-level updates. Load changes as versioned rows through a change stream instead.
- Relying on `FINAL` or `OPTIMIZE ... FINAL` in routine query or load paths.
