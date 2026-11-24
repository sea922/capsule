---
name: performance
description: Make working software measurably faster or lighter, or review code for performance risk, with numbers that hold up. Use when asked to speed up, optimize, profile, or reduce memory, latency, load time, bundle size, or cost, to set or check a performance budget, or to review a change for performance. Explaining why something got slower belongs to diagnosing-bugs; comparing options, vetting a reported number, or setting up a benchmark belongs to benchmark.
---

# Performance

Change performance only with evidence: a number measured before, the same number measured after, and the limiter named. A fix is a guess until it is re-measured, and an unmeasured win is complexity with no proven return.

## 1. Fix the target

Name one metric, the workload that drives it, and what counts as good enough: p95 latency of a request under stated load, peak memory of a job, time to interactive on a mid-range phone, rows per second, bundle bytes. "Make it faster" is not a target; ask for the missing part, or propose one and say so.

Record the environment that matters: production build and flags, data size, concurrency, cold or warm caches, network and device class. A laptop with a local database hides the I/O and latency that make production slow.

When the request is a cause ("why did this get slower after the deploy?"), use `diagnosing-bugs` and return here once the cause is known. A request to review code without running it is step 6. A request to optimize authorizes local edits and measurement runs, not production load, commits, or new dependencies.

**Complete when:** the metric, workload, environment, threshold, and edit authority are written down.

## 2. Measure the baseline

Build a harness that reproduces the workload with representative data, because toy data profiles a different program. Run it at least five times, keep every run, and report the median and the range. When the range is wider than the gain you are chasing, fix the harness before measuring anything else.

Before trusting any number, check that the work really happened inside the timed region and that every run succeeded: count errors and confirm outputs are correct. Fast failures and skipped work produce flattering numbers. `benchmark` holds the full rules for a measurement a decision rests on; use it when the comparison itself is in doubt or several variants must be searched.

**Complete when:** the baseline has a median, a range, an error count of zero or an explained one, and the exact command to reproduce it.

## 3. Find the limiter

Profile on the axis the metric lives on: wall-clock sampling for elapsed time, CPU profiles for compute, heap or allocation profiles for memory, the database's query plan for a slow query, the browser's performance trace for rendering, traces for a request crossing services. Profile in runs you do not report, because profilers add overhead.

Read the profile before believing it. Separate self time from inclusive time, and computing from waiting: a CPU profile of an I/O-bound program shows an idle program. Then confirm the suspect by stubbing or removing its work in a scratch copy and re-measuring. If the total barely moves, it was not the limiter, however bad the code looks.

**Complete when:** the limiter is named and confirmed by a removal experiment, or the report says what blocked confirming it.

## 4. Change one thing

First ask whether the work can be avoided: fewer round trips, less data fetched, work done once instead of per item, the right index, pagination. Then make it cheaper. Change one thing per measurement, because two changes measured together cannot be told apart.

For React and Next.js work, the [React reference](references/REACT.md) lists candidate causes and fixes in impact order; use it once the limiter is confirmed. When the confirmed limiter is repeated expensive work on inputs that rarely change, such as parsing, extraction, compilation, or file analysis, read the [caching reference](references/CACHING.md) before adding a cache.

Caching, batching, concurrency, and laziness change behavior. Name the invariant each one adds, such as cache key inputs, staleness window, ordering, memory ceiling, or partial-failure handling, and keep the test suite green.

**Complete when:** one change is in place, its new invariants are stated, and the existing checks pass.

## 5. Re-measure and decide

Re-run the baseline command under identical conditions and compare medians against the range.

| Result | Decision |
| --- | --- |
| Past the threshold or clearly outside the range, checks green | Keep, with before and after numbers in the change description |
| Inside the run-to-run range | Revert: no measurable change |
| Worse, or a check went red | Revert |
| Better only because work was skipped or a test was loosened | Revert: that is a regression |

Record every attempt, kept or reverted, with its numbers and reason, in the change description or a project performance log, so a failed idea is not tried again. Repeat steps 3–5 until the target is met, the limiter moves somewhere that cannot be changed, or the user's budget runs out.

**Complete when:** every attempt has a recorded number and a keep or revert decision.

## 6. Review without running

When asked to review code or a change for performance, or when `code-review` deep mode delegates, use the read-only `performance-reviewer` agent when available, or the same checklist directly. Findings from reading code are potential impact, never measurements: give no millisecond or percentage figures that no tool produced, and name the measurement that would confirm each finding.

**Complete when:** each finding names its location, its trigger such as data size or call frequency, and the measurement that would confirm it.

## 7. Guard and report

Where the project has CI, propose a guard proportionate to the risk, such as a bundle-size limit, a benchmark with a stated tolerance, or a query-count assertion. Report in this order: the verdict (faster, slower, no measurable change, or inconclusive), the metric with unit, run count, and range before and after, the limiter now, the changes kept and reverted, the invariants added, and what was not measured. Call a result inconclusive when the limiter was not confirmed, a side ran untuned, or errors were not counted.

**Complete when:** the report gives honest numbers with their spread and says what the next limiter is.
