# ADLC field report: how the suite was used, where it fell short, what to refine

**Date:** 2026-09-28
**Author:** agent, from the session transcript and repository state of the suite's first real use
**Skills repo revision:** `f00c9d7` (plugin cache `backpass` 0.1.0 was the version in use). This file is new and uncommitted.
**Field project:** `D:\Source\cautious-octo-umbrella`, a private family-tree website, work item `docs/adlc/family-tree-website/`.

## Purpose

Joe ran the ADLC suite end to end on a greenfield project on 2026-09-27. This report records how each skill was actually used, where it was ineffective, and candidate refinements. **Nothing here is decided or implemented.** Joe owns every refinement choice.

## Evidence sources

| Source | What it contains |
| --- | --- |
| `~/.claude/projects/D--Source-cautious-octo-umbrella/ae2aed63-8a38-4952-a201-21e11f55c062.jsonl` | The full session: every `/adlc-*` invocation, gate exchanges, the delivery orchestration (times below are UTC from this log) |
| `…/ae2aed63-…/subagents/` | Transcripts of the worker, tester and reviewer subagents |
| `docs/adlc/family-tree-website/{intent,spec,plan}.md` in the field project | The approved artifacts; hashes still match (`e647cc4…`, `e3352ae…`, `72b8df1…`, checked 2026-09-28) |
| Field-project commits `80f59ef` (approvals), `d4c74a7` (S0, PR #1), `79b8f7d` (S2 spike, unmerged branch `spike/s2-tree-render`) | Delivery results |
| Working tree on `feat/s1-invite-access` | S1, verified but uncommitted; the session ended waiting on Joe's commit/PR decision |

Labels: **observed** = seen in the transcript or repo; **inferred** = a reasoned risk not directly seen.

## How the suite was used (timeline)

| Time (UTC) | Skill | What happened |
| --- | --- | --- |
| 14:41 | `/adlc-flow` + one-line idea | Empty repo, no commits. Routed correctly to `/adlc-intent` and listed what intent would need to settle. |
| 14:42–14:44 | `/adlc-intent` | Standard depth, no `/grilling`. Two rounds of multiple-choice questions (8 questions). The draft had 3 assumptions and 4 open questions, all owned by Joe. |
| 14:45–14:46 | `/adlc-gate intent` | Self-check flagged "human corrected the draft: not shown" and a partial success signal. Joe: "Draft is good", which the gate refused as no decision; then "approved — Joe (owner)". |
| 14:47–14:49 | `/adlc-spec` | Two more question rounds (8 questions) resolved all four intent open questions. 24 ACs, 4 areas of concern, 3 open questions. |
| 14:49–14:51 | `/adlc-gate spec` | Self-check partial on AC-015 (no numbers). Joe: "Approved", refused for missing name. Joe then used the agent's suggested wording: `approved-with-conditions — Joe (owner) — plan proposes AC-015 thresholds for sign-off`. |
| 14:52–14:59 | `/adlc-plan` → `planning-and-task-breakdown` | Asked stack, hosting, DB and implementer questions; ran two research subagents; wrote 13 slices (S0–S12), coverage, assignment, risks, and proposed AC-015 thresholds T1–T5. |
| 15:03–15:04 | `/adlc-gate plan` | The agent added an extra criterion, "spec approval condition met". It noted that Joe hadn't commented on the draft, so approving the plan would also approve the stack choices and T1–T5. Joe: "approved — Joe (owner)". |
| 15:05–15:06 | (commit) | Joe typed `! git add … && git commit …` as chat text. It didn't run, and the agent committed it. The agent then found that `core.autocrlf=true` would break the hashes on a fresh checkout and proposed `.gitattributes`. |
| 15:14 | `/adlc-flow` | Verified all three hashes and routed to `orchestrate`. Asked for three confirmations (build, branch per slice, check tools); Joe: "Go". |
| 15:19–16:48 | `orchestrate` (outside ADLC) | S0 and S2 ran in parallel, then S1. Independent tester per slice, plus a security review for S1. Joe signed off the S2 library choice in chat ("family-chart approved"), recorded in the spike's `RESULT.md`. `/adlc-flow` was not used again. |

The ADLC stages took about 25 minutes from idea to approved plan. Delivery of three slices took about 90 minutes.

## What worked (keep)

- **Routing from nothing.** `/adlc-flow` handled an empty repo with no commits correctly, and at handoff it checked the whole approval chain by hash before routing (observed, 14:41 and 15:14).
- **Gates refused non-decisions.** "Draft is good" and a bare "Approved" were both refused and nothing was recorded (observed). The gates did what they were designed to do.
- **Self-checks were honest.** They marked partial or unmet criteria instead of passing everything, and each time recommended "not ready yet" with a concrete fix (observed, all three gates).
- **Content-hash chain.** The `source:` hash links held across all three artifacts, and the agent re-verified them against the committed blobs (observed, 15:05).
- **Plan as delivery contract.** Worker, tester and reviewer prompts cited the approved plan and slice by path. The separate-verifier assignment paid off: the S1 tester broke the code on purpose to prove the tests caught it, and the S1 security review found three hardening issues, which were then fixed (observed, 16:36–16:48).
- **Discovery slice fed back into the plan.** S2 measured the plan's T1–T5 thresholds and overturned the plan's leading library choice (React Flow) with evidence (observed).

## Where it was ineffective

### E1. Plan approval freezes the file that should track progress (observed)

The plan puts status in its slice headings (`### S0: Walking skeleton (status: ready)`). S0, S1 and S2 are now done or verified, but the plan still shows them as `ready` or `blocked`, because editing the body would make the approval stale. After 15:14, progress lived only in chat messages and commit trailers (`Plan: …/plan.md (slice S0)`), a convention the skills never defined. `/adlc-flow` has no artifact it could read to answer "which slices are done".

### E2. Decisions during delivery have no home in ADLC (observed)

The S2 sign-off, which the plan says blocks S5, was made in chat and written as an improvised `## Sign-off` table in `spikes/tree-render/RESULT.md` on a branch that is intentionally never merged. That sign-off also added conditions: placeholder parents stay off, adopted/step link styles are custom-drawn, and the phone check moves to S5. Those conditions now exist only on that branch. The S1 security findings and the choice to stack S1's PR on S0's are also only in chat. Nothing in `docs/adlc/` would tell a fresh session about any of this.

### E3. Conditions are recorded, then never tracked (observed)

The spec approval carried a condition (AC-015 thresholds). The plan-gate agent had to invent a criterion to check it ("spec approval condition met"), because the gate's exit-criteria table has no such row. The plan was then approved with `—`, and the spec's AC-015 still reads "stays responsive". The binding thresholds live only in the plan.

### E4. "Owned" counted as "handled" for open concerns (observed)

The spec's top concern, that Google-only sign-in could shut out older relatives (the main knowledge source), passed the "every area of concern owned" criterion because it was assigned to Joe. It was never decided. The plan also passed with it listed as "one risk stays open", and S1 built Google-only sign-in. The gates check ownership, not whether a decision is due before the next stage.

### E5. Gate approvals bundled decisions the human never looked at (observed)

The plan gate itself said Joe hadn't commented on the draft. Approving it therefore also signed off the stack, hosting, T1–T5, and 13 slices in one word. The intent gate has a "human corrected the draft" criterion; the spec and plan gates don't. Joe also went straight from each draft to the gate without replying to it. Neither the drafting skills nor the gate slow that down.

### E6. Gate decision format cost extra round-trips (observed)

Two of three gates needed a second message because the first reply lacked the name or exact keyword ("Draft is good", "Approved"). The rule is right, but the first prompt didn't give a line Joe could copy and send; the agent only offered one after the refusal. The rule that the name can't be reused from earlier gates adds friction for a single-owner project.

### E7. "Git authorship attests the sign-off" didn't hold (observed)

Every gate told Joe to commit the approval himself. His `!` command arrived as chat text, and the agent ran the commit under Joe's git identity. The commit is authored "Joe", but the agent ran it, so the attestation the gate describes is weaker than it claims.

### E8. The content hash depends on line endings (observed)

With `core.autocrlf=true`, a fresh checkout would change every hash and make all three approvals look stale. The agent caught this only after committing. The fix, `docs/adlc/** text eol=lf`, landed in S0 (`d4c74a7`). No ADLC skill or doc mentions it.

### E9. The router isn't used after handoff (observed)

`/adlc-flow`'s delivery rows ("slices open", "change unreviewed", "change reviewed") were never exercised. Once `orchestrate` took over, the session never returned to the router, and the router couldn't have read slice state anyway (E1). The ADLC flow effectively ends at the plan gate.

### E10. Multiple-choice interviews put words in the human's mouth (inferred)

`adlc-intent` says to record facts "only as the human states them", in their words. In practice all 16 intent and spec answers were picks from agent-written options (e.g. "5+ relatives in 3 months"). This is fast and seemed to work, but the intent reflects the agent's framing. No free-text "why" was captured beyond the option labels.

### E11. Hash command assumes a POSIX shell (inferred)

`sed … | git hash-object --stdin` worked because Git Bash is installed. It would fail in a PowerShell-only setup.

## Candidate refinements (ranked by impact; none decided)

| # | Fixes | Refinement | Trade-off |
| --- | --- | --- | --- |
| R1 | E1, E2, E9 | Add a living `progress.md` beside the plan, never hashed: slice state, evidence links (commit/PR/test), delivery-time decisions, and sign-offs with conditions. `/adlc-flow` reads it for the delivery rows, and `orchestrate`/`implement` append to it | A new artifact the delivery skills must write. Simplest way to keep the contract frozen and the record live |
| R2 | E2 | Let `adlc-gate` record a slice-level decision (e.g. `/adlc-gate slice S2`) into `progress.md`, with the same decision words and approver rule | Widens the gate. Alternatively, `progress.md` gets a sign-off table and the gate's rules are only referenced |
| R3 | E3, E4 | Spec and plan exit criteria: "every upstream condition discharged or carried with an owner and a due stage", and "every area of concern that affects this stage's content is decided, not only owned". Flow routes back while any are overdue | Stricter gates; each concern needs a "decide by" stage |
| R4 | E5 | Add "the human reviewed and responded to the draft" to the spec and plan gates, as intent already has. The plan gate lists each bundled decision (stack, thresholds, …) so approval is explicit per item | A little more gate reading. Stops one word approving many decisions |
| R5 | E6 | Gate step 3 always shows ready-to-send lines (`approved — <name> (<role>)`, …). Consider letting a project declare a single owner so the name can be reused | The name rule protects multi-person teams; make reuse opt-in |
| R6 | E7 | Reword the attestation claim: the agent may commit only on the user's instruction, and the commit message names the approver and hash. Don't imply that git authorship proves a human action | Honest wording; a hook-based signature is the stronger option |
| R7 | E8, E11 | `adlc-intent` step 1 checks for or proposes the `.gitattributes` LF rule when creating `docs/adlc/`. Document a PowerShell equivalent, or ship one cross-platform hash script used in all five places | A script is one more file; doc-only is cheaper but easier to miss |
| R8 | E10 | Interview guidance: multiple choice for scope and constraints, but ask "problem" and "why now" as free text, and quote the human's own words in the intent | Slightly slower intent stage |

## Adjacent findings (not ADLC skills, same run)

These came from `orchestrate` and its agents during ADLC delivery. List them against those skills, not ADLC:

- Workers hit the 30-turn limit on nearly every slice (S0, S2 twice, S1, S1-fix, and the tester at 20), each needing a `SendMessage` resume.
- The S0 worker force-killed every `python.exe` on the machine, which disconnected the Serena MCP server. After that, later worker prompts forbade killing processes by image name.
- The S0 tester reported migrations as "committed" when nothing was committed, and the root agent had to correct it.
- The S2 first-pass measurements were invalid (the drag started on a card, and a debug run overwrote the results). They were caught only because the root agent read the result before asking for sign-off.

## Next step

1. Joe picks which refinements to take. R1–R4 change how ADLC relates to delivery and are worth a `/grilling` session. R5–R8 are small and could go straight to `implement`.
2. Edit `skills/adlc/*` and the matching `docs/adlc/*.md` with `writing-for-agents`. If the hash rule changes, keep the command identical in all five places (`grep -rn "git hash-object" skills/adlc docs/adlc`).
3. Validate against the field project. Recompute the three hashes (they should be unchanged unless the hash rule changes). If R1 is adopted, backfill `progress.md` for S0/S1/S2 and confirm `/adlc-flow` routes to the S1 commit/PR decision and then S3/S11.

Hash check (Git Bash):

```bash
cd /d/Source/cautious-octo-umbrella
for f in intent spec plan; do a=docs/adlc/family-tree-website/$f.md
  sed -e '/^status:/d' -e '/^## Approvals/,$d' $a | git hash-object --stdin; done
```

To re-read the source transcript as condensed text: parse the session JSONL above for `user` text, `assistant` text and `Skill`/`Agent`/`AskUserQuestion` tool calls.

## Scope and authority

This report grants no new actions. Editing the skills repo, committing, releasing the plugin, and changing the field project's approved artifacts each need Joe's authorization. Any body edit to those artifacts makes their approvals stale.
