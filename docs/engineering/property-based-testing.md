# Property-Based Testing

Use `property-based-testing` when tests should cover a whole input domain instead of a few hand-picked examples. It is model-invoked for requests about property-based, generative, or fuzz-style unit tests, for parsers, serializers, codecs, normalizers, comparators, and data structures, for "find the edge cases" requests, and for triaging a counterexample that a property test has shrunk.

The result is a set of properties, each tied to a documented contract, with a generator that reaches the interesting inputs, evidence that the property can fail against a realistic defect, and a run report. Code with no algebraic shape gets ordinary example tests, and the skill says so.

## Choosing properties

Properties are ranked by strength: no crash, then shape preservation, invariants, idempotence and metamorphic relations, and finally round-trip, oracle, and model agreement. The skill asserts the strongest one the contract supports. When only "no crash" seems available, it checks whether the shape is buried behind I/O, in-place mutation, or string building, and proposes a refactor for the author to accept or decline.

## Guarding against empty properties

A property test can pass forever while asserting nothing. A *tautology* restates the implementation, so shared bugs pass. A *vacuous* property filters away nearly every generated case. The skill pushes constraints into the generator, checks the generated distribution, and proves each property can fail by running it against a deliberate local defect that it then restores.

## Triaging a counterexample

A shrunk counterexample is classified against the contract as an over-broad generator, a wrong property, an ambiguous specification, or a code defect. Real counterexamples are pinned as explicit examples with their replay seed.

## Example

"We use Hypothesis. Add property tests for `encode_cursor` and `decode_cursor`."

The skill writes a round-trip property over a generator that builds valid cursor payloads, pins empty and non-ASCII values as examples, shows the distribution, and demonstrates a failure when escaping is removed.

## Composition and design basis

Example-driven red-green-refactor stays with `tdd`; a property can serve as a `tdd` red test when it fails for the missing behavior. A failure whose cause is not obvious goes to `diagnosing-bugs`, and its fix returns through `tdd` with the counterexample as red. Coverage-guided fuzzing campaigns and security findings belong to `security-review`. Adding a property-testing library to a project that lacks one is left to the user.

The [source-repository sweep](../research/2026-09-27-source-repos-sweep.md) identified the gap. Trail of Bits' `property-based-testing` plugin is the primary influence: its property catalog, strength ordering, tautology and vacuity warnings, refactor-to-expose-a-property lens, and failure classification are adapted in original wording. Its Solidity guidance (Echidna, Medusa) is omitted as outside this library's scope. Its sibling `mutation-testing` plugin informed the sabotage check that proves a property can fail. Cursor pstack's `principle-test-behavior-not-implementation` contributed the self-referential and weak-assertion shapes behind the tautology rule. Obra's Superpowers and Matt Pocock's TDD skills shaped the boundary with `tdd`, since both teach example-first testing through public interfaces and neither covers generative testing. Addy Osmani's agent skills, Ponytail, last30days, Anthropic's skills, EveryInc's compound engineering plugin, gstack, ECC, Wshobson's agents, and agent-dispatcher have no property-based testing guidance and did not influence this skill.

See the [skill instructions](../../skills/engineering/property-based-testing/SKILL.md).
