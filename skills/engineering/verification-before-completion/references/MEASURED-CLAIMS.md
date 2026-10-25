# Measured Claims

Use this before reporting or acting on a number you measured: a speedup, a
regression, a throughput or latency figure, or an eval score. A run that went
wrong still prints a plausible number. Failed requests, a cache that skipped the
work, code that never ran, a side left on default settings, and run-to-run noise
all produce results that look fine.

## Before running

- Write the claim you expect to make, in the words you would report: "export is
  30% faster at p50 on the 60k-row dataset". The checks below test that
  sentence.
- Read the measurement script. Note what it times, what it counts, and what it
  ignores.
- Check machine load and core count. If you cannot quiet the machine, alternate
  the sides so both see the same noise, and say so.

## The checks

1. **Limiter.** Ask "why not twice as good?" and name what bounds the result: a
   core, a lock, the disk, the network, or the load generator itself. Take it
   from a profile or system counters in a run you do not report, then map it to
   source. A guess from reading code is not a limiter.
2. **Tuning parity.** Run every side the way production runs it: release build,
   production flags, pools, batching, cache warmth, versions, and data. One side
   on defaults compares configurations, not implementations.
3. **Physical limits.** Compare the result with disk, network, and CPU capacity,
   and the time saved with the time the changed piece took. Removing a piece
   that takes 10% of the run can save at most about 10%. A result past a limit
   measured something else.
4. **Errors.** Count failures and non-success responses, and check outputs are
   correct, not just present. Rejections are often fast; timeouts are slow.
5. **Repeatability.** Run each side at least five times, alternating A and B.
   Report the median and range. A gap smaller than the run-to-run spread is no
   measurable difference.
6. **Relevance.** Next to a micro result, measure the end-to-end path a user
   waits on and report the micro result as a share of it.
7. **The work happened.** Confirm the work ran inside the timed region: the
   request arrived, the rows were written, the result was used. Unconsumed lazy
   values, unawaited promises, and timeouts all time nothing.

For a quick ballpark the user asked for, one run is enough, but still apply
checks 4 and 7 and say it was one run. A choice between options is never a
ballpark.

For an eval score, ask the same of the trials: did every trial do the task,
does the gap hold across trials and models, and does the scenario matter.

## Report

Lead with the verdict: faster, slower, no measurable difference, or
inconclusive. Give the number with its unit, run count, range, and limiter, for
example "p50 41 ms to 33 ms, median of 7 runs per side, range 32 to 35 ms,
bound by JSON parsing on one core". The verdict is INCONCLUSIVE when the
limiter is unnamed, a side ran untuned, or checks 4 or 7 could not be done;
name the gap.
