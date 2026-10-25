# Codebase Design

`codebase-design` helps an agent reason about both sides of software architecture: what belongs inside a module, what every relationship between modules promises, and when an abstraction has earned its cost.

- **Invocation:** model-invoked. It fires for module or service boundaries, interface design, coupling and cohesion, DRY/KISS/YAGNI, duplication versus abstraction, over- or under-engineering, SOLID trade-offs, ports and adapters, layers and vertical slices, dependency cycles, communication choices, architectural refactoring, test seams and substitutes, reliability semantics at a boundary, and human or agent navigability. Bare test authoring and SLO work carry no ownership or boundary decision, so they route elsewhere.
- **Posture:** design and audit work stays read-only unless implementation is explicitly requested.
- **Output:** an evidence-backed architecture decision or review with modules, relationship contracts, alternatives, enforcement, migration, tests, observability, risks, and the next authorized action.

## North star

> Build cohesive, information-hiding modules; make dependencies intentional and directional; make every cross-module conversation explicit about semantics, failure, and evidence.

The skill retains Matt Pocock's memorable deep-module vocabulary: module, interface, seam, adapter, depth, leverage, and locality. It qualifies several original rules where primary sources and operational practice require more precision:

- a module may expose several coherent client-specific interfaces;
- a seam is justified by evidenced variation, failure, nondeterminism, policy, ownership, or migration pressure, not a fixed adapter count;
- a qualified boundary remains useful for domain, process, trust, transaction, deployment, state, and ownership distinctions;
- thin adapters and anti-corruption layers can protect valuable semantics even when they contain little business logic;
- public-contract tests are the default stable evidence, but internal, property, conformance, integration, resilience, and end-to-end tests cover different risks;
- SOLID principles are design diagnostics rather than an architecture recipe.

## Simplicity and abstraction timing

The skill applies three familiar principles as one evidence sequence:

1. **KISS:** choose the lowest total complexity that satisfies present invariants, failure constraints, and client needs. Simplicity includes navigation, tests, migration, and operations, not only source size.
2. **YAGNI:** defer structure justified only by hypothetical variation. Record the observable trigger that would make the abstraction worthwhile later.
3. **DRY:** consolidate authoritative knowledge or intent once its shared owner and change pattern are real. Similar-looking code may remain deliberately duplicated when it belongs to different policies.

This prevents two symmetric failures: abstracting repeated syntax before the domain is understood, and using simplicity slogans to excuse duplicated policy, hidden coupling, or ignored failure semantics. A rule of three can prompt comparison, but ownership, invariants, coordinated changes, and total complexity decide.

## Workflow

### 1. Frame the decision

Inspect the current repository and identify the capability, scale, owners, clients, invariants, hidden knowledge, change pressure, constraints, and authorization boundary.

### 2. Map modules and edges

Give every important module a responsibility and owner. Describe every consequential relationship with intent, contract ownership, source dependency, runtime flow, location, time, delivery, state, failure, trust, and evidence.

This **edge-first** view prevents “A talks to B” diagrams from hiding the assumptions that actually couple code.

### 3. Design it twice

Generate materially different interfaces or ownership models and compare them on cohesion, information hiding, depth, coupling, dependency direction, contract clarity, reliability, security, testability, observability, migration, cost, and reversibility.

### 4. Prove the design

Turn architectural intent into proportionate enforcement, seam-aligned tests, an incremental migration and rollback path, and production evidence. A design is not complete while consequential relationships remain unowned or unverifiable.

## How modules talk

The skill separates interaction intent from transport:

| Intent or style      | Core question                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Query                | What information is requested, with what freshness and consistency?                       |
| Command              | Which authority is being asked to act, and how is completion known?                       |
| Event                | What fact occurred, and are subscribers genuinely independent?                            |
| Local call           | Can the simplest in-process relationship satisfy the need?                                |
| Remote request/reply | What deadline, partial-failure, idempotency, and compatibility contract applies?          |
| Queued work          | How are completion, backlog, duplicates, ordering, expiry, and poison messages handled?   |
| Stream or log        | What are the partition, replay, retention, lag, and delivery scopes?                      |
| Orchestration        | Which coordinator owns workflow state, timing, retry, and compensation?                   |
| Choreography         | Can independent local reactions remain understandable without a hidden long-running flow? |
| Shared state         | Who owns the invariant and transaction boundary?                                          |

For diagrams, every arrow must read as **source - action - destination**. The geometry must show the real owner of a result, command, event, or compensation.

## Progressive references

- `references/VOCABULARY.md` - canonical terms and disambiguations.
- `references/MODULE-DESIGN.md` - information hiding, cohesion, depth, DRY/KISS/YAGNI, layers, slices, and bounded contexts.
- `references/DEPENDENCIES.md` - dependency profiles, DIP, cycles, ports, seams, and enforceable architecture.
- `references/COMMUNICATION.md` - edge cards, calls, commands, events, messaging topology, contracts, and diagrams.
- `references/RELIABILITY.md` - time, partial failure, retries, idempotency, delivery, ordering, capacity, and consistency.
- `references/SOLID.md` - precise principle cards, evidence gates, failure modes, and conflicts with deep modules.
- `references/TESTING.md` - risk-based test portfolios, doubles, conformance, contracts, and safe test migration.
- `references/OBSERVABILITY.md` - outcome telemetry, golden signals, tracing, messaging evidence, and operational ownership.
- `references/DEEPENING.md` - a characterization-first workflow for consolidating shallow clusters.
- `references/DESIGN-IT-TWICE.md` - materially different alternatives and one shared decision scorecard.

The core router stays short enough to guide a complete run. Each reference loads only when its branch fires.

## Research basis

The design was developed from the repository's [primary-source research report](../research/codebase-design-skill-research.md), which audits the upstream base and records a 34-row evidence matrix. Its foundations include:

- Parnas on information hiding;
- Stevens, Myers, and Constantine on coupling and cohesion;
- Ousterhout on deep modules and interface complexity;
- Hunt and Thomas on DRY as authoritative knowledge rather than matching text;
- Beck on YAGNI as abstraction timing and preserved optionality;
- Metz on deliberate duplication and recovering from the wrong abstraction;
- Feathers on seams and safe legacy-code change;
- Liskov and Wing plus Martin's original SOLID articles;
- Cockburn on ports and adapters;
- Evans, Fowler, Bogard, Hohpe, and Woolf on domain and integration patterns;
- Waldo and distributed-systems research on remote interaction and consistency;
- owning specifications for HTTP, OpenAPI, AsyncAPI, CloudEvents, Kafka, gRPC, Reactive Streams, and OpenTelemetry;
- AWS Builders' Library, Google SRE, Azure Architecture Center, and Pact for operational and compatibility practice.

Recent practitioner evidence was used only to prioritize enforcement, refactorability, failure-first contracts, and resistance to speculative abstractions. It was not treated as proof of a new consensus.

## Attribution

This skill adapts the MIT-licensed [`codebase-design`](https://github.com/mattpocock/skills/tree/main/skills/engineering/codebase-design) vocabulary by Matt Pocock. The repository license retains the upstream copyright notice.

The agent-proof design rule (split ownership, two ways to do one task, importable internals, hand-synced lists) comes from Cursor pstack's `architect` design red flags in the [2026-10 source sweep](../research/2026-10-06-source-repos-sweep.md).
