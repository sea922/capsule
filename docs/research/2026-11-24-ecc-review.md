# ECC review: what capsule can use

Source: [`affaan-m/ECC`](https://github.com/affaan-m/ECC) at `4adeee67`
(2026-11-19), MIT. Read in full by resource type: 328 skills (every one of the
125 general-purpose skills by description, the candidates below in depth),
72 agents, 99 commands, about 25 hooks, 122 rule files, three guides, and the
contexts, examples, and schemas.

Baseline: capsule `main` at `b3432b3`, with 33 skills, five agents (the
`orchestrate-*` roles), and no hooks. The 2026-11-16 upstream sweep read ECC's
skills at `d2ef2680` and took only `change-impact`, into `ship-it` and
`adlc-flow`.

This note records the findings. The [adoption research](2026-11-24-ecc-adoption-research.md)
and the [performance and accessibility research](2026-11-24-performance-accessibility-research.md)
record what was built from them and every other source consulted. Capsule adapts
ideas in its own wording and vendors no file.

## Summary by resource type

| ECC resource | Count | Usable in capsule |
| --- | --- | --- |
| Skills | 328 | 7 new skill topics and 9 smaller ideas for existing skills |
| Agents | 72 | 9 read-only reviewers and auditors |
| Hooks | ~25 | 2 small guards |
| Commands | 99 | None: capsule skills already act as commands |
| Rules | 122 | None: plugins cannot ship rules, and these conflict with capsule's approach |
| Guides | 3 | One checklist, from the security guide |
| Contexts, examples, schemas | — | None: ECC installer and harness plumbing |

## 1. New skill topics

Jobs people ask for by name that no capsule skill owns.

| Topic | ECC source | What it would own | Gap in capsule today |
| --- | --- | --- | --- |
| Database migrations | `database-migrations`, `database-reviewer` agent | Forward-only production changes, schema and data kept apart, expand–contract renames, online indexes, batched backfills with lock timeouts, a pre-apply checklist | Nothing; `git-workflow` only mentions splitting a risky PR into expand and contract |
| Production readiness | `production-audit`, `deployment-patterns` | A read-only "ready to launch?" review across security, data, payments and webhooks, operations, and user experience, with a capped score and a ship or block call | `ship-it` delivers and `security-review` covers security only |
| Performance | `performance-optimizer` agent, `benchmark` | Measure a baseline, confirm the limiter, change one thing, keep or revert on evidence | `diagnosing-bugs` only explains regressions |
| Benchmarking | `benchmark-optimization-loop`, `benchmark` | Agreed search budget, frozen metric and inputs, proof the metric reflects the user outcome, hard constraints judged apart from the score, a promotion gate that re-runs baseline and winner | Nothing |
| Accessibility | `accessibility`, `frontend-a11y`, `a11y-architect` agent | WCAG 2.2 AA audit and fixes from the running app: scanner, keyboard, screen reader, zoom, contrast | A few lines in `coding-standards` (`FRONTEND.md`) |
| Decision records | `architecture-decision-records`, `context-and-decisions` | Numbered ADRs with context, options, decision, consequences, status, and an index | ADRs are named as neighbours; nothing writes one |
| Codebase onboarding | `codebase-onboarding`, `code-tour` | A map of an unfamiliar repository: stack, architecture, entry points, a request's path, conventions, common tasks | Nothing |

For performance, benchmarking, and accessibility, ECC is one source among
several. `nahid-sparktales/agent-dispatcher`, `addyosmani/agent-skills`, and
`cursor/plugins` (pstack) carry stronger method for those three and should be
read with it.

## 2. Agents

All read-only. Capsule keeps an agent beside the skill that owns it.

| Capsule use | ECC source | Owner skill |
| --- | --- | --- |
| Review pass for errors a change swallows or hides behind fallbacks | `silent-failure-hunter` | `code-review` (deep) |
| Review pass for whether changed types still enforce their invariants | `type-design-analyzer` | `code-review` (deep) |
| Review pass for comments and docs that no longer match the code | `comment-analyzer` | `code-review` (deep) |
| Review pass for whether tests would catch the change breaking | `pr-test-analyzer` | `code-review` (deep) |
| Schema, migration, and query safety reviewer | `database-reviewer` | A database-migrations skill, reused by `code-review` |
| Performance risk reviewer | `performance-optimizer` | A performance skill, reused by `code-review` |
| Accessibility reviewer | `a11y-architect` | An accessibility skill, reused by `code-review` |
| Scan for secrets, personal data, and internal references before publishing | `opensource-sanitizer` | `security-review` |
| Derive requirements and invariants from existing code | `spec-miner` | `adlc-spec` |

The first four appear to descend from Anthropic's PR review toolkit; confirm
their origin and credit it before adapting them. ECC's general `code-reviewer`,
`planner`, `architect`, `tdd-guide`, `build-error-resolver`, and
`refactor-cleaner` duplicate capsule skills, and `code-explorer` duplicates
`orchestrate-explorer`.

## 3. Hooks

Capsule ships none, so any hook changes what installing the plugin does.

| Hook | ECC source | What it stops |
| --- | --- | --- |
| No-verify guard | `block-no-verify.js` | `--no-verify`, `commit -n`, `core.hooksPath` overrides, and `HUSKY=0` on git commands |
| Config protection | `config-protection.js` | Edits to existing lint and format configs, so the code is fixed instead of the check |

ECC's version of the first is about 1,500 lines aimed at deliberate evasion; a
capsule version would target casual bypasses and say it is not a security
boundary. Not usable: GateGuard, Hookify, governance capture, delivery gate
(ECC runtime), and tmux, notification, cost, and formatter hooks (personal or
project-specific).

## 4. Ideas for existing skills

| Idea | ECC source | Target skill |
| --- | --- | --- |
| Trace each UI handler call by call: one call undoing another, async races, stale closures, missing transitions | `click-path-audit` | `diagnosing-bugs`, `code-review` |
| Classify MCP config references as exact, ranged, or mutable, without running servers | `mcp-dependency-review` | `security-review` |
| Minimum bar for projects that run agents: scoped short-lived credentials, sandboxing, default-deny egress, approval boundaries, logging, kill switches, scanning skills, hooks, and MCP configs | `the-security-guide.md`, `agent-security-hardening` | `security-review` |
| Every fixed bug becomes an executable regression test; cover every code path, since a model reviewing its own code shares its blind spots | `ai-regression-testing` | `tdd`, `verification-before-completion` |
| After a deploy: console errors, assets, streams, and Web Vitals against a baseline | `canary-watch`, `browser-qa` | `ship-it` |
| Agent loops: machine-decidable goals, damping, and the spin, gaming, and wrong-answer failure modes; refine a subagent's context in rounds | `loop-design-check`, `iterative-retrieval` | `orchestrate`, `babysit-pr` |
| Look for an existing library, tool, or skill before building, then adopt, extend, or build | `search-first`, `skill-scout` | `implement`, `codebase-design`, `writing-for-agents` |
| Designing tools an agent calls: action granularity, observation format, error-recovery contract, context budget | `agent-harness-construction` | `writing-for-agents` |
| Multi-module repositories: rerun every downstream consumer's acceptance command after a change | `module-regression` | `verification-before-completion` |

## 5. Tooling

| Idea | ECC source | Target |
| --- | --- | --- |
| Check that skill frontmatter is safe for Codex and Cursor as well as Claude Code | `skill-host-compat` | `scripts/validate-repo.mjs` |

## Not usable, with the reason

| ECC resource | Reason |
| --- | --- |
| Rules | Plugins cannot ship rules; absolute checklists ("always immutable", 80% coverage) conflict with capsule's project-first `coding-standards` and evidence-led `tdd` |
| Commands | Thin wrappers over ECC's own skills and agents; `santa-loop` and `review-pr` are covered by `code-review` deep mode with specialist passes |
| `verification-loop`, `conventional-commit-review`, `test-collaboration`, `issue-review`, `story-lifecycle`, `blueprint`, `intent-driven-development`, `product-capability` | Owned by `verification-before-completion`, `git-workflow`, `sprint-planning`, `planning-and-task-breakdown`, and the ADLC suite |
| `error-handling`, `api-connector-builder`, `hexagonal-architecture`, `inherit-legacy-style`, `contract-first` | Covered by `coding-standards`, `implement`, and `codebase-design` |
| `council`, `santa-method`, `dev-team` | `code-review` deep mode already runs independent passes and an optional second-model reviewer |
| `skill-stocktake`, `skill-comply`, `rules-distill`, `continuous-learning-v2` | `skill-evolve` covers evidence-gated skill improvement |
| `eval-harness`, `cost-aware-llm-pipeline`, `prompt-caching-strategy`, `regex-vs-llm-structured-text` | Useful only for projects that build LLM features |
| `benchmark-methodology` | Scores competitors' marketing, not software |
| Language, framework, domain, and business packs; ECC's orchestration, memory, and canvas tooling | Outside capsule's scope |
