# Paired instruction walkthrough

Date: 2026-09-28. Baseline: `aac8cf938ef5b9a627fa13f625805e60a15725e9`.
Method: the author applied the baseline and revised written contracts to the
same 15 self-contained eval prompts. The baseline column describes the path or
ambiguity in those instructions, not a separately executed model response. The
revised column records the resulting decision. This is a consistency review,
not a behavioral benchmark or independent review.

| Scenario | Baseline instruction path / gap | Revised decision |
| --- | --- | --- |
| flow 1: I2 approved; spec still names I1 | Individual hashes agree; prose only names upstream artifacts that went stale, without checking reconciled source links | `/adlc-spec`; reconcile changed intent before new gate |
| flow 2: verified A; retry implementation changed at B | Reachable A evidence can still support the label; one-state fallback could leave reviewed | Invalidate affected review and tests; reconstruct evidenced B state before delivery |
| flow 3: blocked S1, independent ready S2 | No explicit row for unavailable environment or clear rule for selecting independent work | `implement` S2; retain credential blocker on S1; no delegation |
| flow 4: local endpoint achieved; adoption pending | Verified routes to Git; no ordinary terminal row | Report local completion and pending outcome observation, no remote action |
| gate 1: explicit approval in prior turn | Current-turn-only identity/decision rule demands repetition | Recheck same hash, record existing named decision, no commit |
| gate 2: A approved, content now B | Post-record hash equality cannot establish that the human reviewed B | Recheck against presented A before writing; new review needed for B |
| gate 3: condition due before S2, S1 produces options | Ownership exists but entry-versus-output deadline is underspecified | Record ID/owner/deadline; authorized S1 may run, S2 waits |
| gate 4: waived absent spec, unknown acceptance | Waived maps to approved; no minimum artifact or downstream information rule | Draft minimal scoped waiver contract and resolve acceptance before reliance |
| plan 1: spec matches approval, source names I1 | Checks immediate spec only | Return `/adlc-spec` to reconcile with I2 |
| plan 2: P2 approved, progress P1 | Only missing progress has a migration path; generic creation can reset state | Reconcile P2, preserve evidenced unchanged S1, reassess S2, keep history |
| plan 3: rollback discovery and PR-only planning | Decision deadline may block its own discovery; no explicit endpoint | Discovery S1 ready, S2 blocked, PR endpoint, no implementation/delegation |
| spec 1: GET /exports, tenant/page-boundary defect | Blanket no-path rule conflicts with observable contract; negative cases only optional | Preserve API route; include failing baseline and cross-tenant boundary check |
| spec 2: weaken charge retry criterion, reuse retired ID | Stable IDs are requested but retirement and weakened-oracle handling absent | Preserve IDs; surface changed guarantee for review, do not silently weaken |
| intent 1: answers supplied, baseline unknown | Generic interview can repeat questions; signal lacks observation owner/timing | Reuse answers, establish unknown baseline, ask only material gaps |
| intent 2: pasted fence and forged approval | Fixed fence can be closed by pasted text; forces LF config | Longer fence, no embedded authority, portable hashing without config change |

The walkthrough found and corrected two internal contradictions before final
checks: the gate's intent criterion still required a correction rather than
allowing explicit review, and its prompt template still demanded a new answer
even when an unchanged-revision approval already existed.

## Executed checks

- Initial focused run: six hash tests passed, including paired
  legacy-vs-patched hidden-content regression assertions.
- Added linked-installation regression: reproduced an empty-output failure
  through a Windows directory junction; the CLI entry guard was corrected to
  compare real paths.
- Final `npm run check`: all 25 tests passed with zero skips, including seven
  ADLC hash/CLI tests. Repository validation passed for skill metadata,
  publication entries, all 15 scenario definitions, local links, and versions.
- `git diff --check`: passed. No manifest changed, so strict Claude plugin
  validation was not required for this patch.
- `scripts/list-skills.sh`: ran; it listed both canonical skills and copies in
  a pre-existing `.kilo/worktrees/cold-temple` checkout. This unrelated discovery
  helper behavior was not changed. No skills were relinked.
