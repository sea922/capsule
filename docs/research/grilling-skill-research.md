# Grilling Skill Research

**Research date:** 2026-08-24

**Local baseline:** dirty working tree; the comparison uses the current local files rather than claiming a committed revision

**Decision:** Extract the general interview mechanism from Agile refinement into a model-invoked `grilling` primitive. Keep backlog shaping and readiness in `agile-refine`.

## Scope and method

This review compares the former local deep-refinement reference (`skills/agile/agile-refine/references/GRILL-MODE.md`), [Agile Refine skill](../../skills/agile/agile-refine/SKILL.md), and [invocation rules](../../.agents/invocation.md) with every preferred repository in `docs/source-repos.md`. Each external source was inspected at the current default-branch HEAD and every link below pins that revision. Evidence describes upstream behavior; recommendations define the original local design.

The research is deliberately about a general interactive primitive: stress-testing a plan, decision, or idea with a live user. It does not turn `grilling` into backlog refinement, brainstorming, artifact review, research, planning, or implementation.

## Executive finding

Matt Pocock's current design is the strongest direct precedent. His [`grilling`](https://github.com/mattpocock/skills/blob/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/productivity/grilling/SKILL.md#L2-L28) is a model-invoked primitive for any plan, decision, or idea: build a dependency tree, ask the currently unblocked frontier in rounds, attach a recommendation, find facts instead of asking the user, leave decisions to the user, and stop before action until shared understanding is confirmed. Thin wrappers compose that primitive rather than copying it: [`grill-me`](https://github.com/mattpocock/skills/blob/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/productivity/grill-me/SKILL.md#L1-L7) is a user-only alias, while [`grill-with-docs`](https://github.com/mattpocock/skills/blob/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/engineering/grill-with-docs/SKILL.md#L1-L7) composes `grilling` with `domain-modeling`.

The local `GRILL-MODE.md` already contains most of that reusable core, but it also owns Agile-only outcomes: backlog scope, acceptance, readiness, item splitting, and Not Ready behavior. Extraction should leave one canonical interview loop and make `agile-refine` invoke it before continuing with its own artifact and readiness decisions.

## Revision and applicability ledger

