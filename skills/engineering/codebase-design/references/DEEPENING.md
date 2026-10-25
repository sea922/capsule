# Deepening an Existing Cluster

Deepening concentrates duplicated policy and knowledge behind a cohesive interface. It is a refactoring workflow, not a mandate to merge every in-process dependency.

## 1. Map the cluster

Inspect every caller, implementation, test, state store, external dependency, and configuration path in scope. Record:

- repeated sequencing, validation, policy, and error translation;
- invariants and authoritative state;
- each client's actual use cases;
- static imports and runtime calls or messages;
- transaction, process, trust, and ownership boundaries;
- current tests and production evidence;
- observed change and defect history.

**Complete when:** every current caller and behavior in scope maps to an owner, contract, and test or explicit evidence gap.

## 2. Diagnose the shallowness

Look for:

- callers reconstructing one workflow from many low-level operations;
- the same rule or failure translation repeated across call sites;
- configuration flags leaking implementation choices to clients;
- pass-through layers that add no policy, translation, protection, or compatibility;
- tests coupled to internal sequences because the public surface exposes steps rather than capability;
- source cycles or bypass imports around the intended module;
- one interface serving unrelated client roles.

Do not call a module shallow only because its implementation is short. A thin adapter, anti-corruption layer, authorization gate, or migration facade can isolate substantial risk.

## 3. Propose the target module

State:

```text
Capability and owner:
Invariant and authoritative state:
Hidden knowledge:
Client roles:
Proposed interface(s):
Effects and error contract:
Dependencies and source direction:
Required seams and their pressures:
Process or transaction boundaries:
```

Prefer capability-oriented operations over exposing internal steps. Keep internal seams private unless clients must choose behavior.

## 4. Profile dependencies

For each dependency, record owner, location, I/O, state, trust, latency, availability, compatibility, and substitute fidelity.

- Pure or stable same-owner computation may remain a direct dependency.
- Local I/O may use a real lightweight implementation in tests when fidelity is high.
- Owned remote behavior may use a policy-owned port with transport adapters when the process boundary is justified.
- Third parties usually need translation, explicit failure contracts, and a risk-appropriate mix of sandbox, emulator, fake, stub, mock, or contract test.

The dependency profile drives the test. “External equals mock” is not a strategy.

## 5. Migrate with overlapping evidence

When every caller is internal, follow the single-change path in step 6 instead of overlapping old and new.

1. Add characterization evidence for current behavior.
2. Introduce the target interface and contract.
3. Move policy behind it without changing all callers at once.
4. Add adapters or facades only where a real seam or migration need exists.
5. Move callers incrementally; compare outcomes or telemetry where practical.
6. Enforce the public entry point and intended dependency direction.
7. Run contract, conformance, integration, and resilience tests for changed edges.
8. Preserve rollback until the new path is proven under real usage.

**Complete when:** all intended callers cross the target interface, bypasses are detected, and old and new behavior have explicit evidence.

## 6. Retire the old shape

When every caller is internal and changes in the same repository and deploy, and nothing outside that deploy can still observe the old shape (no persisted data, queued messages, or caches in the old format, no rolling deployment where old and new instances overlap, and no rollback that would need it), migrate them all and delete the old shape in the same change. Keep no adapter, alias, or deprecation window: a second path doubles what readers and tests must cover and has no caller to protect.

For public, external, or separately deployed callers, or when old-shape data or instances can outlive the change, delete obsolete modules, adapters, compatibility paths, and tests only after:

- no supported caller depends on them;
- replacement tests cover the same or greater risks;
- production evidence meets the declared threshold;
- rollback or migration policy permits removal;
- dependency rules prevent regression.

Record what was removed and which complexity disappeared versus which complexity moved behind the new interface.

## Deepening report

Lead with the recommendation, then show:

1. current cluster and evidence;
2. target responsibility, invariant, and interfaces;
3. source and runtime dependency changes;
4. seam justifications and adapter choices;
5. migration order and rollback;
6. old-to-new test evidence map;
7. enforcement and production proof;
8. explicit deletions and unresolved risks.
