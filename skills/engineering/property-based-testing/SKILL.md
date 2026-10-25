---
name: property-based-testing
description: Property-based and generative testing - choosing properties, designing generators, and triaging shrunk counterexamples with Hypothesis, fast-check, QuickCheck, proptest, FsCheck, jqwik, or rapid. Use when the user asks for property-based, generative, or fuzz-style unit tests; when parsers, serializers, encoders, codecs, normalizers, comparators, or data structures need coverage across a whole input domain; when asked to find edge cases or state invariants; when judging whether existing property tests assert anything; or when a property test has produced a counterexample. Example-driven red-green-refactor belongs to tdd, failures of unknown cause to diagnosing-bugs, and coverage-guided or security fuzzing campaigns to security-review.
---

# Property-Based Testing

An example test pins one point; a property states a rule for every valid input and lets a generator hunt for the counterexample. The trade pays when the code has an algebraic *shape*: an inverse, an invariant, a reference to compare against, a relation between runs. Code with no shape gets example tests through `tdd`, and saying so is a valid outcome.

## Entry contract

Detect the project's language and any property-testing library already in use; see [references/libraries.md](references/libraries.md). Write in the existing library. When none is present, adding one is the user's dependency decision: propose it once with the specific property you would write, and continue with example tests if they decline.

A property can be the red test in a `tdd` slice. It must then fail for the missing behavior before production code changes, like any other red test.

## 1. Find the shape

Read the code's contract in authority order: external spec or format definition, types, docstrings, existing tests, then the name. List candidate properties from [references/property-catalog.md](references/property-catalog.md) and rank them by strength:

`no crash < type or shape preserved < invariant < idempotence or metamorphic relation < round-trip, oracle, or model agreement`

Assert the strongest property the contract supports, adding weaker ones only where they cover behavior the strong one misses. If only "no crash" is available, check whether the shape is buried behind I/O, mutation, or string building (catalog, "Exposing a buried shape") before concluding the code is a poor candidate. Suggest production refactors; the author decides.

**Complete when:** each chosen property is grounded in a stated contract source, and it is the strongest available or the reason nothing stronger applies is recorded.

## 2. Design the generator

Generate the contract's domain directly. Put constraints inside the generator (bounds, alphabets, dependent draws, builders) rather than filtering afterwards; a precondition filter is for relationships between values that no generator can express. Pin the edge cases you already know as explicit examples: empty, single element, duplicates, zero, negative, extremes, delimiter and escape characters. Keep generated values shrinkable, so prefer the library's combinators over hand-rolled randomness.

Check the distribution, not just the pass. Use the library's labeling or statistics to confirm the interesting classes (empty and non-empty, valid and rejected, collisions) each receive a meaningful share of cases. Details and per-library tools: [references/generators-and-triage.md](references/generators-and-triage.md).

**Complete when:** the generator covers the documented domain, excludes only documented preconditions, and observed statistics show every interesting class exercised.

## 3. Prove the property can fail

A property test asserts nothing in two ways:

- **Tautology:** the assertion restates the implementation (`add(a, b) == a + b`, `encode(d) == urlencode(d)` when `encode` wraps `urlencode`), so any bug they share passes. Replace it with a relation that constrains the function without recomputing it. `f(x) == f(x)` is a real determinism property only when `f` touches hashing, iteration order, clocks, or shared state.
- **Vacuity:** filters discard nearly every case, contradict each other, or narrow the domain to one value, so the test passes having exercised nothing.

Name a realistic wrong implementation the property would reject. Then confirm it: run the test against a deliberate local sabotage (drop an escape, flip a comparison, lose the last element) and restore the original, or cite an existing counterexample. Leave no sabotage in the tree.

**Complete when:** each property has an observed or cited failure against a realistic defect, and the run reports a non-trivial number of executed cases.

## 4. Run and triage

Run the tests with a case count suited to the loop: small while iterating, larger in CI. Record the seed or replay token for every failure. A shrunk counterexample means one of four things:

| Finding | Response |
| --- | --- |
| Input violates a documented precondition | Constrain the generator |
| Property contradicts the contract | Fix the property |
| Contract is silent at this edge | Report as ambiguous and ask the owner; not a bug |
| Documented guarantee violated | Real defect: report the shrunk input with the contract quote |

Pin every real counterexample as an explicit example so it replays on every run. A defect whose cause is not obvious goes to `diagnosing-bugs`; its fix proceeds through `tdd` with the pinned counterexample as red.

**Complete when:** every failure is classified with its seed and shrunk input, and every real counterexample is pinned.

## Example

A query-string codec, where round-trip is the strongest shape and the known hard inputs are pinned:

```python
from hypothesis import example, given, strategies as st
from app.query import encode_params, parse_params

keys = st.text(min_size=1)                    # contract: keys are non-empty
params = st.dictionaries(keys, st.text())     # values may hold '&', '=', '%', non-ASCII

@given(params)
@example({"a": ""})                           # empty value
@example({"k&=": "%20+"})                     # delimiters and pre-escaped text
def test_parse_inverts_encode(d):
    assert parse_params(encode_params(d)) == d
```

Sabotage check: removing the escaping of `&` in `encode_params` makes the second example fail immediately; restore it before continuing.

## Report

For each property: the contract source, the property and its strength rank, the generator's domain and exclusions, the distribution evidence, the sabotage or counterexample that proves it can fail, the run command with case count, and any classified failures with seeds. State properties considered and rejected, and why.
