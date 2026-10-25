# Generators, shrinking, and triage

## Generate the domain, do not filter it

A filter or precondition discards cases after generation. A filter that rejects most candidates wastes the case budget, weakens shrinking, and in several libraries ends in a health-check error or a silently low case count. Express the constraint in the generator instead:

| Want | Generator move, not filter |
| --- | --- |
| Positive integers | Bounded integer generator with a minimum of 1 |
| A list and a valid index into it | Dependent draw: draw the list, then draw an index bounded by its length |
| Sorted input | Generate any list, then map it through a sort |
| Valid domain objects | A builder over field generators, not generate-then-validate |
| Recursive data (JSON, ASTs) | The library's recursive or lazy combinator with a size bound |
| Strings from a grammar | Compose token generators; filter only for rare cross-token rules |

Keep a filter only for a relation between already-drawn values that no combinator can express, and check the discard rate.

## Distribution

A passing property proves only what the generator reached. Label or classify cases and read the statistics before trusting a pass:

- Collections: how many were empty, singleton, large, with duplicates.
- Parsers and validators: what share of inputs were accepted versus rejected. All-rejected random bytes never reach the happy path; generate structured valid input and mutate it.
- Numbers: whether zero, negatives, boundaries, and (for floats) NaN, infinity, and denormals appear when the contract admits them.

When a class is starved, add a biased generator (`oneOf` weighted toward the interesting shape) or explicit examples.

## Shrinking

Shrinking is what turns a random failure into a readable one. Protect it:

- Build values from library combinators; generators that call an external RNG or hash to pick values cannot shrink.
- Prefer integrated-shrinking libraries or derived shrinkers; a custom type with no shrinker reports its first random failure unshrunk.
- Keep side effects out of generation, so replaying a shrunk case is deterministic.
- A property that is nondeterministic (clock, iteration order, threads) shrinks erratically; fix the nondeterminism or make it an explicit input.

## Case counts and deadlines

Use a small count for local iteration, the library default or a few hundred in CI, and thousands in a scheduled job. Disable or raise per-case deadlines for work that is legitimately slow, because a timing-based failure on a loaded CI runner is a flake, and flakes get suites deleted.

## Triage a counterexample

Ground the failure in the contract before reporting it. Authority, highest first: external spec, type signatures, docstrings, existing tests, function name. The name is the weakest signal; plenty of functions called `normalize` promise less than the word suggests.

| Symptom | Classification | Action |
| --- | --- | --- |
| Input outside the documented domain | Over-broad generator | Constrain the generator |
| Property asserts more than the contract promises | Wrong property | Fix the property; say what it now asserts |
| Contract never addresses this edge | Ambiguous spec | Ask the owner; report as a question |
| Violates a documented guarantee or a language contract | Code defect | Report shrunk input, seed, and the contract quote; pin the example |
| Vanishes under realistic constraints | Test artifact | Fix the generator; record why |
| Differs from a sibling function's behavior | Possible inconsistency | Raise it with the uncertainty stated |

Report every finding with its classification, including uncertain ones. A suppressed finding cannot be triaged by anyone else.

Language contracts need no docstring: equal values must hash equally, comparators must be transitive and antisymmetric, and iterators must yield every element once.

## Recurring counterexamples

- Lone surrogates and non-UTF-8 byte sequences break text round-trips; the verdict depends on whether the format claims arbitrary strings.
- Denormals, negative zero, NaN, and rounding break numeric invariants and money arithmetic.
- Delimiters inside values (`&`, `=`, `,`, quotes, newlines) break hand-written encoders.
- Off-by-one at collection ends: iterators dropping the last element, pagination skipping or repeating a row.
- Duplicate keys and equal sort keys expose unstable sorts and last-write-wins surprises.
- Empty input: empty strings, empty collections, zero-length ranges.

## Reviewing existing property tests

Report each issue with its severity; do not drop the lower ones on the author's behalf.

| Issue | Severity | Signal |
| --- | --- | --- |
| Tautological | Critical | Assertion holds for any implementation, or recomputes the function |
| Vacuous | Critical | Filters discard nearly all cases, contradict each other, or pin one value |
| No assertion | High | Calls the function and stops, with no documented error contract |
| Weaker property than available | Medium | Checks length but not order, type but not round-trip |
| Over-filtered | Medium | Stacked filters where generator constraints belong |
| Unverified distribution | Medium | No evidence the interesting classes are reached |
| Flake risk | Low | Float equality without tolerance, clock reads, set or map order, tight deadlines |

For each test, name the strongest catalog property the code supports that the suite does not yet assert.
