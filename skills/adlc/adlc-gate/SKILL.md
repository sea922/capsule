---
name: adlc-gate
description: Record a named human sign-off on an ADLC intent, spec, plan, or delivery slice.
disable-model-invocation: true
---

# ADLC Gate

Put a named human decision between each ADLC stage and the next, and at the specific decisions delivery requires. Routine reversible execution inside the approved scope needs no new gate. The agent checks the artifact against its exit criteria and records what the human decides. The human alone approves, and an approval covers only the exact revision they reviewed.

## 1. Identify the artifact

Take the stage from the argument: `intent`, `spec`, `plan`, or `slice <id>`. For a stage, find the work item's artifact (`docs/adlc/<slug>/<stage>.md` or the project's convention). Read [references/APPROVALS.md](references/APPROVALS.md), compute the content hash with [scripts/content-hash.mjs](scripts/content-hash.mjs), and verify every required upstream approval and source link. A stale upstream approval returns its gate; a current upstream with an outdated downstream source returns the downstream authoring command for reconciliation.

For `slice <id>`, use the living `progress.md` beside the plan. Verify the whole approval chain and the record's plan hash. Identify the required decision by ID and bind its evidence to an exact code revision or captured measurement a fresh session can reach. A mutable file or PR URL alone cannot identify what was approved.

**Complete when:** the artifact, its content hash or slice evidence, and a current upstream source are known.

## 2. Run the self-check

Evaluate the stage's exit criteria as a table of criterion, pass or fail, and evidence from the artifact. A **carried item** is an upstream approval condition, open question, or area of concern that is not yet decided; it carries an owner and a `decide by` stage or slice.

| Stage | Exit criteria |
| --- | --- |
| intent | Every section answered or "none"; no solution design or implementation file choices; observable success signal with observation owner and point; every assumption and open question has an owner and a `decide by`; the human reviewed the draft |
| spec | Source is the approved intent; every intent outcome maps to an acceptance criterion; every criterion is observable with a verification method and relevant failure cases; every intent approval condition and open question is settled in the spec or carried; every area of concern due by `spec` is decided, and the rest are carried; no implementation file choices or code; the human responded to the draft |
| plan | Full upstream chain is current; every spec condition, open question, and concern due by `plan` is settled under **Decisions**, and the rest are carried; dependent work cannot start before a required decision; every acceptance criterion has slice and combined-outcome checks; every slice has an implementer and separate verifier; risks, rollback, delivery endpoint, and outcome observation are stated proportionately; no placeholders; the first ready slice is executable from the plan alone; the human responded to the draft |
| slice | Full plan chain and progress binding are current; the decision is one the plan or a carried item requires; the evidence is revision-specific and reachable, or durably captured in `progress.md`; every new condition has an ID, owner, and a `decide by` slice or delivery boundary |

"Owned" alone never passes a decision that is due. A slice designated to investigate and produce a decision can run; dependent build work waits for the answer. "The human responded" means they replied to the draft with corrections or an explicit review; an explicit approval of the presented draft counts, so do not demand a separate correction turn. Invoking the gate alone is not a response.

Title the table **Agent self-check, not approval**. Any fail makes the recommendation *not ready*; the decision still belongs to the human.

**Complete when:** every exit criterion for the stage has a pass or fail with evidence.

## 3. Ask for the decision

Show the human the artifact path, the content hash or slice evidence, and the self-check. For a plan, list each entry under **Decisions** by ID, so the approval names what it covers; the human excludes an entry by approving with a condition on it.

When a valid decision is not already available, end with ready-to-send lines the human can copy, filled with the stage and, when known, their name:

```text
approved — <name> (<role>)
approved-with-conditions — <name> (<role>) — <conditions>
rejected — <name> (<role>) — <reasons>
waived — <name> (<role>) — <reason>
```

Accept an explicit human decision bound to the presented revision: `approved`, `approved-with-conditions` with the conditions, `rejected` with the reasons, or `waived` with the checkpoint scope and reason. Require the human's stated name and role, or the work item's explicit **sole approver** declaration at the intent gate. The decision may already exist in the current conversation; reuse it when revision, scope, and identity are unambiguous. A sole approver supplies identity, never approval by default.

For each condition, record an ID, owner, and deadline before allowing dependent work. A waiver retains the minimum upstream contract and replacement evidence described in the approval reference. It does not waive project policy or authorize an external action.

Treat anything else, including silence, "looks good so far", or a name taken from git config, as no decision: stop without recording.

**Complete when:** the human has stated an explicit decision and a name, or the gate has stopped undecided.

## 4. Record the decision

Immediately before writing, recompute the reviewed hash (or recheck the slice evidence revision). If it differs from what the human saw, present the change and obtain a decision for that revision. Otherwise append a row to the artifact's final `## Approvals` table, creating the table when absent:

```markdown
## Approvals

| Stage | Decision | Approver | Date | Reviewed revision | Conditions / reasons |
| --- | --- | --- | --- | --- | --- |
| spec | approved | Jane Doe (product owner) | 2026-09-26 | 89e7a515a1b652322c5711b5f96f42756299f4fa | — |
```

Record the full hash exactly as the command prints it. Set the frontmatter `status` to `approved` for `approved`, `approved-with-conditions`, and `waived`, and to `rejected` for `rejected`. When a new artifact replaces this one, mark the old one `superseded`. Leave every other line untouched, so the content hash stays equal to the reviewed revision. Any later edit to the body makes the approval stale, and the stage must pass the gate again.

For a slice, append a row to the **Decisions** table in `progress.md` with the decision ID, slice, human decision, approver, date, plan hash, evidence revision, and conditions. Add each new condition to **Carried items** with its ID, owner, and `decide by`. Preserve failed self-checks and any explicitly accepted exception; approval never rewrites a failed check as passing.

Commit the record within the user's explicit commit authorization, including authorization already given. The commit message names the stage or slice, the decision, the approver, and the reviewed hash or evidence. The Approvals or Decisions row records the human's decision; git authorship shows only who ran the commit. This advisory workflow does not authenticate identities or install enforcement hooks.

**Complete when:** the row is saved, and for a stage the status is set and the recomputed content hash equals the recorded reviewed revision.

## 5. Name the next stage

After approval, return the next command: `/adlc-spec` after intent, `/adlc-plan` after spec, and `/adlc-flow` after plan or a slice for the delivery handoff. After a stage's rejection, return that stage's command with the reasons; after a slice's rejection, return the reasons and `/adlc-flow`. Stop.

**Complete when:** the decision and the one next command are visible.
