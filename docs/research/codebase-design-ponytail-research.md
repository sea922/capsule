# Codebase Design and Ponytail Research

Date: 2026-09-02

## Question

Should concepts from [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) be added to `skills/engineering/codebase-design`?

## Recommendation

**Yes, selectively.** Add a short, architecture-level **subtraction ladder** to `codebase-design`, but do not import Ponytail as a persistent mode, a line-count objective, or a replacement for the existing architecture workflow.

The useful new idea is not another statement of YAGNI. It is an ordered decision procedure that stops design work at the first sufficient existing capability: no change, existing codebase capability, language/standard library, native platform, installed dependency, direct call or data constraint, and only then a new module, seam, adapter, or dependency. That procedure would make the current KISS -> YAGNI -> DRY guidance more operational.

The current skill already has the safeguards needed to adapt the idea responsibly: it evaluates total client and operational complexity rather than line count, requires the current flow to be understood first, treats direct dependencies as legitimate, recognizes useful thin adapters, and uses risk-based tests and evidence. Preserve those rules.

## What Ponytail contributes

Ponytail's current skill makes the agent stop at the first rung that works: question whether the change is needed, reuse something already present, prefer standard-library and native-platform capability, reuse an installed dependency, and only then write the minimum new code. It explicitly says the ladder runs **after** the agent reads the affected code and traces the real flow. It also protects trust-boundary validation, data-loss prevention, security, accessibility, and explicit requirements from simplification. ([Ponytail skill, pinned](https://github.com/DietrichGebert/ponytail/blob/2ed6c52c9d7e5e56942508591085fd45dea277d3/skills/ponytail/SKILL.md))

That ordering is the distinct contribution. The local `codebase-design` skill already says to choose the simplest design, apply KISS -> YAGNI -> DRY, avoid speculative structure, prefer direct dependencies when justified, and keep useful thin adapters. It does not yet give the designer a memorable, ordered **reuse before invention** gate covering the codebase, standard library, platform, and installed dependencies. ([current skill](../../skills/engineering/codebase-design/SKILL.md), [module design](../../skills/engineering/codebase-design/references/MODULE-DESIGN.md), [dependencies](../../skills/engineering/codebase-design/references/DEPENDENCIES.md))

Ponytail's history also sharpens the guardrails:

