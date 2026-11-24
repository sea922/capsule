# Backend standards

Apply the sections touched by the change. Preserve the project's API style,
framework facilities, and deployment model.

## Requests and authorization

Validate request shape, bounds, and domain invariants at entry. Authentication
identifies the caller; authorization must also cover the requested action and
resource, including tenant ownership. Derive trusted identity from server-side
context rather than accepting identity or permissions from request fields.

Keep HTTP status, response shape, pagination, and error conventions consistent
with the existing contract. Return safe public errors and record diagnostic
context through the established logger. Include malformed input, forbidden
resources, and not-found behavior in relevant checks.

## Persistence and consistency

Keep operations that must succeed together inside the appropriate transaction
or established consistency mechanism. Check concurrent updates and uniqueness
at the authoritative store. When effects span a database and an external system,
use the project's delivery/reconciliation mechanism; a local transaction cannot
roll back an external effect.

Select required data, bound result sizes, and inspect access patterns for repeated
per-row queries. Use the existing data-access owner. Add a layer only when it
protects a concrete boundary or removes demonstrated duplication.

## Layering

Keep transport handlers thin: parse and validate, authorize, call the owner of
the behavior, map the result. Business rules live where they can be tested
without the transport, and queries live with the data-access owner. Shared
concerns such as authentication, request identifiers, and error mapping belong
in the framework's middleware, applied once, rather than repeated per handler.
Follow the layers the project already has; do not introduce a service or
repository tier for a single pass-through call.

## Retries and jobs

Define which failures are transient before retrying. Bound attempts, elapsed
time, and concurrency; use backoff and jitter where contention is possible.
For operations with side effects, establish idempotency or deduplication before
repeating them. A timeout can leave the original operation completed remotely.

Jobs need explicit success, retry, and terminal-failure handling. Follow the
queue's acknowledgment and delivery semantics. Verify that interrupted or
duplicate delivery cannot silently lose or repeat a required effect. Never wrap a non-idempotent multi-step handler in a generic retry loop to mask partial failure.

## Caches, limits, and dependencies

When caching is justified, define freshness, invalidation, failure behavior, and
tenant/user isolation in keys. Keep the authoritative source identifiable.
Decide what a miss costs: when many requests can miss the same hot key at once,
bound the recomputation with a lock, early refresh, or jittered expiry. A cache
outage should degrade to the source within its capacity, not fail the request
or flood the store.

Check deployment topology before using process-local counters, locks, or caches
for a correctness guarantee. A limit intended to hold across replicas needs an
appropriate shared authority or an explicit per-instance contract.

Bound outbound calls and response consumption. Use the existing client and
connection lifecycle. Preserve cancellation and distinguish a dependency outage
from a valid empty result.

## Logging and operations

Log structured events through the established logger with a request or
correlation identifier that follows the work across services and jobs. Record
the operation, outcome, duration, and relevant identifiers; never secrets,
tokens, or personal data. Log a failure once, where it is handled. Emit the
metrics the project already tracks for a new endpoint or job, so that its error
rate and latency are visible from the first deploy.

A service stops cleanly: it stops accepting work, finishes or hands back
in-flight requests and jobs within a bound, and closes pools. Health endpoints
separate "process is running" from "dependencies are reachable".

## Evidence

Choose checks for the changed boundary: invalid input, unauthorized access,
partial failure, duplicate execution, concurrent updates, or dependency timeout.
Use real local infrastructure where practical and the project's established
test doubles for unavailable dependencies. State which guarantees remain
unexercised; a happy-path response alone does not demonstrate failure handling.

## Deeper references

Error classification, retries, and client-safe messages are in
[ERROR-HANDLING.md](ERROR-HANDLING.md). Stack-specific guidance is in
[TYPESCRIPT.md](TYPESCRIPT.md), [PYTHON.md](PYTHON.md), [JAVA.md](JAVA.md),
[GO.md](GO.md), and [CSHARP.md](CSHARP.md).
