# Benchmark

Use `benchmark` to produce or check a measurement that a decision will rest on.

Examples:

- “Is this 30% speedup real?”
- “Compare these two parsers for the nightly import.”
- “Set up a benchmark so we catch regressions.”
- “Try variants until the report job is under two minutes.”

The skill writes down the claim, the metric, and why that metric reflects what users experience, together with the hard constraints and a budget for the search. It freezes the inputs, expected results, and evaluator before any variant runs, and takes expected results from an independent source. Each side runs at least five times, interleaved, under production-like settings, with errors counted. Variants test one hypothesis each and are recorded in a ledger; a variant that breaks a hard constraint is rejected whatever its score. A winner is confirmed by a fresh paired run and then locked in as a script or CI check.

The read-only `benchmark-auditor` agent vets a harness or a reported number against seven questions, and `performance` and `code-review` deep mode reuse it.

## Workflow fit

`performance` owns finding and fixing a bottleneck and hands measurement questions here. `diagnosing-bugs` owns explaining a regression.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-adoption-research.md), and the [skill instructions](../../skills/engineering/benchmark/SKILL.md).
