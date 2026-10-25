# Module Communication

Describe interactions as contracts between owners, not arrows between boxes. Separate intent, topology, transport, time, and delivery so one choice does not smuggle in the others.

## Edge description

The edge card in [SKILL.md](../SKILL.md) is the checklist; fill every dimension of it for each consequential edge. This reference expands the four dimensions that carry the communication decision: intent, topology, contract, and the envelope that makes delivery and correlation real.

## Choose intent before transport

- **Query:** asks for information. It should not intentionally change domain state. State freshness, pagination, and consistency.
- **Command:** asks one logical authority to attempt an action. State accepted, rejected, and completed outcomes plus deduplication identity.
- **Event:** records something that happened. Name it in past tense. The producer does not require a particular subscriber reaction.
- **Document or state transfer:** supplies data without necessarily requesting behavior or asserting an occurrence.
- **Reply or result:** correlates to a request and communicates a typed success, rejection, or failure.

An event that the producer expects one consumer to handle is usually a command wearing past tense. A command can be a local call, HTTP request, or queued message. An event can be in-process or published. Request/reply can be synchronous or asynchronously correlated.

## Choose the interaction style

| Style                    | Strength                                                          | Cost                                                                         | Prefer when                                                                        |
| ------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **In-process call**      | Immediate result, simplest debugging, shared transaction possible | Temporal coupling and shared release/runtime                                 | Default while independent deployment or buffering is unnecessary                   |
| **Remote request/reply** | Targeted operation with immediate outcome                         | Latency, partial failure, deadlines, retries, compatibility                  | The caller needs a result now and availability can be coupled within a time budget |
| **Queued command**       | Buffers work, absorbs bursts, decouples caller latency            | Completion is another protocol; backlog, duplicates, expiry, poison messages | Work can finish later and one receiver owns the action                             |
| **Event notification**   | Independent fan-out and subscriber evolution                      | Hidden end-to-end flow, long-lived schemas, replay and order concerns        | Several autonomous consumers react and no reaction is required by the producer     |
| **Event-carried state**  | Consumer read autonomy and fewer callbacks                        | Duplicated state, staleness, reconciliation, privacy propagation             | Consumers own projections and accept explicit consistency                          |
| **Stream or log**        | Retained history, replay, ordered partitions                      | Lag, backpressure, retention, scoped guarantees                              | High-volume history, CDC, projections, or continuous processing justify it         |
| **Batch or file**        | Efficient bulk movement and auditable snapshots                   | Staleness, partial files, duplicate runs, delayed feedback                   | Throughput and schedule matter more than freshness                                 |
| **Shared database**      | Easy joins and one local transaction                              | Maximum schema, release, workload, and ownership coupling                    | Only inside a deliberately shared ownership and transaction boundary               |

## Choose topology

- **Point-to-point:** one consumer from a group handles each message. Use for work distribution.
- **Publish-subscribe:** each subscription receives a copy. Use for independent reactions and fan-out.
- **Orchestration:** a coordinator owns workflow state, ordering, deadlines, retries, and compensation. Prefer for visible multi-step business processes, branching, audit, or one clear process owner.
- **Choreography:** participants own small local reactions to facts. Prefer for a few stable, independent reactions. Avoid long implicit event chains.
- **Saga:** a sequence of local transactions with compensating actions. It may be orchestrated or choreographed; compensation is a new business action, not a time-reversing rollback.

## Contract anatomy

For an important local or remote interaction, specify:

1. purpose and owning vocabulary;
2. client roles and allowed operations or messages;
3. schemas, units, identifiers, nullability, size, and validation;
4. preconditions, postconditions, invariants, and state authority;
5. effects and transaction boundary;
6. success, rejection, error, and retryability taxonomy;
7. idempotency identity and duplicate window;
8. ordering, delivery, acknowledgement, replay, and retention;
9. consistency, freshness, and conflict behavior;
10. deadline, timeout, cancellation, TTL, and performance limits;
11. authentication, authorization, tenancy, confidentiality, and rate limits;
12. versioning, compatibility, deprecation, and migration;
13. trace, correlation, causation, and required telemetry.

OpenAPI, AsyncAPI, CloudEvents, protobuf, or JSON Schema can describe parts of a contract. None proves behavioral semantics or ownership.

## Message envelope

For durable cross-process messages, prefer a consistent envelope containing:

- message or event ID and producer source;
- type and schema or contract version;
- subject, entity, or aggregate key when routing or ordering depends on it;
- occurred-at time, distinct from published, received, and processed times;
- correlation ID for the business interaction;
- causation ID for the immediate predecessor;
- standard trace context;
- tenant and security classification where applicable;
- payload content type and optional expiry or deadline.

Do not standardize domain payloads into one universal envelope model. Standardize transport context while preserving bounded domain language.

## Diagram semantics

Read every arrow as **source - action - destination**. Show results returning to the caller before the caller issues a compensation or publishes a fact. A shortcut arrow can falsely assign ownership even when nearby prose is correct.

Label arrows with verbs and intent:

```text
Checkout API --commands CreateOrder--> Order
Order --queries Availability--> Inventory
Order --commands ReserveStock--> Inventory
Order --commands AuthorizePayment--> Payment
Payment --returns PaymentRejected--> Order
Order --commands ReleaseReservation--> Inventory
Order --publishes OrderRejected--> Order subscribers
```

Every result arrives before the action it justifies: Order can only compensate the reservation because the rejection returned to it, and the published fact reports the outcome that actually happened. Dropping the `AuthorizePayment` arrow would leave a result with no request and silently move payment ownership.

## Primary sources and specifications

- [Waldo et al., A Note on Distributed Computing](https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf)
- [Hohpe and Woolf, Enterprise Integration Patterns chapter 3](https://www.enterpriseintegrationpatterns.com/docs/EnterpriseIntegrationPatterns_HohpeWoolf_ch03.pdf)
- [Fowler, What do you mean by Event-Driven?](https://martinfowler.com/articles/201701-event-driven.html)
- [OpenAPI specification](https://spec.openapis.org/oas/latest.html)
- [AsyncAPI specification](https://github.com/asyncapi/spec/blob/master/spec/asyncapi.md)
- [CloudEvents specification](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)
