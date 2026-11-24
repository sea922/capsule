# Seam-Aligned Evidence

Test where assumptions cross. Public behavior is the default stable surface, but risk determines the portfolio: internal algorithms, adapters, compatibility, failure, and workflows need different evidence.

## Match the test to the risk

| Risk                                  | Useful evidence                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Domain rule or invariant              | Focused unit or property tests through a stable module interface                                 |
| Complex internal algorithm            | Focused internal or property tests when they provide stronger or faster evidence                 |
| Adapter translation                   | Adapter unit tests plus a shared conformance suite                                               |
| Database semantics                    | Real database or high-fidelity local integration tests                                           |
| Consumer-provider compatibility       | Consumer-driven or bidirectional contract tests plus provider verification                       |
| Network or broker behavior            | Integration tests for serialization, authentication, deadlines, duplicate, and ordering behavior |
| Retry, timeout, overload, or recovery | Resilience tests with controlled faults and time                                                 |
| Critical user journey                 | A small number of focused end-to-end tests                                                       |
| Legacy behavior during reshaping      | Characterization tests before the seam moves                                                     |

The objective is not maximal test count. Every test should name the risk it proves and the seam it crosses.

## Test-double vocabulary

- **Dummy:** satisfies a parameter but is not used.
- **Stub:** returns programmed answers.
- **Spy:** records calls for later assertions.
- **Mock:** carries interaction expectations about calls or sequence.
- **Fake:** working, simplified implementation such as in-memory storage.
- **Emulator:** reproduces a system or protocol with higher behavioral fidelity.
- **Sandbox:** provider-controlled non-production environment.
- **Record/replay:** reuses captured traffic, with freshness and privacy risks.

Choose by semantic fidelity, failure behavior, speed, determinism, and maintenance cost. Do not default every external dependency to a mock; call-sequence tests can pass while the real provider disagrees.

## Prove substitutability

Run one contract or conformance suite against every implementation that claims the same port:

- production adapter;
- fake or emulator;
- migration adapter;
- alternate provider;
- supported protocol or version.

Include behavioral guarantees, not just success examples:

- validation and invariants;
- error categories;
- idempotency and duplicate handling;
- ordering and concurrency;
- time and cancellation where relevant;
- compatibility and default behavior.

If a fake cannot meet the important contract, narrow its declared use or raise its fidelity rather than silently weakening production assumptions.

## Test communication contracts

For synchronous remote calls, test:

- request and response schema plus semantic validation;
- typed rejection and error translation;
- deadline, timeout, cancellation, and unknown outcomes;
- authentication and authorization context;
- compatible old and new versions.

For messages and streams, test:

- envelope and domain payload compatibility;
- duplicate, reorder, delayed, expired, and poison messages;
- consumer idempotency and replay;
- partition or aggregate ordering;
- retry and dead-letter behavior;
- producer outbox and consumer transaction boundaries.

Contract formats and broker tests complement one another. A schema-valid event can still violate domain meaning.

## Deepening migration

Follow [DEEPENING.md](DEEPENING.md) Steps 5–6 for the migration sequence (including single-change deletion when every caller is internal and no persisted data, queues, caches, or rolling deploys still read the old shape). For test retirement on either path:

- capture characterization evidence before moving the seam;
- keep focused internal tests for complex logic until replacement coverage at the target interface proves the same or greater risk;
- retire redundant tests only after behavior and risk coverage are mapped.

“Replace, do not layer” is an end state, not permission to delete evidence early.

## Test review checklist

- What risk does each test prove?
- Does it use the same contract as real clients where useful?
- Which tests intentionally know implementation details, and why is that trade-off worthwhile?
- Are substitutes verified against the real contract?
- Are time, failure, duplicates, ordering, and compatibility exercised at remote edges?
- Does the portfolio fail when a meaningful guarantee breaks?
- Can obsolete tests be retired without reducing evidence?
