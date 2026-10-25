---
name: codebase-design
description: Design or improve software architecture through cohesive modules, intentional dependency direction, explicit inter-module contracts, and evidence-gated abstraction. Use when the user asks about module or service boundaries, interfaces, coupling or cohesion, DRY/KISS/YAGNI, duplication versus abstraction, over- or under-engineering, SOLID trade-offs, ports and adapters, layers or vertical slices, dependency cycles, synchronous or asynchronous communication, architecture refactoring, test seams and substitutes, reliability semantics at a boundary, or making a codebase easier for humans and coding agents to navigate. Route UI-only visual design and infrastructure topology with no software ownership decision to their dedicated skills.
---

# Codebase Design

Design cohesive modules and explicit relationships under change and failure. A good module hides knowledge; a good relationship makes ownership, direction, semantics, and evidence visible.

For scoped cleanup that preserves the existing contract, use `simplify`. Keep consequential interface, module, or ownership decisions here; return the decision to the caller's authorized workflow.

## Core grammar

- **Module:** a cohesive unit that owns behavior or knowledge and exposes one or more client-specific interfaces. State the scale when it matters.
- **Interface:** everything a client must know to use a module correctly, including behavior, invariants, effects, errors, time, and compatibility.
- **Contract:** the testable obligations carried by an interface.
- **Boundary:** a qualified separation such as module, domain, process, trust, transaction, deployment, state-ownership, or team boundary.
- **Seam:** a place where behavior can vary without editing the code at that place.
- **Port:** a policy-owned interface at a seam.
- **Adapter:** a concrete translator or implementation that satisfies a port.
- **Depth:** leverage relative to the cohesive complexity hidden behind an interface.
- **Coupling:** the ways one module constrains another. **Cohesion:** why responsibilities belong together.
- **Locality:** how well a change and its verification remain concentrated.

Read [references/VOCABULARY.md](references/VOCABULARY.md) when terms are disputed, overloaded, or doing decision work.

## 1. Frame the decision

Inspect the current code, configuration, tests, diagrams, and project context before proposing a shape. Record:

- the user-visible capability or decision at stake;
- the scale under discussion;
- responsibility, invariant, state, and policy owners;
- clients and the facts each client must know;
- current pain, likely change axes, constraints, and evidence;
- whether the request authorizes design only or implementation too.

For a design or audit request, remain read-only. Implement only when the user explicitly asks for the change; implementation does not broaden permission to publish, deploy, commit, or migrate external state.

Read [references/MODULE-DESIGN.md](references/MODULE-DESIGN.md) when deciding what belongs together, whether a module is deep enough, whether layers, slices, or bounded contexts fit, or how DRY, KISS, and YAGNI apply to duplication and abstraction timing. When the task is consolidating an existing shallow cluster, follow [references/DEEPENING.md](references/DEEPENING.md) from here; its six steps sequence mapping, diagnosis, migration, and retirement across all four stages of this workflow.

**Complete when:** every proposed module has a stated responsibility, hidden knowledge or invariant, owner, clients, and concrete reason to exist.

## 2. Map modules and edges

Draw or tabulate the important modules and every relationship that can constrain change. Use precise verbs: **calls**, **queries**, **commands**, **publishes**, **subscribes**, **streams**, **reads**, **writes**, **shares state with**, **orchestrates**, or **reacts to**.

For each important edge, record this **edge card**:

| Dimension | Required decision                                                                        |
| --------- | ---------------------------------------------------------------------------------------- |
| Intent    | Query, command, event, document, stream, batch, or shared state                          |
| Owner     | Contract owner, policy owner, and authoritative state owner                              |
| Direction | Static source dependency and runtime data/control flow                                   |
| Location  | In-process, cross-process, remote owned, third party, human, or device                   |
| Topology  | Direct, request/reply, queue, competing consumers, pub/sub, log, or orchestrated         |
| Time      | Blocking, deferred, streaming, deadline, timeout, cancellation, or expiry                |
| Delivery  | Acknowledgement, duplicate, ordering, replay, and retention semantics                    |
| State     | Transaction scope, consistency, freshness, conflict, and compensation                    |
| Failure   | Rejection, timeout, unknown outcome, overload, retry, and poison data                    |
| Trust     | Authentication, authorization, validation, tenancy, data classification, and rate limits |
| Evidence  | Tests, enforcement, telemetry, and compatibility checks                                  |

Keep static dependency direction separate from runtime flow. Policy may call an adapter at runtime while the adapter depends on a policy-owned port in source code.

