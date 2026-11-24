# Preferred Source Repositories: Delta Sweep

**Research date:** 2026-11-16
**Window:** 2026-10-06 through 2026-11-16, following
`2026-10-06-source-repos-sweep.md`
**Scope:** all 15 repositories in `docs/source-repos.md`. `humanlayer/skills`
and `testdouble/han` joined the list after the last sweep. Later single-skill
reports sampled them, but this is their first full read.
**Method:** fresh blobless clones. For each repository:
`git log --since=2026-10-06`, then
`git diff --name-status <last commit before 2026-10-06> HEAD -- '*SKILL.md'`, then
reads of every added skill and every substantive skill diff. For `testdouble/han`,
which had no commits in the window, the skills that overlap local ones were read
in full.
**Boundary:** the source list was not changed. Every local skill was checked
against the findings. The changes are listed under Applied.

## Activity and revisions

| # | Repository | Revision read | Commits | Skill changes in window |
|---|---|---|---|---|
| 1 | mattpocock/skills | `5863806` | 51 | New `in-progress/software-factory`; `chief-of-staff` wiki rules; small edits to `grilling`, `tdd`, `diagnosing-bugs`, `code-review`, `implement`, `implement-spec`, `to-tickets`, `wayfinder`, `handoff`; `SCOPE.md` |
| 2 | obra/superpowers | `22f0b46` | 4 | `brainstorming` rebuilt; `subagent-driven-development` split into references (fix loop, pre-flight, batching, final review); `writing-skills` split into references |
| 3 | addyosmani/agent-skills | `39b723c` | 193 | `spec-driven-development` V1 scoping and delta specs; documentation drift and prose review in `documentation-and-adrs`; review and TDD rules; trigger tuning for pasted code |
| 4 | cursor/plugins (pstack) | `bf0c7cd8` | 305 | New `ketchup`, `sharpen`, `in-your-own-words`, `statechart`, formal-verification skills; rewrites of `principle-fix-root-causes`, `principle-test-behavior-not-implementation`, `interrogate`, `poteto-mode` subagent rules; a generated `harness/` copy |
| 5 | DietrichGebert/ponytail | `96608e0` | 58 | `ponytail-review` and `ponytail-audit` rewritten from over-engineering-only to full quality review; installer and band fixes |
| 6 | mvanhorn/last30days-skill | `f32f440` | 242 | `SKILL.md` split from about 2,400 lines into references; engine and source fixes |
| 7 | anthropics/skills | `1780c5e` | 5 | `claude-api`, `mcp-builder`, and Office skills; `skill-creator` unchanged |
| 8 | trailofbits/skills | `149d7b2` | 31 | New `patching-bugs` and `regression-hunt` plugins, `cvss-scoring`, `taint-trace`; tool fixes |
| 9 | EveryInc/compound-engineering-plugin | `ee46dde7` | 189 | New `ce-retro`; changes to `ce-debug`, `ce-compound`, `ce-simplify-code`, `ce-plan`, `ce-work`, `ce-code-review`, `ce-babysit-pr` |
| 10 | garrytan/gstack | `a15a0de7b` | 773 | New `modernize`, `verify`, `write-skill`, `eval-plan`, `runaway-stopper`; `/investigate` retired after a no-gain eval; many `/ship` fixes |
| 11 | affaan-m/ECC | `d2ef2680` | 854 | 21 new skills, including `change-impact`, `story-lifecycle`, `issue-review`, `test-collaboration`; 32 modified |
| 12 | wshobson/agents | `9c61ab2` | 34 | Example fixes, eight oversized skills split, new `social-evidence-research` |
| 13 | nahid-sparktales/agent-dispatcher | `564c3f0` | 0 | None |
| 14 | humanlayer/skills | `4d69d20` | 13 | `rpi` made portable; prose reference and a document-review step |
| 15 | testdouble/han | `abba73a` | 0 | None in window; first full read of `han-planning` and `han-coding` |

## Findings by theme

### 1. Root cause: is the state legitimate, and what would have shown it?

- pstack `principle-fix-root-causes` (rewritten): if the system may be in the
  state that triggered the symptom, the code that broke on it is the root cause;
  if the state should never exist, a check there hides the bug. Guards, retries,
  swallowed errors, and clamped values are the usual hiding places. When the
  deciding fact took a deep dig, propose the cheap always-on signal that would
  have shown it.
