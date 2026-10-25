# Progress record

`progress.md` sits beside the plan and is the living delivery record. It has no
`status` or `## Approvals`, is never hashed, and never makes the plan stale.
Its `plan` field binds it to a specific plan content hash. Delivery updates it
at each slice state change; `/adlc-gate slice <id>` records required human
sign-offs in it; `/adlc-flow` reads it to route delivery.

## State requires evidence

| State | Required evidence |
| --- | --- |
| blocked | Actual dependency, unresolved decision, failed check, or unavailable environment; name the next action and owner |
| ready | Prerequisite slices and entry decisions satisfied; inputs and action authority available |
| in-progress | Named implementer and active slice; preserve blockers and prior receipts |
| implemented | Change exists at a recorded revision/snapshot; slice checks and gaps recorded |
| reviewed | Review of that change, findings and dispositions recorded; required independent verifier identified |
| verified | Fresh evidence supports applicable ACs and required checks after the last relevant change; skips/errors are gaps |
| done | Verified result reached the endpoint declared in the plan, with direct endpoint evidence |

These are evidence states, not a mandatory sequence of human gates. `blocked`
can occur at any point. `done` means local verification, PR readiness, merge,
or deployment **as declared**; merge alone cannot prove a deployment endpoint.
When an older plan omitted the endpoint, retain the old suite's `done = merged`
meaning until the human explicitly changes it through plan revision and review.

Record evidence as a commit SHA or reproducible working-tree snapshot, plus
check/review ID, scope, environment, result, and time. A working-tree snapshot
must include relevant dirty and untracked files; HEAD alone does not describe
them. A file or PR link needs the reviewed revision. Use native review/CI
receipts instead of duplicating full logs. Label reported-green evidence as
reported until independently reproduced; the verification skill owns verdicts.

On code, test, configuration, or environment changes, preserve old receipts as
history and invalidate affected claims. Unrelated changes need not rerun
everything if the verifier records why the old evidence still applies. A stale
or missing receipt supports no state beyond the last fully evidenced one.
Changing verification thresholds to obtain a pass is a contract change, not a
routine progress update.

On plan revision, reconcile stable slice and AC IDs against the newly approved
hash. List added, changed, and retired slices; keep unaffected evidence with a
reason and recheck affected slices. Do not just replace the plan hash or reset
completed slices to ready. Legacy records with only a plan path first need this
reconciliation. All slices passing does not establish combined acceptance.

## Template

```markdown
---
adlc: progress
slug: <slug>
plan: <plan path>@<content hash; draft candidate until approved>
---

# <Title> progress

> Living delivery record; never hashed or gated.

## Slices

| Slice | State | Revision / snapshot | Evidence and result | Blocker / next action | Updated |
| --- | --- | --- | --- | --- | --- |
| S1 | ready | <inspected baseline> | <prerequisites satisfied> | <next action> | <date> |

## Decisions

| ID | Date | Slice | Decision | Decider / authority | Plan hash | Evidence revision | Conditions |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Carried items

| ID | Item | Source | Owner | Decide by | State / resolution evidence |
| --- | --- | --- | --- | --- | --- |
| C1 | <condition, question, or concern> | <artifact hash and decision ID> | <who decides> | <before S2 starts, end of S1, or delivery boundary> | open |

## Delivery and outcome

- Endpoint: <from approved plan>; evidence: <pending, or revision-specific receipt>.
- Combined acceptance: <check, AC IDs, revision, result, or exact gap>.
- Outcome observation: <intent signal, owner, method, and observation point>.
- Follow-up: <none, scheduled observation, or linked new intent for a changed need>.
```

Record consequential execution decisions made within existing authority with
the actual decider and authority source; do not invent a human approver for an
agent's routine choice. No decision row overrides an approved spec or plan.
Keep human gate decisions distinguishable from these execution notes.

For a deployed endpoint, use the target environment's read-back and planned
smoke/health check. Assign an observation point for the intent signal when it
cannot yet be measured; report it as pending. This record does not schedule an
automation or grant monitoring/deployment authority. Route an observed incident
or changed need to a new intent; use `compound-learnings` only for a durable
lesson that meets that skill's relevance bar.
