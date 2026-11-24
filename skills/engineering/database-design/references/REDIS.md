# Redis

Defaults for using Redis as a cache, counter store, coordinator, or stream. Decide first whether each key space is disposable. A cache can be evicted and rebuilt; a queue, lock, or session store cannot, and the two need different eviction and persistence settings, so keep them on separate instances.

## Pick the structure

| Need | Structure |
| --- | --- |
| Cached value, counter, flag | String, with `INCR` for counters |
| Object with fields updated separately | Hash |
| Membership, uniqueness | Set |
| Ranking, time-ordered index, sliding window | Sorted set |
| Simple queue or recent-items list | List |
| Durable event log with consumer groups | Stream |
| Approximate distinct count | HyperLogLog |

## Keys

Name keys `namespace:resource:id`, optionally with a field or date, and keep the scheme in one place in the code. Include a version segment when the stored shape may change, so a deploy does not read the old shape. In cluster mode, keys used together in one multi-key command, transaction, or script must share a hash tag, such as `{user:42}:cart` and `{user:42}:profile`.

## Expiry

Give every cache key a TTL, chosen from how stale the value may be and not from habit. Add random jitter so keys written together do not expire together. Match a rate-limit key's TTL to its window. Keys without a TTL are a decision to store data permanently; make it knowingly.

## Caching

- **Cache-aside** is the default: read the cache, fall back to the source, write the result with a TTL. On a write to the source, delete the key instead of updating it, which avoids two writers leaving a stale value.
- **Write-through** suits values read immediately after writing, at the cost of a write to both stores.
- **Stampede**: when a hot key expires, many requests recompute it at once. Let one caller rebuild behind a short lock while others wait or serve the old value, or refresh early at random before expiry.
- **Negative results**: cache "not found" briefly, or repeated misses fall through to the source every time.
- **Group invalidation**: track member keys in a set per tag, or put a version number in the key and bump it.

A cache is not a source of truth. The application must work, more slowly, when the key is missing or Redis is unreachable; set short client timeouts so a Redis fault does not hold every request.

## Rate limiting

A fixed window is `INCR` plus an expiry set on the first increment. Do both atomically, or a crash between them leaves a counter that never expires. It allows a burst of twice the limit across a window boundary. A sliding window over a sorted set, or a token bucket, is accurate; run its read-modify-write as one Lua script so concurrent requests cannot interleave.

## Locks

Acquire with `SET key token NX PX ttl`, where the token is random per holder. Release only with a script that deletes the key if it still holds that token; a plain `DEL` can remove a lock that expired and was taken by someone else.

A lock on Redis is advisory. A paused process or a failover can leave two holders, so the protected operation must still be safe: carry a fencing token that the downstream store checks, or make the work idempotent. When correctness depends on mutual exclusion, enforce it in the database.

## Messaging

- **Pub/Sub** delivers only to subscribers connected at that moment and keeps nothing. Use it for signals that may be lost.
- **Streams** persist entries. With a consumer group, each entry goes to one consumer, which must `XACK` it. Delivery is at least once, so handlers must be idempotent. Reclaim entries stuck with a dead consumer (`XAUTOCLAIM`), and cap the stream with `MAXLEN` or it grows without limit.

## Atomicity

`MULTI`/`EXEC` queues commands and runs them together, but does not roll back when one fails at runtime. Use `WATCH` for optimistic checks, or a Lua script when a decision depends on a value read in the same step. Scripts block the server while they run, so keep them short.

## Connections and topology

Use a client pool sized to the workload, with connect and command timeouts. Pipeline batches of independent commands to save round trips. Blocking commands and subscriptions need their own connections. Sentinel gives failover for one primary; Cluster shards data and restricts multi-key operations to one slot. Replication is asynchronous, so a failover can lose the most recent writes.

## Memory and persistence

Set `maxmemory` and an eviction policy that matches the data:

| Policy | Use for |
| --- | --- |
| `allkeys-lru` or `allkeys-lfu` | A pure cache |
| `volatile-lru` or `volatile-ttl` | Mixed data where only keys with a TTL may go |
| `noeviction` | Queues, locks, and anything that must not vanish; writes fail when full |

Enable append-only persistence when the data must survive a restart, and accept the fsync policy's loss window knowingly.

## Traps

- `KEYS`, and `SMEMBERS` or `HGETALL` on huge collections, block the single command thread. Iterate with `SCAN`, `SSCAN`, and `HSCAN`.
- Deleting a very large key blocks too. Use `UNLINK`.
- Large values slow every access and move whole over the network. Store big blobs elsewhere and keep a reference.
- One enormous collection or one very hot key cannot be spread across a cluster. Split it by bucket.
- `FLUSHALL` and `FLUSHDB` wipe more than intended on a shared instance. Delete by scanned pattern.
- Require authentication and TLS, and never expose the port publicly.
