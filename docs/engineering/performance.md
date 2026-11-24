# Performance

Use `performance` to make working software measurably faster or lighter, or to review code for performance risk.

Examples:

- “Make the orders endpoint faster; p95 is around 900 ms.”
- “Reduce the dashboard's bundle size.”
- “Review this change for performance problems.”
- “Cut the memory this worker uses.”

The skill fixes one metric and workload first, measures a repeated baseline with its range, and profiles to find the limiter. It confirms the limiter by removing its work before changing anything, then changes one thing at a time. Each attempt is re-measured under identical conditions and kept only when it moves the number outside run-to-run noise with the checks still green. Neutral or worse changes are reverted, and every attempt is recorded so failed ideas are not retried.

A review without running code reports potential impact only. It names the data size or call frequency that makes each finding matter and the measurement that would confirm it, and never invents timings. The read-only `performance-reviewer` agent does this checking, and `code-review` deep mode reuses it for changes on hot paths.

References load on demand: React and Next.js causes in impact order, caching by content hash, tail latency in latency-sensitive systems, and bulk data throughput.

## Workflow fit

`diagnosing-bugs` owns explaining why something got slower; `performance` takes over once the work is to make it faster. `benchmark` owns comparing options and vetting a reported number, `database-design` the index or query for a known slow query, and `llm-features` model-call cost and latency. `verification-before-completion` governs the final claim.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-performance-accessibility-research.md), and the [skill instructions](../../skills/engineering/performance/SKILL.md).
