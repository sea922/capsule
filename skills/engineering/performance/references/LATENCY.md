# Latency-sensitive paths

Read this when the confirmed concern is how quickly an event becomes visible or
acted on: realtime dashboards, data feeds, streaming responses, queues, and
caches in front of them. Here "fast" is several separate numbers, and improving
one can quietly worsen another.

## Split the metrics

Record each of these on its own, under a stated load, before changing anything:

- **Latency as a distribution:** p50, p95, and p99 from a histogram. An average
  hides the tail, and the tail is what users of a realtime path notice.
- **Freshness age:** now minus the timestamp the source put on the data. A
  response can return in a few milliseconds and still show data that is minutes
  old.
- **Queue depth and its direction:** a depth that keeps growing means the
  consumer is slower than the producer, whatever the per-item latency says.
- **Throughput** at which the latency figures were taken. Latency without the
  load it was measured under is not comparable to anything.
- **Cache hit rate**, with the age of what the hits returned.
- **Upstream response time** for each provider or dependency, apart from your
  own processing.
- **Error, retry, and timeout rates**, and whether results stay correct under
  load. A path that gets faster by dropping work has not improved.

Take timestamps from one clock where possible. When segments run on different
machines, say how far their clocks can differ before reading a small gap as
real.

## Map the hot path and budget each hop

Write the path from the originating event to the state a user sees, naming
every hop: source, upstream API, ingest worker, queue, store or cache, serving
route, stream to the client, render. Then:

1. Measure each hop separately, including time spent waiting in a queue or for
   a connection, not only time spent working.
2. Give the whole path a target (for example a p95 and a maximum freshness
   age) taken from the user-facing requirement, and divide it among the hops.
3. Find the hop that spends the most of the budget or varies the most. That is
   the limiter; work elsewhere will not move the end-to-end figure.

A hop that is fast at p50 and slow at p99 usually waits on something shared: a
lock, a pool, a garbage-collection pause, a cold cache, or a retry.

## Candidate changes, in the order to consider them

Try one at a time, measuring the whole path after each.

1. Remove round trips the path does not need.
2. Cache stable reads, and store the source timestamp with each entry so
   staleness stays visible.
3. Batch small calls and writes, with a cap on how long an item may wait for
   its batch. Batching raises throughput and can raise per-item latency.
4. Move the computation nearer to the data or to the user.
5. Split hot and cold work so slow, rare operations do not share a queue, pool,
   or thread with the fast path.
6. Bound every queue and decide what happens when it is full: block the
   producer, shed load, drop the oldest, or collapse updates to the latest
   value per key. An unbounded queue turns overload into growing latency and
   then memory failure.
7. Put timeouts on every hop, shorter than the caller's own, and retry only
   with a limit and backoff. Retries during an incident multiply load.
8. Use streaming or push only where it measurably improves freshness or the
   experience over polling.

## Degraded modes

Decide in advance what the path does when an upstream is slow or down: serve
the last value marked as stale with its age, show an explicit gap, or fail.
Add a check that alerts on stale data, a growing queue, and a degraded
upstream, since a healthy response time does not reveal any of the three.

## Verify with a live readback

After a change, read the numbers from the running system rather than from the
code or a label in the interface:

- request timing and cache headers at the serving edge
- the source timestamp carried through to the response, compared with now
- queue or job state: depth, oldest item age, consumer lag
- the actual screen in a browser when the claim is about what users see
- logs around retries, timeouts, and any switch into a degraded mode

Report before and after as distributions at the same load, with freshness and
queue depth beside latency.

## Limits

- Do not buy latency by removing required validation, authorization, or
  durability.
- Do not let a cache hit present stale data as current.
- Do not claim a timing you did not measure end to end.
- Keep secrets and private payloads out of timing logs and benchmark output.
- Load tests and changes on shared or production systems need the user's
  go-ahead first.
