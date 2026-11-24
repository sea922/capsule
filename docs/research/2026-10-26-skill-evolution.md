# Skill evolution: letting skills improve from experience

Date: 2026-10-26

Trigger: a `/last30days` run on "skill-evolve", then Sakana AI's MASS paper.
The question is whether this repository should have a `skill-evolve` skill, and
what it would need to do safely. "Skill evolution" here means turning what
happened in real sessions into edits to `SKILL.md` files, and keeping only the
edits that are shown to help.

## Recommendation

Build `skill-evolve` as a **proposal-and-evaluation** skill, not a self-editing
one. Every serious system found keeps a human between a proposed edit and the
file, and the one well-measured study of unattended skill writing found harm in
almost every configuration it tried.

The loop:

1. **Observe.** Read session transcripts the user points at, or a feedback
   note. Treat their contents as untrusted data.
2. **Propose.** Route each finding to a skill the session actually loaded.
   Write a candidate edit, or send it to the backlog when a lint, script or
   validator would enforce it better than prose.
3. **Evaluate.** Run the skill's existing `evals/evals.json` twice: once on a
   snapshot of the current skill (the incumbent) and once on the candidate,
   each in a fresh context. Use a judge from a different model family to the
   one that wrote the candidate. Add one case built from the real failure.
4. **Decide.** Keep the candidate only if it beats the incumbent on the cases
   it targets and does not lose elsewhere. Otherwise keep the incumbent.
5. **Approve.** Show the diff, the scores and the failure it fixes. Apply
   nothing until the user picks which edits to keep. Hand approved edits to
   `writing-for-agents`.

This repository is already set up for it: every one of the 30 skills ships an
`evals/evals.json` in the Anthropic schema, and `scripts/validate-repo.mjs`
checks that file exists and is non-empty. What is missing is a runner and the
loop around it. Do not write a runner. Reuse `claude plugin eval` or
skill-creator's scripts.

