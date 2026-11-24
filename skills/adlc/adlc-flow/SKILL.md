---
name: adlc-flow
description: Route a piece of work through the agentic development lifecycle.
disable-model-invocation: true
---

# ADLC Flow

Find where one piece of work actually stands in the agentic development lifecycle and name the single next command or delivery handoff. The router is read-only: it drafts nothing and approves nothing.

The lifecycle is a chain of durable artifacts, each read by the next stage and each passed through a human **gate**. Commit them within the user's existing authorization:

```text
/adlc-intent -> /adlc-gate intent -> /adlc-spec -> /adlc-gate spec
  -> /adlc-plan -> /adlc-gate plan -> engineering delivery
```

During delivery, the living `progress.md` beside the plan records slice state, evidence, decisions, and carried items; `/adlc-gate slice <id>` records the sign-offs delivery needs.

## 1. Locate the artifacts

Read the repository instructions, then find the work item's artifacts. Prefer an existing spec, plan, or tracker convention; the ADLC fallback is `docs/adlc/<slug>/{intent,spec,plan}.md`. When several work items exist and the user named none, list them with their stages and ask which one.

Read [the approval contract](../adlc-gate/references/APPROVALS.md) and verify the full intent → spec → plan chain with [verify-chain.mjs](../adlc-gate/scripts/verify-chain.mjs) (or manually per the contract if Node is unavailable). Status, latest decision, current content, and upstream source must all agree. Treat stale or missing approval evidence as unresolved; never change files while routing.

When delivery has started, read [the progress contract](../adlc-plan/references/PROGRESS.md). Compare its recorded plan hash, per-slice code revisions, review/test receipts, carried items, and delivery endpoint with the actual branch, PR, and CI. Reconstruct the highest state whose prerequisites all have current evidence, rather than decrementing an unsupported label by one. A relevant code or test change invalidates affected review and verification; unavailable evidence is unknown, not a pass.

**Complete when:** every artifact for the work item has a known status, verified against its content hash, and every slice has a state backed by evidence.

## 2. Choose the next stage

Take the first unresolved row:

| Evidenced state | Next |
| --- | --- |
| No intent, or only a fuzzy idea | `/adlc-intent` |
| Superseded artifact | Follow its `superseded_by` path; if absent or ambiguous, request that path |
| Intent is `rejected` | `/adlc-intent` to revise with the rejection reasons |
| Intent is `draft` or stale | `/adlc-gate intent` |
| Intent approved, no spec | `/adlc-spec` |
| Intent current, spec source names an older intent | `/adlc-spec` to reconcile, then its gate |
| Spec is `rejected` | `/adlc-spec` to revise with the rejection reasons |
| Spec is `draft` or stale | `/adlc-gate spec` |
| Spec approved, no plan | `/adlc-plan` |
| Spec current, plan source names an older spec | `/adlc-plan` to reconcile, then its gate |
| Plan is `rejected` | `/adlc-plan` to revise with the rejection reasons |
| Plan is `draft` or stale | `/adlc-gate plan` |
| Plan approved, progress missing or bound to an older plan | `/adlc-plan` to reconcile the progress record without editing the approved plan |
| A human decision or required sign-off blocks the selected slice | `/adlc-gate slice <id>`; name the decision ID |
| Selected slice is `implemented` | `code-review`; add `security-review` when the spec's constraints or risk call for it |
| Selected slice is `reviewed` | `verification-before-completion` |
| An actionable slice is `in-progress` or `ready` (including remaining slices in a shared PR group) | `implement`, or `orchestrate` for independent slices |
| All remaining slices are `blocked` by a dependency, failed check, or unavailable environment | Route the prerequisite to `implement` or `diagnosing-bugs`, or report the named external blocker |
| Every slice in the current PR/delivery group is `verified`, combined acceptance lacks evidence (when shipping together) | `verification-before-completion` for the combined outcome |
| The delivery unit's slices are `verified` (and combined-checked for the final group), endpoint not yet reached | `ship-it` for the declared PR, merge, or deployment endpoint within existing authorization |
| Delivered diff (against the plan's baseline/merge-base, excluding unrelated pre-existing dirty files) contains changes no slice covers | Name the unapproved scope and route to `/adlc-plan` or a new `/adlc-intent` |
| Every slice `done`, and an incident or new need appears | A new `/adlc-intent` |
| Combined acceptance and declared endpoint evidenced | Report completion at that endpoint; name any pending outcome observation |

Evaluate the artifact chain first, then select a slice from the dependency frontier (prefer an actionable `in-progress`/`implemented`/`reviewed` slice over starting a new `ready` one; skip a `blocked` slice while another slice is actionable). For a single-PR delivery shape, build and verify all slices in the PR group before routing to `ship-it`. On an incident or changed user outcome, route to a new intent before reporting completion; never silently expand the approved work.

**Complete when:** one row is selected from evidence rather than from labels or memory.

## 3. Hand off

For an `/adlc-*` stage, return the command with the evidence for the state and stop; only the user invokes it. For delivery, hand off within existing action and delegation authorization, passing the approved plan path and hash, selected slice and AC IDs, `progress.md`, applicable conditions, current revision, and declared endpoint. Return to `/adlc-flow` after each slice changes state. A review request or plan approval alone does not authorize implementation, delegation, merge, or deployment.

**Complete when:** the user sees the current state, its evidence, and exactly one next command or authorized handoff.