- Read [references/DEPENDENCIES.md](references/DEPENDENCIES.md) for seams, ports, dependency inversion, cycles, and enforcement.
- Read [references/COMMUNICATION.md](references/COMMUNICATION.md) when modules call, message, stream, share data, orchestrate, or choreograph work.
- Read [references/RELIABILITY.md](references/RELIABILITY.md) when an edge crosses time, process, network, transaction, or ownership boundaries.

**Complete when:** every important edge has an unambiguous verb, owner, dependency direction, contract, failure model, and proving evidence; no consequential arrow means only “talks to.”

## 3. Design it twice

For a meaningful module, seam, or interaction change, produce at least two materially different designs. For a small local change, compare the proposed shape with keeping the current shape. Vary the interface or ownership model, not merely names and folders.

Use **KISS -> YAGNI -> DRY** as an evidence sequence: choose the lowest total complexity that meets present constraints, defer structure justified only by hypothetical needs, then consolidate knowledge whose shared owner and change pattern are real. Score each design on:

- cohesion and information hidden;
- caller knowledge and module depth;
- coupling, dependency direction, and cycles;
- contract, failure, time, and consistency clarity;
- compatibility, security, migration, and reversibility;
- testability, observability, cognitive load, and operational cost.

Read [references/DESIGN-IT-TWICE.md](references/DESIGN-IT-TWICE.md) for the alternative-design brief and comparison format. Use [references/SOLID.md](references/SOLID.md) when a SOLID principle is part of the argument; treat the principles as diagnostics, not architecture badges.

Recommend the simplest design that satisfies current constraints and evidenced change or failure pressure. Simplicity means total client knowledge, indirection, navigation, testing, migration, and operational machinery, not the fewest lines or modules. Name the rejected alternative and the evidence that would make it preferable later.

**Complete when:** the alternatives differ materially, use the same scorecard, and end in one opinionated, reversible recommendation.

## 4. Prove the design

Translate prose into evidence at the same seams where assumptions cross:

- choose the lightest effective enforcement: language visibility, module exports, package boundaries, dependency rules, architecture tests, or CI;
- match tests to risk: contract, unit/property, adapter conformance, integration, resilience, and focused end-to-end coverage;
- define migration order, compatibility period, rollback, and the evidence required before old paths or tests are removed;
- define production evidence for cross-process edges: outcomes, latency, errors, saturation or backlog, retries, and trace or correlation context.

Read [references/TESTING.md](references/TESTING.md) for seam-aligned evidence and [references/OBSERVABILITY.md](references/OBSERVABILITY.md) for production evidence.

**Complete when:** the proposal names its enforcement, test portfolio, migration and rollback path, production evidence, unresolved risks, and the next authorized action.

## Design rules

- Consolidate duplicated knowledge, not similar syntax. Similar code stays separate when owners, invariants, or change axes differ, and caller flags multiplying inside a shared abstraction are evidence it has joined unrelated knowledge.
- Cheap code generation lowers the cost of writing an abstraction, not the cost of understanding, maintaining, migrating, or deleting it. Speculative structure still needs present evidence or a recorded trigger.
- Hide difficult or volatile decisions, not merely steps in a processing sequence.
- Put cohesion before depth. A small interface does not redeem an unrelated god module.
- Expose coherent client-specific interfaces instead of one union surface for every caller.
- Create a seam for evidenced variation, volatility, failure, nondeterminism, policy, ownership, or migration pressure; adapter count alone is not the test.
- Keep useful thin adapters, anti-corruption layers, validation gates, and policy points when they isolate material knowledge or risk.
- Prefer an in-process call until independent deployment, isolation, buffering, or ownership earns distribution's cost.
- Choose intent before transport. A command, event, or query can travel through several mechanisms.
- Name consistency and delivery guarantees within their real scope. Treat unqualified “exactly once” as an unanswered question.
- Preserve characterization evidence during refactoring; retire old tests only after replacement coverage is demonstrated.
- Make architecture executable where drift matters, but keep enforcement proportional to the risk.
- Design for a contributor, often an agent, who sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. A change that looks right from one file should be right for the whole repository. Screen candidates for four red flags: **split ownership** (several modules write or copy the same state; give it one owner), **two ways to do one task** (keep one and delete the others in the same migration), **importable internals** (make them unreachable so the wrong import fails the build), and **hand-synced lists** (derive every copy from one list, or fail the build when they disagree).

## Handoff shape

Lead with the decision, then provide only the sections the task needs:

1. **Decision and evidence**
2. **Current and proposed modules**
3. **Relationship contracts and dependency direction**
4. **Alternatives and trade-offs**
5. **Enforcement, migration, tests, and observability**
6. **Risks, unknowns, and next authorized action**

For diagrams, read every arrow as **source - action - destination**. Geometry must show the real owner of a command, result, event, or compensation; prose cannot repair a misleading arrow.
