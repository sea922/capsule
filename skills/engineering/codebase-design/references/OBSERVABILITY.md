# Production Evidence

Observability is part of the relationship contract when an interaction can fail independently. Instrument the seam so operators can reconstruct a business action without guessing from process-local logs.

## Evidence per edge

For each important dependency or message flow, record:

- request, command, or message type;
- initiating module and receiving module;
- outcome category, not only success or exception;
- latency or queue age;
- traffic rate;
- errors, rejections, timeouts, and unknown outcomes;
- saturation, concurrency, queue depth, or backlog;
- retry and redelivery attempts;
- contract or schema version;
- trace, correlation, and causation context;
- owning team and runbook or escalation route.

Google's four golden signals provide a useful baseline: latency, traffic, errors, and saturation. Messaging also needs lag, age, retry, duplicate, and dead-letter evidence.

## Correlate the flow

- Propagate standard trace context across supported synchronous and asynchronous transports.
- Use a **correlation ID** for the whole business interaction.
- Use a **causation ID** for the immediate command or event that produced a message.
- Preserve message IDs for deduplication and replay diagnosis.
- Record occurred, published, received, started, and completed times when delay matters.

Do not replace trace context with one ad hoc ID. Each field answers a different diagnostic question.

## Name outcomes

Prefer bounded, machine-readable outcome categories:

- succeeded;
- rejected by business rule;
- unauthorized or forbidden;
- invalid contract;
- dependency unavailable;
- timed out with unknown outcome;
- overloaded or shed;
- retried then succeeded;
- exhausted retries;
- quarantined or dead-lettered;
- compensated or reconciliation required.

Keep exception details for diagnosis while using stable categories for metrics and SLOs.

## Observe asynchronous work

Measure:

- publish and consume success;
- oldest message age and consumer lag;
- production versus sustainable consumption rate;
- retry, redelivery, and duplicate rates;
- dead-letter volume and age;
- per-key or partition skew;
- end-to-end completion latency;
- replay progress and reconciliation differences.

Alert on user or business impact and unrecoverable backlog trajectory, not every transient retry.

## Control cost and risk

- Keep metric dimensions bounded; put high-cardinality IDs in traces or logs.
- Exclude secrets, tokens, payment data, and unnecessary personal information.
- Sample traces deliberately while preserving errors and rare critical paths.
- Define retention and access policy for diagnostic data.
- Make dashboards and alerts follow contract outcomes and ownership.

## Completion gate

An observable relationship has:

- stable outcome and error categories;
- golden signals or messaging equivalents;
- trace and correlation propagation;
- queue or dependency saturation evidence;
- bounded cardinality and protected sensitive data;
- an owner who can act on the signal;
- a way to verify instrumentation before production incidents.

## Primary sources and specifications

- [Google, Dapper](https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/)
- [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/)
- [Google SRE, Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
