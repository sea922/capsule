# ECC full sweep for capsule

Source: [`affaan-m/ECC`](https://github.com/affaan-m/ECC) at `4adeee67`
(2026-11-19), MIT. The 2026-11-16 upstream sweep read ECC at `d2ef2680` for
skills only and folded `change-impact` into `ship-it` and `adlc-flow`. This
sweep covers every resource type: 328 skills, 72 agents, 99 commands, the hook
set, 122 rule files, the three guides, contexts, and examples.

Capsule adapts ideas in its own wording and vendors no ECC file.

## Verdict by resource type

| Type | Count | Worth taking | Why the rest is skipped |
| --- | --- | --- | --- |
| Skills | 328 | 8 new or folded topics (below) | Language, framework, and domain packs; topics capsule already owns |
| Agents | 72 | `spec-miner`, `silent-failure-hunter`, `type-design-analyzer`, `opensource-sanitizer` as review passes or modes | General reviewers, planners, and architects duplicate `code-review`, `planning-and-task-breakdown`, `codebase-design` |
| Hooks | ~25 | `config-protection`, `block-no-verify` as optional plugin hooks | ECC runtime (GateGuard, Hookify, governance capture), personal workflow helpers (tmux, notifications, cost telemetry) |
| Commands | 99 | `santa-loop` and `review-pr`'s specialist panel as `code-review` deep-mode ideas | Thin wrappers over skills and agents capsule already has |
| Rules | 122 | None | Short absolute checklists ("ALWAYS immutable", 80% coverage); capsule's `coding-standards` puts project conventions first |
| Guides | 3 | The security guide's minimum-bar checklist for agent-run projects | Long-form opinion and ECC setup |
| Contexts, examples, schemas | — | None | ECC installer and harness plumbing |

## New skills

| Topic | ECC source | Gap in capsule | Shape |
| --- | --- | --- | --- |
| Database migrations | `database-migrations` | Nothing on migration safety | Forward-only production changes, schema and data split, expand–contract renames, concurrent indexes, batched backfills with lock timeouts, a pre-apply checklist; tool specifics in references |
| Production readiness | `production-audit` | No "ready to launch?" entry point; `ship-it` delivers and `security-review` covers security only | Read-only review across security, data, payments and webhooks, operations, and UX, with a capped score and a ship or block call |
| Decision records | `architecture-decision-records` | ADRs are named as neighbours, but no skill writes one | Numbered Nygard-style ADRs with alternatives and consequences, an index, and supersession |
| Codebase onboarding | `codebase-onboarding`, `code-tour` | Nothing maps an unfamiliar repository | Reconnaissance, architecture and entry-point map, request lifecycle, detected conventions, common tasks |

## Folds into existing skills

| Idea | ECC source | Target |
| --- | --- | --- |
| Trace each UI handler call by call for sequential undo, async races, stale closures, and missing transitions | `click-path-audit` | `diagnosing-bugs`, frontend lens in `code-review` |
| Silent-failure pass: swallowed errors, fallbacks that hide failure, lost stack traces, missing timeouts and rollback | `silent-failure-hunter` agent | `code-review` deep pass |
| Classify MCP config references as exact, ranged, or mutable without running servers | `mcp-dependency-review` | `security-review` |
| Agent-run project minimum bar: scoped short-lived credentials, sandboxing, default-deny egress, approval boundaries, logging, kill switches, supply-chain scanning of skills, hooks, and MCP configs | `the-security-guide.md`, `agent-security-hardening` | `security-review` |
| Derive a WHEN → THEN requirement and invariant spec from existing code | `spec-miner` agent | `adlc-spec` brownfield mode |
| WCAG 2.2 AA across web, iOS, and Android | `accessibility`, `a11y-architect` | `coding-standards` reference |
| Turn every fixed bug into an executable regression test; cover every code path, because a model reviewing its own code shares its blind spots | `ai-regression-testing` | `tdd`, `verification-before-completion` |
| Post-deploy console, asset, stream, and Web Vitals checks against a baseline | `canary-watch`, `browser-qa` | `ship-it` deployment reference |
| Machine-decidable goals, damping, and failure modes for agent loops | `loop-design-check` | `orchestrate`, `babysit-pr` |

## Optional plugin hooks

Capsule ships no hooks today, so adding any changes what installing it does.
Two are small and broadly useful:

- **Config protection:** block edits to existing lint and formatter configs, so
  an agent fixes the code instead of loosening the check.
- **No-verify block:** refuse `--no-verify` and `core.hooksPath` overrides on
  git commands.

## Considered and not taken

`gateguard`, `safety-guard`, `plankton-code-quality`, `config-health`,
`security-scan`, `delivery-gate` (hooks or ECC runtime); `verification-loop`,
`conventional-commit-review`, `search-first`, `test-collaboration`,
`issue-review`, `story-lifecycle`, `skill-stocktake`, `skill-comply`,
`rules-distill`, `contract-first`, `inherit-legacy-style` (owned by `verification-before-completion`,
`git-workflow`, `research`, `sprint-planning`, `skill-evolve`, `writing-for-agents`,
`codebase-design`, `coding-standards`); `council`, `santa-method` (deep review
already runs independent passes and an optional cross-vendor reviewer);
`eval-harness`, `regex-vs-llm-structured-text`, `cost-aware-llm-pipeline` (only
for projects building LLM features); domain packs.
