# Libraries by ecosystem

Match the library the project already uses; a second property-testing library is not worth the property you wanted. Detect before proposing:

```bash
rg -l "from hypothesis|fast-check|Test.QuickCheck|Hedgehog|proptest|quickcheck|FsCheck|net.jqwik|pgregory.net/rapid|io.kotest.property|StreamData|scalacheck|test.check"
```

Confirm API details against the installed version's documentation before relying on them; the names below are orientation, not a pinned reference.

| Ecosystem | Library | Precondition | Pinned examples | Distribution | Replay a failure | Stateful / model |
| --- | --- | --- | --- | --- | --- | --- |
| Python | Hypothesis | `assume` | `@example` | `event()`, `--hypothesis-show-statistics` | Example database replays automatically; `@reproduce_failure`, `--hypothesis-seed` | `RuleBasedStateMachine` |
| TypeScript / JavaScript | fast-check | `fc.pre` | `examples` option on `fc.assert` | `fc.statistics` | `seed` and `path` options from the failure report | `fc.commands` with `fc.modelRun` |
| Haskell | QuickCheck | `==>` | Separate unit test | `label`, `classify`, `cover` with `checkCoverage` | `replay` in `Args` | quickcheck-state-machine, quickcheck-dynamic |
| Haskell | Hedgehog | `discard` | Separate unit test | `classify`, `cover` | Seed printed on failure | `Command` state machines |
| Rust | proptest | `prop_assume!` | Regression file entries | Manual counters | `proptest-regressions/` files persist and replay | proptest-state-machine |
| .NET (C#, F#) | FsCheck | `==>` (F#), `.When` (C#) | Separate unit test | `Prop.classify`, `Prop.collect` | `Replay` in `Config` | Model-based commands |
| Java | jqwik | `Assume.that` | `@Example` | `Statistics.collect` | `seed` on `@Property`; failures replay by default | Action chains |
| Go | rapid | `t.Skip` or `Filter` | Separate unit test | Manual counters | Fail files under `testdata/rapid`; `-rapid.seed` | `t.Repeat` with an action map |
| Kotlin | Kotest property | `assume` | Arb edge cases or a separate test | `collect`, `classify` | Seed in `PropTestConfig` | Not built in |
| Elixir | StreamData | `filter` | Separate unit test | Manual | `--seed` | Not built in |
| Scala | ScalaCheck | `==>` | Separate unit test | `classify`, `collect` | Seed in parameters | `Commands` |
| Clojure | test.check | `such-that` | Separate unit test | Manual | `:seed` option | Not built in |

Shrinking style matters when writing custom generators. Hypothesis, Hedgehog, rapid, fast-check, jqwik, and proptest shrink through the generator, so values built with combinators shrink for free. QuickCheck and FsCheck shrink through a per-type shrinker; a custom `Arbitrary` without one reports unshrunk failures.

Coverage-guided fuzzers (libFuzzer, AFL++, cargo-fuzz, Go native fuzzing, Jazzer, Atheris) are a different tool with a different loop: long campaigns, corpus management, and crash triage. A single harness can reuse a property as its oracle, but a campaign and its security findings belong to `security-review`.
