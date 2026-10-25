# ADLC Flow

`adlc-flow` is the explicit router for the ADLC suite and the one command humans need to remember.

- **Invocation:** user-invoked only.
- **Output:** the work item's evidenced stage and exactly one next command or authorized delivery handoff.

## Routing

| Evidenced state | Route |
| --- | --- |
| No intent, or a fuzzy idea | `/adlc-intent` |
| Intent, spec, or plan is draft or stale | `/adlc-gate <stage>` |
| An artifact was rejected | The same stage's command, with the reasons |
| Intent approved, no spec | `/adlc-spec` |
| Spec approved, no plan | `/adlc-plan` |
| Upstream reapproved, downstream source still old | Downstream authoring stage to reconcile, then its gate |
| Plan approved, progress missing or bound to an older plan | `/adlc-plan` to reconcile it |
| A carried item or required sign-off is due and undecided | `/adlc-gate slice <id>` |
| Slice blocked by a dependency, failed check, or environment | Resolve that prerequisite; continue independent authorized work |
| A slice is implemented | `code-review`, plus `security-review` when the spec calls for it |
| A slice is reviewed | `verification-before-completion` |
| A slice is verified, delivery endpoint not reached | `ship-it` within existing authorization |
| Slices ready or in progress | `implement`, or `orchestrate` for independent slices |
| All slices delivered, combined acceptance unverified | `verification-before-completion` |
| Combined acceptance and endpoint evidenced | Report completion at that endpoint and any pending outcome observation |

The router is read-only. It verifies status, latest decision, current content
hash, and every source link in the approval chain. An upstream change sends work
to the earliest unresolved stage. During delivery, states need evidence for the
actual code revision, conditions, and plan hash. A changed implementation cannot
reuse an old review or test pass without a documented relevance check. A missing
receipt means unknown, not merely one state earlier.

The plan declares whether completion means local verification, PR readiness,
merge, or deployment. Legacy plans without an endpoint retain `done = merged`.
Deployment requires evidence from its target environment; neither approval nor
passing tests grants permission to deploy. An observed incident or changed need
starts a new intent. Delivery returns to the router at slice boundaries.

See the [ADLC research](../research/2026-09-26-adlc.md) for sources and design decisions.
The [2026-09-28 review](../research/2026-09-28-adlc-review.md) strengthens chain
freshness, evidence, and terminal routing.