- EveryInc `ce-debug` reached the same "always-on signal" rule independently.
  It also adds an issue of record (state its title; never manufacture one), a
  check for an open PR that already fixes the bug, and a design route when no
  fix inside the current design corrects the mechanism.
- Matt Pocock `diagnosing-bugs`: when you force a red by mutation, diff against
  a pristine copy to prove the mutation landed.

**Local fit:** `diagnosing-bugs`, with the forced-mutation rule also in `tdd`.

### 2. Proof of a fix: three arms and blind validators

- Trail of Bits `prove-patch`: the baseline fails, the patch passes, and a full
  revert of the patch fails again. The harness prints a reached-marker before
  the assertion and is blind to which side it runs on. A bounded class needs at
  least two failing representatives and a valid control. An empty "unproven"
  list leaves the result inconclusive.
- `patching-bugs` and `regression-hunt` give each validator the finding and the
  artifacts, never the producer's transcript. `regression-hunt` adjudication
  rejects "S0 passes and S1 fails" as proof of a regression when the change only
  exposed a latent defect, and "nothing reproduced" as a clean review.
- Addy Osmani `code-review-and-quality` independently added: label defects that
  already exist in the base separately from regressions.

**Local fit:** `verification-before-completion` already had the side-blind and
reached-marker rules, so it gains the revert arm and class representatives.
Also `code-review`, `security-review`, and `orchestrate`.

### 3. Subagents start fresh, with consolidated scope

- Matt Pocock changed every subagent call to "a fresh context window, not a
  fork".
- pstack `poteto-mode`: give new work to a fresh subagent with the original
  brief, every later directive, and the prior agent's report and branch.
  Resume an existing agent only when the work needs state that lives in it.
  Interrupt-chained resumes silently drop directives.
- Superpowers `subagent-driven-development` differs. Its fix loop resumes the
  original implementer for rounds 1-3, then uses a fresh, stronger model for
  rounds 4-5. It agrees on the exception: resume when the agent's context is
  the thing you need. Local `orchestrate` follows the two-repository majority
  and keeps that exception.
- Superpowers also adds batching same-shape edits into one dispatch, one fixer
  for a final review's whole findings list, a capped loop after which the
  controller rules on each open finding, and a final "Rulings I made" list with
  the cost of each if wrong.

**Local fit:** `orchestrate`, plus a ruling-cost field in `handoff`.

### 4. Review depth is selected by consequence

- EveryInc `ce-code-review`: an adversarial pass needs a credible failure
  scenario with a material consequence; diff size, paths, and keywords do not
  qualify. A verification mechanism that can go green while the real thing is
  red (CI gates, mocks) never gets the quick path. A race is real when you can
  name independent paths, show nothing serializes them, and give the step
  order. The nearer `CODING_STANDARDS.md` decides a conflict.
- Ponytail rewrote `ponytail-review` from over-engineering only to a full
  quality review: state the load you assumed, grep every caller when a
  signature changes, and give every finding a concrete case.
- pstack `interrogate`: only findings a run proves survive.
- Matt Pocock `code-review`: search the repository for every standards file.

**Local fit:** `code-review` and its deep-review reference, `coding-standards`.

### 5. Plans: one pull request by default, and an evidence gate

- EveryInc `ce-plan`: one PR is the default. Split only when the project
  requires separate approval, a required human reviewer could not review one
  PR, a part must reach production first, or a later part needs an earlier one
  deployed. Different risk, separate rollback, order, and waiting on a decision
  are not reasons.
- testdouble/han `yagni-rule.md`: an item needs evidence that it is needed now,
  then the strictly simpler version wins. Cut items go to a Deferred section
  with a reopen trigger.
- Addy Osmani `spec-driven-development` reached the same deferred list (Out of
  Scope, Deferred) independently, and adds delta specs for changes to shipped
  behavior.

**Local fit:** `planning-and-task-breakdown`, `codebase-design`, `adlc-spec`,
`adlc-plan`.

### 6. Measurements and evals: decide before you run

- pstack `principle-explain-the-number` now starts with "write the decision
  before you run" and a noise floor.
- gstack `eval-plan`: if every result leads to the same action, do not run.
  The judge comes from another model family and is checked against hand labels.
  The comparison is paired. Any count that may be reported as zero needs a
  planted case. The terms are frozen before the first priced call, and stacked
  arms are compared with a no-skill arm. gstack then retired `/investigate`
  after such an eval showed no gain.
