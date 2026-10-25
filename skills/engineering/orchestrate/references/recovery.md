# Delegation recovery

Load this reference when a native dispatch times out, fails, stops responding, returns an incomplete result, overlaps ownership, or must be replaced. Unknown state stays unknown until refreshed.

## State and evidence

Use observed native runtime status where the host exposes it; some hosts report only running/completed. The root may classify a completed runtime as `blocked` or `failed` when its artifacts, contract, or checks are incomplete, and may record `cancelled` after an explicit native stop. Label that as a root assessment rather than inventing a runtime status. Record the dispatch identity, requested role/model/effort, observed identity when exposed, last known activity, files touched, commands/results, and the original dirty baseline. A worker's “done” message without artifacts or checks is incomplete evidence.

## Deadlines and stalls

Wait for a dispatch whose output the root needs before proceeding; a background dispatch left running can drop that slice silently. When a dispatch passes its contract deadline or returns nothing usable, follow the contract's stall branch: refresh native status, stop the task through the native control if it is still active, compare the workspace with the pre-dispatch baseline, and surface any stray changes. Then retry under the rules below with a changed contract; re-sending the same contract repeats the stall.

## Writer replacement

1. Refresh native status and inspect the current diff.
2. If the writer is still active or termination is unconfirmed, stop or interrupt it through the native control and wait for confirmation. Silence, timeout, and a local assumption do not free ownership; until confirmation, report the workflow as blocked with unresolved ownership, not cancelled.
3. Preserve user changes and the partial artifact, including an isolated writer's worktree and branch. Mark the old slice's state and record the exact files still owned.
4. Transfer ownership explicitly to one replacement with a narrowed contract. A replacement may write only after step 2 is confirmed.
5. Reconcile the combined diff, then run fresh checks after the replacement's latest edit.

Disjoint work may continue while this transfer is pending. A root-approved exception may coordinate separate files or non-overlapping hunks only when the shared contract is settled and the native workspace cannot cause an overlap.

## Retry and escalation

Retry a recoverable failure once with a narrower objective or clearer evidence. Escalate one supported native model tier only when capability, rather than missing information, caused the failure; retain the reason and the requested/configured/observed identities. After another failure, stop unchanged retries and reassess the route at the root. Never switch harnesses, edit configuration, or claim success to hide an unavailable role.

Completion requires actual artifacts, relevant checks, no unresolved ownership, and a final root decision. If any of these cannot be established, report `blocked` or `failed` with the missing evidence and the smallest next action.
