# Research: Deepening the codebase-design skill

**Research date:** 2026-08-21

**Baseline inspected:** local files at C:/Users/joevr/.agents/skills/codebase-design plus Matt Pocock's upstream codebase-design directory at commit [321658273cb1d20b76026717d027d505790106d4](https://github.com/mattpocock/skills/tree/321658273cb1d20b76026717d027d505790106d4/skills/engineering/codebase-design)

**Files audited:** SKILL.md, DEEPENING.md, DESIGN-IT-TWICE.md

**Scope:** durable terminology and decision guidance for how code is decomposed, how dependencies point, and how modules communicate. This is research only; it does not modify the published skill.

## Executive finding

The existing skill has a valuable center of gravity: prefer cohesive modules that hide substantial complexity behind comprehensible interfaces, put replaceable behavior at deliberate seams, and evaluate alternative designs rather than accepting the first shape. John Ousterhout's Stanford material supports the broad framing that an interface includes both formal signatures and informal behavior, constraints, and side effects, and that a deep module exposes relatively little complexity for the functionality it provides ([Ousterhout, Modular Design](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php%3Ftopic%3DmodularDesign)).

It is not yet a complete codebase-design skill. It mostly answers “how can this cluster become a deeper module?” It does not yet give an agent a reliable way to answer:

- What belongs together, and which design decision or invariant does the module own?
- Which direction should source dependencies point, independently of runtime call flow?
- Is this an interface, API, port, seam, adapter, boundary, service, layer, slice, or bounded context?
- Should two modules use a local call, remote request/reply, command queue, event, stream, batch transfer, or shared data?
- What guarantees exist for ordering, delivery, time, retries, consistency, compatibility, and failure?
- How will the interaction be tested and observed without coupling tests to implementation details?

The durable expansion should therefore be a **design reasoning system**, not a larger catalog of fashionable architectures. Its canonical sequence should be:

1. Identify responsibilities, invariants, owners, and likely axes of change.
2. Form cohesive modules around hidden design decisions and domain capabilities.
3. Define client-specific interfaces and behavioral contracts.
4. Make static dependency direction explicit and keep the module graph acyclic where practical.
5. Choose deployment and communication boundaries only after the logical design is understood.
6. Specify interaction semantics, including time, failure, delivery, ordering, consistency, and evolution.
7. Select tests and telemetry at the same seams where assumptions cross.

This follows Parnas's information-hiding criterion—decompose around difficult or change-prone design decisions, not merely steps in a flow—and the original structured-design concern for high cohesion and controlled coupling ([Parnas 1972](https://dl.acm.org/doi/10.1145/361598.361623); [Stevens, Myers, and Constantine 1974](https://doi.org/10.1147/sj.132.0115)). It also corrects a common category error: architecture is not synonymous with distributed deployment. Waldo and colleagues show why crossing an address-space or network boundary introduces latency, concurrency, and partial failure that a local call does not have ([A Note on Distributed Computing](https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf)). A modular monolith with clean internal seams can be better designed than a collection of tightly coupled services.

The recommended north star is:

> **Build cohesive, information-hiding modules; make dependencies intentional and directional; make every cross-module conversation explicit about semantics, failure, and evidence.**

## Audit of the current base skill

### What is worth preserving

