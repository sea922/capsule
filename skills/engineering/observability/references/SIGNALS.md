# Signals

Read when choosing fields, metric names and labels, or span boundaries. The project's existing names and libraries win; library APIs change, so confirm them against the installed version's documentation.

## Logs

- One event per unit of work, with a stable event name. A field to filter on beats a sentence to pattern-match.
- Fields worth having on every line: timestamp, service, version, environment, correlation id, route or job name, entry point, outcome, duration, error class.
- Levels, used the same way everywhere:

| Level | Meaning | Operator response |
| --- | --- | --- |
| Error | An invariant broke; someone may need to act | Investigate |
| Warning | Degraded but handled, such as a retry that succeeded or a fallback used | Watch the trend |
| Info | A significant event, such as an order placed or a job finished | None |
| Debug | Diagnostic detail | Off in production by default |

- Allow-list the fields that may be logged instead of logging an object and removing what looks sensitive. Whole request and response bodies, headers, and exception objects that embed input are the common leaks.
- Log an error once, where it is handled, with its cause. The same failure logged at every layer reads as several failures.
- A debug level left on in production is a frequent cause of a telemetry bill; check it before touching sampling.

## Metrics

| What is measured | Record |
| --- | --- |
| Request-driven work: endpoint, consumer, job | Rate, errors, duration distribution |
| A resource: pool, queue, worker set, host | Utilization, saturation, errors |
| A queue | Depth and the age of the oldest item; age shows a stuck consumer that depth alone hides |
| A dependency call | Attempts, outcomes, duration, retries, apart from the caller's total |

- Use histograms for durations and sizes, with buckets that bracket the objective's threshold. Read p50, p95, and p99 together with the count.
- Use a counter for things that only increase and a gauge for a level that goes both ways. Derive a rate at query time.
- Follow the naming and unit convention already in use, and put the unit in the name where the convention does.
- Labels come from small fixed sets. Use the route template, not the path; the status class, not every code, unless a code matters on its own.
- Carry version or deploy identity so "which release" is a filter. Keep it bounded: a label that takes a new value on every deploy still grows without limit if old series are never dropped.

## Traces

- Start from automatic instrumentation; add a manual span where a unit of work has a name an operator would use.
- Put high-cardinality detail here and in logs: user or tenant id where policy allows it, the entity id, the retry number.
- Record an error on the span where it happened, and mark the span's status, so failed traces can be found.
- Context must cross HTTP headers, message metadata, and thread or task hand-offs. Most traces die at the queue boundary, which is where unexplained latency tends to live.
- Sampling decided at the start of a request is cheap but drops rare failures; sampling decided after the request completes can keep errors and slow requests and costs more to run. State which is in use, because it decides what can be found later.

## Health endpoints

- Liveness says the process should not be restarted. Keep dependency checks out of it, or one slow database restarts every instance.
- Readiness says the instance can take traffic now, and may include the dependencies it cannot serve without.
- Report dependency health separately, for people and dashboards.

## When the data misleads

| Symptom | Likely cause |
| --- | --- |
| Every signal is green and users complain | Measurement sits behind the point of failure; measure closer to the user, past the load balancer, edge cache, and client |
| Telemetry cost jumped | An unbounded label, or debug logging left on |
| A trace stops halfway | Context is not propagated across an asynchronous or queue boundary |
| Nothing was recorded for the window that mattered | Sampling or retention dropped it; say so and do not reconstruct it from what seems likely |
| Durations look fine while requests time out | Timed-out or failed requests are not recorded in the histogram |