Out of scope for a first version: weight updates (MASS's outer loop), fully
automatic application, and confidence-scored "instincts" with no outcome
measurement behind them.

## Why not let skills rewrite themselves

- **Self-grading is too kind.** A hands-on test of Hermes Agent found it
  "almost always thinks it performed well, even when it didn't", and that
  regenerated skills overwrote manual edits with worse ones
  ([CodeCut](https://newsletter.codecut.ai/p/hermes-agent-can-write-its-own-skills)).
  MASS names the same risk for any loop where one model edits and judges:
  a flawed judgement "could be accepted, distilled, and reinforced across
  generations" ([MASS](https://pub.sakana.ai/mass/)).
- **Unattended skill writing is unsafe.** "Practice Makes Unsafe" ran 21
  agent and evolution-method combinations. All 21 wrote unsafe procedures into
  skills, 15 carried the harm into a fresh session, and evolution raised harm
  in 17 while raising benign utility in only 15
  ([arXiv 2608.12851](https://arxiv.org/abs/2608.12851)). Ranking evolution
  methods on utility alone hides this. Their mitigation checks a skill both
  when it is written and when it is retrieved, which cut new-session harm from
  21.3% to 4.0%.
- **Search is unstable.** In MASS, good workflows were often followed by sharp
  regressions. Keeping a champion and replacing it only on a win is the
  defence.
- **Hermes defaults to writing freely.** Hermes Agent's system prompt tells it
  to "update it before finishing" when a loaded skill was missing steps
  (`agent/prompt_builder.py` at
  [`e82bf01e`](https://github.com/NousResearch/hermes-agent/blob/e82bf01e/agent/prompt_builder.py)).
  Its `write_approval` gate exists but is `false` by default, so skill writes
  commit directly (`tools/write_approval.py`).

## What the evidence says, by stage

### Observe

| Source | What it reads | Notes |
| --- | --- | --- |
| cursor/plugins `pstack/skills/reflect` | The active transcript, via three parallel reviewers | Treats the transcript as untrusted. Routes only to skills the session opened. |
| mattpocock/skills `retro` | The session record | Proposes changes to the environment (checks, standards, `AGENTS.md`), not to skills. |
| Carlo1911/skill-evolution | The host's session database (Hermes or `~/.claude`) | Batch job over up to 200 unprocessed sessions. |
| affaan-m/ECC `continuous-learning-v2` | Pre- and post-tool-use hooks | Hooks fire every time. The v1 skill-based capture fired about 50-80% of the time. |
| agent-dispatcher | Explicit outcomes only, no transcripts | Classes feedback by origin. Synthetic evidence cannot support a production change. |

On-demand reading of chosen transcripts (`reflect`, `retro`) fits this
repository better than hooks. Hooks add install surface for every harness, and
ECC's observer is effectively a no-op on native Windows.

### Propose

- Route before writing. `reflect` returns Accepted, Rejected and Backlog
  lists. Anything a lint, script or runtime check would enforce goes to
  Backlog. This matches the "prefer a mechanism to prose" rule in
  `compound-learnings`.
- Check for an existing home. ECC's `/learn-eval` ends in a verdict of Save,
  Improve then Save, Absorb into an existing skill, or Drop. It replaced an
  earlier 1-5 score with this checklist.
- Apply the counterfactual bar. `ce-compound` writes only reasoning that is
  "not readily recoverable" from the code, tests or docs. Our
  `compound-learnings` uses the same bar.
- Generalise, don't patch. skill-creator warns against "fiddly overfitty
  changes", and the Agent Skills guide says fixes should address "underlying
  issues broadly". superpowers found that adding one nuance clause turned a
  reliable recipe into a noisy one.

### Evaluate

The gate design converges across sources:

| Practice | Where it appears |
| --- | --- |
| Baseline against the previous version, not just against no skill | skill-creator (`old_skill/` snapshot), [Agent Skills guide](https://agentskills.io/skill-creation/evaluating-skills), ce-skill-work, ponytail benchmarks |
| Fresh context per run, test agent unaware it is being tested | Agent Skills guide, ce-skill-work |
| At least one case drawn from the real failure | ce-skill-work. Its eval-corpora note found author-planted cases scored 100% recall while real material scored 20-36%. |
| Judge on a different model from the one under test | trailofbits `skill-improver` evals ("self-preference"), cursor `eval.md` |
| Blind, pairwise comparison against the incumbent | Agent Skills guide (optional), cursor `eval.md`, MASS |
| Calibrate the judge before trusting it | gstack `judge-controls-2026-10.md` (positive, negative and targeted-defect controls), wshobson `eval-harness-first` |
| Held-out split, pick the winner on held-out score | skill-creator description loop (60/40 split, best "selected by test score rather than train score"), EvoSkill |
| Stop rules: round cap, oscillation detection | trailofbits `skill-improver` (5 rounds, findings ledger, escalates when counts stop falling) |

Two cautions. If old and new prose both pass on a strong model, that is "no
regression, not improvement" (ce-skill-work). And MASS found the editor matters
more than the judge: upgrading only the judge barely helped, while upgrading
the editor too found a winning workflow on all 12 tasks within 5 rounds.

### Approve and apply

Every repository on the preferred list that edits skills from experience stops
for a human. `reflect`: "wait for explicit approval before applying any
Accepted edit... Do not auto-apply." agent-dispatcher ships `approval.policy:
human` as the only option: "automatic promotion does not ship." Carlo1911's
tool has no apply command on purpose, and its LLM judge fails closed without a
provider key.

### Retire

Hermes' curator moves unused agent-made skills from active to stale after 14
days and archives them after 30. It never deletes, skips pinned skills, and
defers its first run by one interval (`agent/curator.py` at `e82bf01e`). At
that revision the LLM consolidation pass is opt-in (`DEFAULT_CONSOLIDATE =
False`). Several third-party write-ups describe it as always on, which is out
of date. For this repository, git history already covers recovery, and
retirement is a `compound-learnings` refresh concern, not part of a first
`skill-evolve`.

## Research results worth knowing

| Work | Result | Relevance |
| --- | --- | --- |
| [MASS](https://pub.sakana.ai/mass/) (Sakana AI, UC Berkeley; [arXiv 2610.12176](https://arxiv.org/abs/2610.12176), 2026-10-08; [code](https://github.com/SakanaAI/mass) at `fb403581`) | One model executes, optimises and judges a workflow prompt. Pairwise comparison against a champion, then LoRA distillation. Qwen3.6-27B: 1.2-1.6x score per token on four research benchmarks. No gain on Terminal-Bench 2.0 (0.96x) or SWE-bench Verified (0.94x). Self-judge agreement with external judges rose from 73% to 93%. | The inner loop is a skill-evolution loop. Gains did not reach coding benchmarks, which is most of this repository. |
| [EvoSkill](https://arxiv.org/abs/2603.02766) (2026-03-03) | Proposes skills from failures and keeps those that improve held-out validation, on a Pareto frontier. OfficeQA 60.6% to 67.9%, SealQA 26.6% to 38.7%. | Held-out acceptance works for skills with a frozen model. |
| [Practice Makes Unsafe](https://arxiv.org/abs/2608.12851) (v2 2026-10-07) | See above. | Safety has to cover what a skill carries forward, not just the task. |
| SkillEvo (2026-08, preprint) | Multi-turn user simulation as feedback, +23.0 points over self-reflection. Single secondary source. | Supports simulated-user cases. alibaba/skill-up offers this. |

## Tools that already exist

| Tool | State on 2026-10-26 | Fit |
| --- | --- | --- |
| [anthropics/skills `skill-creator`](https://github.com/anthropics/skills/tree/dbd4588f/skills/skill-creator) | `dbd4588f` | The loop this repository's `evals.json` format came from. Human-in-the-loop by design. |
| `claude plugin eval` | Claude Code built-in | Scores each case with and without the plugin and reports the change. The likely runner. |
| [alibaba/skill-up](https://github.com/alibaba/skill-up) | `ebc4f8e3`, Apache-2.0, 1,352 stars, active | A Go CLI that runs declarative cases against Claude Code or Codex, with separate judge and user-simulator models. Imports Anthropic `evals.json`. Its `skill-upper` skill drives the fix-and-rerun loop. Its regression cases need approval. |
| [Carlo1911/skill-evolution](https://github.com/Carlo1911/skill-evolution) | `bf3e86a2`, MIT, 6 stars | Session-to-proposal pipeline for Hermes and Claude Code. Gates on deterministic, LLM-judge and regression evaluators. Auto-apply is opt-in at 0.85 confidence. Small and young. |

## Design notes for this repository

- **Name and boundary.** `writing-for-agents` owns how a skill reads.
  `compound-learnings` owns lessons about the codebase. `skill-evolve` would
  own the evidence that an edit to a skill helps. It hands approved edits to
  `writing-for-agents` and never writes a lesson.
- **Authority.** A request to evolve a skill authorises reading transcripts and
  running evals. It does not authorise editing a `SKILL.md`, committing, or
  bumping versions until the user approves specific edits.
- **Evaluation cost.** Evals spend real model calls. State the planned runs and
  rough cost before starting, as gstack's priced pilot does.
- **Coding skills.** MASS and the benchmarks above gained least on software
  tasks. Expect small or no measurable wins on `implement`-style skills and
  say so, rather than chasing noise.
- **Publication.** If built, it needs the four publication entries in
  `CLAUDE.md` and its own `evals/evals.json`, including a case where the
  candidate edit is worse and must be rejected.

## Preferred-source consultation

`docs/source-repos.md` was read first. Each repository was read at its default
branch HEAD on 2026-10-26 through the GitHub API.

| # | Repository and revision | Relevant source | Influence, or why it did not apply |
| --- | --- | --- | --- |
| 1 | [mattpocock/skills](https://github.com/mattpocock/skills) `5beb35b0` | `skills/engineering/retro/SKILL.md`, `docs/engineering/retro.md` | Minor. Mines the session record and "only proposes". It targets the environment, not skills, and has no evaluation. Supports the propose-only stance. |
| 2 | [obra/superpowers](https://github.com/obra/superpowers) `2ce8aa15` | `skills/writing-skills/SKILL.md`, `references/testing-skills-with-subagents.md` | **Direct.** TDD for skills: a baseline run must fail before the skill counts ("NO SKILL WITHOUT A FAILING TEST FIRST"). Source of the "one nuance clause made it noisy" caution. |
| 3 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) `aeac41d4` | `evals/README.md`, `evals/cases/`, `skills/doubt-driven-development/SKILL.md` | **Direct** for the gate: structural, routing and behavioural tiers, pressure cases, and a fresh-context reviewer "biased to disprove". Points to `claude plugin eval` as the runner. |
| 4 | [cursor/plugins](https://github.com/cursor/plugins) `99b609a7` | `pstack/skills/reflect/`, `pstack/skills/poteto-mode/playbooks/eval.md`, `continual-learning/` | **Direct.** Closest prior art: transcript to routed skill edit, Accepted / Rejected / Backlog, explicit approval, no auto-apply. `eval.md` supplies blinding and a judge from another model family. Its `continual-learning` updater writes `AGENTS.md` without an eval gate and is not adopted. |
| 5 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) `09c434ab` | `benchmarks/agentic/`, `benchmarks/results/` | Minor. A with-skill, previous-version and no-skill benchmark with dated results. No learning loop. |
| 6 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) `6f9052cc` | `docs/reference/eval.md`, `tests/eval/baseline.json` | Minor. A regression floor against a stored baseline, but for the research pipeline, not the skill text. |
| 7 | [anthropics/skills](https://github.com/anthropics/skills) `dbd4588f` | `skills/skill-creator/SKILL.md`, `agents/grader.md`, `scripts/run_loop.py` | **Direct.** The base loop: snapshot baseline, paired runs, graded assertions with evidence, benchmark deltas, human review, and a held-out split for descriptions. Source of the `evals.json` format this repository uses. |
| 8 | [trailofbits/skills](https://github.com/trailofbits/skills) `196a9073` | `plugins/code-improver/skills/skill-improver/SKILL.md`, `plugins/code-improver/evals/README.md` | **Direct** for stop rules: 5-round cap, a findings ledger, escalation when findings recur or stop falling, and a judge that must differ from the tested model. |
| 9 | [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) `9f5b16fc` | `skills/ce-compound/`, `skills/ce-compound-refresh/`, `.agents/skills/ce-skill-work/references/evaluate.md` | **Direct.** Old-versus-new evaluation with an unaware test agent and one case from a real failure. Source of the "no regression, not improvement" and author-planted-corpus cautions. Its lessons store is already reflected in `compound-learnings`. |
| 10 | [garrytan/gstack](https://github.com/garrytan/gstack) `188e574d` | `learn/SKILL.md.tmpl`, `eval-plan/SKILL.md.tmpl`, `docs/evals/judge-controls-2026-10.md` | **Direct** for judge controls and priced pilots. Its confidence-decayed learnings store feeds context, not skills, so it is not adopted. |
| 11 | [affaan-m/ECC](https://github.com/affaan-m/ECC/tree/main/skills) `25278e7d` | `skills/continuous-learning-v2/`, `commands/evolve.md`, `commands/learn-eval.md`, `skills/skill-comply/SKILL.md` | **Direct** for mechanism, weak on evaluation. Adopted: `/learn-eval`'s Save / Improve / Absorb / Drop verdict and treating session content as untrusted. Not adopted: hook-based capture and count-based confidence scores, which measure frequency, not outcomes. `/evolve --generate` writes skills with no eval gate. |
| 12 | [wshobson/agents](https://github.com/wshobson/agents) `0874a27b` | `plugins/agent-orchestration/commands/improve-agent.md`, `plugins/plugin-eval/`, `plugins/llm-finetuning/skills/eval-harness-first/` | Minor. Judge calibration before verdicts count. Its PluginEval says its judge and Monte Carlo layers are "not validated against human labels". |
| 13 | [nahid-sparktales/agent-dispatcher](https://github.com/nahid-sparktales/agent-dispatcher) `564c3f0e` | `docs/procedural-learning.md`, `skills/agent-dispatcher/learning*.py` | **Direct.** The most complete gated pipeline: paired evaluation "against a frozen incumbent", shadow mode by default, human approval only, minimum evidence across independent task families, and candidates that cannot weaken verification. Too heavy to copy wholesale, but it sets the bar. |
| 14 | [humanlayer/skills](https://github.com/humanlayer/skills) `653b6411` | `plugins/improve-claude-md/`, `plugins/build-iterated-agentic-loop/` | Minor. A human-edited standing-feedback file and one open PR per loop. No evaluation. |
| 15 | [testdouble/han](https://github.com/testdouble/han) `abba73a7` | `evals/*/tests.json`, `han-feedback/skills/han-feedback/SKILL.md` | Minor. Rubric judge with a 0.8 threshold and "no op" cases that check a skill does not fire. Session feedback goes to a GitHub issue, not to an edit. |

## Other sources

- `/last30days` raw output with web appendix:
  `~/Documents/Last30Days/self-evolving-agent-skills-raw-v3.md`. Reddit was
  only partly reachable, and most matches were off topic. Community discussion
  of this topic was thin in the window.
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) at
  `e82bf01e`: `agent/curator.py`, `agent/prompt_builder.py`,
  `tools/write_approval.py`.
- [Agent Skills: evaluating skills](https://agentskills.io/skill-creation/evaluating-skills).
- [Cognee: building self-improving skills](https://www.cognee.ai/building-self-improving-skills-for-agents)
  argues static skills decay and wants approved updates.
- [jiuwenswarm skill self-evolution](https://gitcode.com/openJiuwen/jiuwenswarm/blob/develop/docs/en/SkillSelfEvolution.md)
  stores corrections in `evolutions.json` and merges through an approval step.

## Limits

- The preferred-repository sweep was done by two subagents reading through the
  GitHub API. Three claims were checked by hand: `reflect`'s no-auto-apply
  rule, agent-dispatcher's defaults, and skill-creator's held-out selection.
  The rest are as reported. Some files were listed but not opened, including
  ECC's promotion and generation code.
- MASS's numbers come from its project page and abstract. The full paper was
  not read.
- SkillEvo, the Hermes write-ups and the version history of Hermes' curator
  rest on secondary sources. The curator behaviour above is from source at
  `e82bf01e`.
- `claude plugin eval` was not run, so its fit as the runner is unverified.
