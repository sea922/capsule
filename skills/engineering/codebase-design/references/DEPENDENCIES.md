# Dependencies, Seams, and Enforcement

Treat a dependency as a profile, not a single category. Ownership, process location, I/O, state, trust, latency, replaceability, and contract authority vary independently.

## Profile each material dependency

Record:

- owner and contract authority;
- same address space, owned remote process, third party, human, or device;
- pure computation, local I/O, network I/O, nondeterminism, or shared state;
- latency, availability, and failure independence;
- trust level and data classification;
- state and consistency role;
- release and compatibility cadence;
- substitute options and their semantic fidelity;
- source dependency direction and runtime flow.

This profile determines seam placement, test strategy, failure handling, and enforcement more accurately than labels such as “internal” or “external.”

## Direct source dependencies

Use a direct dependency when the caller legitimately knows the callee's stable concepts and no policy, failure, ownership, or replacement pressure needs isolation. Directness is often the simplest design.

Introduce a port when it gives policy control over a material concern:

- infrastructure or vendor details should depend on application policy;
- several mechanisms satisfy one stable capability;
- a dependency changes or fails independently;
- a foreign model should not leak into the local domain;
- tests need a faithful local substitute for a slow or nondeterministic edge;
- a migration must support old and new paths temporarily;
- trust or authorization policy needs one controlled point.

One production adapter can justify a seam. Demand a concrete pressure, not a fixed adapter count.

## Dependency inversion

Dependency inversion means source dependencies point toward stable policy-owned abstractions. It is not the same as constructor injection or using a container.

```text
Runtime:     Order policy -> Stripe adapter -> Stripe
Source:      Stripe adapter -> Payment port <- Order policy
Owner:       Order policy owns Payment port
```

Place the port with the policy that needs the capability, using its language. Translate provider DTOs and errors in the adapter. Construct the graph at a composition root so policy does not create details internally.

Do not invert every dependency. Framework-neutral pure computation and stable same-owner code may be clearer as direct calls.

## Keep the graph understandable

Prefer an acyclic source dependency graph. A cycle means the participating modules cannot be understood, tested, built, or released independently at that level.

Break a cycle by asking which knowledge moved to the wrong owner:

1. move a shared invariant or policy into its rightful module;
2. extract a small policy-owned contract;
3. replace a callback cycle with a returned decision or explicit result;
4. introduce an application orchestrator above the participants;
5. publish a fact only when consumers are genuinely independent;
6. merge modules when the cycle reveals one cohesive responsibility;
7. move composition into a higher-level root.

Do not use events only to hide a source cycle. They can replace visible compile-time coupling with harder temporal and behavioral coupling.

## Enforcement ladder

Protect important architecture decisions with the lightest mechanism that reliably detects drift:

1. **Language visibility:** private members, internal namespaces, sealed modules.
2. **Public entry points:** package exports, module manifests, `index` or facade surfaces.
3. **Build boundaries:** packages, projects, modules, workspaces, or assemblies.
4. **Static dependency rules:** import restrictions, dependency-cruiser, ArchUnit, NetArchTest, or equivalent native tools.
5. **Architecture tests:** graph assertions, forbidden dependency checks, public-contract checks.
6. **CI gates:** run the rules where bypasses cannot silently merge.

Match enforcement to consequence. A comment can guide a low-risk convention; a trust or policy boundary usually deserves executable protection.

When reviewing a codebase, compare three graphs:

- **declared:** documentation and intended architecture;
- **source:** actual imports, references, packages, and schemas;
- **runtime:** observed calls, messages, and state flows.

Report discrepancies with file-level evidence. A clean diagram does not outweigh a bypassing import.

## Seam decision record

For each proposed seam, write:

```text
Capability:
Policy owner:
Pressure isolated:
Port contract:
Current adapter(s):
Static dependency direction:
Runtime flow:
Test substitute or conformance evidence:
Enforcement:
Removal condition:
```

The removal condition prevents speculative abstractions from becoming permanent sediment.

## Primary and current sources

- [Martin, Dependency Inversion Principle](https://objectmentor.com/resources/articles/dip.pdf)
- [Martin, Granularity and package cycles](https://objectmentor.com/resources/articles/granularity.pdf)
- [Cockburn, Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture)
- [Matt Pocock Skills issue 458](https://github.com/mattpocock/skills/issues/458)
- [Matt Pocock Skills issue 877](https://github.com/mattpocock/skills/issues/877)
