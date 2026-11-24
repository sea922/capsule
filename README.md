<div align="center">

# 💊 capsule

**Agent skills for engineering work, packaged as a Claude Code plugin.**

Plan, build, review, ship, and write with skills that keep agents on evidence,
not guesses. Works with GitHub and GitLab.

[![Version](https://img.shields.io/github/package-json/v/sea922/capsule?label=version&color=blueviolet)](CHANGELOG.md)
[![Skills](https://img.shields.io/badge/skills-48-orange)](#-skills)
[![CI](https://github.com/sea922/capsule/actions/workflows/ci.yml/badge.svg)](https://github.com/sea922/capsule/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)
[![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-d97757)](#-install)
[![GitHub + GitLab](https://img.shields.io/badge/forges-GitHub%20%7C%20GitLab-181717)](#-skills)

[![Stars](https://img.shields.io/github/stars/sea922/capsule?style=social)](https://github.com/sea922/capsule/stargazers)
[![Forks](https://img.shields.io/github/forks/sea922/capsule?style=social)](https://github.com/sea922/capsule/forks)
[![Last commit](https://img.shields.io/github/last-commit/sea922/capsule)](https://github.com/sea922/capsule/commits/main)
[![Visitors](https://hits.sh/github.com/sea922/capsule.svg?label=visitors&color=2ea44f)](https://hits.sh/github.com/sea922/capsule/)
[![Clones](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsea922%2Fcapsule%2Ftraffic%2Fclones.json)](.github/workflows/traffic.yml)
[![Views](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsea922%2Fcapsule%2Ftraffic%2Fviews.json)](.github/workflows/traffic.yml)

[Install](#-install) · [Skills](#-skills) · [Workflow map](docs/workflow.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

</div>

---

## ⚡ Install

In Claude Code:

```text
/plugin marketplace add sea922/capsule
/plugin install capsule@capsule
```

Model-invoked skills load on their own when a request matches them. The ADLC
skills run only when you call them, for example `/adlc-intent`. Start with the
[workflow map](docs/workflow.md) to pick an entry point and see how the skills
compose.

## 🧰 Skills

### 🧭 ADLC — agentic development lifecycle (user-invoked)

| Skill | What it does |
| --- | --- |
| [adlc-flow](docs/adlc/adlc-flow.md) | Verify the approval chain and route work from its evidenced stage to the next command or delivery endpoint. |
| [adlc-intent](docs/adlc/adlc-intent.md) | Interview the human and record the problem, outcome, and success signal before agents build. |
| [adlc-spec](docs/adlc/adlc-spec.md) | Turn approved intent into observable behavior and numbered, verifiable acceptance criteria. |
| [adlc-plan](docs/adlc/adlc-plan.md) | Plan covered, assigned slices with separate verifiers and rollback from an approved spec. |
| [adlc-gate](docs/adlc/adlc-gate.md) | Record revision-bound human sign-off with portable content hashes, conditions, and freshness checks. |

### 🛠️ Build

| Skill | What it does |
| --- | --- |
| [implement](docs/engineering/implement.md) | Execute authorized changes in coherent, repository-safe slices with fresh completion evidence. |
| [tdd](docs/engineering/tdd.md) | Drive behavior changes through observable red, green, and refactor evidence. |
| [property-based-testing](docs/engineering/property-based-testing.md) | Find strong properties and generators, avoid vacuous tests, and triage shrunk counterexamples. |
| [prototype](docs/engineering/prototype.md) | Answer one design or feasibility question with a small, reproducible experiment. |
| [simplify](docs/engineering/simplify.md) | Reduce complexity in a scoped pass while preserving observable behavior. |
| [database-migrations](docs/engineering/database-migrations.md) | Plan, write, and verify schema and data changes that survive a live deploy. |
| [benchmark](docs/engineering/benchmark.md) | Produce or vet a measurement a decision can rest on, and search variants within a budget. |
| [performance](docs/engineering/performance.md) | Make software measurably faster or lighter, or review code for performance risk, with numbers that hold up. |
| [codebase-design](docs/engineering/codebase-design.md) | Design cohesive modules, evidence-gated abstractions, dependency direction, and explicit contracts. |
| [api-design](docs/engineering/api-design.md) | Design or change an HTTP API contract without breaking the callers that depend on it. |
| [database-design](docs/engineering/database-design.md) | Design schemas, indexes, and queries that fit the workload, with PostgreSQL, MySQL, Redis, and ClickHouse references. |
| [containers-and-deploys](docs/engineering/containers-and-deploys.md) | Build a service's container image, pipeline, rollout strategy, and infrastructure definitions, and prove them by running them. |
| [llm-features](docs/engineering/llm-features.md) | Build, evaluate, and tune product features that call a language model, keeping or reverting each change on the project's own evals. |
| [interface-polish](docs/engineering/interface-polish.md) | Audit design tokens, find visual drift, and apply concrete polish details to an existing interface. |
| [i18n-sync](docs/engineering/i18n-sync.md) | Keep locale files in step with source strings: missing, unused, and stale keys, translated in context and verified. |
| [seo](docs/engineering/seo.md) | Audit and fix how a site is crawled, indexed, and presented in search, working from what a crawler actually receives. |
| [coding-standards](docs/engineering/coding-standards.md) | Apply project conventions with shared rules, backend and frontend guidance, and per-stack references. |

### 🔍 Investigate and plan

| Skill | What it does |
| --- | --- |
| [codebase-onboarding](docs/engineering/codebase-onboarding.md) | Map an unfamiliar repository: stack, architecture, a traced request, conventions, and where to start. |
| [decision-records](docs/engineering/decision-records.md) | Record significant technical decisions as ADRs and answer why past ones were made. |
| [diagnosing-bugs](docs/engineering/diagnosing-bugs.md) | Prove a root cause through reproduction, competing hypotheses, and discriminating evidence. |
| [research](docs/engineering/research.md) | Investigate questions with primary sources, revision-aware citations, and explicit gaps. |
| [planning-and-task-breakdown](docs/engineering/planning-and-task-breakdown.md) | Turn clear requirements into verifiable slices, dependencies, and a ready frontier. |
| [sprint-planning](docs/engineering/sprint-planning.md) | Plan a team sprint with a goal, capacity, spikes, and Fibonacci points anchored to reference stories. |
| [orchestrate](docs/engineering/orchestrate.md) | Route bounded work to Claude Code or Codex agents with fitting models and verified integration. |

### ✅ Review and quality

| Skill | What it does |
| --- | --- |
| [code-review](docs/engineering/code-review.md) | Review changes at quick, standard, or deep depth with evidence-backed findings. |
| [production-readiness](docs/engineering/production-readiness.md) | Judge whether a release is ready for real users, with a ship, ship-with-caveats, or block verdict. |
| [e2e-testing](docs/engineering/e2e-testing.md) | Build and repair end-to-end suites that cover real journeys and stay trustworthy. |
| [accessibility](docs/engineering/accessibility.md) | Audit and fix UI against WCAG 2.2 AA with real keyboard, screen-reader, zoom, and contrast evidence. |
| [security-review](docs/engineering/security-review.md) | Assess trust boundaries and concrete abuse paths in a scoped, read-only review. |
| [verification-before-completion](docs/engineering/verification-before-completion.md) | Prove completion claims with fresh, scope-matched evidence and honest verdicts. |
| [compound-learnings](docs/engineering/compound-learnings.md) | Capture durable engineering lessons and refresh them against current code. |

### 🚀 Git and delivery — GitHub and GitLab

| Skill | What it does |
| --- | --- |
| [git-workflow](docs/engineering/git-workflow.md) | Focused commits, branches, rebases, stacks, backports, freshness checks, and Git recovery. |
| [git-worktrees](docs/engineering/git-worktrees.md) | Select, prepare, retire, and recover isolated checkouts without displacing other work. |
| [pr-description](docs/engineering/pr-description.md) | Outcome-led PR or MR titles and bodies from the final diff, with evidence and a merge-danger section. |
| [pr-images](docs/engineering/pr-images.md) | Capture, privacy-check, and attach before/after screenshots to GitHub PRs, GitLab MRs, issues, and comments. |
| [babysit-pr](docs/engineering/babysit-pr.md) | Carry a GitHub PR or GitLab MR through review feedback, CI repairs, and verified merge. |
| [ship-it](docs/engineering/ship-it.md) | Carry finished changes to an explicit, verified PR, merge, or deployment endpoint. |

### 🤝 Productivity

| Skill | What it does |
| --- | --- |
| [grilling](docs/productivity/grilling.md) | Stress-test a consequential or ambiguous plan, decision, or idea through a live interview. |
| [handoff](docs/productivity/handoff.md) | Preserve verified task state across sessions, harnesses, directories, or people. |

### ✍️ Writing and skills

| Skill | What it does |
| --- | --- |
| [writing-for-humans](docs/authoring/writing-for-humans.md) | Write and revise clear, specific, genre-aware prose while keeping the author's voice. |
| [writing-for-agents](docs/authoring/writing-for-agents.md) | Write skills, `AGENTS.md`, and `CLAUDE.md` so agents take the same path every run. |
| [html-writeup](docs/authoring/html-writeup.md) | Build a self-contained HTML document with diagrams, tables, and code, verified in a real browser. |
| [skill-evolve](docs/authoring/skill-evolve.md) | Turn real-session evidence into skill edits, keeping only those that beat the current version. |

## 🧩 Agents and hooks

capsule also ships read-only agents that its skills hand work to, indexed in [`agents/`](agents/README.md), and two hooks.

| Agent | Used by | What it checks |
| --- | --- | --- |
| `code-review-silent-failures` | `code-review` deep | Errors a change swallows, hides behind fallbacks, or loses |
| `code-review-type-design` | `code-review` deep | Whether changed types still enforce their invariants |
| `code-review-comments` | `code-review` deep | Comments and docs that no longer match the code |
| `code-review-tests` | `code-review` deep | Whether the tests would catch the change breaking |
| `java-reviewer` | `code-review` deep | Java changes in Spring Boot, Quarkus, or plain Java: security, errors, layering, persistence, concurrency |
| `database-migrations-reviewer` | `database-migrations`, `code-review` deep | Migrations, schema, and queries that can lose data, lock tables, or break deploys |
| `benchmark-auditor` | `benchmark`, `performance`, `code-review` deep | Whether a harness or a reported number supports its claim |
| `production-readiness-auditor` | `production-readiness` | The evidence a launch review needs: what exists, what is missing, what looks risky |
| `performance-reviewer` | `performance`, `code-review` deep | Hot paths, unbounded work, and bundle weight, as potential impact |
| `accessibility-reviewer` | `accessibility`, `code-review` deep | Likely WCAG barriers in UI code, for manual checks to confirm |
| `security-review-sanitizer` | `security-review` | Secrets, personal data, and internal references before publishing |
| `adlc-spec-miner` | `adlc-spec` | Current behavior of existing code, as evidence-backed requirements and invariants |
| `orchestrate-*` | `orchestrate` | Bounded explorer, researcher, worker, tester, and reviewer roles |

| Hook | Blocks | Turn off |
| --- | --- | --- |
| `block-no-verify` | `--no-verify`, `commit -n`, `core.hooksPath` overrides, and `HUSKY=0` on git commands | `CAPSULE_HOOKS_DISABLED=block-no-verify` |
| `config-protection` | Edits to existing lint and format configs (ESLint, Prettier, Biome, Stylelint, Ruff, and others) | `CAPSULE_HOOKS_DISABLED=config-protection` |

The hooks need Node.js. They stop an agent from casually skipping checks; they are not a security boundary. List several ids with commas to turn off more than one.

## 📏 Rules (optional)

Rules are always-loaded guidance that Claude Code reads from a project's
`.claude/rules/`. The plugin does not install them; copy the sets you want:

```sh
node rules/install.mjs --target /path/to/your-project --sets common,typescript,react --apply
```

| Set | Loads for |
| --- | --- |
| `common` | Every session: precedence, evidence before claims, Git safety, untrusted content, scope, skill routing |
| `typescript`, `react`, `web` | TypeScript and JavaScript, `.tsx`/`.jsx`, and HTML and CSS files |
| `python`, `java`, `golang`, `csharp` | Files of that language |

Every rule defers to the project's own conventions and tooling. The rules are
adapted from [affaan-m/ECC](https://github.com/affaan-m/ECC) under the MIT
License. See [`rules/README.md`](rules/README.md).

## 📁 Repository structure

| Path | Contents |
| --- | --- |
| `skills/` | The skills, grouped into bucket folders |
| `docs/` | Human-facing skill pages under `adlc/`, `engineering/`, `productivity/`, and `authoring/`, with source research under `research/` |
| `scripts/` | Maintainer helpers: validation, versioning, audit, packaging, traffic |
| `agents/` | Index of the agents, which live with the skills that own them |
| `hooks/` | The plugin's hooks and their tests |
| `rules/` | Optional rule sets and their installer |
| `.claude-plugin/` | Claude Code plugin and marketplace metadata |
| `.changeset/` | Versioning metadata |
| `.github/workflows/` | CI, release, and traffic automation |

## 🙏 Attribution

See the [license](LICENSE).

<details>
<summary>Sources and influences for each skill</summary>

The repository shell is based on
[`mattpocock/skills`](https://github.com/mattpocock/skills). `grilling`
generalizes that project's design-tree and frontier-round model into an
original local interview primitive. `codebase-design`
adapts Matt Pocock's original deep-module vocabulary and expands it with
source-backed guidance for simplicity and abstraction timing, decomposition,
dependency direction, communication, reliability, testing, observability, and
enforcement. `writing-for-humans` is original work informed by a comparative
read of this family of skills and their published evaluations: it adapts the
editorial intent of Cursor's `pstack/unslop`, meaning-preservation gates from
[`jlevy/practical-prose`](https://github.com/jlevy/practical-prose), mode
separation and structural validation from
[`conorbronsdon/avoid-ai-writing`](https://github.com/conorbronsdon/avoid-ai-writing),
check-only operation from
[`tornikegomareli/agent-rules`](https://github.com/tornikegomareli/agent-rules),
and genre-sensitive voice precedence from
[`blader/humanizer`](https://github.com/blader/humanizer). See the repository
license for attribution.

`writing-for-agents` deliberately reuses the name of Matt Pocock's
[`writing-for-agents`](https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-for-agents)
and adapts its conceptual vocabulary: the two loads, context pointers, the
information hierarchy, completion criteria, leading words, and the pruning
discipline. It extends that base with the failure-form taxonomy,
rationalization tables, baseline-first testing, and wording micro-tests from
[`obra/superpowers`](https://github.com/obra/superpowers) `writing-skills`, and
with the layout conventions, three-level loading model, eval-set shape, and
no-surprise principle from Anthropic's
[`skill-creator`](https://github.com/anthropics/skills). Where those sources
conflict — what a skill `description` should contain, and how strict the testing
gate should be — the skill states the conflict and resolves it rather than
picking a side silently. No upstream skill file is vendored.

`code-review` preserves the useful Standards and Spec separation from Matt
Pocock's
[`code-review`](https://github.com/mattpocock/skills/tree/main/skills/engineering/code-review)
while adding a defect-first finding gate, explicit review levels, and
independent validation for deep reviews. Its merge-base and contextual review
discipline is informed by
[`openai/codex`](https://github.com/openai/codex), and its deep parallel-pass
shape is informed by
[`anthropics/claude-code`](https://github.com/anthropics/claude-code). No
upstream skill file is vendored; the instructions are maintained here.

The engineering execution suite is an original synthesis of the implementation,
TDD, debugging, and verification families in
[`mattpocock/skills`](https://github.com/mattpocock/skills),
[`obra/superpowers`](https://github.com/obra/superpowers),
[`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills),
[`wshobson/agents`](https://github.com/wshobson/agents), and the relevant
MIT-licensed subtrees of [`cursor/plugins`](https://github.com/cursor/plugins).
It keeps execution coordination, red-green-refactor, root-cause diagnosis, and
completion proof as separate composable owners. No upstream skill files or
templates are vendored; each human-facing page links its pinned research record.

Planning, research, security review, prototyping, and handoff extend that workflow
using the [preferred-source ecosystem research](docs/research/preferred-skill-repositories-workflow-gap-research.md).
The new instructions use original wording and preserve one owner per outcome.

`simplify` adds a behavior-preserving cleanup entry point, informed by the
[six-source comparison](docs/research/simplify-skill-research.md). Its instructions
and evaluation fixtures are maintained here; no upstream skill file is vendored.

`skill-evolve` adds an evidence-gated loop for improving skills from session
experience, informed by the
[skill-evolution research](docs/research/2026-10-26-skill-evolution.md), which
covers all fifteen preferred repositories. No upstream skill file is vendored.

The ADLC suite follows the artifact-and-gate lifecycle described in Anthropic's
[AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook),
with per-work-item folders informed by the Conductor plugin in
[`wshobson/agents`](https://github.com/wshobson/agents). It composes the local
`grilling` and `planning-and-task-breakdown` skills; the
[ADLC research](docs/research/2026-09-26-adlc.md) records every preferred source
consulted. No upstream skill file is vendored.

</details>
