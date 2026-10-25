# Vocabulary

Use the most specific term and qualify overloaded terms. Consistency makes comparisons possible; precision matters more than banning established language.

## Structural terms

| Term                      | Working definition                                                                                                                                                           | Usage rule                                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Architecture**          | Decisions that allocate knowledge, responsibility, dependency, and constraints so some future changes become easier and others harder.                                       | Describe the decisions and consequences, not just the boxes.                                                                                                                                         |
| **Module**                | A cohesive unit that encapsulates implementation and exposes one or more interfaces. It may be a function, class, namespace, package, library, slice, process, or subsystem. | State the scale. A module is not automatically a deployment unit.                                                                                                                                    |
| **Interface**             | The complete facts a particular client relies on: operations and data plus semantics, invariants, effects, errors, time, and compatibility.                                  | A signature is only the syntactic part. One module may expose several role-specific interfaces.                                                                                                      |
| **API**                   | An intentionally exposed programmatic interface for external or separately evolving consumers.                                                                               | Every API is an interface; not every interface is a public API.                                                                                                                                      |
| **Contract**              | Testable obligations between a provider and a client: preconditions, postconditions, invariants, effects, failures, and evolution promises.                                  | A schema describes shape, not the whole contract.                                                                                                                                                    |
| **Implementation**        | Internal code and data structures that fulfill an interface's contract.                                                                                                      | Hidden does not mean unstructured or untested.                                                                                                                                                       |
| **Encapsulation**         | A mechanism that controls access to state or implementation.                                                                                                                 | **Information hiding** is the design criterion: conceal decisions likely to change. Encapsulation is one mechanism.                                                                                  |
| **Boundary**              | A meaningful separation in domain language, responsibility, trust, process, deployment, transaction, consistency, ownership, or lifecycle.                                   | Qualify it: module boundary, process boundary, trust boundary, and so on.                                                                                                                            |
| **Seam**                  | A place where behavior can vary without editing the code at that place; an enabling point selects the behavior.                                                              | A seam can exist within one module or at a boundary, and can be made by parameterization, composition, linking, configuration, dispatch, a protocol, or a message. Adapter count does not define it. |
| **Port**                  | A policy-owned interface at a seam through which the module communicates.                                                                                                    | Name inbound and outbound ports by capability or intent, not technology.                                                                                                                             |
| **Adapter**               | A concrete implementation or translator that satisfies a port for a technology, protocol, data model, or actor.                                                              | An adapter can be intentionally thin if translation or isolation is its value.                                                                                                                       |
| **Facade**                | A simplified interface over a more complex subsystem.                                                                                                                        | It need not invert a dependency or translate a foreign model.                                                                                                                                        |
| **Gateway**               | An object or module that represents access to a remote or external system.                                                                                                   | State the contract and failure semantics it owns.                                                                                                                                                    |
| **Anti-corruption layer** | Translation that protects one domain model from a foreign model.                                                                                                             | It is a semantic boundary, not merely DTO mapping.                                                                                                                                                   |
| **Component**             | A replaceable or composable implementation unit in a particular technology or deployment model.                                                                              | Use when that technology-specific meaning matters; otherwise name the module scale.                                                                                                                  |
| **Service**               | A capability offered through an interface; often, but not necessarily, a separately deployed process.                                                                        | Qualify logical service versus network service.                                                                                                                                                      |
| **Bounded context**       | The boundary within which a domain model and language remain consistent.                                                                                                     | It is not a synonym for package, service, seam, or transaction.                                                                                                                                      |
| **Layer**                 | A logical grouping by responsibility or abstraction level.                                                                                                                   | A layer is not a physical deployment tier. Prefer domain-oriented top-level modules in larger systems.                                                                                               |
| **Tier**                  | A physical deployment or process partition.                                                                                                                                  | Distribution costs apply even when tiers mirror layers.                                                                                                                                              |
| **Vertical slice**        | A use-case-oriented path that contains the behavior needed for one request or capability.                                                                                    | It can coexist with internal layers and shared deep modules.                                                                                                                                         |

## Dependency and quality terms