- EveryInc `ce-retro`: weigh a change's cumulative cost across sessions against
  what the fix costs from then on. A new always-loaded line is paid for in every
  session. Proposing nothing is a complete retro.

**Local fit:** `verification-before-completion` `MEASURED-CLAIMS.md`,
`prototype`, `skill-evolve`.

### 7. Smaller items

| Source | Finding | Local skill |
|---|---|---|
| Matt Pocock `grilling`, EveryInc `ce-plan` | Word a yes-or-no question so "yes" accepts the recommendation | `grilling` |
| Superpowers `brainstorming` | Ask only when the answer would change what gets built; otherwise state the call as a proposal | `grilling` |
| Superpowers `brainstorming`, pstack `in-your-own-words` | Restate the request in your own words before asking | `adlc-intent` |
| Matt Pocock `tdd`, EveryInc `ce-debug` | One line per proposed seam on what it catches and misses | `tdd` |
| pstack `principle-test-behavior-not-implementation` | Judge a test by two imagined edits: break the behavior, change the internals | `tdd` |
| Addy Osmani `test-driven-development` | Crash and rollback tests exercise the real boundary | `tdd` |
| Matt Pocock `implement`, EveryInc `ce-debug` | Fetch a passed ticket and state its title | `implement` |
| gstack `verify` | A red is pre-existing only if it was red before the first edit | `implement` |
| EveryInc `ce-work` | A progress update does not end the run | `implement` |
| ECC `change-impact`, gstack `verify` | Compare the delivered diff with the declared scope; an unexercised change is a gap | `ship-it`, `adlc-flow` |
| gstack `modernize` | Conceptual conflicts in untouched files; merge commits a rebase drops; explain every range-diff hunk | `git-workflow` |
| gstack uninstall fixes | Locked and nested worktrees; recheck before deleting | `git-worktrees` |
| EveryInc `ce-babysit-pr` | Base movement does not reset the quiet window; an announced reviewer has only started; an unread lookup is not "no review" | `babysit-pr` |
| EveryInc `ce-simplify-code`, Ponytail | Protect proof tests; prune hollow tests and redundant comments; split by job, not line count | `simplify` |
| EveryInc `ce-compound` | Capture candidates come from corrected wrong beliefs | `compound-learnings` |
| Addy Osmani `documentation-and-adrs` | Decide doc drift by commit ancestry; "can't tell" is never "current" | `compound-learnings` |
| Matt Pocock `chief-of-staff` | Date claims and cite the commit they were true at | `compound-learnings` |
| testdouble/han `evidence-rule.md` | Trust classes, corroboration gate, "no evidence" label | `research` |
| Matt Pocock `to-tickets`, `wayfinder` | Blockers first, native links, sub-issues, real IDs in a second pass | `sprint-planning` |
| pstack `typescript-best-practices` | A brand comes from a checking type guard, never a cast | `coding-standards` |
| gstack `write-skill` | Fix below the skill first; the tool's errors as a level; edit before append; size before and after | `writing-for-agents` |
| humanlayer `rpi` `prose.md`, pstack `ketchup` | Real names, no coined labels, clear referents | `writing-for-humans` |
| pstack `ketchup` | Catch-up shape: what waits on the reader, then each decision made decidable from the message | `writing-for-humans`, `handoff` |
| gstack write-up checklist, humanlayer `rpi` review step | Two or three plain takeaways; each visual beside its text | `html-writeup` |
| Addy Osmani (several skills) | Triggers fire on pasted inline diffs and stack traces | `code-review`, `diagnosing-bugs` descriptions |

## Not applicable this window

| Repository | Reason |
|---|---|
| mvanhorn/last30days-skill | Engine, source, and packaging work; the `SKILL.md` split into references is a layout already used locally. No change to `research`'s routing of recent evidence. |
| anthropics/skills | `claude-api`, `mcp-builder`, and Office skills have no local owner. `skill-creator` is unchanged. |
| wshobson/agents | Example corrections and skill splits. Its `git reset --hard` warning is already covered by `git-workflow` recovery. |
| nahid-sparktales/agent-dispatcher | No commits since 2026-09-29. |
| ECC (most of it) | Language, framework, and harness skills, plus `story-lifecycle` and `issue-review`, which overlap `sprint-planning` and `research` without adding anything those lack. `change-impact` is used above. |
| Matt Pocock `software-factory` | A glossary for designing agent factories; no local owner. Its "start slow, cap every loop" rule is already in `babysit-pr` budgets. |
| Superpowers `writing-skills` | The "match the form to the failure" table was already adopted in `writing-for-agents` from its June version. |
| pstack `statechart`, formal-verification skills, Trail of Bits `cvss-scoring`, `taint-trace` | Specialised tooling with no local owner. |

