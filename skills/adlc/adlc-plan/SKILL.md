---
name: adlc-plan
description: Plan covered, assigned slices from an approved spec.md.
disable-model-invocation: true
---

# ADLC Plan

Turn an approved spec into a plan that an engineer or agent who never saw the conversation could execute alone. Slicing belongs to `planning-and-task-breakdown`; this stage adds acceptance coverage, assignment, risk, and the delivery handoff.

## 1. Check the precondition

Read the spec beside this work item (`docs/adlc/<slug>/spec.md` or the project's convention). Read [the approval contract](../adlc-gate/references/APPROVALS.md), run its hash helper, and verify intent → spec, including both approvals and the source link. Return the earliest unresolved gate or authoring stage when it fails; an unchanged spec can still be based on superseded intent.

When the plan is already approved and current but `progress.md` is missing or bound to an older plan, reconcile only `progress.md` using [references/PROGRESS.md](references/PROGRESS.md). Preserve prior evidence and decisions, bind the current approved plan hash, and reassess changed slices and conditions rather than resetting or upgrading them. Leave the plan untouched and return `/adlc-flow`. A plan with an outdated spec source first needs explicit content reconciliation and its own gate.

List the spec's approval conditions and its open questions and areas of concern with `decide by: plan` or a slice; this stage settles or schedules them.

**Complete when:** the spec is approved and current, its path and content hash are recorded as the plan's source, and its conditions and carried items are listed.

## 2. Slice the work

Run `planning-and-task-breakdown` with the approved spec as the contract and the plan artifact as its canonical save path. Its slices, interfaces, dependencies, review focus, ready frontier, and checks become the plan's core.

When planning uncovers a fact that contradicts the approved spec, stop and return `/adlc-spec` with the evidence. The plan carries the spec as settled; it does not quietly change it.

Keep slice IDs stable across plan revisions; note added, changed, and retired slices. Slice headings carry no status: state changes during delivery, and an edit to the approved plan makes it stale. The approved plan's ready frontier is its initial snapshot; current state and frontier live in `progress.md`. These ADLC rules override the composed skill's instruction to refresh status in the plan itself.

**Complete when:** the slices, interfaces, dependencies, review focus, and ready frontier are written by that skill, with no placeholders.

## 3. Add the ADLC sections

Add the sections in [references/PLAN.md](references/PLAN.md):

- **Decisions**: every choice the plan makes that the spec left open (stack, hosting, thresholds, sequencing), each with an ID and its evidence, including every spec condition and item due by `plan` that it settles.
- **Carried items**: every spec item still undecided, with a stable ID, owner, and `decide by` boundary before dependent work. Distinguish an entry prerequisite from a decision the slice is explicitly meant to produce.
- **Coverage**: every acceptance criterion maps to the slices that deliver it and a check capable of disproving it, plus the combined acceptance check across slices. Do not substitute compilation or implementation-authored happy-path checks for the spec's required behavior.
- **Assignment**: who executes each slice (a human, an agent role, or `orchestrate`), and a verifier who is separate from the implementer.
- **Risks and rollback**: what could go wrong, when to stop or roll back, and how each slice is undone. If reversal cannot restore data or an external effect, name the recovery/roll-forward owner and the decision required before proceeding.
- **Handoff**: `implement`, or `orchestrate` when authorized and slices are independent; identify the delivery endpoint (local verification, PR ready, merged, or deployed), existing action authority, combined acceptance evidence, and who observes the intent's success signal and when. Use `ship-it` for remote delivery. Do not add deployment or monitoring to a local-only request.

Write or reconcile `progress.md` beside the plan with [references/PROGRESS.md](references/PROGRESS.md). For new work, every slice starts `ready` or `blocked`; preserve evidenced progress when revising existing work. Record the plan hash as a draft candidate until its gate approves it. Progress is a living record, never itself hashed or gated, but it cannot grant approval to the referenced plan.

**Complete when:** every spec condition and due item is settled under Decisions or carried to a slice, every acceptance criterion is covered, every slice has an implementer and a separate verifier, `progress.md` lists every slice, and a fresh reader could start the first ready slice from the plan alone.

## 4. Hand off to the gate

Rerun that skill's proportion check across the whole plan, ADLC sections included. Show the plan to the human with each entry under Decisions called out, and ask for a reply to each. Apply their corrections. Leave `status: draft`. Return `/adlc-gate plan` with the artifact path and stop.

**Complete when:** the human has replied to the plan and the gate command is visible.
