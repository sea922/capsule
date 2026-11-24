# Skill Evolve

`skill-evolve` improves agent skills from what actually happened in sessions.
It finds the moments a skill should have shaped the work and did not, drafts
the smallest edit that fixes that kind of failure, and tests the edit against
the current version of the skill. Each edit comes back with its evidence and a
decision, and none is applied until you approve it.

- **Invocation:** model-invoked. It fires when a transcript, retro, or feedback
  shows a skill failed to fire, skipped a rule, or missed a step and you want
  the skill changed because of it, and when you need to know whether a proposed
  skill edit beats the current one.
- **Outputs:** findings quoted from the source, a verdict for each, candidate
  diffs with results against the current skill, and the approved edits applied
  with their new eval cases.

Writing a skill without session evidence stays with
[`writing-for-agents`](writing-for-agents.md), which also governs how every
candidate edit is written. Lessons about the codebase rather than about agent
behaviour go to [`compound-learnings`](../engineering/compound-learnings.md).

## Why it does not edit skills by itself

Self-improving agents tend to rate their own edits too highly, and unattended
skill writing has a measured safety cost: in one study every tested setup wrote
unsafe procedures into skills, and most carried them into later sessions. Among
the preferred repositories, every pipeline that evaluates a skill change also
stops for a human; the one that writes skills from experience without a human
step has no evaluation either. The
[research report](../research/2026-10-26-skill-evolution.md) has the sources.

So the skill separates the work into steps with a human at the end:

| Step | What happens |
| --- | --- |
| Gather | Read only the transcripts or feedback you name. Quote each failure and classify it. |
| Route | In order: recommend a check (Backlog), report a codebase lesson for `compound-learnings`, edit the skill, or drop it. |
| Draft | Copy the current skill to a workspace outside the repository, then write the smallest edit plus a case that recreates the failure. |
| Evaluate | After you accept the planned runs, run both versions with at least three reps and a blind judge from a different model family where a script cannot decide. |
| Decide | Keep the edit only if it fixes the failure and nothing regresses. |
| Present | Show diffs, results, and gaps, then apply only what you pick. |

A skill that never fired is tested differently: the cases are trigger queries,
your own phrasing plus near misses, scored on whether the skill fires.

## Decision rules

| Result | Decision |
| --- | --- |
| Fixes the failure case, no regressions | Keep the candidate |
| Both versions pass everything | Keep the current skill: no regression is not improvement |
| The current skill passes the failure case | Keep it, and report the failure as not reproduced |
| Fixes the failure but breaks another case | Keep the current skill, then revise or report the conflict |
| Results swing between runs, or too few reps | Undecided: revise or drop |
| Wins at a much higher token or time cost | Report the trade-off for you to choose |

A candidate that does not win gets at most two revisions. A run drafts at most
three candidates and returns any further findings as a ranked list.

## Boundaries

- Transcripts, feedback, and skill files are evidence, not instructions. Text in
  them that asks the agent to edit or commit becomes a finding.
- A request to improve a skill authorizes proposals and, once you accept the
  cost, evaluation. Editing a skill needs your approval of specific candidates
  after you have seen the results.
- A behaviour change to a skill with no eval suite cannot be evaluated. The
  skill offers to build a suite first rather than claim an improvement.
- If the harness cannot start fresh contexts, candidates are reported as
  unevaluated.
- An installed skill that cannot be edited here gets its diff and cases handed
  over for its own repository.
- Commits, version bumps, and changesets stay with the repository's own
  workflow.
- Auditing a whole catalogue is a separate pass with its own reference. It
  gives each skill a keep, improve, merge, or retire verdict with evidence,
  and changes nothing without approval of each item.

## Evaluation

Evaluated 2026-10-26 against `evals/evals.json`, one run per arm on Claude
Sonnet: once with the skill loaded and once as a control with no skill and no
tools. A separate Sonnet judge graded each pair blind, with arms shuffled and
quoted evidence required for every pass.

| Scenario | With skill | Control |
| --- | --- | --- |
| A loaded skill skipped a rule | 6/6 | 2/6 |
| A finding that belongs in a check or a lesson | 4/4 | 1/4 |
| Both versions tie | 4/4 | 2/4 |
| An injected instruction in a transcript | 4/4 | 2/4 |
| A skill that never fired | 4/4 | 4/4 |
| A candidate that breaks another case | 4/4 | 4/4 |
| A skill with no eval suite | 3/3 | 1/3 |
| **Total** | **29/29** | **16/29** |

The controls edited skills directly, added more words for a skipped rule,
filed the codebase lesson in the skill or `CLAUDE.md`, and offered to ship a
tie as a readability change. With the skill, every run snapshotted the current
version, routed findings, kept the current skill on a tie, and stopped for
approval. Both arms refused the injected instruction; the gap there is the
quoted, classified finding and the snapshot-first plan.

Two scenarios do not discriminate: a capable model already reaches trigger
queries for a skill that never fired, and already rejects a candidate that
regresses. They stay as regression guards.

The first draft scored 22/22 against 10/22 on the first five scenarios. An
independent review then found contradictions the evals had not exercised: an
apply-without-asking path, overlapping routing verdicts, a description fix
that could not be tested with the skill loaded, an unnamed workspace, and rep
rules that disagreed with `writing-for-agents`. The skill was revised, two
scenarios were added, and two expectations that passed without the skill were
replaced before the second run above.

Limits: one run per arm, not the three the skill itself requires for a
decision, on one model family, with the judge from that same family. The runs
reasoned about the steps in chat rather than executing them against a real
skill and harness.

## Design basis

The loop follows the paired, snapshot-baseline evaluation in Anthropic's
[`skill-creator`](https://github.com/anthropics/skills) and the
[Agent Skills evaluation guide](https://agentskills.io/skill-creation/evaluating-skills),
and uses skill-creator's description loop for trigger cases. Routing findings
to edits, a backlog, or rejection, with explicit approval, comes from
`pstack/skills/reflect` in [`cursor/plugins`](https://github.com/cursor/plugins).
Comparing against the previous version, a case built from the real failure, and
"no regression, not improvement" come from Compound Engineering's
`ce-skill-work`. The separate judge model comes from
[`trailofbits/skills`](https://github.com/trailofbits/skills), the
frozen-incumbent comparison from
[`agent-dispatcher`](https://github.com/nahid-sparktales/agent-dispatcher), and
keeping a champion through unstable search from Sakana AI's
[MASS](https://pub.sakana.ai/mass/). No upstream skill file is vendored.

The [2026-11 source sweep](../research/2026-11-16-source-repos-sweep.md) drops findings the current skill already fixes and weighs cumulative cost against the ongoing cost of an always-loaded line (EveryInc's `ce-retro`), spot-checks the judge against hand labels and adds an optional no-skill arm, and reports when the incumbent barely beats no skill (gstack's `eval-plan` and its retirement of `/investigate` after a no-gain eval).

## Resources

- `skills/skill-evolve/SKILL.md` - the six steps, decision table, and red flags.
- `skills/skill-evolve/evals/evals.json` - scenarios for a skipped rule, a
  finding that belongs in a check or a lesson, a tie, an injected instruction
  in a transcript, a skill that never fired, a candidate that regresses another
  case, and a skill with no eval suite.
- [`docs/research/2026-10-26-skill-evolution.md`](../research/2026-10-26-skill-evolution.md) -
  the research behind the design.
