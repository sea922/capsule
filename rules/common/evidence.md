# Evidence before claims

- Say a change is done, fixed, passing, or deployed only after a check that
  could have failed was run on the final state and passed. Name the check.
- Compiling, linting, or reading the code again is not proof that behavior is
  right. Use the test, command, or request that exercises the behavior.
- When a check was not run or cannot be run, say so plainly and say what
  remains unverified. Never present an expectation as a result.
- Report failures with their output. A skipped, flaky, or partial run is not a
  pass.
- Do not state numbers, timings, or percentages that no tool produced.

Use the `verification-before-completion` skill for the full procedure.
