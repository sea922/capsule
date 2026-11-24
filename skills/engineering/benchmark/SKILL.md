---
name: benchmark
description: Produce or vet a measurement that a decision can rest on, and run a bounded search for a better variant. Use when asked to benchmark, compare two implementations, libraries, or configurations, check whether a reported speedup or regression is real, set up a repeatable benchmark or regression gate, or try several variants to reach a target. Finding and fixing a bottleneck belongs to performance; explaining why something got slower to diagnosing-bugs.
---

# Benchmark

A benchmark is evidence only when someone else can rerun it and get the same answer to the question that matters. This skill fixes the question, freezes the comparison, and reports only what the runs support.

## 1. Fix the question and the budget

Write the claim you expect to make, worded as it would appear in the PR: "p50 export time drops 30% on the 60k-row dataset". Then record:

- the **primary metric**, its unit and direction, and why it reflects what the user experiences. A proxy such as a micro-benchmark may guide diagnosis, but improving it does not show the user's task improved;
- the **hard constraints** that must stay true whatever the score: correctness, safety, data integrity, cost ceiling;
- the **threshold** that counts as success;
- the **budget**: maximum variants, time, spend, and data impact. A request such as "make it 20x faster" keeps its ambition and still gets a bounded search.

Benchmarking authorizes local runs. Production load, paid calls beyond the budget, new dependencies, and commits need their own permission. When a threshold or tradeoff is missing, propose one and ask.

**Complete when:** the claim, metric, constraints, threshold, budget, and authority are written down.

## 2. Freeze the comparison

Fix the inputs, the expected results, and the evaluator before any variant runs, and record the versions of the code, data, and environment needed to rerun. Use representative data sizes and concurrency. Expected results come from an independent source, never from the candidate being tested. For a subjective score, calibrate the rubric against accepted examples first; the optimizing agent's own score is not acceptance evidence.

Run every side the way production runs it: release build, production flags, the same warm or cold cache state, the same machine. Make the harness count errors and confirm outputs are correct, because rejections are fast and skipped work is free.

If the inputs or evaluator later prove wrong, document why, get the user's agreement to change what success means, version the change, and rerun every side under the new rules.

**Complete when:** the harness, inputs, expected results, and environment are frozen and reproducible from the record.

## 3. Establish the baseline

Check the machine is quiet, then run each side at least five times, alternating sides so warm-up and drift favor neither. Keep every run. Report the median and the range, with failures counted in the total rather than dropped.

Check the number against what the hardware allows: bytes per second against disk and network limits, operations per second against cores. A result beyond those limits means the work did not happen. Name the limiter where you can: a result you cannot explain is not ready to report.

A quick ballpark the user asked for may be one run; say that it is one run, and still check for errors and that the work happened. A choice between options is never a ballpark.

**Complete when:** the baseline has a median, a range, a failure count, and a reproducing command.

## 4. Run variants

Test one hypothesis per variant, under the frozen rules. Record each in a ledger: hypothesis, exact command, versions, result, hard-constraint results, failures and retries, and the decision.

Judge hard constraints separately from the score. A variant that breaks correctness or another constraint is rejected however good its number, and a variant that wins by skipping required work is a failure. Compare each variant with the last accepted winner, not only the previous run.

Stop when the threshold is met, the budget is spent, improvements fall inside the run-to-run range, or the search is changing more than it can explain. Keep the last accepted winner and report the gap.

**Complete when:** every variant has a ledger entry with a keep or reject decision and its reason.

## 5. Confirm and lock in

Before a winner becomes the default, rerun the baseline and the winner together to confirm the difference, and check it against the user-level outcome from step 1 where that can be measured. Then make it durable: the winning setting in source control, and the harness kept as a script or CI check with a stated tolerance, or removed deliberately.

**Complete when:** the difference is confirmed by a fresh paired run and the result is recorded where the next person will find it.

## 6. Vet a result someone else produced

When asked whether a reported number is real, or when `performance` or `code-review` delegates, use the read-only `benchmark-auditor` agent when available, or the same questions directly: what limits it, was each side tuned alike, does it fit hardware limits, were errors counted, does it reproduce, does it matter end to end, and did the work happen. Call it inconclusive when those cannot be answered.

**Complete when:** each question has an answer from evidence or is named as unanswered.

## 7. Report

Open with the verdict, one of faster, slower, no measurable difference, or inconclusive. Then state the number and its unit, how many runs produced it and their range, the limiter, and the conditions. Report benchmark success, user-level acceptance, and deployed results as three separate things. Say "best measured variant", not "optimal", unless the search covered every option. Keep one primary number in a PR description and link the ledger.

**Complete when:** a reader could rerun the comparison and knows exactly what was and was not shown.
