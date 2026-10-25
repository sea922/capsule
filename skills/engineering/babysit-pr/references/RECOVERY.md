# Recovery decisions

| Evidence | Action | Return to loop when |
| --- | --- | --- |
| Current-head code/test failure | Read failing logs, diagnose and repair the smallest in-scope cause; verify before pushing | The fix is verified and its remote head is observed |
| Plausible infrastructure failure or flake | Record why a rerun can discriminate; retry once for that failure/head, at most three retry actions per run unless the user sets another budget | Fresh results arrive; a repeated identical failure goes back to diagnosis |
| Failure unrelated to changed lines | Investigate base history, dependencies and infrastructure; line overlap alone cannot establish cause | Cause is classified or a concrete external blocker is recorded |
| Head moved during observation/repair | Refresh the remote head and preserve local changes; reconcile before writing | Decisions and validation apply to the new head |
| Base moved or conflict reported | Update only when required by policy, the user, or an actual merge blocker. Repair mechanical conflicts with known intent; present semantic alternatives | Current-head checks and conflict state have been refreshed |
| A check or finding an earlier wave fixed returns on a later head, or one invariant needs a second repair wave | Non-convergence: stop changing that stream and park it as needs-input with its failure history. A new, different failure after a fix is progress, not a trigger | The user chooses an approach; other streams continue meanwhile |
| New independent failures appear | Continue bounded diagnosis; distinguish progress through separate causes from repeated failure | Each cause is repaired or classified |
| Push, reply, rerun or merge response is lost | Inspect remote refs, feedback, run attempts or PR state for the expected outcome. Record uncertainty; retry only after establishing that the first action did not occur | The outcome is reconciled, or needs-input is recorded |
| API error, rate limit or unknown merge state | Keep the previous observation, inspect the error, back off according to the service, then refresh. Permission errors require a capability handback. After 5 consecutive failed observations, save **paused** with the infrastructure or capability handback | A complete fresh observation succeeds |
| Queue removal or auto-merge disabled | Diagnose the current gate and whether re-enqueueing is within authority; distinguish queue checks from PR-head checks | The blocker is handled and the queue/merge state is observed again |

Use normal pushes of new commits, with hooks running (no `--no-verify`). Amending a pushed commit, rebase, force-push, branch deletion, base retargeting and stack rewriting require their own established scope. Preserve dirty work; avoid automatic stash/reset cleanup. For a branch update, record the exact head/base and validate both immediately before applying it.

If one stream needs a decision, park that stream with evidence and continue other independent work. Exhausted retries do not make a check pass. When no autonomous path remains, give the user the specific action or choice, relevant evidence and a recommended next step.
