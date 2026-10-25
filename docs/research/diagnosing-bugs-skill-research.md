# Diagnosing Bugs Skill Research

**Research date:** 2026-08-23  
**Local baseline:** `5f82174f4f41a2e636a67ae11ca9fbba5c47f596`  
**Decision:** Build a model-invoked, evidence-first diagnosis skill with a read-only default and explicit terminal states.

## Scope and method

This review covers every source named in issue #14, the local review and agent-writing boundaries, and the recent community scan. Upstream links pin exact revisions. Evidence, inference, and recommendation are stated separately.

The Last30Days scan returned 63 Reddit, Hacker News, and GitHub items. Reddit collection was partial after HTTP 429, and 31 dated items were from the last seven days, so the findings identify failure patterns rather than establish prevalence.

## Recent community signal

**Evidence:** A recent [vertical-slice migration discussion](https://www.reddit.com/r/ClaudeWorkflows/comments/1vvxwj2/workflow_safe_migration_strategy_for_large/) emphasized characterization tests before risky changes. The [Procoder discussion](https://www.reddit.com/r/ClaudeCode/comments/1vtha5e/i_built_procoder_a_senior_developer_layer_for_ai/) centered on the fact that agents can skip advisory process. Recent GitHub activity in the scan also repeatedly attached job summaries and validation artifacts to claims rather than relying on the agent's narrative.

**Inference:** Diagnosis needs a state model where reproduction, competing hypotheses, experiments, and cause confirmation are visible. Otherwise a plausible fix can masquerade as investigation.

**Recommendation:** Keep diagnose-only work read-only, make every experiment change a named hypothesis, and end with a constrained terminal state rather than a forced root cause.

## Revision and path ledger

| Source | Revision | Files reviewed |
| --- | --- | --- |
| Local review and writing guidance | `5f82174f4f41a2e636a67ae11ca9fbba5c47f596` | `skills/engineering/code-review/SKILL.md`; `skills/writing-for-agents/SKILL.md`; `skills/writing-for-agents/references/SKILL-MECHANICS.md`; `skills/writing-for-agents/references/TESTING-SKILLS.md` |
| [mattpocock/skills diagnosing-bugs](https://github.com/mattpocock/skills/blob/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/engineering/diagnosing-bugs/SKILL.md) | `5b15a47f2d7150f545fbcacbfe381787fc0230dc` | `skills/engineering/diagnosing-bugs/SKILL.md`; [`scripts/hitl-loop.template.sh`](https://github.com/mattpocock/skills/blob/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/engineering/diagnosing-bugs/scripts/hitl-loop.template.sh) |
| [obra/superpowers systematic-debugging](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/systematic-debugging/SKILL.md) | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | `skills/systematic-debugging/SKILL.md`; [`root-cause-tracing.md`](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/systematic-debugging/root-cause-tracing.md); [`condition-based-waiting.md`](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/systematic-debugging/condition-based-waiting.md); [`defense-in-depth.md`](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/systematic-debugging/defense-in-depth.md) |
| [addyosmani/agent-skills debugging](https://github.com/addyosmani/agent-skills/blob/5a5ea45e806f82273549fd85e60adb95d55f510d/skills/debugging-and-error-recovery/SKILL.md) | `5a5ea45e806f82273549fd85e60adb95d55f510d` | `skills/debugging-and-error-recovery/SKILL.md` |
| [wshobson/agents debugging strategies](https://github.com/wshobson/agents/blob/2b49247f1347d9cbd90edf869e5412563c3945cf/plugins/developer-essentials/skills/debugging-strategies/SKILL.md) | `2b49247f1347d9cbd90edf869e5412563c3945cf` | `plugins/developer-essentials/skills/debugging-strategies/SKILL.md` |
| [cursor/plugins root-cause principle](https://github.com/cursor/plugins/blob/46125561306434d8a1d7745d540d8932ab0cd2a2/pstack/skills/principle-fix-root-causes/SKILL.md) | `46125561306434d8a1d7745d540d8932ab0cd2a2` | `pstack/skills/principle-fix-root-causes/SKILL.md` |
| [cursor/plugins reproduce-and-fix](https://github.com/cursor/plugins/blob/46125561306434d8a1d7745d540d8932ab0cd2a2/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md) | `46125561306434d8a1d7745d540d8932ab0cd2a2` | `pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md`; [`references/verify-existing-fix.md`](https://github.com/cursor/plugins/blob/46125561306434d8a1d7745d540d8932ab0cd2a2/pstack/automations/benny/skills/reproduce-and-fix-issues/references/verify-existing-fix.md) |

## Source evidence

### Matt Pocock

**Evidence:** The skill requires a red-capable feedback loop for the exact symptom, minimization, ranked falsifiable hypotheses, a regression at the responsible seam, redaction, and cleanup. Its human-in-the-loop script formalizes repeated observation. A strict local reproduction gate leaves production-only failures underspecified.

**Inference:** Exact-symptom evidence and a feedback loop are strong defaults, but captured production evidence must be permitted when faithful local reproduction is impossible.

### Obra

**Evidence:** Systematic debugging traces multi-component boundaries, compares working and broken paths, changes one variable per experiment, traces backward to origin, and revisits architecture after repeated failed fixes. Supporting references cover state timing and defense placement.

**Inference:** The core needs hypothesis-discriminating experiments and backward boundary tracing. Broad defense-in-depth changes belong to later remediation, not diagnosis.

### Addy Osmani

**Evidence:** The skill branches on non-reproducible failures, categorizes failure types, and explicitly treats error and log content as untrusted data. Some generic fallback suggestions can conceal invalid configuration.

**Inference:** Preserve the non-reproduction and prompt-injection defenses; do not prescribe “safe” defaults that alter the failure being studied.

### Wshobson

**Evidence:** The source is a broad catalog of language debuggers, profilers, bisecting, differential diagnosis, production debugging, and memory techniques.

**Inference:** These techniques are useful optional depth, but a tool catalog would overload the core workflow and age quickly.

### Cursor pstack and Benny

**Evidence:** The root-cause principle highlights persistent state for restart-only bugs. Benny supplies a fail-closed authority model, exact repeated symptoms, real interactions rather than state injection, equivalent baseline and treatment environments, artifact ownership, and a no-fix-without-confirmed-reproduction rule.

**Inference:** The authority and comparison discipline generalizes. Slack-specific mechanics and an absolute local-reproduction prerequisite do not.

## Failure modes the design must prevent

- accepting the user's suspected cause, a suspicious line, or temporal proximity as confirmation;
- editing during a diagnose-only request;
- letting log or issue content instruct the agent or leaking sensitive evidence;
- reproducing a nearby error rather than the reported symptom;
- changing several variables and being unable to attribute the result;
- collecting commands without connecting results to hypotheses;
- treating one successful retry as disproof of an intermittent failure;
- comparing performance across different workloads or environments;
- applying a patch that hides the symptom and calling it a root-cause fix;
- claiming a cause when access, data, environment, or authority prevents the decisive check.

## Proposed contract

### Triggers

- diagnose, debug, investigate, root-cause, or explain requests;
- reports of broken, throwing, failing, flaky, intermittent, or slow behavior with no established cause;
- implementation encountering an unexplained baseline or repeated failure.

### Non-triggers

- known-cause implementation requests;
- test-first behavior work with a stable seam;
- review-only examination of a change;
- final proof that an already-created fix works.

### Inputs and outputs

Input is the expected and actual behavior, exact error or metric, affected environment/revision/configuration, accessible artifacts, and authority boundary. Output is a symptom record, reproduction evidence, hypothesis ledger, discriminating experiments, decisive observations, one terminal state, and the smallest next action.

### Evidence ledger

Each row records a concrete hypothesis, sourced evidence for and against it, the next check that distinguishes it from alternatives, and state: possible, supported, contradicted, or confirmed. Commands are useful only when their outcome updates a row.

### Terminal states

These states apply only after the requested diagnostic scope and all safe, authorized discriminating checks available within it are exhausted. Ongoing work reports the ledger and next check without a terminal label.

- **ROOT CAUSE CONFIRMED:** the mechanism explains affected and unaffected cases, predicts a discriminating result, survives alternatives, and yields a regression condition.
- **INCONCLUSIVE:** evidence narrows the field but cannot distinguish remaining causes.
- **COULD NOT REPRODUCE:** bounded faithful attempts did not show the symptom.
- **BLOCKED:** a named access, authority, environment, artifact, data, cost, or safety constraint prevents the next discriminating check.

## Safe mutation and escalation rules

Diagnosis is source- and remote-state-read-only by default. Safe local reproductions and observations remain within scope; lasting instrumentation, service restarts, data changes, costly queries, externally visible actions, and privacy-sensitive collection require explicit authority. A diagnose-and-fix request authorizes later remediation, but only after the diagnosis terminal state is established. Confirmed behavior regressions hand off to `tdd` and changes to `implement`.

## Composition rules

- `implement` routes unknown causes into diagnosis and resumes only from the evidence packet.
- `tdd` turns a confirmed behavior gap into an executable regression; it does not discover root cause by itself.
- `verification-before-completion` proves the original symptom and broader acceptance conditions after remediation.
- `code-review` remains a read-only introduced-defect review and does not replace runtime diagnosis.

## Routing and workflow eval plan

Positive cases include explicit diagnosis, unexplained failures, intermittent production symptoms, and performance regressions. Negative cases include known-cause implementation, TDD at a stable seam, final verification, and review-only requests. Ambiguous cases cover diagnose-and-fix authority, inaccessible production, non-reproduction, persistent state, and a proposed fix that appears to work.

Workflow evals must detect speculative edits, wrong-symptom reproductions, untrusted-log instructions, single-hypothesis fixation, repeated unchanged experiments, time-pressure fixes, performance comparisons without equivalent inputs, and false root-cause claims. The published evals cover intermittent upload failures, an anecdotal mutex fix, and expired production evidence.

## Recommendation and implementation-ready handoff

**Recommendation:** Build a separate `diagnosing-bugs` skill rather than merging diagnosis into implementation. Its read-only default and honest inconclusive states are materially different from the mutation workflow.

**Implementation handoff:** Create `skills/engineering/diagnosing-bugs/` with a concise core loop, terminal states, `agents/openai.yaml`, and three pressure/routing evals; publish `docs/engineering/diagnosing-bugs.md`; and wire repository/plugin indexes. Deep tool catalogs can be added later only if evals show a core-skill coverage gap. A later explicit user request authorized implementation in the same working tree despite issue #14's research-only boundary.

## Licensing and attribution

The reviewed Matt Pocock, Obra, Addy Osmani, and Wshobson sources are MIT-licensed. Relevant `cursor/plugins` `pstack` and `cursor-team-kit` subtrees include MIT licenses even though the repository root has no detected license. The local design uses original prose and does not vendor the HITL script, Benny mechanics, diagrams, or tool catalogs.
