# Test quality

Load this file when a test must be designed or judged. A test is worth keeping only if it fails when the behavior it names breaks, and stays green when only the structure changes.

## Four properties of a useful test

| Property | A test fails it when… |
| --- | --- |
| Behavior-sensitive | it passes against a realistic wrong implementation: it asserts only "does not throw", checks truthiness instead of the value, or verifies mocks rather than outcomes |
| Structure-insensitive | a refactor that changes no behavior breaks it: it asserts private methods, exact mock call counts, internal snapshots, or an order that does not matter |
| Deterministic | its result depends on the real clock, timezone, locale, network, unseeded randomness, sleeps, or scheduling |
| Isolated | its result depends on test order or on a fixture another test mutates |

When two properties conflict, keep behavior-sensitivity. A brittle test that catches regressions can be repaired; an inert test gives false confidence.

## Example or property

An example test asserts one point. A property asserts a rule over an input domain and lets a generator search for a counterexample. Prefer a property when the code has an algebraic shape: roundtrip or inverse, idempotence, invariant, reference oracle, cheap checker, or algebraic law. Otherwise use examples.

Choosing the strongest property, designing generators, spotting tautological or vacuous properties, and triaging shrunk counterexamples belong to `property-based-testing`; load it before writing or judging a property test.

## Test doubles

Use the real collaborator inside the ownership boundary. Substitute only what is slow, unsafe, nondeterministic, or controlled by someone else. Prefer the smallest honest double: a fake with real behavior over a stub, and a stub over a mock that asserts calls. Assert call protocol only when the protocol is itself the contract, for example a payment request sent exactly once.

## Arrange, act, assert

- Name the behavior in the caller's terms, such as `refund_over_original_amount_is_rejected`, not `test_bug_4417` or `calls_validate_amount`. Put an issue link in a comment.
- Build inputs through a helper that defaults irrelevant fields. Set the one or two values the test depends on in the test body, so a reader sees them without opening a fixture.
- Test one behavior per test. Several inputs for the same behavior belong in one parameterized case.
- Make the assertion specific to the defect: the value, message, count, or order that was wrong.

## Choosing the next slice

Pick by risk. Coverage percentages are not a slice-selection rule. Useful candidates:

- error branches, rejected input, and the denied case of every permission check;
- zero, one, and many; empty and absent; minimum and maximum; off-by-one boundaries;
- Unicode, special characters, and injection-shaped strings where user input reaches a parser or query;
- a sentinel value such as `null`, an empty collection, or a fallback enum that now carries a new meaning, proving consumers act on the new state truthfully;
- a guard or early return added around setup, caching, loading, or cleanup;
- concurrent or repeated calls when the behavior promises idempotence or exactly-once effects.

## Mirror tests

A test that compares generated output, a copied list, or a shim against a fixture that was copied or regenerated from the implementation proves nothing about the generator: the fixture changes in lockstep with the code it checks. Ask: if the source of truth changed and the fixture did not, would this test fail? If not, assert against the source or regenerate the fixture in the test. A golden or oracle fixture authored independently of the implementation is a valid expected value and stays.
