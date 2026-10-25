# SOLID as Design Diagnostics

Use SOLID to ask sharper questions about change, substitutability, clients, and dependency direction. It is not an architecture, a scoring system, or a mandate for class and interface proliferation.

Before applying a principle, answer:

1. What observed or credible change or failure pressure exists?
2. Which client, invariant, or policy benefits?
3. What indirection, concept, or operational cost will be added?
4. How will the result be enforced and tested?

## Single Responsibility Principle

**Definition:** group behavior that changes for the same actor or reason; separate behavior governed by different actors or reasons.

**Helps when:** unrelated policies create change coupling, merge conflicts, mixed ownership, or incompatible lifecycles.

**Evidence:** different owners, change histories, invariants, release cadence, or security rules.

**Failure mode:** interpreting “responsibility” as one method or one tiny class, producing shallow pass-throughs and scattered workflows.

**Deep-module resolution:** keep several operations together when they protect one invariant or hide one difficult policy. Separate them when their owners or reasons to change differ.

## Open-Closed Principle

**Definition:** choose a stable abstraction so selected variations can extend behavior without editing trusted policy. Complete closure against all change is impossible.

**Helps when:** a variation axis is established, additions are frequent, and modifying a stable core is risky.

**Evidence:** multiple current strategies, protocols, providers, rules, or scheduled migrations.

**Failure mode:** speculative factories, plugins, generic handlers, and configuration languages for changes that never arrive.

**Deep-module resolution:** hide the variation behind a capability-focused interface. Keep the simplest direct design until variation earns the abstraction.

## Liskov Substitution Principle

**Definition:** a substitute preserves the behavioral properties clients rely on, including invariants, preconditions, postconditions, errors, time, and side effects.

**Helps when:** implementations, adapters, fakes, plugins, or versions must be interchangeable.

**Evidence:** clients depend on one declared contract and several implementations or versions claim conformance.

**Failure mode:** treating structural typing or method signatures as sufficient while implementations strengthen preconditions, weaken guarantees, change error meaning, or violate performance assumptions.

**Deep-module resolution:** put behavioral promises in the interface contract and run the same conformance suite against meaningful substitutes.

## Interface Segregation Principle

**Definition:** clients should depend only on the coherent capabilities and knowledge they need.

**Helps when:** roles, permissions, compatibility timelines, or use cases differ.

**Evidence:** clients use disjoint operation groups or should not know privileged or unrelated behavior.

**Failure mode:** one interface per method, fragmented navigation, duplicated types, and abstractions that expose implementation structure.

**Deep-module resolution:** a module may expose several role-specific interfaces while remaining one cohesive owner. Optimize for coherent client views, not minimum method count.

## Dependency Inversion Principle

**Definition:** source dependencies point toward stable policy-owned abstractions; details implement those abstractions.

**Helps when:** infrastructure, vendors, frameworks, or transports should not dictate business policy.

**Evidence:** policy must survive a detail change, details evolve independently, or tests require a faithful substitute.

**Failure mode:** mirror interfaces for every concrete class, abstractions owned by providers, or dependency injection mistaken for dependency inversion.

**Deep-module resolution:** place the port with the policy that needs it, speak policy language, translate detail-shaped data in adapters, and compose at the edge.

## Resolve principle conflicts

SOLID principles and deep-module design can pull in opposite directions:

- SRP may suggest separation while an invariant suggests cohesion.
- ISP may suggest client-specific surfaces while depth favors fewer concepts.
- OCP may suggest extension while simplicity favors direct modification.
- DIP may add an interface while locality favors one implementation.

Resolve the conflict using total system complexity:

1. protect invariants and ownership;
2. minimize client knowledge;
3. preserve directional, understandable dependencies;
4. isolate evidenced change and failure;
5. count navigation, testing, migration, and operational costs;
6. choose the more reversible option when evidence is close.

## Primary sources

- [Martin, Single Responsibility Principle](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)
- [Martin, Open-Closed Principle](https://objectmentor.com/resources/articles/ocp.pdf)
- [Liskov and Wing, A Behavioral Notion of Subtyping](https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf)
- [Martin, Interface Segregation Principle](https://objectmentor.com/resources/articles/isp.pdf)
- [Martin, Dependency Inversion Principle](https://objectmentor.com/resources/articles/dip.pdf)