| Current idea                                       | Why it is strong                                                                                                                                                                                                                                                                                            | Qualification to add                                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Module is scale-agnostic                           | Lets the same reasoning apply to functions, packages, libraries, slices, and deployables. Fowler similarly treats modules as relatively independent clumps at several code and deployment scales ([Presentation-Domain-Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)). | State the scale under discussion so a class seam is not confused with a process or domain boundary.                                                                  |
| Interface includes more than a type signature      | Correctly includes behavior, constraints, side effects, errors, and other facts clients must know. Ousterhout makes this same formal/informal distinction ([Modular Design](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php%3Ftopic%3DmodularDesign)).                                  | Treat an interface as client- or role-specific; one module may present several coherent interfaces.                                                                  |
| Depth as leverage and locality                     | A good antidote to pass-through layers and duplicated policy. It focuses on complexity hidden for callers rather than line-count ratios.                                                                                                                                                                    | Add cohesion: a large implementation behind a small surface is not good if it combines unrelated responsibilities into a god module.                                 |
| Seam and adapter are different                     | Correctly separates a place where behavior can vary from a concrete implementation or translator at that place. Feathers also identifies an enabling point where the choice of behavior is made ([The Seam Model](https://www.informit.com/articles/article.aspx?p=359417&seqNum=2)).                       | A seam is not defined by an adapter count, and a boundary is not a forbidden synonym; the terms answer different questions.                                          |
| Design It Twice                                    | Comparing substantially different interfaces is a strong guard against premature commitment. Ousterhout's official book page identifies this as part of the design philosophy ([A Philosophy of Software Design](https://web.stanford.edu/~ouster/cgi-bin/book.php)).                                       | Compare more than depth/locality: include coupling, dependency direction, invariants, failure behavior, compatibility, security, operability, migration, and cost.   |
| Test observable behavior through stable interfaces | Produces refactor-resistant contract tests and keeps tests aligned with client-visible behavior.                                                                                                                                                                                                            | Do not make it an exclusive rule. Focused internal tests, property tests, adapter conformance tests, and integration tests remain valuable at different risk points. |

### Statements that should be revised

| Current statement or framing                                                                | Problem                                                                                                                                                                                                                                                                                                                                                                       | Recommended replacement                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Use these terms exactly; do not substitute component, service, API, or boundary.”          | It makes useful distinctions impossible. API, boundary, service, component, and bounded context have established meanings. A vocabulary should disambiguate them, not ban them.                                                                                                                                                                                               | “Use the most specific term and qualify ambiguous ones. Interface is the client-visible contract; API is an intentionally exposed programmatic surface; boundary is a separation of domain, trust, process, deployment, transaction, or ownership.”                                                                                                |
| “A module has exactly one interface.”                                                       | Robert Martin's own ISP example describes one object with separate interfaces for separate clients ([Interface Segregation Principle](https://objectmentor.com/resources/articles/isp.pdf)). Inbound and outbound ports also give an application multiple purposeful conversations ([Cockburn, Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture)). | “A module exposes one or more coherent, client-specific interfaces. Do not force every client to depend on the union of all operations.”                                                                                                                                                                                                           |
| “Depth is a property of the interface, not the implementation.”                             | Depth is relational: functionality hidden compared with interface complexity. Looking only at the surface can reward an underspecified interface, and ignoring cohesion can bless god modules.                                                                                                                                                                                | “Depth describes the leverage of an interface relative to the cohesive behavior and complexity hidden behind it.”                                                                                                                                                                                                                                  |
| “Shallow modules: avoid” and the deletion test                                              | Thin adapters, anti-corruption layers, façades, validation gates, security policy points, and protocol translators may intentionally contain little business logic yet protect a valuable seam. Evans's anti-corruption layer explicitly translates between models ([DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)).    | Ask whether a thin module isolates volatility, semantics, failure, policy, or ownership. Remove only pass-throughs that add no such value.                                                                                                                                                                                                         |
| “One adapter means a hypothetical seam. Two adapters means a real one.”                     | Feathers defines a seam by the ability to vary behavior through an enabling point, not by the number of production implementations. An external dependency, test substitute, protocol boundary, nondeterministic clock, or migration path can justify a seam with one production adapter.                                                                                     | “Create a seam when it isolates a material source of variation, volatility, failure, nondeterminism, policy, or ownership. Demand a concrete reason, not a fixed adapter count.”                                                                                                                                                                   |
| Dependency categories are in-process, local-substitutable, remote-owned, and true-external. | These are overlapping, not exhaustive categories. Ownership, process location, transport, statefulness, determinism, trust, failure mode, replaceability, and test strategy are independent dimensions.                                                                                                                                                                       | Replace the four buckets with a dependency profile: owner, address space, I/O, state, trust, latency, availability, consistency, substitute fidelity, and contract authority.                                                                                                                                                                      |
| “In-process ... always deepenable.”                                                         | Co-location does not imply shared responsibility. Merging unrelated in-process code can reduce cohesion and make change locality worse.                                                                                                                                                                                                                                       | “In-process calls remove distributed-systems costs, but merge only when behavior shares an invariant, change axis, domain capability, or lifecycle.”                                                                                                                                                                                               |
| “True external (Mock).”                                                                     | Mock is a specific test double, not the default for every third party. Mocks can overfit call sequences and still disagree with the real provider.                                                                                                                                                                                                                            | Choose among real sandbox, emulator, fake, stub, mock, record/replay, schema validation, and provider/consumer contract tests based on risk and semantic fidelity ([Fowler, Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html); [Pact](https://docs.pact.io/)).                                                           |
| “Return results, don't produce side effects.”                                               | Many useful modules exist to produce effects. Hiding the effect or pretending it is pure can make the contract less honest.                                                                                                                                                                                                                                                   | “Separate decision from effect where it improves reasoning; make effects explicit in names, types, results, idempotency, failure modes, and tests.”                                                                                                                                                                                                |
| “Fewer methods = fewer tests needed.”                                                       | Test count follows behavioral state space, invariants, input partitions, failures, and interaction semantics—not method count alone. One generic method can hide a huge state space.                                                                                                                                                                                          | “Prefer the smallest comprehensible client surface, then test the contract's meaningful behaviors and risks.”                                                                                                                                                                                                                                      |
| “If you want to test past the interface, the module is probably the wrong shape.”           | Useful internal algorithm/property tests and adapter conformance tests may deliberately sit behind a public interface. Their trade-off is greater implementation coupling, not automatic design failure.                                                                                                                                                                      | “Default contract tests to stable public behavior; add narrower internal tests where they produce faster or stronger evidence for complex logic.”                                                                                                                                                                                                  |
| “Old unit tests ... become waste; delete them.”                                             | Immediate deletion removes characterization evidence during a risky refactor. A replacement test may not cover the same state space.                                                                                                                                                                                                                                          | Overlap old and new tests, prove equivalent or improved risk coverage, then retire redundant tests deliberately. Feathers's legacy-code workflow is built around gaining safe feedback before change ([Working Effectively with Legacy Code](https://www.pearson.com/en-us/subject-catalog/p/working-effectively-with-legacy-code/P200000008984)). |
| Design It Twice compares only depth, locality, and seam placement.                          | A design can score well on all three and still fail under retries, violate invariants, create cycles, or be impossible to operate.                                                                                                                                                                                                                                            | Add a standard scorecard: cohesion, information hidden, client complexity, dependency direction, coupling, contract clarity, failure/time semantics, consistency, compatibility, testability, observability, migration, and cost.                                                                                                                  |

### Material gaps

The current base does not yet cover coupling and cohesion, information hiding, dependency direction and cycles, SOLID, ports versus adapters, logical layers versus physical tiers, vertical slices, command/event/message distinctions, synchronous versus asynchronous interaction, orchestration versus choreography, contracts and invariants, version compatibility, idempotency, consistency, partial failure, time budgets, backpressure, observability, or a layered testing strategy. Those are not optional add-ons: they are the facts that determine whether modules can evolve and communicate safely.

A semantic graph cross-check of the four installed source documents found 59 concepts, 76 relationships, and six communities. Its most connected concepts were **depth**, **seam**, **port**, **dependency categories**, and **interface**. Every community remained centered on module depth, adapters, test substitution, or interface-design variants; none modeled communication contracts, dependency-graph enforcement, temporal behavior, or failure semantics as a first-class cluster. That independently corroborates the audit: the existing material is coherent, but its graph stops at the edge between modules.

## Recommended canonical vocabulary

The skill should use these definitions consistently while preserving legitimate distinctions. Definitions describe concepts; they should not force a particular framework or programming paradigm.

### Structural terms

| Term               | Canonical definition                                                                                                                                                                                                                              | Disambiguation and usage rule                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Module**         | A cohesive unit that encapsulates implementation and exposes one or more interfaces. It may be a function, class, namespace, package, library, vertical slice, process, or larger subsystem.                                                      | Always state the scale when it matters. A module is a reasoning unit, not automatically a deployment unit. Parnas's module criterion is what knowledge/design decision is hidden, not the flowchart step it performs ([Parnas 1972](https://dl.acm.org/doi/10.1145/361598.361623)).                                                                                                                                                                                |
| **Interface**      | The complete set of facts a particular client must rely on to use a module correctly: operations and data shapes plus semantics, preconditions, postconditions, invariants, errors, ordering, effects, time behavior, and compatibility promises. | A language interface or function signature is only the syntactic portion. A module may expose multiple role-specific interfaces.                                                                                                                                                                                                                                                                                                                                   |
| **API**            | An intentionally exposed programmatic interface for external or separately evolving consumers, normally documented and governed for compatibility.                                                                                                | Every API is an interface; not every internal interface is a public API. OpenAPI is an interface-description standard for HTTP APIs, not the total behavioral contract ([OpenAPI 3.2](https://spec.openapis.org/oas/latest.html)).                                                                                                                                                                                                                                 |
| **Implementation** | The code and internal data structures that fulfill an interface's contract.                                                                                                                                                                       | Internal decomposition remains design; “hidden” does not mean unstructured or untested.                                                                                                                                                                                                                                                                                                                                                                            |
| **Encapsulation**  | A mechanism that controls access to state or implementation.                                                                                                                                                                                      | **Information hiding** is the design criterion: conceal decisions likely to change. Encapsulation is one way to enforce it. Parnas's result is about hiding knowledge, not merely making fields private.                                                                                                                                                                                                                                                           |
| **Boundary**       | A meaningful separation in domain language, responsibility, trust, process, deployment, transaction, consistency, state ownership, team ownership, or lifecycle.                                                                                  | Name the kind of boundary. A boundary may host several interfaces and seams. A **bounded context** is specifically the boundary inside which a domain model and language are consistent ([Evans, DDD Reference](https://www.domainlanguage.com/ddd/reference/)).                                                                                                                                                                                                   |
| **Seam**           | A place where behavior can be changed without editing the code at that place.                                                                                                                                                                     | A seam has an **enabling point** where the alternative is selected. A seam can be created by parameterization, composition, linking, configuration, dispatch, a protocol, or a message—not only an OO interface ([Feathers, The Seam Model](https://www.informit.com/articles/article.aspx?p=359417&seqNum=2)).                                                                                                                                                    |
| **Port**           | An application-owned, technology-neutral contract for a purposeful conversation between the application and an actor outside its core.                                                                                                            | A port expresses intent (“submit payment,” “load account”), not HTTP, SQL, Kafka, or a vendor SDK. Ports may be inbound/driving or outbound/driven. Cockburn's model explicitly supports multiple ports ([Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture)).                                                                                                                                                                           |
| **Adapter**        | A concrete translator that connects a port or interface to a technology, protocol, data model, or actor.                                                                                                                                          | Name both sides when useful: HTTP-to-command adapter, domain-to-Stripe adapter, Postgres persistence adapter. An adapter may be thin and still valuable because it contains translation and volatility.                                                                                                                                                                                                                                                            |
| **Gateway**        | An object/module that encapsulates access to a foreign system or resource and presents a locally useful interface.                                                                                                                                | A gateway often contains an adapter, but emphasizes the access point. An **anti-corruption layer** additionally translates between incompatible domain models so the foreign model does not leak inward ([Evans, DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)).                                                                                                                                             |
| **Facade**         | A simplified interface over a more complex set of modules.                                                                                                                                                                                        | It need not invert dependencies or translate a foreign model. Its value is client simplicity and controlled exposure.                                                                                                                                                                                                                                                                                                                                              |
| **Component**      | A generic replaceable/composable unit at a declared scale.                                                                                                                                                                                        | Do not ban the word; qualify it (“UI component,” “deployable component,” “library component”) because the unqualified term is ambiguous.                                                                                                                                                                                                                                                                                                                           |
| **Service**        | A capability offered through an interface; in deployment discussions, usually an independently addressable process.                                                                                                                               | Qualify **domain service**, **application service**, and **network service**. Do not infer microservice deployment from the word service.                                                                                                                                                                                                                                                                                                                          |
| **Layer**          | A logical grouping by technical responsibility with a defined dependency policy, such as presentation, domain, and data source.                                                                                                                   | A **tier** is a physical/deployment separation. Fowler explicitly distinguishes logical layers from physical tiers ([Presentation-Domain-Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)).                                                                                                                                                                                                                                      |
| **Vertical slice** | A use-case-oriented module that contains the presentation/application/domain/data behavior needed for one capability, with shared mechanisms factored only when genuinely shared.                                                                 | Layers and slices are composable choices: use domain/capability slices at the top level and internal layers where they reduce cognitive scope. Fowler recommends domain-oriented top-level modules as systems grow; Bogard documents the vertical-slice alternative to organizing primarily by technical layer ([Fowler](https://martinfowler.com/bliki/PresentationDomainDataLayering.html); [Bogard](https://www.jimmybogard.com/vertical-slice-architecture/)). |
| **Depth**          | The leverage of an interface relative to the cohesive functionality and complexity hidden behind it.                                                                                                                                              | It is not an implementation-line/interface-line ratio and not permission to accumulate unrelated behavior. Thin policy or translation modules can be valuable without being deep.                                                                                                                                                                                                                                                                                  |

### Dependency and quality terms

| Term                           | Canonical definition                                                                                                                                                                         | Disambiguation and usage rule                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dependency**                 | A reliance by one module on another module's name, contract, data, behavior, availability, timing, or lifecycle.                                                                             | Distinguish **static/source dependency** from **runtime control or data flow**. With dependency inversion, A may call B at runtime while B's source depends on an interface owned by A.                                                                                                                                                                                                                                           |
| **Coupling**                   | The amount and strength of assumptions one module makes about another.                                                                                                                       | Analyze dimensions: knowledge/data shape, control, temporal availability, sequence, identity, implementation, deployment, consistency, and failure. “Async” reduces some temporal coupling but can increase semantic and operational coupling. The original structured-design work treats coupling and cohesion as complementary decomposition concerns ([Stevens, Myers, and Constantine](https://doi.org/10.1147/sj.132.0115)). |
| **Cohesion**                   | The degree to which the elements of a module belong together because they serve one capability, enforce the same invariants, change for the same source, and share a lifecycle.              | “Does one thing” is too vague. High cohesion means related reasons to change are together, not that every class has one method. Martin later framed SRP as grouping things that change for the same actor/reason ([Single Responsibility Principle](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)).                                                                                         |
| **Dependency inversion (DIP)** | High-level policy and low-level detail depend on abstractions whose direction protects the policy from the detail. Abstractions do not depend on details; details implement the abstraction. | Not the same as **dependency injection**, which is a construction technique, or **inversion of control**, which is the broader transfer of control to a framework/caller. Avoid an interface for every class; invert architecturally significant dependencies ([Martin, DIP](https://objectmentor.com/resources/articles/dip.pdf)).                                                                                               |
| **Composition root**           | The narrow place where concrete implementations are selected, constructed, and wired to interfaces/ports.                                                                                    | “Accept dependencies, do not create them” applies inside policy modules; object creation still belongs somewhere intentional.                                                                                                                                                                                                                                                                                                     |
| **Cycle**                      | A path in the static dependency graph that returns to its starting module.                                                                                                                   | Cycles bind change, build, test, and release units together. Martin's Acyclic Dependencies Principle recommends a DAG for package dependencies ([Granularity](https://objectmentor.com/resources/articles/granularity.pdf)). Break cycles by moving policy, extracting an interface owned by the stable side, merging a genuinely cohesive unit, or introducing a message—not by arbitrary indirection.                           |
| **Stability**                  | Resistance to change because many dependents rely on a module or because its contract is intentionally durable.                                                                              | “Stable” does not mean never edited. Dependencies should generally point toward policy and intentionally stable contracts, not toward volatile details ([Martin, Stability](https://objectmentor.com/resources/articles/stability.pdf)).                                                                                                                                                                                          |

### Contract and behavior terms

| Term              | Canonical definition                                                                                                                                                                             | Disambiguation and usage rule                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contract**      | The obligations and guarantees at an interface: accepted inputs, semantics, preconditions, postconditions, invariants, errors, effects, ordering, time, delivery, security, and evolution rules. | A schema is only the structural portion. An OpenAPI or AsyncAPI document can describe much of a wire interface but does not by itself prove behavior.                                                                                                                                                                                                                                                                                                                                    |
| **Precondition**  | A condition the caller must establish before invoking an operation.                                                                                                                              | If violated, provider guarantees may not apply; decide whether the interface rejects, sanitizes, or treats violation as programmer error.                                                                                                                                                                                                                                                                                                                                                |
| **Postcondition** | A condition the provider guarantees after a successful operation when preconditions held.                                                                                                        | Include observable effects, not only return values.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Invariant**     | A property that must remain true at every externally observable stable state of a module/entity, or across every allowed transition within a declared scope.                                     | State the scope and enforcement owner. Meyer's Design by Contract makes caller obligations, supplier guarantees, and class invariants explicit ([Applying Design by Contract](https://archive.eiffel.com/doc/manuals/technology/contract/)).                                                                                                                                                                                                                                             |
| **Compatibility** | The ability of a new provider or message/API version to satisfy existing consumers' relied-upon contract.                                                                                        | Source/binary/schema compatibility is not enough if semantics change. SemVer only works after a precise public API is declared ([SemVer 2.0.0](https://semver.org/)).                                                                                                                                                                                                                                                                                                                    |
| **Idempotency**   | Repeating the same logical operation with the same intent has no additional externally visible effect beyond the first successful application.                                                   | It does not mean “read-only” or “the response is byte-identical.” Define identity scope, retention window, concurrency behavior, and replayed response. HTTP specifies which methods are idempotent at the protocol-semantic level ([RFC 9110, section 9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)); AWS documents client request IDs for safe retries ([Making Retries Safe](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)). |

### Interaction and operations terms

| Term                               | Canonical definition                                                                                                                                     | Disambiguation and usage rule                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Call**                           | Direct invocation of an operation, normally with control returning to the caller.                                                                        | A local call and remote call can share syntax but not failure, latency, concurrency, or consistency semantics ([Waldo et al.](https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf)).                                                                                                                                                                                                                                                                                              |
| **Message**                        | A discrete data unit transferred between endpoints, often through a channel or broker.                                                                   | A message can represent a command, event, document, query, or reply. “Message” describes the carrier, not intent.                                                                                                                                                                                                                                                                                                                                                                        |
| **Command**                        | A request for a specific receiver/capability to perform an action. It may be accepted or rejected.                                                       | Use imperative intent and include a command identity for deduplication when retries/redelivery are possible. Do not disguise an expected action as an event.                                                                                                                                                                                                                                                                                                                             |
| **Event**                          | A record that an occurrence has happened, expressed in past-tense domain language and not addressed to a required specific receiver.                     | Event notification, event-carried state transfer, event sourcing, and CQRS are different patterns. Fowler explicitly warns against “passive-aggressive commands” labeled as events ([What do you mean by Event-Driven?](https://martinfowler.com/articles/201701-event-driven.html)). CloudEvents defines an event as occurrence data plus context and does not prescribe a processing topology ([CloudEvents spec](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)). |
| **Queue / point-to-point channel** | A channel where each message is consumed by one competing consumer instance/group.                                                                       | Queue is not synonymous with “asynchronous” or “exactly once.” Specify durability, acknowledgement, visibility/lease, retry, ordering, and dead-letter behavior ([Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/patterns/messaging/PointToPointChannel.html)).                                                                                                                                                                                          |
| **Publish-subscribe**              | A channel that delivers a copy of an event/message to each interested subscription.                                                                      | Multiple consumers on one subscription usually compete; separate subscriptions receive separate copies. Do not call a single work queue pub/sub ([Publish-Subscribe Channel](https://www.enterpriseintegrationpatterns.com/patterns/messaging/PublishSubscribeChannel.html)).                                                                                                                                                                                                            |
| **Stream**                         | An ordered or partially ordered sequence of records processed over time, often unbounded.                                                                | State partitioning and ordering scope. Backpressure is the mechanism by which downstream demand bounds upstream production/buffering; the Reactive Streams specification makes that contract explicit ([Reactive Streams](https://github.com/reactive-streams/reactive-streams-jvm)).                                                                                                                                                                                                    |
| **Orchestration**                  | A coordinator owns end-to-end workflow state and explicitly directs participants.                                                                        | Centralizes visibility, branching, deadlines, retries, and compensation, but can become a bottleneck or god coordinator.                                                                                                                                                                                                                                                                                                                                                                 |
| **Choreography**                   | Participants react to events and decide their next local action without a central workflow controller.                                                   | Supports autonomy and fan-out but can hide end-to-end control flow and create emergent coupling. Azure's pattern documentation presents both the decentralization benefit and flow/operability risks ([Choreography pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography)).                                                                                                                                                                               |
| **Consistency model**              | The promises about which writes a read may observe, in what order, and after what delay.                                                                 | “Consistent” is incomplete without a model and scope. CAP's formal result is specifically about atomic consistency and availability under partitions in an asynchronous model, not a universal “choose any two” slogan ([Gilbert and Lynch](https://www.cs.princeton.edu/courses/archive/spring21/cos418/papers/cap.pdf)).                                                                                                                                                               |
| **Partial failure**                | A distributed interaction state where some participants or links fail or become unreachable while others continue, leaving outcomes potentially unknown. | Treat timeout as uncertainty, not proof that no effect occurred. This is the core reason remote calls cannot be designed as ordinary local calls.                                                                                                                                                                                                                                                                                                                                        |
| **Timeout**                        | A maximum wait duration applied by one operation or hop.                                                                                                 | A **deadline** is the absolute latest useful completion time for the whole request. Prefer propagating a shrinking deadline and cancellation through call chains; gRPC recommends explicit deadlines ([gRPC Deadlines](https://grpc.io/docs/guides/deadlines/)).                                                                                                                                                                                                                         |
| **Backpressure**                   | Feedback that causes producers to slow, bound, reject, or shed work when consumers cannot keep up.                                                       | A queue merely postpones overload unless capacity and backlog age are bounded. AWS documents queue-backlog failure modes and isolation strategies ([Avoiding Insurmountable Queue Backlogs](https://d1.awsstatic.com/builderslibrary/pdfs/avoiding-insurmountable-queue-backlogs.pdf)).                                                                                                                                                                                                  |
| **Observability**                  | The ability to infer system behavior and diagnose interactions from emitted telemetry and context.                                                       | Instrument the seam: outcome, latency, traffic, saturation/backlog, errors, retries, and correlation. OpenTelemetry standardizes traces, metrics, logs, baggage, and context propagation ([OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/)); Google's four golden signals are latency, traffic, errors, and saturation ([Google SRE](https://sre.google/sre-book/monitoring-distributed-systems/)).                                                              |

## Relationship and communication taxonomy

### Describe every important edge, not just every box

An architecture description should model a relationship as more than “A talks to B.” For every important edge, capture:

| Dimension                 | Questions                                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Intent**                | Is this a query, command, event notification, state transfer, stream, or batch? Who needs the outcome?                                    |
| **Contract owner**        | Which side owns the abstraction and version policy? Is the consumer depending on a provider-shaped DTO or a local/domain-shaped port?     |
| **Static dependency**     | Which module imports/references which contract? Is that direction toward stable policy? Is there a cycle?                                 |
| **Runtime flow**          | Who initiates, who responds, and who receives data? Runtime flow may oppose source dependency under DIP.                                  |
| **Location**              | Same function/object, same process, cross-process on one host, remote owned service, third party, human, device?                          |
| **Topology**              | Point-to-point, request/reply, competing consumers, pub/sub fan-out, brokered, peer-to-peer, orchestrated?                                |
| **Time**                  | Synchronous blocking, asynchronous completion, streaming? What deadline, timeout, TTL, scheduling, and cancellation rules apply?          |
| **Delivery and ordering** | At-most-once, at-least-once, or exactly-once within what scope? Ordered globally, per key/partition, per producer, or not at all?         |
| **State and consistency** | Who is authoritative? What transaction/invariant scope exists? What may be stale, duplicated, reordered, or concurrently modified?        |
| **Failure**               | How are rejection, timeout, unknown outcome, retry, poison data, overload, and compensation represented?                                  |
| **Security and trust**    | Authentication, authorization, tenant context, data classification, validation, rate limits?                                              |
| **Evidence**              | Which contract, component, integration, resilience, and end-to-end tests prove the relationship? Which telemetry lets operators trace it? |

This edge-first view prevents attractive box diagrams from hiding the assumptions that actually couple modules.

### Interaction styles

| Style                                | Semantics and strengths                                                                                                                                                                                                                                                       | Coupling and failure costs                                                                                                                                                                                                                                                                   | Prefer when                                                                                                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **In-process call**                  | Immediate result/error, simple debugging, shared transaction and memory possible, lowest operational cost.                                                                                                                                                                    | Caller and callee are temporally coupled during the call and often share release/runtime. Re-entrancy and concurrency still matter.                                                                                                                                                          | Default when independent deployment, isolation, or asynchronous buffering is not required.                                                                                        |
| **Remote request/reply (HTTP, RPC)** | Explicit targeted operation with an immediate result; familiar contract tooling.                                                                                                                                                                                              | Network latency, partial failure, independent client/server conclusions, deadlines, retries, compatibility, and cascading failure. A timeout leaves outcome unknown.                                                                                                                         | A caller needs a result now and both sides' availability can be coupled within a bounded time budget.                                                                             |
| **Asynchronous command via queue**   | Buffers work, decouples caller latency from processing, enables competing consumers and load leveling.                                                                                                                                                                        | Completion/error becomes a separate protocol; duplicates, backlog, poison messages, expiry, retry storms, and out-of-order work must be designed.                                                                                                                                            | Work can complete later, the receiver is authoritative for the action, and burst absorption or availability decoupling is valuable.                                               |
| **Event notification via pub/sub**   | Producer reports a fact without knowing receivers; new subscribers can be added independently.                                                                                                                                                                                | End-to-end flows can become invisible; schemas live long; duplicates/order and replay matter; consumers can accidentally depend on undocumented producer behavior.                                                                                                                           | Several autonomous consumers react independently and the producer does not require a specific reaction.                                                                           |
| **Event-carried state transfer**     | Consumers can work without synchronous callbacks to the source, improving availability and query latency.                                                                                                                                                                     | Duplicated state, eventual consistency, schema evolution, reordering, reconciliation, and privacy/deletion propagation.                                                                                                                                                                      | Consumers need local read autonomy and can own projections/materialized views.                                                                                                    |
| **Stream/log**                       | Durable ordered history within declared partitions; replay and multiple consumers; continuous processing.                                                                                                                                                                     | Ordering is scoped, retention matters, lag/backpressure is operational state, and “exactly once” is normally bounded to a platform/workflow. Kafka explicitly distinguishes publish durability from consume/process guarantees ([Kafka Design](https://kafka.apache.org/42/design/design/)). | High-volume ordered records, replayable projections, CDC, or continuous analytics justify the operational model.                                                                  |
| **Batch/file transfer**              | Loose runtime coupling, auditable snapshots, efficient bulk movement. Enterprise Integration Patterns treats file transfer as a distinct integration style ([Message Channel catalog](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageChannel.html)). | Staleness, partial files, duplicate runs, naming/manifest/version rules, large retry cost, and delayed feedback.                                                                                                                                                                             | Bulk throughput and scheduled exchange matter more than freshness.                                                                                                                |
| **Shared database**                  | Simple joins and transactions across writers in the short term.                                                                                                                                                                                                               | Maximum schema, release, ownership, workload, and failure coupling; bypasses module contracts and makes invariants ambiguous.                                                                                                                                                                | Only inside a deliberately shared ownership/transaction boundary, never as an accidental integration protocol. Prefer a single authoritative writer per invariant where feasible. |

Remote procedure invocation, messaging, shared database, and file transfer are distinct integration styles in Hohpe and Woolf's pattern language; request/reply is possible over messaging too, so transport and interaction semantics should be modeled separately ([Enterprise Integration Patterns, chapter 3](https://www.enterpriseintegrationpatterns.com/docs/EnterpriseIntegrationPatterns_HohpeWoolf_ch03.pdf)). Likewise, “event sourcing” does not imply asynchronous communication; Fowler gives synchronous version-control commits as a counterexample ([What do you mean by Event-Driven?](https://martinfowler.com/articles/201701-event-driven.html)).

### Command, event, query, and document

Use message names and contracts to expose intent:

- **Query:** asks for information and promises no domain state change as its purpose. Caches, staleness, pagination, and consistency still belong in the contract.
- **Command:** asks an authority to attempt an action. It has one logical target/capability, an identity for deduplication where needed, and explicit accepted/rejected/completed outcomes.
- **Event:** states that an occurrence happened. It is past tense, immutable as a historical statement, and does not require a particular subscriber reaction.
- **Document/state transfer:** communicates data without necessarily asserting a domain occurrence or requesting behavior; examples include snapshots and canonical documents.
- **Reply/result:** correlates to a request/command and communicates outcome, including machine-readable error categories.

Do not infer topology from intent. A command can be a local call, HTTP request, or queued message. An event can be emitted in-process or over pub/sub. A request/reply can be synchronous or asynchronously correlated.

### Point-to-point, publish-subscribe, orchestration, and choreography

- **Point-to-point** assigns each message to one consumer from a group. It is for work distribution, not broadcasting.
- **Publish-subscribe** gives each subscription a copy; consumers inside a subscription may still compete. It is for independent reactions and fan-out ([EIP Publish-Subscribe Channel](https://www.enterpriseintegrationpatterns.com/patterns/messaging/PublishSubscribeChannel.html)).
- **Orchestration** puts process state, sequence, timeouts, retries, and compensation in an explicit coordinator. Prefer it when the end-to-end process has many steps, strict visibility/audit requirements, complex branching/time rules, or one clear process owner. Keep the coordinator focused on workflow policy rather than absorbing participant business rules.
- **Choreography** leaves each participant responsible for local reactions. Prefer it for a small number of stable, independent reactions where no component needs end-to-end control. Avoid long implicit event chains. Fowler notes that event notification can look loosely coupled while making the larger flow hard to see and change ([Event-Driven](https://martinfowler.com/articles/201701-event-driven.html)).
- **Saga** is a long-running consistency technique, not a synonym for either topology. A saga is a sequence of local transactions with compensating transactions for partial execution; it can be orchestrated or choreographed ([Garcia-Molina and Salem 1987](https://doi.org/10.1145/38713.38742)). Compensation is a new business action, not a magical rollback of time or external effects.

### Contract anatomy

For an important module or cross-process interaction, the contract should state:

1. Purpose and owning domain vocabulary.
2. Client roles and operations/messages each role may use.
3. Input/output schemas, units, identifiers, nullability, size limits, and validation.
4. Preconditions, postconditions, invariants, and authoritative state owner.
5. Effects and transaction boundary.
6. Error/rejection taxonomy and which failures are retryable. RFC 9457 provides a standard machine-readable HTTP problem shape while warning against exposing implementation details ([RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)).
7. Idempotency identity, deduplication window, and concurrent duplicate behavior.
8. Ordering, delivery, acknowledgement, replay, and retention guarantees.
9. Consistency/freshness promise and conflict behavior.
10. Deadline, timeout, cancellation, TTL, and performance limits/SLOs.
11. Authentication, authorization, tenant context, confidentiality, and rate limits.
12. Versioning, compatibility, deprecation, and migration policy.
13. Trace/correlation context and required telemetry.

OpenAPI can describe HTTP operations and schemas; AsyncAPI can describe message-driven applications, channels, operations, messages, and protocol bindings; CloudEvents can standardize event identity and context ([OpenAPI](https://spec.openapis.org/oas/latest.html); [AsyncAPI](https://github.com/asyncapi/spec/blob/master/spec/asyncapi.md); [CloudEvents](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)). None eliminates the need to document semantic invariants, ownership, failure, or compatibility.

### Message envelope minimum

For durable cross-process events/messages, prefer a consistent envelope containing:

- message/event ID and producer/source;
- message type and schema/contract version;
- subject/entity/aggregate identifier when ordering or routing depends on it;
- occurred-at time, distinct from published/received/processed time;
- correlation ID for the business interaction and causation ID for the immediate predecessor;
- trace context using a standard propagation format;
- tenant/security classification where applicable;
- payload/content type and optional expiry/deadline;
- producer contract documentation link or registry identifier.

CloudEvents requires source, id, specversion, and type, defines optional time/subject/data metadata, and permits extensions; it also states that source plus ID identifies duplicates ([CloudEvents specification](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)). Correlation and causation are application extensions, not implied by the CloudEvents ID.

## SOLID: useful diagnostics, not an architecture

SOLID is best taught as five pressure tests for changeability and substitutability. It is not a recipe that automatically yields good architecture, and it should not override cohesion, information hiding, simplicity, evidence, or domain language. Several principles were expressed in OO terms, but their core concerns—change axes, extension strategy, behavioral substitutability, client-specific contracts, and dependency direction—apply across OO and functional designs. Robert Martin's consolidated primary material is [Design Principles and Design Patterns](https://objectmentor.com/resources/articles/Principles_and_Patterns.pdf); LSP's formal foundation is Liskov and Wing's behavioral subtyping work ([1994 paper](https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf)).

| Principle                       | Precise working meaning                                                                                                                                                                                                                                 | When it helps                                                                                                                                 | Common failure modes and misuse                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SRP — Single Responsibility** | Gather code that changes for the same actor/business reason; separate code that changes for different actors/reasons. It is a cohesion principle, not “one method per class.”                                                                           | Separating policy from persistence/presentation, isolating independent stakeholder rules, reducing unrelated change blast radius.             | Splitting every verb into a tiny class, equating responsibility with task/step, separating things that always change together, ignoring duplicated invariants across fragments. Martin explicitly reframed “reason to change” around the people/business function requesting change ([SRP](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)).                      |
| **OCP — Open/Closed**           | Make selected, evidenced dimensions of behavior extensible without modifying stable policy or breaking existing consumers. Closure is strategic, not total.                                                                                             | Plugins, policy strategies, protocol adapters, stable public APIs, rules with demonstrated variants.                                          | Speculative abstraction for imagined futures, extension points everywhere, inheritance hierarchies that leak assumptions, treating existing source as sacred, confusing additive syntax with behavioral compatibility. Martin's original article notes that no significant program can be closed against every kind of change ([OCP](https://objectmentor.com/resources/articles/ocp.pdf)).           |
| **LSP — Liskov Substitution**   | Any implementation/subtype used through a contract must preserve every property clients are entitled to rely on: it does not strengthen preconditions, weaken postconditions, violate invariants, or introduce surprising history/behavior constraints. | Multiple adapters/implementations, plugin contracts, polymorphic collections, fakes that must stand in for production, version compatibility. | “It has the same methods so it is substitutable,” unsupported operations, narrower accepted inputs, new exceptions/effects, mutable subtype state that breaks supertype invariants, fakes with unrealistic semantics. Liskov and Wing define subtyping behaviorally, not structurally ([Behavioral Subtyping](https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf)).                           |
| **ISP — Interface Segregation** | Clients should depend only on the coherent operations and knowledge they use; expose role-specific views rather than one fat union.                                                                                                                     | Different callers need different capabilities, permissions, change rates, or data; narrowing public SDK surfaces.                             | One interface per class, method-level fragmentation, duplicate near-identical contracts, shallow forwarding abstractions, forcing all implementations to support combinations that are not coherent. Martin's example explicitly permits one object to implement multiple client interfaces ([ISP](https://objectmentor.com/resources/articles/isp.pdf)).                                             |
| **DIP — Dependency Inversion**  | Source dependencies at architecturally important seams point toward policy-owned abstractions; volatile details implement those abstractions.                                                                                                           | Databases, UI, transports, vendor SDKs, clocks/randomness, remote services, plugins, and frameworks should not dictate domain policy.         | Interface for every concrete class, container-driven architecture, confusing injection with inversion, abstractions owned/shaped by the low-level provider, exposing vendor DTOs through the port, runtime service locators. Martin's formulation is that high- and low-level modules depend on abstractions and details depend on them ([DIP](https://objectmentor.com/resources/articles/dip.pdf)). |

### SOLID decision guardrail

Before applying a SOLID move, require a concrete answer to all four questions:

1. Which client, actor, policy, invariant, or evidenced variation is being protected?
2. Which coupling or change propagation does the move reduce?
3. What new abstraction, indirection, object count, runtime cost, or cognitive load does it add?
4. What evidence will show it is better: simpler callers, fewer changed modules, an acyclic graph, a replaceable adapter, stronger tests, or a clearer contract?

If those answers are weak, keep the direct design and defer the abstraction.

## Decision heuristics

### 1. Start with ownership and invariants

Ask:

- What domain capability is being delivered?
- Which facts must always remain true, and over what transaction/state boundary?
- Who is authoritative for the data and the rule?
- Which stakeholder or external system causes this code to change?
- Which difficult or volatile design decision should other code not know?

Place together behavior that enforces the same invariants, changes for the same source, and shares a lifecycle. Split when responsibilities have different owners, vocabularies, security/consistency needs, or change independently. This combines Parnas's information hiding with cohesion/SRP rather than treating “deep” as the sole criterion.

### 2. Choose the seam for a reason

A seam is justified when it isolates at least one material concern:

- external I/O, vendor/protocol volatility, or a foreign domain model;
- nondeterminism such as time, randomness, scheduling, environment, or identity generation;
- a trust/security boundary or policy enforcement point;
- an independently evolving consumer/provider contract;
- a process/deployment boundary with partial failure;
- multiple real client roles or adapters;
- an incremental migration/strangler point;
- a costly or destructive dependency that tests must control.

Do not introduce a seam solely because another implementation is imaginable. Conversely, do not wait for two production adapters when a current external/failure/test boundary is already material.

### 3. Protect policy with dependency direction

Draw the static dependency graph, not only the runtime call graph. Prefer:

- domain/application policy owns the port;
- adapters and infrastructure depend inward on that port;
- composition happens at a narrow outer root;
- dependencies point toward intentionally stable contracts;
- package/module dependencies remain acyclic.

If two modules depend on each other, decide whether they are one cohesive unit, whether a shared stable concept belongs in a third module, or whether one direction is runtime flow that can be inverted by a policy-owned interface or message. Do not “fix” a cycle with an interface that merely mirrors the concrete class and leaves ownership unchanged.

### 4. Prefer local calls until distribution earns its cost

Keep a relationship in-process unless there is a concrete need for independent deployment, fault/resource isolation, security isolation, geographic placement, independent scaling, technology constraint, or separately owned lifecycle. A network boundary adds latency, concurrency, version skew, partial failure, retries, observability, security, and operational ownership. Martin Fowler's first-distribution guidance and Waldo's paper both warn against treating remote interactions as transparent local objects ([Waldo et al.](https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf)).

Logical modularity should precede distribution. A port can exist inside a modular monolith; deployment can change later if the contract and ownership are sound.

### 5. Synchronous or asynchronous

Prefer **synchronous request/reply** when:

- the caller cannot proceed without the answer;
- completion fits a bounded end-to-end deadline;
- immediate rejection/error is useful;
- coupling caller availability to provider availability is acceptable;
- the call rate and fan-out will not create cascading latency.

Prefer an **asynchronous command/message** when:

- work can complete later;
- burst absorption/load leveling matters;
- the receiver may be temporarily unavailable;
- processing is long-running or naturally queued;
- the caller can model accepted, rejected, completed, expired, and unknown states.

Prefer an **event** when:

- a fact has already occurred;
- the producer neither targets nor requires a particular receiver reaction;
- several autonomous consumers may react;
- consumers can tolerate the event's delivery, ordering, replay, and compatibility semantics.

Async is not free decoupling. It moves coupling into durable schemas, brokers, retries, backlog, replay, and observability. Require explicit capacity/backpressure and completion/error protocols.

### 6. Layers or vertical slices

- Use **layers** to separate concerns that are genuinely different across many capabilities, such as presentation mechanics, domain policy, and data-source mechanics. They reduce the scope of attention and can protect the domain from technology ([Fowler](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)).
- Use **vertical slices** as top-level modules when features/capabilities change independently and layer-first organization causes each change to touch many distant packages. Keep cross-slice sharing evidence-based ([Bogard](https://www.jimmybogard.com/vertical-slice-architecture/)).
- Combine them: domain/capability slices at the top level, with internal layers or ports where a slice is complex enough to benefit.
- Avoid a rule that every request must traverse controller-service-repository abstractions even when each is pass-through. Also avoid copying nontrivial policy into every slice to preserve superficial independence.

### 7. Orchestration or choreography

Prefer orchestration as workflow complexity, auditability, timeouts, branching, and compensation increase. Prefer choreography for a small, understandable set of independent reactions with clear event ownership. For either:

- make the end-to-end business state visible;
- bound retries and time;
- model compensation and manual intervention;
- emit correlation/causation and traces;
- prevent a participant from silently becoming the hidden orchestrator.

### 8. Define consistency where the invariant lives

Keep invariants requiring atomic enforcement inside one transaction/authoritative module where possible. Across independently owned stores or services:

- name the consistency model and acceptable staleness;
- use version/optimistic concurrency or explicit conflict resolution;
- make commands idempotent when retried;
- treat messages as at-least-once unless a narrower stronger guarantee is proven;
- use an outbox or equivalent atomic handoff when a local state change must reliably cause message publication;
- use sagas/compensation for multi-step business processes rather than pretending to have a global rollback.

The transactional outbox stores the message with the business update and relays it later, avoiding an unsafe “commit DB then publish” gap; the relay can still duplicate, so consumers remain idempotent ([Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html)). Exactly-once claims must name their scope: Kafka's documentation limits stronger guarantees to specific producer/transaction/consume-process-produce configurations ([Kafka Design](https://kafka.apache.org/42/design/design/)).

### 9. Treat time and failure as interface data

At every remote or queued seam define:

- end-to-end deadline and hop timeout;
- cancellation propagation and whether work may continue;
- retriable versus permanent errors;
- maximum attempts/retry budget, exponential backoff, and jitter;
- idempotency key/operation identity and deduplication retention;
- concurrency limit, queue bound, load shedding, and backpressure;
- circuit/bulkhead isolation if a dependency can exhaust shared resources;
- outcome when the caller cannot know whether the operation completed.

Google documents how retries at multiple layers multiply load and how deadline propagation avoids useless downstream work ([Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)). AWS likewise recommends timeouts plus bounded retries with backoff and jitter, and idempotent APIs for safe repetition ([Timeouts, Retries, and Backoff with Jitter](https://d1.awsstatic.com/builderslibrary/pdfs/timeouts-retries-and-backoff-with-jitter.pdf); [Making Retries Safe](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)).

### 10. Design observability at the seam

For each important interaction, emit and propagate:

- operation/message type and outcome category;
- latency including queue/processing time separately;
- traffic and payload/work size;
- errors/rejections/timeouts/cancellations;
- retry count, deduplication result, and dead-letter/replay outcome;
- saturation, concurrency, queue depth, and oldest-message age;
- trace/span context plus correlation/causation IDs;
- version and peer/dependency identity without leaking secrets or high-cardinality sensitive data.

Distributed tracing exists precisely because a request crosses modules, processes, teams, and languages; Google's Dapper paper reports the value of common low-overhead instrumentation at scale ([Dapper](https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/)). OpenTelemetry supplies a current vendor-neutral contract for the trace, metric, log, baggage, resource, and propagation concepts ([OpenTelemetry](https://opentelemetry.io/docs/specs/otel/overview/)).

## Testing seams and contracts

### Match the test to the risk

| Test type                           | Primary evidence                                                                                                         | Appropriate seam                                                                                                                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Focused unit/property test**      | A policy, algorithm, state transition, or invariant behaves across meaningful cases.                                     | In-process interface or a deliberately narrow internal seam.                                                                                                                                                                                                                  |
| **Module/component test**           | The cohesive module works through its public interface with realistic internal collaborators.                            | Public module interface; local substitutes only where real dependencies are impractical.                                                                                                                                                                                      |
| **Adapter conformance test**        | Each adapter honors the same port contract and edge cases.                                                               | Port/adapter seam; run a shared contract suite against fake, local, sandbox, and production-like adapters as applicable.                                                                                                                                                      |
| **Consumer/provider contract test** | Consumer expectations and provider messages are compatible without deploying the whole system.                           | HTTP or message interaction. Pact defines this as checking both applications in isolation against a shared understanding ([Pact introduction](https://docs.pact.io/)).                                                                                                        |
| **Integration test**                | Real protocol, serialization, database, broker, authentication, or vendor behavior is wired correctly.                   | Technology/process boundary. Include failure and version mismatch, not only the happy path.                                                                                                                                                                                   |
| **Resilience test**                 | Deadlines, retries, duplicates, reorder, poison messages, overload, cancellation, and partial failure meet the contract. | Remote/message/time boundary.                                                                                                                                                                                                                                                 |
| **End-to-end test**                 | A few critical user journeys and deployed components work together.                                                      | System boundary. Keep selective because broad-stack tests are slower and more brittle; Fowler's test-pyramid guidance argues for a balanced portfolio with many lower-level tests and fewer broad UI tests ([Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)). |

### Test-double terminology

Use precise terms:

- **Dummy:** passed but not used.
- **Stub:** returns configured answers.
- **Spy:** records calls for later assertions.
- **Mock:** preprograms and verifies expected interactions.
- **Fake:** working but simplified implementation, such as in-memory storage.
- **Emulator/simulator:** approximates a system/protocol with greater behavioral fidelity.

Mocks are useful when the interaction itself is the behavior, but brittle when they duplicate implementation call sequences. A fake is useful only if shared conformance tests keep it behaviorally substitutable under LSP. A local database substitute may still differ in isolation, SQL, locking, or failure semantics; “it exists” is not proof of fidelity.

### Safe deepening test migration

Replace the base skill's immediate “delete old tests” rule with:

1. Capture current externally observable behavior with characterization tests where risk is unknown.
2. Add contract tests at the proposed new module interface.
3. Add focused invariant/algorithm tests and adapter conformance tests where they provide distinct evidence.
4. Run old and new suites during migration; compare the behaviors and failure cases covered.
5. Delete only tests proven redundant, implementation-coupled, or obsolete after the new seam is established.

The objective is not maximal test count. It is a portfolio where each test has a clear risk and stable seam.

## Proposed skill information architecture

The skill should stay progressive: a concise core workflow routes to focused references. Loading one encyclopedic SKILL.md would make the skill harder for agents to apply.

### SKILL.md — core router and design workflow

Keep under roughly 250 lines and include:

- trigger and scope;
- north star: cohesive information-hiding modules, intentional dependency direction, explicit conversation semantics;
- minimal canonical terms: module, interface, contract, seam, port, adapter, dependency, coupling, cohesion;
- the ten-step decision workflow from this report;
- mandatory architecture-edge checklist;
- red flags and “do not default to distribution/abstraction” guardrail;
- routing links to topic references;
- expected output format for an audit/design recommendation.

### VOCABULARY.md — precise definitions and disambiguations

Contain the canonical vocabulary tables from this report plus “do not conflate” pairs:

- interface vs signature vs API vs contract;
- seam vs boundary vs port;
- adapter vs gateway vs façade vs anti-corruption layer;
- module vs component vs service vs bounded context;
- layer vs tier vs vertical slice;
- dependency inversion vs dependency injection vs inversion of control;
- command vs event vs message;
- queue vs pub/sub vs stream;
- timeout vs deadline; retry vs redelivery; idempotency vs exactly once;
- schema compatibility vs behavioral compatibility.

### MODULE-DESIGN.md — decomposition and depth

- Parnas information hiding;
- cohesion/coupling and change locality;
- deep modules with cohesion guardrail;
- when thin adapters/policy points are valuable;
- interface design including invariants/errors/effects;
- layers, slices, bounded contexts, and logical-versus-physical boundaries;
- decomposition smells and counterexamples.

### DEPENDENCIES.md — direction and seams

- static dependency versus runtime flow;
- DIP, composition root, cycles, stability;
- ports and adapters including inbound/outbound ports;
- dependency profile dimensions rather than the current four buckets;
- seam-justification checklist;
- refactoring cycle-breaking options.

### COMMUNICATION.md — how modules talk

- edge-description template;
- local call, remote request/reply, async command, event notification, event-carried state, stream, batch, shared DB;
- point-to-point, pub/sub, competing consumers;
- orchestration versus choreography;
- message envelope and contract anatomy;
- OpenAPI, AsyncAPI, and CloudEvents as optional contract formats, not architectural mandates.

### RELIABILITY.md — time, failure, and consistency

- local versus remote semantics and partial failure;
- deadline/timeout/cancellation;
- bounded retries, retry budgets, backoff/jitter;
- idempotency and duplicate/reorder handling;
- queue capacity/backpressure/dead-letter/replay;
- transaction boundaries, consistency models, optimistic concurrency;
- outbox, saga/compensation, and narrowly scoped exactly-once claims;
- resilience telemetry checklist.

### SOLID.md — principle cards with trade-offs

For each principle: precise definition, when it helps, evidence required, failure modes, and a language-neutral example. Explicitly state that SOLID is diagnostic guidance, not a mandate for class proliferation or an architecture by itself.

### TESTING.md — seam-aligned evidence

- public contract tests plus legitimate internal/property tests;
- real/fake/stub/mock/emulator distinctions;
- adapter conformance and consumer/provider contract tests;
- integration and resilience tests at process/time boundaries;
- characterization-first migration and deliberate retirement of redundant tests;
- test scorecard based on risk, fidelity, speed, and refactor resistance.

### OBSERVABILITY.md — interaction evidence in production

- four golden signals per dependency;
- trace/context propagation;
- correlation and causation for messaging;
- queue lag/backlog/dedup/retry metrics;
- structured error/outcome taxonomy;
- sensitive-data and cardinality guardrails.

### DEEPENING.md — revise existing workflow

Replace categorical “always deepenable” guidance with:

1. Map responsibilities, invariants, call sites, data ownership, and dependency profile.
2. Identify duplicated policy and change coupling.
3. Propose a cohesive target interface/contract.
4. Evaluate dependency direction, process boundary, interaction style, failure, and test fidelity.
5. Migrate with overlapping behavior evidence.
6. Delete obsolete shallow modules/tests only after proving coverage and callers have moved.

### DESIGN-IT-TWICE.md — expand the comparison scorecard

Keep parallel alternative design, but require each design to state:

- module responsibility and invariants;
- interfaces per client role;
- information hidden and depth;
- static dependencies and cycles;
- ports/adapters and composition;
- interaction style and message/API contracts;
- failure/time/idempotency/consistency behavior;
- compatibility and migration strategy;
- tests and observability;
- cognitive/operational cost.

Compare alternatives using the same scorecard and explicitly recommend the simplest design that satisfies current evidence and likely change.

## Expected skill output for a codebase-design task

An agent using the expanded skill should produce:

1. **Current map:** modules, responsibilities, state owners, interfaces, and important edges.
2. **Evidence:** concrete files/call sites/dependency cycles/change duplication/failure assumptions.
3. **Diagnosis:** cohesion, coupling, hidden/exposed knowledge, dependency direction, contract gaps, and operational risks.
4. **Two or more credible designs:** meaningfully different seam/module/interaction choices, not cosmetic renames.
5. **Recommended design:** responsibilities, interfaces, ports/adapters, runtime flow, static dependency direction, and a conversation contract.
6. **Failure and consistency model:** deadlines, retries, idempotency, ordering, transactions, compensation, backpressure.
7. **Test and telemetry plan:** evidence at each seam.
8. **Migration plan:** incremental steps, compatibility, overlap, rollback, and deletion gate.
9. **Trade-offs and non-goals:** what complexity the design intentionally does not introduce.

## Red flags the expanded skill should detect

- A module is “deep” only because it contains unrelated behavior.
- A “service” is a class with no stable capability or a network process created only to mimic a folder layer.
- Controllers, services, and repositories simply pass the same DTO through three layers.
- Provider/vendor DTOs leak into domain policy.
- Every concrete class has a mirror interface with one implementation and no material seam reason.
- A module exposes one fat interface to clients with different roles or permissions.
- A dependency cycle makes packages build/test/release together.
- A remote call has no deadline, cancellation, error taxonomy, or idempotency plan.
- Retries occur at several layers or retry permanent failures.
- Async messaging has no duplicate, ordering, capacity, replay, poison-message, or completion story.
- An “event” is actually a command the producer expects someone to perform.
- Choreography forms a long invisible business workflow.
- “Exactly once” is claimed without naming platform and effect scope.
- Multiple modules write the same invariant-bearing state without an authority/conflict model.
- A shared database is used as an undocumented integration API.
- Tests only verify mocks, or only use broad end-to-end paths.
- A fake has no conformance tests against the real contract.
- Telemetry stops at process boundaries, making a single business action untraceable.
- Old tests are deleted before replacement evidence is shown.

## Recent practitioner signal (last 30 days)

The strongest current signal is unusually specific to this skill rather than a broad change in architecture practice:

- [Matt Pocock Skills issue #458](https://github.com/mattpocock/skills/issues/458) asks how to make deep-module interfaces real in TypeScript when developers or coding agents can import implementation files directly. Matt's reply identifies package boundaries, language closure, or a dependency linter such as dependency-cruiser as possible enforcement mechanisms, while acknowledging their costs. This validates adding a separate enforcement layer rather than pretending vocabulary alone controls dependencies.
- [Matt Pocock Skills issue #877](https://github.com/mattpocock/skills/issues/877), opened 2026-08-15 and active through the end of this research window, proposes public `index.ts` seams, import-direction rules, and CI-visible architectural checks. The proposal is not adopted evidence, but it sharpens the implementation need: the skill should distinguish the desired module graph from mechanisms that mechanically protect it.
- A 2026-08-20 [r/softwarearchitecture discussion on good software design](https://www.reddit.com/r/softwarearchitecture/comments/1vtkso6/how_to_do_good_software_design/) drew 34 comments. Its most-supported responses emphasized preserving room to refactor and designing failure states from the beginning rather than assuming a design can be correct once and remain fixed. This is practitioner sentiment, not a new principle, but it supports making reversibility, migration, and failure behavior explicit comparison criteria.
- A 2026-07-24 r/softwarearchitecture discussion about package-control enforcement and a 2026-08-12 discussion about deliberately omitted architecture both exposed the same tension from opposite directions: dependency topology must be enforceable enough to prevent drift, while speculative services, repositories, and event buses can obscure rather than reduce coupling. This reinforces an evidence gate for every new seam and deployment boundary.

The recent-source engine found 9 Reddit threads, 20 Hacker News stories, and one GitHub repository item, but the evidence was thin and uneven: Reddit collection ended partially after an HTTP 429, only 14 of 30 dated items were from the final seven days, and the highest-ranked topic clusters were single-source. X, YouTube, TikTok, and Instagram were unavailable in this environment. No recent incident report or comparative study was strong enough to revise the durable principles above. Treat this window as a prioritization signal for **enforcement, refactorability, failure-first contracts, and anti-speculative design**, not as proof of a new consensus. The complete query output and supplemental primary-source notes are preserved in `C:/Users/joevr/Documents/Last30Days/software-architecture-terminology-and-best-practices-for-codebase-design-skills-solid-module-boundaries-dependency-direction-and-module-communication-raw-v3.md`.

### Simplicity and abstraction timing follow-up (2026-08-21)

A narrower follow-up on DRY, KISS, YAGNI, premature abstraction, and deliberate duplication found no relevance-qualified recent-source cluster strong enough to support a new consensus claim. Reddit collection was again partial, and the other collected items were mostly generic or incidental mentions. The useful current signal was smaller and more concrete:

- A 2026-08-20 [r/softwarearchitecture discussion](https://www.reddit.com/r/softwarearchitecture/comments/1vtkso6/how_to_do_good_software_design/) frames an abstraction as a forecast and asks which present variation it models; the concrete heuristic it offers is to wait for several real implementations. The run did not qualify this thread as an evidence cluster and explicitly barred inferring findings from its comments, so it is used only to prioritize the question, never to support a rule.
- A 2026-08-06 [CodeOpinion analysis](https://codeopinion.com/decoupling-in-software-architecture-moves-complexity/) argued that decoupling usually moves complexity instead of eliminating it. This supports evaluating the total machinery and client burden introduced by a seam.
- Durable sources supply the stronger decision model: Hunt and Thomas define DRY around authoritative knowledge; Kent Beck frames YAGNI as an abstraction-timing and optionality decision; Sandi Metz shows how to recover from the wrong abstraction by restoring visible duplication before re-extracting true commonality; and the current Kempner Institute software-engineering guide pairs simple iterative design with refactoring and tests.

Every normative claim the skill makes here rests on the durable sources, not on the current window. In particular, the skill's treatment of the rule of three as a prompt for comparison rather than a threshold for extraction follows Hunt and Thomas's definition of duplication as repeated knowledge and Metz's account of counting occurrences as the wrong test; no recent source in this run establishes it.

The skill therefore uses **KISS → YAGNI → DRY** as an evidence sequence, not as three independent slogans: minimize total present complexity, defer structure justified only by hypothetical needs, then consolidate authoritative knowledge whose owner and change pattern are real. The refined query output and supplemental sources are not checked in; they are preserved locally in the researcher's `last30days` output as `premature-abstraction-deliberate-duplication-simple-software-design-yagni-raw-v3-refined.md`.

## Evidence matrix

| Topic / proposed claim                                  | Primary or high-trust source                                                                                                                                                                                                                                                         | Evidence used                                                                                                                         | Skill implication                                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Deep modules and complete interfaces                    | [John Ousterhout, Stanford CS190 Modular Design](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php%3Ftopic%3DmodularDesign)                                                                                                                                        | Interface includes formal and informal facts; deep modules minimize interface complexity relative to functionality.                   | Preserve depth but define it relationally and require cohesion/contract completeness.        |
| DRY as authoritative knowledge                          | [Hunt and Thomas, The Pragmatic Programmer excerpt](https://media.pragprog.com/titles/tpp20/dry.pdf)                                                                                                                                                                                 | DRY concerns one authoritative representation of knowledge or intent, not eliminating every repeated text fragment.                    | Consolidate shared rules and invariants; allow similar code to remain separate when ownership and change axes differ. |
| YAGNI as abstraction timing                             | [Kent Beck, The Cost YAGNI Was Never About](https://newsletter.kentbeck.com/p/the-cost-yagni-was-never-about)                                                                                                                                                                       | Cheap code production does not remove the optionality cost of speculative structure; timing remains the central design decision.      | Require present evidence or an observable trigger before adding a seam, extension point, registry, or DSL. |
| Recovering from the wrong abstraction                   | [Sandi Metz, The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)                                                                                                                                                                                       | A conditional shared abstraction can be safer to inline, simplify by caller, and reconsider than to extend with more flags.           | Restore visible duplication under tests, then re-extract only proven shared knowledge.       |
| Simple iterative design                                 | [Kempner Institute, Software Design Principles](https://handbook.eng.kempnerinstitute.harvard.edu/s2_swe_for_research/software_design_principles.html)                                                                                                                                | KISS, DRY, and YAGNI are working defaults supported by tests, refactoring, and iterative design rather than one-time rules.             | Judge simplicity by total cognitive and operational cost and keep architecture reversible.   |
| Information hiding as decomposition criterion           | [D. L. Parnas, 1972](https://dl.acm.org/doi/10.1145/361598.361623)                                                                                                                                                                                                                   | Modules should hide difficult/change-prone design decisions rather than follow processing steps.                                      | Put hidden knowledge, invariants, and change axes before folder/layer shape.                 |
| Coupling and cohesion                                   | [Stevens, Myers, Constantine, Structured Design](https://doi.org/10.1147/sj.132.0115)                                                                                                                                                                                                | Foundational modular design treatment of independent, cohesive modules and controlled coupling.                                       | Add both as canonical, multidimensional evaluation criteria.                                 |
| Seam and enabling point                                 | [Michael Feathers, InformIT excerpt](https://www.informit.com/articles/article.aspx?p=359417&seqNum=2)                                                                                                                                                                               | Behavior can vary without editing at the seam; selection occurs at an enabling point.                                                 | Remove adapter-count rule; require a concrete variation/failure/test reason.                 |
| One implementation can expose several client interfaces | [Robert C. Martin, ISP](https://objectmentor.com/resources/articles/isp.pdf)                                                                                                                                                                                                         | Clients should not depend on operations they do not use; one object may present separate interfaces.                                  | Replace “exactly one interface” with coherent role-specific interfaces.                      |
| SRP as change/actor cohesion                            | [Robert C. Martin, SRP](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)                                                                                                                                                                          | Group things that change for the same reason/actor; separate different reasons.                                                       | Prevent “one method/class” caricature; tie responsibility to owner/change source.            |
| Strategic extensibility                                 | [Martin, OCP](https://objectmentor.com/resources/articles/ocp.pdf)                                                                                                                                                                                                                   | Stable abstractions can support extension, but full closure is not attainable.                                                        | Require evidenced variation and account for abstraction cost.                                |
| Behavioral substitutability                             | [Liskov and Wing, 1994](https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf)                                                                                                                                                                                                  | Subtypes must preserve properties/specifications, including invariants and constraints.                                               | Apply to adapters, fakes, plugins, and versions; structural match is insufficient.           |
| Dependency direction                                    | [Martin, DIP](https://objectmentor.com/resources/articles/dip.pdf)                                                                                                                                                                                                                   | Policy and detail depend on abstractions; details depend on policy-owned abstractions.                                                | Separate runtime flow from source dependency and place ports with policy.                    |
| Package cycles and stability                            | [Martin, Granularity](https://objectmentor.com/resources/articles/granularity.pdf); [Stability](https://objectmentor.com/resources/articles/stability.pdf)                                                                                                                           | Package graph should be acyclic and dependencies should point toward stability.                                                       | Add graph inspection and explicit cycle-breaking choices.                                    |
| Ports and adapters                                      | [Alistair Cockburn, original Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture)                                                                                                                                                                            | Application communicates through purposeful ports; adapters translate technologies/actors; multiple ports and adapters are expected.  | Define inbound/outbound ports and adapters without tying them only to remote owned services. |
| Domain boundaries and anti-corruption                   | [Eric Evans, DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)                                                                                                                                                                     | Bounded contexts localize model meaning; anti-corruption layers translate foreign models; aggregates scope invariants.                | Restore precise “boundary” vocabulary and state/model ownership.                             |
| Logical layers                                          | [Martin Fowler, Presentation-Domain-Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)                                                                                                                                                               | Layers reduce attention scope; logical layers differ from physical tiers; large systems should use domain-oriented top-level modules. | Teach layer/tier distinction and combine domain modules with internal layers.                |
| Vertical slices                                         | [Jimmy Bogard, Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/)                                                                                                                                                                                | Organize around request/use-case slices to reduce cross-layer change coupling.                                                        | Present as a contextual alternative/complement, not a universal winner.                      |
| Remote is not local                                     | [Waldo, Wyant, Wollrath, Kendall](https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf)                                                                                                                                                                                        | Distribution adds latency, concurrency, memory-model differences, and partial failure.                                                | Default local; make remote boundaries explicit in interface/failure design.                  |
| Messaging pattern language                              | [Hohpe and Woolf, EIP chapter 3](https://www.enterpriseintegrationpatterns.com/docs/EnterpriseIntegrationPatterns_HohpeWoolf_ch03.pdf)                                                                                                                                               | Message channels, command/document/event messages, request/reply, correlation, point-to-point and pub/sub are distinct concepts.      | Separate intent, transport, topology, and sync/async dimensions.                             |
| Event pattern distinctions                              | [Martin Fowler, Event-Driven](https://martinfowler.com/articles/201701-event-driven.html)                                                                                                                                                                                            | Event notification, event-carried state transfer, event sourcing, and CQRS differ; events can hide flows or be disguised commands.    | Require past fact semantics and explicit end-to-end flow ownership.                          |
| Standard event metadata                                 | [CNCF CloudEvents specification](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)                                                                                                                                                                                  | Event occurrence/context model, source+ID uniqueness, type/version/time/subject/data.                                                 | Provide an envelope checklist while leaving domain payload/processing semantics explicit.    |
| Message/API descriptions                                | [AsyncAPI specification](https://github.com/asyncapi/spec/blob/master/spec/asyncapi.md); [OpenAPI specification](https://spec.openapis.org/oas/latest.html)                                                                                                                          | Machine-readable channel/message/operation and HTTP API descriptions.                                                                 | Recommend standards as contract artifacts, not substitutes for behavioral contracts.         |
| Contract/invariants                                     | [Bertrand Meyer, Design by Contract](https://archive.eiffel.com/doc/manuals/technology/contract/)                                                                                                                                                                                    | Preconditions, postconditions, and invariants divide caller and supplier obligations.                                                 | Make invariant owner and failure behavior part of interface design.                          |
| API evolution                                           | [Semantic Versioning 2.0.0](https://semver.org/)                                                                                                                                                                                                                                     | SemVer requires a declared precise public API and maps compatible/incompatible changes to versions.                                   | Define public API and behavioral compatibility before applying version labels.               |
| HTTP idempotency and error contract                     | [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2); [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)                                                                                                                                                       | HTTP method idempotency semantics and standard machine-readable problem details.                                                      | Treat retries/error taxonomy as contract, with domain-specific extensions where needed.      |
| Safe retries and time budgets                           | [AWS Builders' Library](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/); [Google SRE cascading failures](https://sre.google/sre-book/addressing-cascading-failures/); [gRPC deadlines](https://grpc.io/docs/guides/deadlines/)                    | Idempotent request identity, bounded retries/backoff/jitter, deadline/cancellation propagation, retry amplification.                  | Add required remote-call reliability checklist.                                              |
| Backpressure and bounded queues                         | [Reactive Streams specification](https://github.com/reactive-streams/reactive-streams-jvm); [AWS queue backlogs](https://d1.awsstatic.com/builderslibrary/pdfs/avoiding-insurmountable-queue-backlogs.pdf)                                                                           | Downstream demand bounds production/buffering; unbounded queues can become unrecoverable backlogs.                                    | Require capacity, lag, shedding, and backpressure for asynchronous designs.                  |
| Distributed consistency scope                           | [Gilbert and Lynch, CAP proof](https://www.cs.princeton.edu/courses/archive/spring21/cos418/papers/cap.pdf)                                                                                                                                                                          | Impossibility result is scoped to atomic consistency and availability during partition in an asynchronous model.                      | Teach named consistency guarantees; reject “CAP means choose two” shorthand.                 |
| Multi-step consistency                                  | [Garcia-Molina and Salem, Sagas](https://doi.org/10.1145/38713.38742); [Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html)                                                                                                                      | Local transactions plus compensation; atomic state/message handoff with later relay.                                                  | Add saga/outbox as explicit patterns with duplicate and compensation caveats.                |
| Delivery semantics                                      | [Apache Kafka Design](https://kafka.apache.org/42/design/design/)                                                                                                                                                                                                                    | At-most/at-least/exactly-once differ; guarantees have producer, consumer, transaction, and platform scope.                            | Ban unqualified “exactly once”; require effect and boundary scope.                           |
| Orchestration versus choreography                       | [Azure Choreography Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography); [AWS Saga Orchestration](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html)                                           | Central workflow control versus distributed participant decisions, each with reliability/coupling trade-offs.                         | Add choice heuristics and require flow visibility/compensation either way.                   |
| Test portfolio and contract tests                       | [Pact documentation](https://docs.pact.io/); [Fowler Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)                                                                                                                                                                  | Consumer/provider contracts validate shared messages in isolation; broad-stack tests should be fewer than focused tests.              | Replace all-or-nothing interface testing with seam-aligned, risk-based evidence.             |
| Observability                                           | [Google Dapper paper](https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/); [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/); [Google SRE monitoring](https://sre.google/sre-book/monitoring-distributed-systems/) | Distributed tracing plus traces/metrics/logs/context and golden signals reveal cross-module behavior.                                 | Instrument contracts and propagate context as part of communication design.                  |

## Source-quality notes and limits

- Parnas, Liskov/Wing, Gilbert/Lynch, Garcia-Molina/Salem, Waldo et al., Dapper, and the structured-design paper are original research/technical publications.
- HTTP RFCs, OpenAPI, AsyncAPI, CloudEvents, Reactive Streams, Kafka, gRPC, and OpenTelemetry are owning specifications/project documentation. Their guarantees apply only within their declared scopes.
- Ousterhout, Feathers, Meyer, Martin, Cockburn, Evans, Fowler, Bogard, Hohpe/Woolf, AWS Builders' Library, Google SRE, and Azure Architecture Center are first-party author/vendor practitioner sources. They offer durable terminology and operational experience, not universal empirical laws.
- SOLID and deep modules can conflict when applied mechanically: ISP may encourage smaller client views while deep-module design encourages fewer concepts; SRP may encourage separation while cohesion may justify keeping behavior together. The skill should resolve these through client knowledge, invariants, change evidence, and total complexity—not slogans.
- CAP does not decide ordinary architecture choices outside a partitioned replicated data model. “Exactly once” does not automatically extend to an external email, payment, or database side effect. SemVer does not detect semantic incompatibility by itself. Contract formats do not prove provider behavior.
- The recent-practitioner pass is coverage-limited and should not outweigh the primary literature or owning specifications. It is used only to prioritize present-day pain points.

## Final recommendation

Retain the current skill's memorable deep-module vocabulary, but change its center from **“make shallow clusters deeper”** to **“design cohesive modules and explicit relationships under change and failure.”** The final skill should be opinionated about outcomes—information hiding, cohesive ownership, low and directional coupling, honest contracts, local-first deployment, bounded failure, and seam-aligned evidence—while remaining pluralistic about mechanisms. Ports/adapters, layers, vertical slices, SOLID, events, queues, sagas, and contract tools should be offered as contextual moves with costs and failure modes, never as architecture badges.
