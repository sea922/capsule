# ADLC Plan

`adlc-plan` turns an approved spec into a plan that someone who never saw the conversation could execute.

- **Invocation:** user-invoked only.
- **Output:** a draft `plan.md` with slices, acceptance coverage, assignment, risks, rollback, and the delivery handoff.

## How it works

The skill verifies the entire intent → spec approval chain, including source
hashes and conditions. It composes [`planning-and-task-breakdown`](../engineering/planning-and-task-breakdown.md)
for slices, interfaces, dependencies, review focus, and the initial ready frontier,
then adds:

- **Decisions:** every choice the spec left open (stack, hosting, thresholds), each with an ID, including the spec conditions and concerns the plan settles.
- **Carried items:** anything still undecided, with an owner and the slice it must be decided by.
- **Coverage:** every acceptance criterion mapped to slices and falsifying checks, plus combined acceptance of the integrated outcome.
- **Assignment:** an implementer and a separate verifier for each slice.
- **Risks and rollback:** observable stop conditions and how each slice can be undone, or recovered when reversal cannot restore data.
- **Handoff:** [`implement`](../engineering/implement.md), or authorized [`orchestrate`](../engineering/orchestrate.md), then [`ship-it`](../engineering/ship-it.md) when the declared endpoint requires remote delivery.

The plan names the delivery endpoint (local verification, PR ready, merged, or
deployed), action authority, and owner/method/timing for observing intent success.
Routine delivery updates `progress.md`, bound to the plan's hash with
revision-specific review and test evidence. The approved plan is unchanged by
progress. Reconciliation preserves history and rechecks affected slices instead
of resetting completed work or silently refreshing a stale plan hash.

The [progress contract](../../skills/adlc/adlc-plan/references/PROGRESS.md) defines
state prerequisites, changed-code invalidation, and legacy migration. Decision
deadlines distinguish entry prerequisites from answers a discovery slice is meant
to produce; unrelated authorized slices can continue when one slice is blocked.

When planning finds a fact that contradicts the spec, the skill stops and routes back to `/adlc-spec` instead of changing the approved behavior. Before review, the whole plan gets that skill's proportion check. The draft ends at `/adlc-gate plan`.

The [2026-09-27 source sweep](../research/2026-09-27-source-repos-sweep.md) adds interfaces, review focus, and the proportion check from Superpowers' `writing-plans`.
The [2026-09-28 review](../research/2026-09-28-adlc-review.md) adds approval-chain
verification, evidence freshness, and explicit delivery and observation boundaries.
