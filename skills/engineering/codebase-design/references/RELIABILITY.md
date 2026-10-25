# Reliability Across Boundaries

Crossing a process, network, transaction, or ownership boundary changes the contract. Latency, concurrency, partial failure, unknown outcomes, and independent evolution become design inputs.

## Budget time explicitly

- A **timeout** is how long one operation waits.
- A **deadline** is the latest useful completion time for the whole request or workflow.
- **Cancellation** communicates that downstream work is no longer wanted.
- A **TTL** limits how long queued or cached data remains valid.

Derive per-hop timeouts from the end-to-end deadline and reserve time for useful recovery. Propagate deadlines and cancellation where the protocol supports them. A timeout does not prove failure; it means the caller does not know the outcome.

## Make retries bounded

Retry only when the failure is transient and the operation is safe to repeat or protected by idempotency.

Define:

- which failure categories are retryable;
- maximum attempts or a retry budget;
- exponential backoff and jitter;
- deadline awareness;
- one owning retry layer;
- overload behavior and circuit or load-shedding policy;
- telemetry for attempts and final outcome.

Retries at several layers multiply load. Permanent errors, invalid requests, exhausted deadlines, and overload signals usually need rejection or delayed recovery rather than immediate retry.

## Define idempotency

State:

- the identity key and which fields define equivalent intent;
- key ownership and uniqueness scope;
- storage and deduplication window;
- behavior for concurrent duplicates;
- whether the original result is replayed;
- which effects are covered;
- what happens after the window expires.

HTTP method semantics can help, but a method name alone does not make a domain operation safe. Payments, emails, and third-party effects require effect-specific protection.

## Name delivery and ordering scope

Use guarantees only with a boundary:

- at-most-once between producer and broker;
- at-least-once delivery to a consumer group;
- ordered per aggregate key or partition;
- atomic processing inside one broker transaction;
- deduplicated effect in one database;
- end-to-end business outcome.

“Exactly once” without platform, boundary, duration, and effect scope is incomplete. Most reliable workflows combine at-least-once delivery with idempotent or deduplicated effects.

## Design asynchronous capacity

For queues and streams, specify:

- expected and peak production rate;
- sustainable consumer rate and concurrency;
- maximum useful backlog and message age;
- bounded buffer or retention limits;
- backpressure, admission control, or load shedding;
- retry and dead-letter behavior;
- poison-message diagnosis and replay;
- partition key, ordering, and hot-key behavior;
- lag and recovery-time objectives.

An unbounded queue defers failure until the backlog is too large to recover.

## Protect invariants and consistency

Start from the invariant and authoritative owner:

- Keep a hard invariant inside one transaction and owner where practical.
- Use optimistic concurrency when several writers legitimately race.
- State which reads can be stale, by how much, and how conflicts reconcile.
- Treat cache, replica, and projection freshness as contract data.
- Avoid multiple modules writing the same invariant-bearing state without an authority model.

CAP is proved narrowly, for atomic consistency (linearizability) and availability during a network partition in a replicated asynchronous system ([Gilbert and Lynch](https://www.cs.princeton.edu/courses/archive/spring21/cos418/papers/cap.pdf)). It is not a general instruction to “choose two.” Name the actual consistency and availability guarantees instead.

## Coordinate state and messages

- **Transactional outbox:** write domain state and an outgoing record atomically, then relay it. Consumers still handle duplicates and relay delay.
- **Saga:** compose local transactions and compensating actions. Compensation may fail and cannot erase already observed external effects.
- **Orchestration:** centralize workflow state and recovery when visibility and control matter.
- **Choreography:** distribute small independent reactions when no end-to-end controller is required.

Do not use dual writes without an atomicity or reconciliation story.

## Failure contract

For every remote or deferred operation, distinguish:

| Outcome                 | Meaning                                 | Typical caller action                                                 |
| ----------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| **Succeeded**           | Declared postconditions hold            | Continue and record outcome                                           |
| **Rejected**            | Request was understood but not accepted | Correct input, policy, or business state                              |
| **Failed permanently**  | Retry will not change the result        | Escalate, compensate, or stop                                         |
| **Failed transiently**  | Later attempt may succeed               | Retry within budget or defer                                          |
| **Timed out / unknown** | Caller lacks a final outcome            | Reconcile by idempotency key or status query before repeating effects |
| **Overloaded**          | Capacity is temporarily unavailable     | Shed, queue, back off, or degrade                                     |
| **Poison data**         | Repeated processing cannot progress     | Quarantine with diagnostic context                                    |

Use machine-readable categories. Preserve domain meaning when translating transport errors.

## Completion checklist

A cross-boundary relationship is designed only when it names:

- end-to-end deadline and per-hop time budget;
- cancellation and expiry;
- failure taxonomy and unknown-outcome recovery;
- retry owner and budget;
- idempotency and duplicate scope;
- ordering and delivery scope;
- capacity, backlog, and backpressure;
- consistency and invariant owner;
- compatibility and migration;
- telemetry and operational response.

## Primary sources

- [Waldo et al., A Note on Distributed Computing](https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf)
- [RFC 9110, idempotent methods](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)
- [RFC 9457, Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [AWS Builders' Library, Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
- [Google SRE, Addressing cascading failures](https://sre.google/sre-book/addressing-cascading-failures/)
- [Reactive Streams specification](https://github.com/reactive-streams/reactive-streams-jvm)
- [Garcia-Molina and Salem, Sagas](https://doi.org/10.1145/38713.38742)
- [Gilbert and Lynch, proof of the CAP conjecture](https://www.cs.princeton.edu/courses/archive/spring21/cos418/papers/cap.pdf)
- [Apache Kafka design](https://kafka.apache.org/42/design/design/)
