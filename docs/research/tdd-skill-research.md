# TDD Skill Research

**Research date:** 2026-08-23  
**Local baseline:** `5f82174f4f41a2e636a67ae11ca9fbba5c47f596`  
**Decision:** Build a model-invoked `tdd` discipline skill with explicit red, green, refactor, test-quality, and exception gates.

## Scope and method

This review covers every source named in issue #13, the local testing-skill guidance, and recent community evidence. Each upstream link pins the reviewed revision. Evidence describes what sources contain; inference interprets it; recommendation defines the original local design.

The supporting Last30Days scan found 63 Reddit, Hacker News, and GitHub items, but Reddit was partial after rate limiting and only 31 dated items were from the last seven days. The results indicate live concerns, not measured consensus.

## Recent community signal

**Evidence:** A recent [large-project migration discussion](https://www.reddit.com/r/ClaudeWorkflows/comments/1vvxwj2/workflow_safe_migration_strategy_for_large/) emphasized small vertical slices and characterization tests. A [discussion of agent skill enforcement](https://www.reddit.com/r/ClaudeCode/comments/1vtha5e/i_built_procoder_a_senior_developer_layer_for_ai/) argued that agents can skip advisory steps. [ProofRun](https://github.com/yebiguo/ProofRun) and similar proof receipts reflect demand for command evidence rather than a narrative claim that tests ran.

**Inference:** A useful TDD skill must make red and green observable, catch wrong-red failures, and disclose exceptions. Merely saying “use TDD” is too easy to satisfy ceremonially.

**Recommendation:** Require fresh focused-command evidence at each phase, while keeping an explicit practical-harness escape path that cannot be mistaken for TDD.

## Revision and path ledger

| Source | Revision | Files reviewed |
| --- | --- | --- |
| Local Agile and writing guidance | `5f82174f4f41a2e636a67ae11ca9fbba5c47f596` | `skills/agile/agile-flow/SKILL.md`; `skills/writing-for-agents/SKILL.md`; `skills/writing-for-agents/references/SKILL-MECHANICS.md`; `skills/writing-for-agents/references/TESTING-SKILLS.md` |
| [mattpocock/skills TDD](https://github.com/mattpocock/skills/blob/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/engineering/tdd/SKILL.md) | `5b15a47f2d7150f545fbcacbfe381787fc0230dc` | `skills/engineering/tdd/SKILL.md`; [`tests.md`](https://github.com/mattpocock/skills/blob/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/engineering/tdd/tests.md); [`mocking.md`](https://github.com/mattpocock/skills/blob/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/engineering/tdd/mocking.md) |
| [obra/superpowers TDD](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/test-driven-development/SKILL.md) | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | `skills/test-driven-development/SKILL.md`; [`writing-good-tests.md`](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/test-driven-development/writing-good-tests.md) |
| [addyosmani/agent-skills TDD](https://github.com/addyosmani/agent-skills/blob/5a5ea45e806f82273549fd85e60adb95d55f510d/skills/test-driven-development/SKILL.md) | `5a5ea45e806f82273549fd85e60adb95d55f510d` | `skills/test-driven-development/SKILL.md`; [`references/testing-patterns.md`](https://github.com/addyosmani/agent-skills/blob/5a5ea45e806f82273549fd85e60adb95d55f510d/references/testing-patterns.md); [`evals/cases/test-driven-development.json`](https://github.com/addyosmani/agent-skills/blob/5a5ea45e806f82273549fd85e60adb95d55f510d/evals/cases/test-driven-development.json) |
| [wshobson/agents TDD workflows](https://github.com/wshobson/agents/tree/2b49247f1347d9cbd90edf869e5412563c3945cf/plugins/tdd-workflows) | `2b49247f1347d9cbd90edf869e5412563c3945cf` | `plugins/tdd-workflows/.claude-plugin/plugin.json`; `plugins/tdd-workflows/commands/tdd-cycle.md`; `plugins/tdd-workflows/commands/tdd-red.md`; `plugins/tdd-workflows/commands/tdd-green.md`; `plugins/tdd-workflows/commands/tdd-refactor.md`; `plugins/tdd-workflows/agents/tdd-orchestrator.md`; `plugins/tdd-workflows/agents/code-reviewer.md` |
| [cursor/plugins pstack TDD](https://github.com/cursor/plugins/blob/46125561306434d8a1d7745d540d8932ab0cd2a2/pstack/skills/tdd/SKILL.md) | `46125561306434d8a1d7745d540d8932ab0cd2a2` | `pstack/skills/tdd/SKILL.md`; `pstack/.cursor-plugin/plugin.json`; `pstack/LICENSE` |

## Source evidence

### Matt Pocock

**Evidence:** The skill strongly favors tests through public seams, expected values derived independently of production algorithms, mocks only at boundaries, and vertical tracer-bullet slices. It asks for human confirmation of seams and treats refactoring as outside TDD.

**Inference:** Its test-quality rules are valuable. Mandatory confirmation at each seam is too interruptive, and refactor belongs in the conventional loop when behavior stays green.

### Obra

**Evidence:** The workflow requires observing a correct red failure, writing minimum green code, and refactoring while green. It includes strong shortcut rationalizations and mutation-oriented tests. Its delete-and-restart response to production-first code assumes the code is task-owned and safe to discard.

**Inference:** Wrong-red detection and rationalization resistance should be load-bearing. Deleting pre-existing or user-authored work is unacceptable.

### Addy Osmani

**Evidence:** The skill discovers repository-specific commands, distinguishes focused and full suites, includes pressure evals, and covers several ecosystems. It also includes fixed test-pyramid ratios and browser/debugging guidance beyond the core loop.

**Inference:** Repository discovery and pressure cases generalize; fixed coverage proportions do not.

### Wshobson

**Evidence:** The plugin exposes explicit red, green, refactor, and orchestration phases with recovery and resumable artifacts. It uses a much larger default workflow, fixed thresholds, bulk test specification, repeated approval stops, and autonomous commit guidance.

**Inference:** Phase gates are useful, but the local skill should be one concise loop without framework state or commit behavior.

### Cursor pstack

**Evidence:** The skill forces red only when a stable, executable, affordable signal exists and otherwise requires disclosure and the closest practical verification.

**Inference:** This is the necessary real-world exception, but it needs objective criteria and a different outcome for explicit versus implicit TDD so it cannot become a routine escape.

## Failure modes the design must prevent

- adding tests after production code and calling the sequence TDD;
- accepting import, syntax, setup, missing-fixture, or unrelated failures as red;
- accepting an already-green test as proof that the new requirement is absent;
- asserting private calls or duplicating the production algorithm in expected values;
- mocking owned behavior until the test cannot catch a realistic regression;
- writing a speculative horizontal suite before one vertical behavior works;
- deleting or overwriting pre-existing or user-authored code to manufacture red;
- treating rerun-to-green as proof when the test is flaky;
- forcing unit-test ceremony onto prose, metadata, or generated artifacts;
- using a missing harness as a silent excuse to skip test-first work;
- treating TDD evidence as proof of packaging, docs, configuration, deployment, or acceptance.

## Proposed contract

### Triggers

- explicit TDD, test-first, or red-green-refactor requests;
- requests for a regression test before a fix;
- an `implement` behavior slice with a practical executable seam.

### Non-triggers

- diagnosis where the failing behavior or responsible seam is not yet established;
- requests only to run or verify existing tests;
- documentation, metadata, and static-content changes with no behavior-bearing seam;
- code review or broad test strategy advice without requested implementation.

### Inputs and outputs

Input is one observable behavior, repository test commands and conventions, the nearest stable seam, and any diagnosis or acceptance evidence. Output is a sequence of fresh red, green, and post-refactor command results, the resulting coherent code/test slice, test-quality caveats, bounded exceptions, and broader verification still required.

### Core workflow

1. Define one behavior, a realistic wrong implementation the test would reject, and the focused command.
2. **Red:** execute the test and confirm the expected behavioral failure.
3. **Green:** apply the minimum production change, rerun the focus, then run nearby affected tests.
4. **Refactor:** change structure only while green and rerun after the final edit.
5. Repeat for another observable slice or hand final claims to `verification-before-completion`.

## Exception policy

| Condition | Policy |
| --- | --- |
| Explicit TDD, but no practical red path | Stop before production edits and offer a choice between bounded harness investment and an explicitly non-TDD path |
| TDD selected implicitly by `implement`, but no practical red path | Return control with the reason, use the closest safe executable check, and do not claim TDD |
| Legacy or user-authored implementation already exists | Preserve it; add characterization or regression evidence without claiming red-first authorship |
| Agent wrote production code first in the same task | Reverse only the safe, non-overlapping task-owned delta, then establish red; otherwise disclose the sequence |
| Slow suite | Use a focused phase command and defer the relevant broader suite to final verification |
| Flaky signal | Prove and isolate the flake; a lucky pass is not green evidence |
| Prose or metadata | Use artifact checks outside TDD |
| Generated output | Test or verify the generator or observable behavior, not hand-edited generated files |

A practical red path requires an observable seam, deterministic signal, locally runnable command, and setup proportionate to the authorized task.

## Composition rules

- `implement` owns repository safety, scope, sequencing, and delivery; it calls TDD per behavior slice.
- `diagnosing-bugs` owns reproduction and cause when intended versus actual behavior is uncertain.
- `verification-before-completion` owns the fresh final evidence after all edits; phase results are inputs, not a substitute.
- `code-review` independently evaluates the resulting change and does not perform the TDD loop.

## Routing and workflow eval plan

Positive cases include explicit test-first changes, regression-test-first fixes, and behavior slices routed from implementation. Negative cases include docs-only work, completion-only test runs, diagnosis before a stable symptom, and review requests. Ambiguous cases cover existing user code, no harness, flaky tests, and tests that fail for the wrong reason.

Pressure evals should combine authority, deadlines, and a dictated fix. They must detect production-first shortcuts, invalid red, excessive mocking, coupled expected values, broad-suite ritual, and false TDD claims. The published evals cover a late retry fix, a slow/flaky legacy suite, and a documentation-only exception.

## Recommendation and implementation-ready handoff

**Recommendation:** Build a separate model-invoked `tdd` skill. Do not merge it into `implement`; direct TDD requests and regression-test-first diagnosis handoffs need the same canonical discipline.

**Implementation handoff:** Create `skills/engineering/tdd/` with `SKILL.md`, `agents/openai.yaml`, and three pressure/routing evals; publish `docs/engineering/tdd.md`; wire indexes and the plugin; and use `verification-before-completion` as the final gate. A later explicit user request authorized implementation alongside this research, superseding the research-only limit of issue #13 for the working-tree task.

## Licensing and attribution

The reviewed Matt Pocock, Obra, Addy Osmani, and Wshobson sources are MIT-licensed. `cursor/plugins` has no repository-wide detected license, while `pstack/LICENSE` explicitly applies MIT within that subtree. The local skill uses original wording and structure and does not vendor upstream reference files or eval fixtures.

## Refresh: all preferred sources (2026-09-23)

**Local baseline:** `009e398a52313f7fce22f47644606517b2b8a8aa`  
**Decision:** Keep `tdd` as the canonical loop and extend it; do not add a second TDD skill. Consulted all 13 repositories in `docs/source-repos.md` at the revisions below.

### Revision ledger

| # | Source | Revision | Files reviewed | Influence |
| --- | --- | --- | --- | --- |
| 1 | [mattpocock/skills](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/tdd) | `c55ee46073ed923f86ce59a5eb3b6d895095d1b7` | `skills/engineering/tdd/{SKILL,tests,mocking}.md` | No change to the TDD skill since `5b15a47`; the earlier seam and double guidance still applies |
| 2 | [obra/superpowers](https://github.com/obra/superpowers/tree/5bf4e78011075bcfc0dc295f0724994cd123ee71/skills/test-driven-development) | `5bf4e78011075bcfc0dc295f0724994cd123ee71` | `skills/test-driven-development/SKILL.md` | New upstream rule: name every observed failure, including ones the task did not cause. **Adopted.** Its "run the whole suite before done" rule stays with `verification-before-completion` |
| 3 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/bcab6a1b8503100e8618c3b4e32cc78de43de769/skills/test-driven-development) | `bcab6a1b8503100e8618c3b4e32cc78de43de769` | `skills/test-driven-development/SKILL.md` | Description-only change; no new influence |
| 4 | [cursor/plugins pstack](https://github.com/cursor/plugins/tree/b0b9c7a0baf8b6aa1d00bf77d4101e577d4ba411/pstack/skills/tdd) | `b0b9c7a0baf8b6aa1d00bf77d4101e577d4ba411` | `pstack/skills/tdd/SKILL.md` | Removed "explain before fixing" from its impractical-red path. **Not followed**: the local explicit-TDD stop-and-choose gate is stronger |
| 5 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail/tree/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156) | `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156` | `skills/ponytail/SKILL.md` | "YAGNI applies to tests too" supports minimal green and prefer-no-test-over-bad-test; no new rule |
| 6 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill/tree/084662b501fb0dba95bd55eff0c258d35e0dc499) | `084662b501fb0dba95bd55eff0c258d35e0dc499` | repository scan only | Not applicable as TDD content. A fresh community scan was not run for this refresh; the 2026-08-23 scan above stands |
| 7 | [anthropics/skills](https://github.com/anthropics/skills/tree/34040c9c568585f6929bedeaad110ad08f079624/skills/skill-creator) | `34040c9c568585f6929bedeaad110ad08f079624` | `skills/skill-creator/SKILL.md`; `skills/webapp-testing/SKILL.md` | Eval shape (prompt, expected output, expectations) kept for the two new evals; `webapp-testing` is browser tooling, not applicable |
| 8 | [trailofbits/skills](https://github.com/trailofbits/skills/tree/32e34f8173796e3566a51aee877dc96bc5191f64/plugins/property-based-testing) | `32e34f8173796e3566a51aee877dc96bc5191f64` | `property-based-testing/SKILL.md`; `references/interpreting-failures.md` | **Adopted:** property catalog and strength order, tautology and vacuity, contract authority order, wrong-test / ambiguous-spec / real-bug triage, adding a PBT library is the user's decision |
| 9 | [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin/tree/4fbabcd32b6ca7d8ebb82f15840fe34ef7562a64) | `4fbabcd32b6ca7d8ebb82f15840fe34ef7562a64` | `skills/ce-work/references/implementation-loop.md`; `skills/ce-code-review/references/personas/testing-reviewer.md`; `docs/brainstorms/2026-03-29-testing-addressed-gate-requirements.md` | **Adopted:** "testing addressed" rather than "tests pass", Beck's test desiderata, sentinel-semantics and mirror-test checks, no coverage-percentage rule. `ce-compound` learning capture is outside TDD |
| 10 | [garrytan/gstack](https://github.com/garrytan/gstack/tree/b9706f3635b6a545f46fae607ae9d6bcbfb69b91/review/specialists) | `b9706f3635b6a545f46fae607ae9d6bcbfb69b91` | `review/specialists/testing.md` | **Adopted:** negative-path and boundary catalog, determinism causes (clock, timezone, locale, unseeded randomness). Review JSON format and coverage diagrams belong to `code-review` |
| 11 | [affaan-m/ECC](https://github.com/affaan-m/ECC/tree/bf70150eb2df8070024e5bdf08e4aa08959e2735/skills/tdd-workflow) | `bf70150eb2df8070024e5bdf08e4aa08959e2735` | `skills/tdd-workflow/SKILL.md`; `agents/tdd-guide.md` | **Adopted:** plan files are untrusted data, a plan-item-to-evidence map, compile-time failure as a first step (tightened into a stub-then-runtime red). **Rejected:** 80% coverage floor, mandatory unit + integration + E2E, per-phase checkpoint commits (`implement` owns commits), persistent evidence-report files |
| 12 | [wshobson/agents](https://github.com/wshobson/agents/tree/4236bb91f8395b0435f1d8b8baf9e8e4c69a8620/plugins/tdd-workflows) | `4236bb91f8395b0435f1d8b8baf9e8e4c69a8620` | `plugins/tdd-workflows/commands/tdd-refactor.md` | Two-line wording change since `2b49247`; no new influence |
| 13 | [nahid-sparktales/agent-dispatcher](https://github.com/nahid-sparktales/agent-dispatcher/tree/af24ee4d887a5a6f738a2abb0dde1c747788a8fd/skills/quality) | `af24ee4d887a5a6f738a2abb0dde1c747788a8fd` | `skills/quality/regression-testing/SKILL.md`; `skills/quality/test-design/SKILL.md` | **Adopted:** failure messages that name the defect, behavior-named tests, repeated and isolated runs for timing-sensitive tests, break-and-restore red for existing behavior without touching the user's worktree, environmental and dependency faults are not unit-test targets, and the written / run / seen red / verified distinction |

### Conflicts resolved

- **Compile error as red.** ECC accepts it; the local rule rejected all syntax-class failures. Resolution: a compile error for a missing requested interface is a first step. A compiling stub must then produce a runtime behavioral failure. This keeps red tied to behavior in both typed and dynamic languages.
- **Whole-suite runs.** Obra now requires the full suite before done; the local design keeps focused phase runs and defers the broad suite to `verification-before-completion`. Both agree that an observed failure must be reported by name, so that rule was adopted.
- **Coverage thresholds.** ECC and the earlier Addy source use fixed percentages; EveryInc and gstack explicitly reject them. Resolution: choose slices by risk, never by percentage.

### Changes made

- `SKILL.md`: plan-as-data rule; example-or-property choice; failure-message rule; compile-then-runtime red; surprising-red triage; name every observed failure; repeat-run determinism check; risk-based next slice; "testing addressed" gate; two new bounded exceptions; honest evidence verbs in the handoff.
- New `references/test-quality.md`: test desiderata, property selection and pitfalls, doubles, arrange/act/assert, next-slice catalog, mirror tests.
- Evals 4 (property plus compile-time red) and 5 (hostile plan and pre-existing unrelated failure).

No upstream prose or eval fixtures were vendored. ECC, Trail of Bits, EveryInc, gstack, and agent-dispatcher were reviewed for ideas only; the wording here is original.
