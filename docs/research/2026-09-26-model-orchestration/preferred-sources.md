# Preferred-source consultation ledger

Read `docs/source-repos.md` before research. Its order and contents are unchanged. Snapshots below were inspected on 2026-09-26; repository claims are evidence of a design, not proof of production reliability or savings. Links pin the inspected revision where recorded.

## User-supplied reference

[`donvito/codex-astra-luna-orchestrator`](https://github.com/donvito/codex-astra-luna-orchestrator/tree/30b7d0bb7e9b3b9a7d27e78a11c468f95c4cf704), snapshot dated 2026-09-23.

- [Pro skill](https://github.com/donvito/codex-astra-luna-orchestrator/blob/30b7d0bb7e9b3b9a7d27e78a11c468f95c4cf704/profiles/pro/agents/skills/astra-orchestrator/SKILL.md): adopt root ownership, bounded contracts, actual spawn requirements, independent review and completion gates.
- [Native configuration](https://github.com/donvito/codex-astra-luna-orchestrator/blob/30b7d0bb7e9b3b9a7d27e78a11c468f95c4cf704/profiles/pro/codex/config.toml): separate runtime model settings from workflow prose. The repository is Codex-specific; it is not itself a Claude implementation.
- [Usage guide](https://github.com/donvito/codex-astra-luna-orchestrator/blob/30b7d0bb7e9b3b9a7d27e78a11c468f95c4cf704/guides/token-usage.md): distinguish cached/uncached usage and repeat representative tasks. Its historical sample is explicitly not a benchmark; it does not establish savings for this user.
- [License](https://github.com/donvito/codex-astra-luna-orchestrator/blob/30b7d0bb7e9b3b9a7d27e78a11c468f95c4cf704/LICENSE): Apache-2.0. If implementation reuses text or code, preserve applicable attribution and notices rather than treating it as original MIT material.

## Ordered preferred repositories

### 1. mattpocock/skills

Revision `c55ee46073ed923f86ce59a5eb3b6d895095d1b7` (2026-09-18).

[Invocation metadata](https://github.com/mattpocock/skills/blob/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/.agents/invocation.md) and [plugin ADR](https://github.com/mattpocock/skills/blob/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/.agents/adr/0002-ship-as-a-claude-code-plugin.md) support portable skill content with host-specific packaging. [Research guidance](https://github.com/mattpocock/skills/blob/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/docs/engineering/research.md) informs stopping criteria and durable evidence. High influence; avoid assuming Claude and Codex manifests are interchangeable.

### 2. obra/superpowers

Revision `8ca22dba9a94f28898bbce59f2537ff4d87c747` (2026-09-25).

[Parallel dispatch](https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747/skills/dispatching-parallel-agents/SKILL.md) informs independent work boundaries. [Subagent development](https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747/skills/subagent-driven-development/SKILL.md) informs fresh implementation contexts, specification/quality review and bounded correction. [Codex mapping](https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747/skills/using-superpowers/references/codex-tools.md) reinforces explicit model/effort settings. High influence, but do not impose every review stage on trivial tasks.

### 3. addyosmani/agent-skills

Revision `2686b620fc1fed2e8f60c704839c766b8594c6b6` (2026-09-25).

[Per-agent configuration](https://github.com/addyosmani/agent-skills/blob/2686b620fc1fed2e8f60c704839c766b8594c6b6/docs/advanced-per-agent-configuration.md) supports shared policy with separate runtime adapters. [Agent guidance](https://github.com/addyosmani/agent-skills/blob/2686b620fc1fed2e8f60c704839c766b8594c6b6/docs/agents.md) and [orchestration patterns](https://github.com/addyosmani/agent-skills/blob/2686b620fc1fed2e8f60c704839c766b8594c6b6/references/orchestration-patterns.md) inform one outcome per role, direct execution when routing adds no value, and small integration surfaces. High influence.

### 4. cursor/plugins, especially pstack

Revision `ecc249f1e306fc64ddf83c7bed16cacf7c2239db` (2026-09-25).

[Swarm](https://github.com/cursor/plugins/blob/ecc249f1e306fc64ddf83c7bed16cacf7c2239db/pstack/skills/swarm/SKILL.md) contributes done predicates and isolated outputs. [Shared-state principle](https://github.com/cursor/plugins/blob/ecc249f1e306fc64ddf83c7bed16cacf7c2239db/pstack/skills/principle-separate-before-serializing-shared-state/SKILL.md) highlights that prose is not a lock. [Orchestration playbook](https://github.com/cursor/plugins/blob/ecc249f1e306fc64ddf83c7bed16cacf7c2239db/pstack/skills/poteto-mode/playbooks/orchestrate.md) informs pilots, bounded retries and revision-bound review. Cursor APIs, cloud execution and mixed-provider routing are not applicable to the clarified scope.

### 5. DietrichGebert/ponytail

Revision `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156` (2026-09-14).

[Portability](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/docs/agent-portability.md) supports thin native adapters. [Benchmark guidance](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/benchmarks/README.md) and [cost verification](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/benchmarks/results/2026-06-17-cost-verification.md) show why workflow savings must be measured per provider and workload. High influence on evaluation; do not generalize a reported improvement into a promised percentage.

### 6. mvanhorn/last30days-skill

Upstream revision `084662b501fb0dba95bd55eff0c258d35e0dc499` (2026-09-22, v3.25.0); the actual local research run used the already installed v3.21.1.

[JSON contract](https://github.com/mvanhorn/last30days-skill/blob/084662b501fb0dba95bd55eff0c258d35e0dc499/docs/reference/json-export.md) informs explicit status and coverage semantics. [Fan-out isolation test](https://github.com/mvanhorn/last30days-skill/blob/084662b501fb0dba95bd55eff0c258d35e0dc499/tests/test_competitor_subrun_isolation.py) informs preventing task settings leaking between workers. [Hook lesson](https://github.com/mvanhorn/last30days-skill/blob/084662b501fb0dba95bd55eff0c258d35e0dc499/docs/solutions/workflow-issues/session-start-hook-not-for-skill-nux.md) supports invocation-scoped setup. It supplies research mechanics, not the native agent runtime.

### 7. anthropics/skills

Revision `33375500bcea98d610eb30ce10ac4e59b89c390d` (2026-09-24).

[Skill creator](https://github.com/anthropics/skills/blob/33375500bcea98d610eb30ce10ac4e59b89c390d/skills/skill-creator/SKILL.md) informs progressive disclosure, baseline comparisons, explicit assertions and variance reporting. [Evaluation reference](https://github.com/anthropics/skills/blob/33375500bcea98d610eb30ce10ac4e59b89c390d/skills/mcp-builder/reference/evaluation.md) informs independent verifiable tasks. High influence on authoring and evaluation; do not transplant Claude API behavior into Codex. Check each reused component's license and third-party notices.

### 8. trailofbits/skills

Revision `0cc1c73a5e96749ab32d7ea5e14892fafa6972ae`.

[Audit context](https://github.com/trailofbits/skills/blob/0cc1c73a5e96749ab32d7ea5e14892fafa6972ae/plugins/audit-context-building/skills/audit-context-building/SKILL.md) and its [workflow](https://github.com/trailofbits/skills/blob/0cc1c73a5e96749ab32d7ea5e14892fafa6972ae/plugins/audit-context-building/workflows/audit-context.js) inform bounded phases, structured returns and durable artifacts. [Differential review](https://github.com/trailofbits/skills/blob/0cc1c73a5e96749ab32d7ea5e14892fafa6972ae/plugins/differential-review/skills/differential-review/SKILL.md) informs risk-based depth and limitation reporting. The security-specific workflow and Claude Workflow runtime are not a Codex routing implementation. Test actual results, not just attempted tool invocation. The repository advertises CC-BY-SA-4.0; consult applicable component licensing before copying material.

### 9. EveryInc/compound-engineering-plugin

Revision `a763b392c3c05faa1a383c0d228b7e95200ecc90`.

[Model normalization](https://github.com/EveryInc/compound-engineering-plugin/blob/a763b392c3c05faa1a383c0d228b7e95200ecc90/docs/solutions/integrations/cross-platform-model-field-normalization.md) warns against unsupported model fields in Codex skill frontmatter. This does not negate model selection in native Codex agent TOML. [Portable authoring](https://github.com/EveryInc/compound-engineering-plugin/blob/a763b392c3c05faa1a383c0d228b7e95200ecc90/docs/solutions/skill-design/portable-agent-skill-authoring.md) and [native install strategy](https://github.com/EveryInc/compound-engineering-plugin/blob/a763b392c3c05faa1a383c0d228b7e95200ecc90/docs/solutions/integrations/native-plugin-install-strategy.md) support separating common policy, authority and harness mechanics. High influence. Cross-product peer review is excluded. Durable lessons should record demonstrated corrections rather than automatically promote every worker observation into permanent instructions.

### 10. garrytan/gstack

Revision `2a113ae7e623f590095bcaaa0cc581c9a10a6632`.

[Claude adapter](https://github.com/garrytan/gstack/blob/2a113ae7e623f590095bcaaa0cc581c9a10a6632/hosts/claude.ts), [Codex adapter](https://github.com/garrytan/gstack/blob/2a113ae7e623f590095bcaaa0cc581c9a10a6632/hosts/codex.ts) and [host factory](https://github.com/garrytan/gstack/blob/2a113ae7e623f590095bcaaa0cc581c9a10a6632/hosts/define-host.ts) demonstrate host-specific paths, field allowlists and generated metadata. [Model resolution](https://github.com/garrytan/gstack/blob/2a113ae7e623f590095bcaaa0cc581c9a10a6632/scripts/resolve-codex-generation-model.ts) informs config-driven selection and explicit failure. Apply only the small adapter pattern here; its outside-review and cross-CLI routes are excluded. Avoid turning a small skill into a multi-host transpilation framework.

### 11. affaan-m/ECC

Revision `e482e579415fde18357cafce70f177ae19fd7f03`.

[Plan-orchestrate](https://github.com/affaan-m/ECC/blob/e482e579415fde18357cafce70f177ae19fd7f03/skills/plan-orchestrate/SKILL.md) informs catalog and namespace validation, chain bounds and review consistency. [Adaptation policy](https://github.com/affaan-m/ECC/blob/e482e579415fde18357cafce70f177ae19fd7f03/docs/skill-adaptation-policy.md) supports canonical knowledge with native configuration. The supporting [model-route command](https://github.com/affaan-m/ECC/blob/e482e579415fde18357cafce70f177ae19fd7f03/commands/model-route.md) illustrates risk/confidence/fallback routing within Claude. Its `multi-workflow` cross-model coordination is outside scope. Unknown agent names must produce an explicit error, not a silent default.

### 12. wshobson/agents

Revision `6161de4da8164795bc1128e8888c5054a5b67ddf`.

[Authoring rules](https://github.com/wshobson/agents/blob/6161de4da8164795bc1128e8888c5054a5b67ddf/AGENTS.md) demonstrate canonical sources with generated per-host outputs. [Context-driven development](https://github.com/wshobson/agents/blob/6161de4da8164795bc1128e8888c5054a5b67ddf/plugins/conductor/skills/context-driven-development/SKILL.md) and [track management](https://github.com/wshobson/agents/blob/6161de4da8164795bc1128e8888c5054a5b67ddf/plugins/conductor/skills/track-management/SKILL.md) inform durable context, dependency state and phase verification. Use concise references and checked generation if needed; do not adopt its broad multi-harness conversion scope or treat repository-specific size checks as universal platform limits.

### 13. nahid-sparktales/agent-dispatcher

Revision `c9f7f2d26206235af1c6bfccb8dc009c3c5245ce`.

[Capability intelligence](https://github.com/nahid-sparktales/agent-dispatcher/blob/c9f7f2d26206235af1c6bfccb8dc009c3c5245ce/docs/capability-intelligence.md) and [resolver](https://github.com/nahid-sparktales/agent-dispatcher/blob/c9f7f2d26206235af1c6bfccb8dc009c3c5245ce/capability_resolver.py) inform eligibility before routing, shadow-mode evaluation, equivalent fallbacks and explicit unverified outcomes. [Codex adapter](https://github.com/nahid-sparktales/agent-dispatcher/blob/c9f7f2d26206235af1c6bfccb8dc009c3c5245ce/adapters/codex/README.md) shows separate native distribution. A routing decision never grants permission. Provider/Jev decision engines and additional retrieval services are unnecessary for this scope.

## Synthesis of disagreements

The sources differ on how much orchestration infrastructure to build. The existing local planning and implementation skills already own most delivery behavior, so a broad new framework would duplicate them. The recommendation is a thin `orchestrate` entry point solely for delegation/model selection and coordination, composing those existing owners. Extending planning/implement directly is a valid smaller alternative if a dedicated invocation is not needed.

Native plugin compatibility can simplify distribution, but it does not make Claude model fields, workflow tools or agent definitions valid Codex configuration. Keep semantic adapters separate even if a marketplace manifest is shared. Verify the installed host rather than choosing one repository's historical packaging advice as a permanent contract.
