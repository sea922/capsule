# Debugging Skills: Last 30 Days

**Research date:** 2026-09-26
**Window:** 2026-08-27 through 2026-09-26
**Question:** What recent evidence should inform debugging skills for AI coding agents in this repository?

## Method and limits

I read [the preferred repository list](../source-repos.md) before researching, compared the current [local diagnosing-bugs skill](../../skills/engineering/diagnosing-bugs/SKILL.md) with its [August research baseline](diagnosing-bugs-skill-research.md), and ran `last30days` v3.25.0 twice with explicit query plans. The [broad raw result](last30days-debugging-skills/ai-coding-agent-debugging-skills-raw-v3.md) returned 30 ranked items; the [focused raw result](last30days-debugging-skills/systematic-debugging-skills-for-coding-agents-raw-v3.md) returned 24. Both runs ranked many off-topic items. The focused top clusters were unrelated uses of “systematic,” so their counts are **not** evidence of a debugging-skill trend. X and YouTube were unavailable. The dated community material below is a small qualitative sample, not a prevalence estimate.

I then checked source skill files, a maintainer issue, and recent community discussions directly. Current upstream skill design is useful reference material but is not itself evidence that a change happened within this 30-day window.

## Findings

1. **Keep the evidence-first core.** The current local skill already records the exact symptom, reproduces or bounds it, tracks competing hypotheses, runs discriminating checks, and reserves “root cause confirmed” for a causal explanation that predicts another observation. This agrees with [Obra's systematic-debugging](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md), [Matt Pocock's diagnosing-bugs](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md), and [EveryInc's ce-debug](https://github.com/EveryInc/compound-engineering-plugin/blob/main/docs/skills/ce-debug.md). No source established a need for a new, separate generic debugging skill here.

2. **Activation and task size are the clearest design pressure.** Matt Pocock's [current skill documentation](https://github.com/mattpocock/skills/blob/main/docs/engineering/diagnosing-bugs.md) acknowledges reports that a formal diagnostic process fires on simple questions; the underlying [issue #578](https://github.com/mattpocock/skills/issues/578) opened on 2026-07-15, so it is context outside this window. EveryInc's `ce-debug` has a trivial-bug fast path and a diagnosis-only outcome. A [2026-09-21 Claude Code workflow discussion](https://www.reddit.com/r/ClaudeCode/comments/1wmax2u/whats_your_actual_claude_code_workflow_by_task/) distinguishes task sizes and uses systematic debugging when work actually goes wrong. **Inference:** Evaluate the local skill's trigger precision and response cost before broadening its description or adding steps. A request for a quick explanation should not automatically imply full reproduction work.

3. **Do not substitute a fixed reasoning quota for proof.** A [2026-09-15 discussion](https://www.reddit.com/r/claudeskills/comments/1wh629h/claude_skill_for_debugging_mistakes/) proposed a minimum of ten consecutive “whys.” A commenter reported that forced depth led the agent to invent plausible causes after the evidence ran out. This is one anecdote, but it supports the local skill's observable hypothesis and experiment gates over a mandatory count of causal questions.

4. **Separate diagnosis from remediation and verification.** The local skill's read-only diagnosis default and handoff to `implement`, `tdd`, and `verification-before-completion` make its authority boundary explicit. [Addy Osmani's debugging-and-error-recovery](https://github.com/addyosmani/agent-skills/blob/main/skills/debugging-and-error-recovery/SKILL.md) preserves evidence and handles non-reproduction. [Cursor's reproduce-and-fix workflow](https://github.com/cursor/plugins/blob/main/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md) demands an exact observed symptom and equivalent baseline. [EveryInc's ce-debug](https://github.com/EveryInc/compound-engineering-plugin/blob/main/docs/skills/ce-debug.md) treats diagnosis-only as an outcome. These support keeping the current local boundary.

5. **Specialized aids belong behind the core workflow.** [Wshobson's debugging-strategies](https://github.com/wshobson/agents/blob/main/plugins/developer-essentials/skills/debugging-strategies/SKILL.md) catalogs debuggers, profilers, bisection, and production techniques. [ECC's click-path-audit](https://github.com/affaan-m/ECC/blob/main/skills/click-path-audit/SKILL.md) traces UI state transitions. [Trail of Bits' audit-context-building](https://github.com/trailofbits/skills/blob/main/plugins/audit-context-building/skills/audit-context-building/SKILL.md) records assumptions and call paths before making defect claims. These are targeted references for particular failure shapes; importing their full catalogs into the local core would increase overhead without evidence of a coverage gap.

## Preferred repository influence

The rows follow the owner's order in `docs/source-repos.md`. “Not applicable” means the repository was checked for this question but did not supply a distinct general bug-diagnosis rule.

| Preferred repository | Influence or reason not applied |
| --- | --- |
| [mattpocock/skills](https://github.com/mattpocock/skills) | Exact-symptom feedback loop and a concrete over-triggering report; strongest prompt to test activation. |
| [obra/superpowers](https://github.com/obra/superpowers) | Root-cause investigation and boundary tracing; supports the existing evidence gate. |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Evidence preservation and handling failures that cannot be locally reproduced. |
| [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack) | Exact repeated UI symptom and equivalent environment comparison; useful for UI or issue-driven diagnoses. |
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Its minimal-solution discipline reinforces proportionate effort after the cause is understood; it does not replace causal investigation. |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | Used as the recent-source collection method; the noisy result required direct source checks and a stated confidence limit. |
| [anthropics/skills](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) | Skill trigger evaluations are relevant to the activation concern; no general debugging workflow was adopted from it. |
| [trailofbits/skills](https://github.com/trailofbits/skills) | Context-building before defect judgment is relevant; security-audit depth is outside a generic bug diagnosis. |
| [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin/blob/main/docs/skills/ce-debug.md) | Trivial-case fast path, causal predictions, and diagnosis-only output directly inform possible local refinement. |
| [garrytan/gstack](https://github.com/garrytan/gstack/blob/main/investigate/SKILL.md) | Prior-investigation memory may help recurrent bugs; its persistent learning machinery is optional and needs a demonstrated local need. |
| [affaan-m/ECC](https://github.com/affaan-m/ECC/blob/main/skills/click-path-audit/SKILL.md) | UI click-path audit is a useful specialized follow-up; no generic process change needed. |
| [wshobson/agents](https://github.com/wshobson/agents/blob/main/plugins/developer-essentials/skills/debugging-strategies/SKILL.md) | Broad technique catalog is a reference, not a core workflow to copy. |
| [nahid-sparktales/agent-dispatcher](https://github.com/nahid-sparktales/agent-dispatcher) | Specialist routing and context retrieval are adjacent orchestration concerns; no distinct causal-debugging rule applied. |

## Recommendation for this repository

Keep `diagnosing-bugs` as the single general diagnosis skill. Before editing it, run a small trigger evaluation that contrasts: (a) explicit “diagnose this” and hard intermittent failures; (b) quick explanation requests and already-known causes; (c) diagnose-only versus diagnose-and-fix authority. If false activations or excessive work appear, narrow the trigger text or add a proportional first step. Preserve the current hypothesis ledger and honest terminal states. Do not add a mandatory number of “whys,” a generic tool catalog, or persistent learning based on this scan alone.

## Follow-up edit

The user subsequently authorized an update. The skill now routes quick explanations and known-cause fixes before entering its full diagnostic sequence, and its description narrows automatic invocation to unresolved causes. Two routing scenarios were added to `evals/evals.json`. Repository validation checks their schema and publication links; live model invocation and paired baseline behavior have not been measured, so improved trigger precision remains a hypothesis to test.
