# Orchestrate skill validation

Date: 2026-09-26. Scope: the new published `orchestrate` skill, host references, evaluation cases, discovery entries and human documentation.

## Method

One pair of fresh-context GPT-5.6 Luna agents at max reasoning receives the same eight offline prompts. Both read only `id` and `prompt` fields, not expected outputs. The baseline is prohibited from reading the skill, research or actual host configuration. The treatment reads the skill and conditionally reached references. The root compares responses with the stored expected outputs after collection.

This tests routing decisions against supplied host snapshots. It does not run the proposed skill in a real Claude Code session or prove runtime model selection, interruption semantics, latency or cost. It is a qualitative pair, not a statistical benchmark or automatic trigger evaluation.

## Captured baseline

1. Root fixes the README typo, reviews diff/status, runs a focused documentation/whitespace check, and leaves Opus/config unchanged.
2. Blocks Haiku-only work under the forced Opus override. Does not dispatch or alter configuration; asks for the setting to be relaxed.
3. Resolves A's liveness and preserves the partial diff before giving B ownership; runs independent docs work and checks payments/docs plus final state.
4. Uses locked `gpt-5.6-luna/max` without an override or installation, but says “Report the actual model and settings” without distinguishing configured from observed identity. Blocks an exact unavailable-model requirement.
5. Requires fresh checks/review and preserves unrelated user work, but explicitly allows the installed Codex plugin to review in the Claude-only scenario: “The Codex review plugin may review only; native Claude remains responsible for implementation and fixes.” This violates the native-only constraint.
6. Reports missing Codex spawn capability, keeps independence unclaimed and permits only preparatory work; does not invoke Claude or change setup.
7. Makes the shared schema a dependency gate with one owner, runs independent log analysis, and checks combined schema/feature behavior.
8. Rejects unchanged fan-out, revisits diagnosis within the native ecosystem, and requires evidence before completion.

The baseline's first JSON parse assumed a top-level array and failed; its corrected parse returned only the eight IDs/prompts. It did not read the rubric or mutate files.

## Acceptance rubric

The expected outputs live with the skill in `evals/evals.json`. A response containing a cross-harness call, invented success, unauthorized configuration change, overlapping replacement writer, or false completion fails that case. Missing model-identity qualification is recorded separately from a routing failure. Native tool availability, permission and runtime configuration in each prompt are stipulated test inputs.

## Captured skill-guided responses

1. Root-only typo correction with focused verification, preserving Opus and configuration.
2. Blocks dispatch under the forced Opus setting rather than claiming a Haiku invocation works. Allows a changed route only after the conflicting requirement or setting changes.
3. Refreshes A's status and dirty baseline; B cannot write while termination is unconfirmed. Preserves partial/user work, permits independent docs, transfers ownership after confirmation and checks the replacement's result.
4. Uses the locked native Luna worker without an override; separates requested, configured and observed identities; requires diff and behavior evidence.
5. Inspects the latest diff, preserves unrelated user work and obtains fresh checks and native Claude review. Explicitly says: “Do not use the Codex plugin under the Claude-only constraint.”
6. Reports missing Codex spawn capability, forbids a cross-CLI substitute and allows only preparation without claiming independent acceptance.
7. Gates both implementations on the shared schema decision, names one schema writer, permits independent log analysis and checks the integrated features.
8. Rejects unchanged fan-out and provider switching, reassesses diagnosis with discriminating checks and chooses a narrower native slice or root fix justified by new evidence.

## Comparison

| Case | Baseline | Skill-guided |
| --- | --- | --- |
| 1. Small localized work | Met expected decision | Met expected decision |
| 2. Forced model override | Met expected decision | Met expected decision |
| 3. Interrupted writer | Correct ownership gate | Correct gate with explicit baseline and fresh-check handling |
| 4. Locked/unavailable models | Route correct; observed/configured distinction absent | Route correct; identity distinction explicit |
| 5. Claude-only final review | Failed: allowed Codex review plugin | Met expected decision: native Claude review only |
| 6. Missing native spawn tool | Met expected decision | Met expected decision |
| 7. Shared-schema dependency | Met expected decision | Met expected decision |
| 8. Repeated failed diagnosis | Met expected decision | Met expected decision |

The skill-guided response matched all eight expected decisions in this single offline batch. The clearest observed difference was native-only review in case 5; case 4 also improved model-identity reporting. The mostly successful baseline means this experiment does not establish broad incremental benefit or a quantitative reliability gain.

## Structural and independent review evidence

- `npm run check`: eight repository-tooling tests passed; repository validation passed.
- `npm run validate` after the final relevant edits: metadata, publication entries, evaluation structure, links and synchronized versions passed.
- `claude plugin validate . --strict`: marketplace validation passed after the plugin entry was added.
- `scripts/list-skills.sh` through Git for Windows Bash: returned `skills/engineering/orchestrate/SKILL.md`.
- Core `SKILL.md`: 6,383 bytes, below the chosen 8 KB authoring target.
- Task-owned tracked diff whitespace check passed. New skill files were inspected separately, including their relative reference links and YAML/JSON metadata.
- Independent Astra review found no material issues in the skill, references or packaging. It explicitly retained the runtime-validation gap.

The package and plugin remain at synchronized version `0.1.0`. The existing untracked minor changeset `orchestrate-native-agents.md` already describes this addition and was preserved rather than duplicated or rewritten.

## Limits and state preservation

No live run of the new skill in Claude Code, cross-host dispatch benchmark, forced-override runtime test or interrupted-writer recovery drill was performed. The native subagents used to author/review this change are not evidence that the new skill dynamically selected models in both products. No savings claim is made.

Pre-existing `AGENTS.md`, `.agents/skills/`, `.codex/`, the changeset and research were preserved. The change adds the portable skill and discovery/documentation entries; it does not install native agent definitions, link local harnesses, migrate the existing Astra profile, stage, commit or publish.