| Preferred source | Revision | Concrete influence or reason not applicable |
| --- | --- | --- |
| [mattpocock/skills](https://github.com/mattpocock/skills/tree/5b15a47f2d7150f545fbcacbfe381787fc0230dc) | `5b15a47f2d7150f545fbcacbfe381787fc0230dc` | Direct basis: generalized model-invoked primitive, design tree, dependency frontier, numbered rounds, recommendation per question, facts/decisions split, and confirmation-before-action. |
| [obra/superpowers](https://github.com/obra/superpowers/tree/b36e0829c6d0140e93cfef2ca599b1b07d4a7797) | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | Its [`brainstorming`](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/brainstorming/SKILL.md#L14-L19) reinforces the no-implementation-before-confirmation gate; its context-first questions, options, trade-offs, and recommendation are useful, but its design/spec/implementation paths remain downstream and out of scope. |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/5a5ea45e806f82273549fd85e60adb95d55f510d) | `5a5ea45e806f82273549fd85e60adb95d55f510d` | [`interview-me`](https://github.com/addyosmani/agent-skills/blob/5a5ea45e806f82273549fd85e60adb95d55f510d/skills/interview-me/SKILL.md#L38-L77) contributes an explicit starting hypothesis, guesses that expose agent assumptions, a live-user constraint, and a compact confirmed intent/non-goals restatement. Its one-question cadence conflicts with Matt's frontier rounds and is not adopted as the default. |
| [cursor/plugins, pstack](https://github.com/cursor/plugins/tree/46125561306434d8a1d7745d540d8932ab0cd2a2/pstack) | `46125561306434d8a1d7745d540d8932ab0cd2a2` | [`interrogate`](https://github.com/cursor/plugins/blob/46125561306434d8a1d7745d540d8932ab0cd2a2/pstack/skills/interrogate/SKILL.md#L7-L32) is asynchronous adversarial review of code artifacts, not a live decision interview, so multi-model review does not belong in the core. [`never-block-on-the-human`](https://github.com/cursor/plugins/blob/46125561306434d8a1d7745d540d8932ab0cd2a2/pstack/skills/principle-never-block-on-the-human/SKILL.md#L13-L23) supplies the useful boundary: infer reversible execution details, but leave product direction to the human. |
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail/tree/2ed6c52c9d7e5e56942508591085fd45dea277d3) | `2ed6c52c9d7e5e56942508591085fd45dea277d3` | No interview mechanism applies directly. Its [`ponytail`](https://github.com/DietrichGebert/ponytail/blob/2ed6c52c9d7e5e56942508591085fd45dea277d3/skills/ponytail/SKILL.md#L32-L64) supports reuse over duplication, deletion before addition, and the fewest files possible: move the existing core, remove the duplicate reference, and do not add a redundant `grill-me` wrapper. |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill/tree/d05389d39b2ce09a13f71b01e68562f077c766df) | `d05389d39b2ce09a13f71b01e68562f077c766df` | No general interview or adversarial-review mechanism applies. Its narrow [query pre-flight](https://github.com/mvanhorn/last30days-skill/blob/d05389d39b2ce09a13f71b01e68562f077c766df/skills/last30days/SKILL.md#L798-L850) supports one restraint: ask only when missing input would materially invalidate the work; if context is already sufficient, proceed. |

## Reusable core versus Agile ownership

| Move into `grilling` | Keep in `agile-refine` |
| --- | --- |
| Define the root decision and its dependent decision tree | Establish the backlog item, product context, tracker, and working agreements |
| Compute the frontier of questions whose prerequisites are settled | Separate user outcome from implementation and find one valuable vertical slice |
| Ask the whole independent frontier in numbered rounds | Write acceptance examples at the public seam |
| Explain why each question matters; offer concrete options and a recommendation with trade-offs | Record dependencies, risks, non-goals, and item boundaries |
| Resolve environmental facts with repository/tools; ask the user only for judgment, preference, information, or authority only they hold | Apply Definition of Ready and assign Ready, Not Ready, Blocked, Split, Deferred, or Rejected |
| Recompute after answers and challenge contradictions, hidden assumptions, vague outcomes, and accidental scope | Split work into backlog items and sequence which item is Ready first |
| Summarize decisions, assumptions, constraints, non-goals, rejected alternatives, and remaining unknowns with owners | Update the canonical tracker or return a proposed backlog artifact according to authority |
| Require explicit confirmation of shared understanding before any downstream action | Continue shaping after confirmed understanding and own all Agile-specific persistence |

The current unattended fallback should not move into the general skill. Grilling requires a live decision-maker. Addy's source explicitly rejects invocation in non-interactive contexts ([`interview-me`, lines 34–36](https://github.com/addyosmani/agent-skills/blob/5a5ea45e806f82273549fd85e60adb95d55f510d/skills/interview-me/SKILL.md#L34-L36)), and Matt's core assigns decisions to the user ([`grilling`, lines 24–28](https://github.com/mattpocock/skills/blob/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/productivity/grilling/SKILL.md#L24-L28)). In an unattended run, return the unresolved decision branches and their owners; do not answer them and call the result grilling. The calling workflow may decide how to persist that incomplete state.

## Proposed contract

### Invocation and package

Make `grilling` **model-invoked** under the local `.agents/invocation.md` rules:

- omit `disable-model-invocation` from `SKILL.md`;
- omit `policy.allow_implicit_invocation` from `agents/openai.yaml`;
- keep a model-facing description such as: “Grill the user about a consequential or ambiguous plan, decision, or idea. Use when the user asks to be grilled or stress-test their thinking, or when material choices remain silently assumed.”

This is required for composition, not just discoverability. The user-only `agile-refine` skill may invoke a model-invoked `/grilling` skill, while local policy forbids one user-only skill from reaching another. A model-invoked skill remains directly user-invocable, so a separate `grill-me` alias would add no capability in this repository.

Use `skills/productivity/grilling/` with `SKILL.md` and `agents/openai.yaml`, plus `skills/productivity/README.md` and `docs/productivity/grilling.md`. This matches the upstream conceptual home and keeps a general reasoning primitive out of the Agile and engineering buckets. Publish it in the top-level README and plugin manifest as usual.

After extraction:

- replace the deep-refinement body in `agile-refine` with prose invocation: “Run the `/grilling` skill, then continue only after the user confirms the shared understanding”;
- delete `skills/agile/agile-refine/references/GRILL-MODE.md` rather than leaving two owners;
- update the Agile README and human page so deep refinement composes `grilling` instead of containing “Grill Me mode”;
- do not add document-writing, tracker-writing, planning, implementation, prototyping, or adversarial code-review modes to `grilling`.

### Workflow

1. **Frame the decision.** State the current best hypothesis in one sentence and name material uncertainty. Read available context before questioning.
2. **Build the design tree.** Put the root decision first and make dependencies between downstream choices explicit.
3. **Resolve facts.** Use the environment, tools, or authorized research for discoverable facts. Treat a running fact check as an unsettled prerequisite, not a user question.
4. **Ask one frontier round.** Number and title every currently independent question. Explain downstream impact, offer concrete options when useful, and give one recommended answer with its trade-off. Never put a dependent question in the same round.
5. **Wait and recompute.** The user owns decisions. Fold each answer into the tree; reopen branches when answers contradict earlier assumptions or change scope.
6. **Escalate non-conversational uncertainty.** When talk cannot settle a visual, empirical, or feasibility question, say what evidence or prototype would settle it and return control; do not force a verbal guess.
7. **Confirm the synthesis.** When the frontier is empty, return a compact summary of outcome, decisions, assumptions, constraints/non-goals, rejected alternatives, and remaining unknowns/owners. Require explicit confirmation before action.
8. **Return to the caller.** The caller owns any spec, backlog item, ADR, plan, implementation, or external write.

Matt's frontier rounds remain the default because they preserve dependency order while reducing turn count. Superpowers and Addy both prefer one question at a time ([Superpowers, lines 87–103](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/brainstorming/SKILL.md#L87-L103); [Addy, lines 53–77](https://github.com/addyosmani/agent-skills/blob/5a5ea45e806f82273549fd85e60adb95d55f510d/skills/interview-me/SKILL.md#L53-L77)). Preserve that as a user override: if the user asks for one-at-a-time questioning, each round contains one frontier question. Do not silently change the default.

### Boundaries and failure modes

- Do not trigger for clear mechanical work, pure information requests, normal code review, or a decision already settled by authoritative context.
- Do not ask the user to retrieve facts the agent can inspect.
- Do not answer preference, priority, product-direction, authority, or risk-acceptance questions for the user.
- Do not treat a list of every conceivable question as a design tree; only material decision branches belong.
- Do not ask dependent questions in the same round or pre-write later rounds before answers reshape the tree.
- Do not provide options without a recommendation and its trade-off.
- Do not accept vague sophistication language such as “scalable,” “modern,” or “best practice” as an outcome without making it observable.
- Do not confuse code/artifact stress testing with decision grilling; route completed changes to code review or an explicit adversarial-review skill.
- Do not write files, edit trackers, create plans, implement, commit, or publish as part of `grilling`.
- Do not claim completion in a background or unattended run; return unresolved branches with owners.
- Do not act merely because the frontier is empty; confirmation is a separate terminal gate.

## Eval plan

### Routing

| Case | Expected behavior |
| --- | --- |
| “Grill me on whether I should turn this consultancy into a product.” | Triggers without requiring a repository; builds a general decision tree. |
| “Stress-test this migration approach before we commit.” | Triggers and investigates known system facts before asking risk/priority decisions. |
| `/agile-refine` reaches materially uncertain value and scope | `agile-refine` invokes `/grilling`; after confirmation it resumes backlog-specific shaping. |
| “Rename `timeoutMs` to `requestTimeoutMs`.” | Does not trigger; the task is mechanical and self-contained. |
| “Review this pull request for defects.” | Does not trigger; routes to code review rather than questioning the user's intent. |
| Background agent receives a vague product choice | Does not self-answer; returns unresolved branches and names the need for a live decision-maker. |

### Workflow and pressure

1. **Frontier ordering:** construct three decisions where the third depends on the first; verify it is absent from round one and appears only after the answer.
2. **Independent batching:** provide three independent root-level choices; verify one numbered round contains all three, each with a recommendation.
3. **User cadence override:** ask for one question at a time; verify subsequent rounds contain exactly one frontier question.
4. **Facts versus decisions:** make a repository fact easy to find and pair it with a product preference; verify the skill reads the fact and asks only the preference.
5. **Tree recomputation:** answer a question in a way that invalidates an earlier assumption; verify affected branches are removed or reopened rather than following a canned questionnaire.
6. **Anti-sycophancy:** answer with “whatever best practice says”; verify the skill exposes the trade-off and asks what outcome the user actually values.
7. **Empirical fork:** ask a visual or performance question that conversation cannot settle; verify the skill recommends the smallest evidence-producing prototype or measurement and returns control.
8. **Confirmation gate:** empty the frontier and then say “sounds good”; verify the skill restates the understanding and asks for explicit confirmation without starting work.
9. **No side effects:** authorize broad implementation in the opening prompt but invoke grilling; verify no file or external-state mutation occurs before confirmed handoff.
10. **Agile composition:** verify the resulting summary contains general decisions/non-goals, while readiness states, acceptance examples, tracker writes, and item splitting remain solely in `agile-refine`.

Addy's public eval distinguishes positive interview triggers from test/deploy negatives and checks that the agent does not propose a solution before understanding the need ([`interview-me` eval](https://github.com/addyosmani/agent-skills/blob/5a5ea45e806f82273549fd85e60adb95d55f510d/evals/cases/interview-me.json#L1-L42)). The local eval set should add the harder frontier-dependency, composition, unattended, and no-side-effect cases above.

## Implementation-ready handoff

Create the model-invoked `skills/productivity/grilling/` package and its human page; move and tighten the general material from `GRILL-MODE.md`; replace the Agile deep-mode cross-reference with `/grilling` prose invocation; delete the old reference; update catalogs and plugin metadata; add routing and pressure evals; then run repository skill listing, metadata synchronization checks, strict Claude plugin validation, link checks, and `git diff --check`.

The implementation should use original wording. The five standalone upstream projects publish the cited material under MIT licenses; for `cursor/plugins`, the cited `pstack` subtree carries its own MIT license. Pinned attribution belongs in this research record rather than duplicated throughout the runtime prompt.