| Term                     | Working definition                                                                                                                 | Diagnostic question                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Static dependency**    | A compile-time or source-level reference such as an import, type, package, or schema dependency.                                   | Which source unit must know which other source unit?                                    |
| **Runtime flow**         | The direction of calls, messages, data, or control while the system runs.                                                          | Who initiates and who receives? It may oppose static dependency under DIP.              |
| **Coupling**             | Any way a module constrains another: knowledge, data shape, control, time, sequence, state, platform, deployment, or organization. | What must change, deploy, be available, or agree together?                              |
| **Cohesion**             | The strength of the reason responsibilities belong together.                                                                       | Do they share an invariant, capability, owner, lifecycle, or reason to change?          |
| **Depth**                | Leverage relative to the cohesive behavior and complexity hidden behind an interface.                                              | How much useful capability does each client concept unlock?                             |
| **Leverage**             | Capability callers receive per concept they must learn.                                                                            | Does one decision or implementation pay back across several callers?                    |
| **Locality**             | The degree to which a change, bug, knowledge, and verification remain concentrated.                                                | How many modules and tests move for one business change?                                |
| **Duplicated knowledge** | One rule, invariant, or fact represented in more than one place, so a single conceptual change must be made in several.            | Is this what DRY targets here, and which module should own the authority?                |
| **Duplicated representation** | One piece of knowledge expressed in several forms: code, schema, migration, config, documentation, or fixture.                | Can the other forms be derived from one source instead of extracted into a function?    |
| **Deliberate duplication** | Similar code kept separate on purpose because the occurrences have different owners, policies, or change axes.                   | Is the reason for keeping it separate recorded, or is this an oversight?                |
| **Coincidental similarity** | Code that currently looks alike without expressing shared knowledge.                                                            | Do the occurrences share an invariant and a change history, or only their text?         |
| **Policy**               | A business or system decision that expresses what should happen.                                                                   | Does the abstraction belong with the policy that needs it?                              |
| **Detail**               | A mechanism that fulfills policy, such as storage, transport, framework, or vendor integration.                                    | Can the detail change without rewriting the policy?                                     |
| **Stability**            | Resistance to change created by responsibility and dependents, not by age alone.                                                   | Are less stable modules depending on more stable policy?                                |
| **Volatility**           | Evidence that a decision, dependency, or contract changes or fails independently.                                                  | Is a seam isolating real pressure or imagined flexibility?                              |
| **Dependency injection** | Supplying a module's collaborators from outside instead of constructing them internally.                                           | A construction technique. It does not by itself decide which side owns the abstraction. |
| **Inversion of control** | Handing control of flow, lifecycle, or wiring to a framework, container, or caller.                                                | The broadest of the three; name whether you mean inversion, injection, or control.      |

## Contract and behavior terms

| Term              | Working definition                                                                                                                  | Usage rule                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Invariant**     | A property that must hold at every externally observable stable state, or across every allowed transition, within a declared scope. | Always name the scope and the module that enforces it. An invariant with no owner is a wish, not a guarantee.                           |
| **Precondition**  | What the caller must establish before an operation is valid.                                                                        | Decide whether the interface rejects, sanitizes, or treats violation as a programmer error, and say which.                              |
| **Postcondition** | What the provider guarantees after a successful operation when preconditions held.                                                  | Include observable effects, not only return values.                                                                                     |
| **Compatibility** | The ability of a new version to satisfy the contract existing consumers already rely on.                                            | **Schema compatibility** is a matching shape; **behavioral compatibility** is preserved meaning. Shape can match while meaning changes. |

## Interaction terms

- **Query:** asks for information and promises no domain state change as its purpose.
- **Command:** asks one logical authority to attempt an action and exposes accepted, rejected, and completed outcomes.
- **Event:** records an occurrence in past tense and does not require a particular subscriber reaction.
- **Document:** transfers data or state without necessarily requesting behavior or asserting a domain occurrence.
- **Message:** the transport-neutral envelope carrying a command, event, document, or reply.
- **Queue:** delivers each message to one consumer from a competing group.
- **Publish-subscribe:** gives each independent subscription a copy; consumers inside one subscription may compete.
- **Stream or log:** an ordered history within declared partitions, with retention, replay, and lag semantics.
- **Orchestration:** an explicit coordinator owns workflow state, sequence, time, retry, and compensation.
- **Choreography:** participants react to facts without one component controlling the end-to-end flow.
- **Idempotency:** repeated equivalent requests have the declared effect no more than once within a stated identity and time scope.
- **Retry:** a fresh attempt the sender or caller chooses to make. **Redelivery:** the transport presenting the same message again because it was not acknowledged. Different owners, different budgets.
- **Delivery guarantee:** what the transport or workflow promises about loss and duplication, always within a named boundary.
- **Consistency:** the visibility and ordering guarantees for state, named precisely rather than summarized as “eventual” or “strong.”

## Do not conflate

- duplicated knowledge, duplicated representation, deliberate duplication, and coincidental similarity;
- interface, signature, API, and contract;
- boundary, seam, and port;
- adapter, gateway, facade, and anti-corruption layer;
- module, component, service, and bounded context;
- logical layer, physical tier, and vertical slice;
- dependency inversion, dependency injection, and inversion of control;
- command, event, message, and document;
- queue, publish-subscribe, and stream;
- timeout and deadline; retry and redelivery;
- idempotency and exactly-once delivery;
- schema compatibility and behavioral compatibility.

## Primary sources

- [Parnas, On the Criteria To Be Used in Decomposing Systems into Modules](https://dl.acm.org/doi/10.1145/361598.361623)
- [Ousterhout, Modular Design](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php%3Ftopic%3DmodularDesign)
- [Hunt and Thomas, The Pragmatic Programmer: DRY excerpt](https://media.pragprog.com/titles/tpp20/dry.pdf)
- [Feathers, The Seam Model](https://www.informit.com/articles/article.aspx?p=359417&seqNum=2)
- [Meyer, Applying Design by Contract](https://archive.eiffel.com/doc/manuals/technology/contract/)
- [Cockburn, Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture)
- [Evans, Domain-Driven Design Reference](https://www.domainlanguage.com/ddd/reference/)
- [Fowler, What do you mean by Event-Driven?](https://martinfowler.com/articles/201701-event-driven.html)
