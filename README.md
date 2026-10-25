# capsule


capsule: an agent skills library.

Start with the [workflow map](docs/workflow.md) to choose an entry point and see how the skills compose.

See [contribution and validation guidance](CONTRIBUTING.md) for local setup and
release checks, and [security reporting](SECURITY.md) for vulnerability reports.

## Skills

### User-invoked

- [adlc-flow](docs/adlc/adlc-flow.md) — verify the approval chain and route work
  from its evidenced stage to the next command or declared delivery endpoint.
- [adlc-intent](docs/adlc/adlc-intent.md) — interview the human and record the problem,
  outcome, and success signal before agents build.
- [adlc-spec](docs/adlc/adlc-spec.md) — turn approved intent into observable behavior
  and numbered, verifiable acceptance criteria.
- [adlc-plan](docs/adlc/adlc-plan.md) — plan covered, assigned slices with separate
  verifiers and rollback from an approved spec.
- [adlc-gate](docs/adlc/adlc-gate.md) — record revision-bound human sign-off with
  portable content hashes, explicit conditions, and freshness checks.

### Model-invoked

- [babysit-pr](docs/engineering/babysit-pr.md) — carry an existing PR through review
  feedback, CI repairs, and verified completion with resumable monitoring.
- [codebase-design](docs/engineering/codebase-design.md) — design cohesive modules,
  evidence-gated abstractions, intentional dependency direction, and explicit
  inter-module contracts.
- [code-review](docs/engineering/code-review.md) — review changes at quick, standard, or
  deep depth with a bounded default and evidence-backed findings.
- [coding-standards](docs/engineering/coding-standards.md) — apply project conventions
  with shared rules and conditional backend and frontend guidance.
- [compound-learnings](docs/engineering/compound-learnings.md) — capture durable
  engineering lessons past a counterfactual bar and refresh the store against current code.
- [diagnosing-bugs](docs/engineering/diagnosing-bugs.md) — prove a root cause through
  reproduction, competing hypotheses, and discriminating evidence before a fix.
- [git-workflow](docs/engineering/git-workflow.md) — make focused commits, manage
  branches, rebases, stacks and backports, and recover interrupted Git state.
- [git-worktrees](docs/engineering/git-worktrees.md) — select, prepare, retire, and
  recover isolated checkouts without displacing another task's work.
- [grilling](docs/productivity/grilling.md) — stress-test a consequential or ambiguous
  plan, decision, or idea through a live, dependency-aware interview.
- [handoff](docs/productivity/handoff.md) — preserve verified task state across a pause,
  pickup, or transfer between sessions, harnesses, directories, or people.
- [html-writeup](docs/authoring/html-writeup.md) — build and verify a self-contained HTML document
  with diagrams, tables, and code, verified in a real browser.
- [implement](docs/engineering/implement.md) — execute authorized changes in coherent,
  repository-safe slices and hand off fresh completion evidence.
- [orchestrate](docs/engineering/orchestrate.md) — route bounded work to native
  Claude Code or Codex agents with task-appropriate models and verified integration.
- [planning-and-task-breakdown](docs/engineering/planning-and-task-breakdown.md) — turn clear
  requirements into verifiable slices, dependencies, and a ready frontier.
- [pr-description](docs/engineering/pr-description.md) — write outcome-led PR titles
  and bodies from the final diff, with a visual summary, before/after evidence, and
  a merge-danger section.
- [property-based-testing](docs/engineering/property-based-testing.md) — find strong
  properties and generators, avoid vacuous tests, and triage shrunk counterexamples.
- [prototype](docs/engineering/prototype.md) — answer one design or feasibility question
  with a small, reproducible experiment.
- [research](docs/engineering/research.md) — investigate questions with primary sources,
  revision-aware citations, and explicit evidence gaps.
- [security-review](docs/engineering/security-review.md) — assess trust boundaries and
  concrete abuse paths through a scoped, read-only security review.
- [ship-it](docs/engineering/ship-it.md) — carry finished changes through delivery
  to an explicit, verified PR, merge, or deployment endpoint.
- [simplify](docs/engineering/simplify.md) — reduce code complexity in a scoped pass
  while preserving observable behavior and useful boundaries.
- [tdd](docs/engineering/tdd.md) — drive behavior changes through observable red, green,
  and refactor evidence, with example or property tests and bounded practical exceptions.
- [verification-before-completion](docs/engineering/verification-before-completion.md) —
  prove completion claims with fresh, scope-matched evidence and honest verdicts.
- [writing-for-agents](docs/authoring/writing-for-agents.md) — write skills, `AGENTS.md`,
  and `CLAUDE.md` so an agent reaches the right material and takes the same path
  through it every run.
- [writing-for-humans](docs/authoring/writing-for-humans.md) — write and revise clear,
  specific, genre-aware prose while preserving meaning and the author's voice.

## Install

```text
/plugin marketplace add sea922/capsule
/plugin install capsule@capsule
```

## Repository structure

- `skills/` — original skills, added when ready
- `.changeset/` — versioning metadata
- `docs/` — human-facing skill documentation grouped under `adlc/`,
  `engineering/`, `productivity/`, and `authoring/`, with source research under
  `research/`
- `scripts/` — maintainer helpers
- `.claude-plugin/` — Claude Code plugin metadata
- `.github/workflows/` — release automation

## Attribution

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

The ADLC suite follows the artifact-and-gate lifecycle described in Anthropic's
[AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook),
with per-work-item folders informed by the Conductor plugin in
[`wshobson/agents`](https://github.com/wshobson/agents). It composes the local
`grilling` and `planning-and-task-breakdown` skills; the
[ADLC research](docs/research/2026-09-26-adlc.md) records every preferred source
consulted. No upstream skill file is vendored.