## Applied

| Local skill | Change | Main sources |
|---|---|---|
| `diagnosing-bugs` | Issue of record and prior-fix check; prove a forced mutation landed; legitimate-state test; always-on signal; design route; pasted-trace trigger | pstack, EveryInc, Matt Pocock, Addy Osmani |
| `tdd` | Seam catches/misses note; real-boundary crash and rollback tests; two imagined edits; prove a forced break landed | pstack, Matt Pocock, EveryInc, Addy Osmani |
| `code-review` | Every standards file, nearer one wins; caller check; no `quick` for verification mechanisms; `deep` only for a stated material scenario; exposed latent defects; race and lifecycle-state test; assumed load; run-proven, reasoning-blind deep validation | EveryInc, Ponytail, Trail of Bits, pstack, Addy Osmani, Matt Pocock |
| `orchestrate` | Fresh-context workers with consolidated scope; batching; one fixer per review; blind verifier; capped fix loop with rulings; rulings list with cost | Matt Pocock, pstack, Superpowers, Trail of Bits |
| `implement` | Ticket fetch; pre-existing failure test; keep going until done | Matt Pocock, EveryInc, gstack |
| `planning-and-task-breakdown` | Evidence gate and Deferred list; one-PR delivery shape | han, Addy Osmani, EveryInc |
| `verification-before-completion` | Revert arm; class representatives; empty-gaps rule; decision-first measurement; four eval checks | Trail of Bits, pstack, gstack |
| `grilling` | "Yes" accepts the recommendation; non-decisions become proposals | Matt Pocock, EveryInc, Superpowers |
| `simplify` | Split by job; protected proof tests; hollow tests and redundant comments | Ponytail, EveryInc |
| `compound-learnings` | Capture trigger; ancestry-based drift; `verified_at` field | EveryInc, Addy Osmani, Matt Pocock |
| `git-workflow` | Conceptual conflicts; merge commits; range-diff explanation | gstack |
| `git-worktrees` | Locked and nested worktrees; recheck before deletion | gstack |
| `babysit-pr` | Quiet window, announced reviewers, unread lookups | EveryInc |
| `research` | Trust classes, corroboration gate, no-evidence label | han |
| `security-review` | Reports as data; exposed latent defects; novelty check; unreproduced is unresolved | Trail of Bits |
| `ship-it` | Scope comparison; unexercised change is a gap | ECC, gstack |
| `prototype` | Skip an experiment that cannot change the decision | pstack, gstack |
| `codebase-design` | Simpler-version rule | han |
| `coding-standards` | Standards search and conflict rule; brands via type guard | EveryInc, Matt Pocock, pstack |
| `sprint-planning` | Ticket creation order and real cross-references | Matt Pocock |
| `handoff` | Ruling cost; decidable items for a person | Superpowers, pstack |
| `adlc-intent` | Restate before asking | Superpowers, pstack |
| `adlc-spec` | Deferred out-of-scope items; changes to delivered specs | Addy Osmani |
| `adlc-plan` | Delivery shape in the handoff | EveryInc via `planning-and-task-breakdown` |
| `adlc-flow` | Unapproved-scope check before completion | ECC |
| `writing-for-agents` | Tool level on the ladder; edit before append; size report | gstack |
| `writing-for-humans` | Coined labels and referents; catch-up genre | humanlayer, pstack |
| `html-writeup` | Takeaways; visuals beside their text | gstack, humanlayer |
| `skill-evolve` | Current-version check; cost weighing; judge spot-check; no-skill arm | EveryInc, gstack |

### Unchanged, with reasons

- `adlc-gate`: no source in the window touched approval or sign-off recording.
- `pr-description`: EveryInc's screenshot decision and link preservation are
  already covered by the before/after evidence and "preserve existing issue
  links" rules.
- `property-based-testing`: Trail of Bits' `property-based-testing` plugin had
  no commits, and no other source changed property-testing guidance.

## Limits

These are instruction-text changes. `npm run check` validates metadata,
publication entries, links, and eval structure. It does not show that agents
behave differently. No paired scenario evaluations were run for this sweep.
The new rules are untested against the incumbents until someone runs
`skill-evolve` on them.