- Issue [#217](https://github.com/DietrichGebert/ponytail/issues/217) identified the missing "already in this codebase" rung. That is especially relevant to architecture work because reusing the canonical owner avoids parallel concepts and duplicate policy.
- Issue [#245](https://github.com/DietrichGebert/ponytail/issues/245) documented a failure where optimizing for the smallest diff caused the agent to skip end-to-end comprehension and patch the wrong layer. The current skill's framing and edge-mapping stages must therefore remain ahead of any subtraction ladder.
- Issue [#112](https://github.com/DietrichGebert/ponytail/issues/112) raised the risk that fewer lines can reduce readability and maintainability. The local skill already resolves this correctly by defining simplicity as total client knowledge, indirection, navigation, testing, migration, and operational machinery, not the fewest lines or modules.
- Issue [#126](https://github.com/DietrichGebert/ponytail/issues/126) showed that the original single-shot benchmark used a chatty baseline and overstated the reduction. Ponytail's replacement agentic benchmark addresses that criticism, but remains evidence about one model and a bounded task set, not a universal architecture law.

## Benchmark evidence and limits

Ponytail's first-party agentic benchmark used Claude Code with Haiku 4.5, twelve feature tasks against a pinned FastAPI/React repository, four runs per task and arm, plus six adversarial safety tasks. It reports a mean 54% reduction in added LOC for Ponytail versus the no-skill baseline, with large reductions where native controls replaced custom components and little change where the work was already irreducible. It also reports 100% on its limited safety checks, while a terse YAGNI one-liner prompt missed one path-traversal guard. ([agentic benchmark, pinned](https://github.com/DietrichGebert/ponytail/blob/2ed6c52c9d7e5e56942508591085fd45dea277d3/benchmarks/results/2026-06-18-agentic.md))

Treat this as supporting evidence for a decision ladder, not proof that minimum LOC produces better architecture. The authors disclose one model, `n=4`, nondeterminism, four timeout-affected cells, and a narrow deterministic safety floor. The benchmark measures implementation diffs, not long-term coupling, change cost, operability, or architectural fitness.

Recent evidence is coverage-limited. The requested `last30days` run covered 2026-08-03 through 2026-09-02 and returned current GitHub repository evidence plus a partial Reddit lane; X and YouTube were unavailable. No relevance-qualified recent community theme was strong enough to outweigh the first-party repository evidence. Current issues do reinforce limitations in deletion-first review and reliable rule delivery, including [#682](https://github.com/DietrichGebert/ponytail/issues/682), [#666](https://github.com/DietrichGebert/ponytail/issues/666), and [#736](https://github.com/DietrichGebert/ponytail/issues/736). This is a limitation, not consensus.

## Preferred-source review

`docs/source-repos.md` was read first. Every preferred repository was consulted at the revision shown.

| Preferred repository                                                                                                      | Revision  | Influence or non-applicability                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`mattpocock/skills`](https://github.com/mattpocock/skills/tree/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76)                 | `6654f6b` | Relevant baseline. Its compact `codebase-design` vocabulary supplies deep modules, deletion test, seams, and test surface. The local skill already extends it substantially; Ponytail should add an operational subtraction gate without reverting to the old rule that one adapter always means a hypothetical seam. ([source](https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/codebase-design/SKILL.md))                                                                                                                    |
| [`obra/superpowers`](https://github.com/obra/superpowers/tree/b36e0829c6d0140e93cfef2ca599b1b07d4a7797)                   | `b36e082` | Partly relevant. `brainstorming` says to explore the codebase, compare approaches, and apply YAGNI, but its mandatory approval workflow is orchestration rather than codebase-design content. Do not import that ceremony into this skill. ([source](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/brainstorming/SKILL.md))                                                                                                                                                                                                              |
| [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills/tree/d2c37ef6225dd8726cdd369a8030307f48592d26)     | `d2c37ef` | Relevant corroboration. `code-simplification` prioritizes comprehension over line count, understanding before deletion, native/stdlib reuse, scoped changes, and behavior-preserving verification. These are the right safety conditions for adapting Ponytail. ([source](https://github.com/addyosmani/agent-skills/blob/d2c37ef6225dd8726cdd369a8030307f48592d26/skills/code-simplification/SKILL.md))                                                                                                                                                                            |
| [`cursor/plugins` `pstack`](https://github.com/cursor/plugins/tree/efa2a531985e0a8084d36ff3cf87233be8a9f34b/pstack)       | `efa2a53` | Relevant corroboration. `architect` requires grounding, alternative shapes, deep interfaces, and "subtract before adding" when redesigning; the build guide treats removal of defensive dead weight as a focused cleanup pass. It supports subtraction as a design check, not an always-on LOC contest. ([architect](https://github.com/cursor/plugins/blob/efa2a531985e0a8084d36ff3cf87233be8a9f34b/pstack/skills/architect/SKILL.md), [build and clean](https://github.com/cursor/plugins/blob/efa2a531985e0a8084d36ff3cf87233be8a9f34b/pstack/docs/guide/05-build-and-clean.md)) |
| [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail/tree/2ed6c52c9d7e5e56942508591085fd45dea277d3)     | `2ed6c52` | Primary target and strongest influence. Adopt the ordered ladder and explicit protected concerns; reject persistent modes, shortest-diff/one-line objectives, one-test ceilings, and overengineering-only review as architecture policy.                                                                                                                                                                                                                                                                                                                                            |
| [`mvanhorn/last30days-skill`](https://github.com/mvanhorn/last30days-skill/tree/56ba5ace27e4697aedc60aa0b1e1bfdcd592ff20) | `56ba5ac` | Applicable as the requested recency research method, not as design guidance. Its source-health reporting is why recent community evidence is explicitly labeled partial rather than treated as silence or consensus.                                                                                                                                                                                                                                                                                                                                                                |

## Exact proposed scope

Add one small reference, tentatively `references/SUBTRACTION.md`, and a short routing paragraph in `SKILL.md`. Do not add a separate published skill or copy Ponytail's branding, modes, hooks, or terse output contract.

The reference should contain this architecture-adapted ladder, run only after the existing **Frame the decision** and **Map modules and edges** stages establish the real flow:

1. **No change:** does the requested capability or flexibility need to exist under current requirements and evidence?
2. **Existing owner:** can an existing cohesive module, interface, invariant, helper, schema, or policy own it without becoming less cohesive?
3. **Language or standard library:** does the language/runtime already supply the behavior with acceptable semantics?
4. **Native platform:** can the browser, operating system, database, framework, protocol, or deployment platform enforce it directly?
5. **Installed dependency:** does an already-owned dependency cover it without importing a larger concept or unacceptable lifecycle risk?
6. **Direct design:** is a direct call, explicit branch, data constraint, or visible duplication simpler than a new abstraction while keeping ownership clear?
7. **New structure:** only then introduce the minimum cohesive module, seam, adapter, dependency, or distributed mechanism that the evidence earns.

For each stopped rung, require one sentence recording what was not introduced and the concrete trigger that would justify reconsideration. This integrates naturally with the existing requirement to name why a rejected alternative loses now and what evidence would make it preferable later.

Add these guardrails beside the ladder:

- Optimize for **total complexity and comprehension**, never LOC, file count, or one-liners.
- Reuse an existing owner only when cohesion and vocabulary remain honest; do not turn a canonical module into a dumping ground.
- A single adapter or interface may still be justified by policy ownership, failure isolation, a trust boundary, test control, migration, or volatility. Adapter count alone is not a deletion rule.
- Do not subtract validation, authorization, accessibility, data-loss protection, failure semantics, compatibility, observability, or risk-proportionate tests.
- Native or installed capability must satisfy the actual contract, including edge cases, portability, lifecycle, and operational constraints.
- Preserve the current risk-based test portfolio; do not import Ponytail's "one runnable check" ceiling.

## What not to add

- No `lite`, `full`, or `ultra` intensity levels.
- No always-on persistence or session hooks.
- No "fewest files", "shortest diff wins", or "can it be one line?" as architecture scoring criteria.
- No blanket ban on an interface with one implementation.
- No numeric promise about LOC, cost, speed, or safety in the skill documentation.
- No Ponytail review/audit output format or speculative `net: -N lines` estimate; those belong to focused simplification/review workflows, not architecture design.
- No duplicated KISS/YAGNI/DRY essay. The new content should be the ordered decision gate and its architecture-specific exceptions.

## Acceptance criteria for a later implementation

1. A design request that proposes a new wrapper, port, dependency, or subsystem is forced to consider no-change, existing-owner, standard-library, native-platform, installed-dependency, and direct-design alternatives first.
2. A justified thin adapter at a trust, failure, translation, or migration seam survives the ladder.
3. An existing module is not reused when doing so would mix owners or invariants.
4. Recommendations continue to score total complexity, coupling, contracts, failure, migration, tests, and observability rather than LOC.
5. The skill records the deferred structure and the evidence-trigger for adding it later.
6. Evals include both an obvious over-build trap and a case where the correct answer is a new seam despite only one current adapter.

## Bottom line

Ponytail should influence `codebase-design`, not be embedded wholesale. Its ordered subtraction ladder supplies a strong missing reflex: **reuse and native capability before architectural invention**. The local skill's existing cohesion, contract, reliability, and evidence model supplies the necessary correction: the smallest architecture is the one with the lowest justified total complexity, not the one with the fewest lines or boxes.
