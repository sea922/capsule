# Skill Ecosystem Sweep A — 2026-08-28 to 2026-09-27

Repos: mattpocock/skills, obra/superpowers, addyosmani/agent-skills, cursor/plugins (pstack/ subtree)

## 1. mattpocock/skills

Activity: 15 non-merge commits in window (48 total incl. merges), all reachable via
`gh api repos/mattpocock/skills/commits?since=2026-08-28T00:00:00Z`. Active repo, real
content changes (not just CI noise).

### NEW: `skills/in-progress/pr/SKILL.md` (added 2026-09-17, commits d75dcf1, 4cfa4cd,
00cf26e, 1615268, d2945f3, 73a3e94, 35f5926, 74ca5fe, c55ee46)

PR-body-writing skill, credited to Dex Horthy/Humanlayer's `show-me` skill. Fixed
3-section template:

```
## Summary        <diagram/diff-sketch/tree>
## Evidence        Before: <screenshot/output/failing test> / After: <passing test>
## Merge Danger    Door: <one-way|two-way>   Blast Radius: <one word>
```

Gives concrete guidance on *which visual to pick* (pseudocode, call tree, component
tree, file tree, mermaid sequence diagram, or diff) and how to shape a diff to match
the topic (component/file-layout/call-tree/state changes).

**Classification: IMPROVEMENT TO EXISTING** — `git-workflow` (references/pr-writing.md,
pr-examples.md). We already cover before/after evidence, diagrams, tables. We are
missing the **"Merge Danger" field** (Door: one-way/two-way + Blast Radius: one word)
as a required, structured risk-communication line in the PR body — this is a concrete,
reusable idea distinct from our general "material compatibility... implications"
prose bullet. Also missing the enumerated visual-type menu (pseudocode/call-tree/
component-tree/file-tree/mermaid/diff) as concrete technique options.
Fold "Merge Danger: Door + Blast Radius" into `references/pr-writing.md` or
`pr-examples.md`.

### CHANGED: `skills/in-progress/retro/SKILL.md` (created 2026-08-24, before window;
substantive edit in-window at commit 0243b6e, 2026-09-15)

Retro is a "suggest improvements to steering files" skill (no direct local owner —
closest is nothing in our list; it's not diagnosing-bugs, it's meta/reflective).
The in-window edit sharpens two of its categories:
- **Automated checks**: read the repo's own check command first; a repo with *no*
  guardrail (no pre-commit hook, no CI lint/typecheck/test job) is itself a finding.
- **Coding standards**: classify a violation as **mechanical** (fixed syntactic
  pattern → gets a deterministic check: linter rule/pre-commit hook/CI job, full
  stop) vs. **judgement call** (reserve `CODING_STANDARDS.md`/prose rules for these
  only). "Default to building the check over writing the rule."

**Classification: IMPROVEMENT TO EXISTING** — `coding-standards`. The mechanical-vs-
judgement classification, with a hard default toward deterministic tooling over
written rules, is a sharp, actionable idea we don't currently state explicitly. Worth
folding into `coding-standards` (or `code-review`) as guidance on when a finding
should become a lint rule/hook instead of a written convention.

### Everything else in window (chores/CI/link-skills housekeeping)

- 3ca18b / 8666e05 (2026-09-03/04): `link-skills` stops linking `misc/` into local
  skill dirs — internal repo tooling, not applicable.
- README/plugin.json bumps — noise.

## 2. obra/superpowers

Activity: only 2 commits in window (both release-tag squash-merges landing months of
prior work): 5bf4e78 (2026-09-19, v6.4.1) and 8ca22db (2026-09-25, v6.4.2). Because
these are squashed releases, "in window" here really means "content that became
visible in window" — treated file-by-file via diff stats.

### NEW: `skills/diagnosing-superpowers/SKILL.md` (120 lines, wholly new in 5bf4e78)

Forensic skill for diagnosing why an *agent session* (not the code) went wrong:
repeated work, ignored plans, cost/token overruns, a skill that never fired. Workflow:
problem intake (one question at a time) → locate session transcripts on disk → dispatch
7 parallel "analyst" subagents (skill-timeline, plan-adherence, repeated-work, stumbles,
quality-evidence, request-conflicts, cost-and-time), each required to cite `path:line`
→ write a report → optionally build a redacted bundle for a GitHub issue. Hard rule:
never diagnoses/proposes a skill fix itself — only reports evidence for a human triager.

**Classification: NEW CAPABILITY (no owner)** — this is categorically different from
our `diagnosing-bugs` (which diagnoses code defects). It diagnoses *agent-session*
behavior. However it is deeply coupled to superpowers' own on-disk session-transcript
format and its own bundle/scrub tooling, so it isn't directly portable — treat as
**inspiration only**: the general pattern (parallel evidence-dimension subagents, each
citation-gated to `path:line`, strict "report don't diagnose/don't fix" boundary) could
inform a future "session retro/forensics" skill if we ever want one, but there's no
clean drop-in target among our current skills.

### CHANGED: `skills/executing-plans/SKILL.md` (+350/-41, "Native plan execution")

Added a full ledger-based inline-execution workflow as an alternative to
subagent-driven-development: `task-start`/`task-done` scripts, a `progress.md` ledger
(shared format with subagent-driven-development so execution mode can switch mid-plan),
mandatory `Ruling: <what> — <why> — <cost if wrong>` lines for any deviation from the
plan, a "completion contract" gate (every step's `Expected:` output actually compared,
final task test run recorded before ledger entry), and a structured final-review flow
that separates Critical/Important (must fix, one pass, test-verified) from Minor
(ledgered as deferred, never auto-fixed).

**Classification: IMPROVEMENT TO EXISTING** — `implement` / `verification-before-
completion`. Two concrete, portable ideas we don't have in this exact form:
1. The **`Ruling: <decision> — <rationale> — <cost if wrong>`** one-line template for
   recording an undocumented-but-necessary deviation transparently (our `implement`
   only says "record the assumption" / "task-scoped scratch ledger" — no fixed format).
2. The **severity-gated final-review handling**: Critical/Important get ONE fix pass
   verified by a fresh failing→passing test; Minor is never auto-fixed, only logged and
   surfaced to the human as "deferred minors" — a clean rule against reviewers/agents
   scope-creeping into unrequested polish.

### CHANGED: `skills/writing-plans/SKILL.md` (+30/-9)

Added: (a) an **Interfaces block** per task (`Consumes:`/`Produces:` — exact
signatures/types) so an implementer who sees only their own task still knows the
neighboring names/types — explicitly targets the "task N calls `clearLayers()`, task
N+3 calls `clearFullLayers()`" class of bug; (b) a **Review Focus** plan section: the
5 input-classes/failure-modes the spec implies but no task's tests exercise, ranked by
likelihood, each wired to a test in its owning task; (c) a **Self-Review checklist**
after writing the plan (spec coverage, step-ambiguity scan, cross-task type
consistency, review-focus completeness, and a **proportion check** — "a plan several
times longer than the spec it implements is a transcript, not a plan"); (d) an
**Execution Handoff** step that makes the user explicitly choose Subagent-driven vs.
Native execution, with the plan author recommending one based on inter-task coupling.

**Classification: IMPROVEMENT TO EXISTING** — `planning-and-task-breakdown` /
`adlc-plan`. Our slices already record "affected owners, contracts, or likely files"
but we don't require an explicit per-slice Consumes/Produces interface contract, nor a
plan-level "Review Focus" section (ranked uncovered failure modes → owning task's
tests), nor a proportion/self-review pass on the plan itself before handoff. All three
are concrete, low-cost additions worth folding into `planning-and-task-breakdown` step
2/3 and/or `adlc-plan` step 3.

### CHANGED: `skills/test-driven-development/SKILL.md` (+10)

New hard rule: "Other tests" means the **project's whole suite**, not just the file/
test you were told to touch — run the repo's actual test command even when your task
named one file, and **any failure that run shows — including one you didn't cause —
goes in your report by name**; omitting an observed red test is "a report falsified by
omission."

**Classification: IMPROVEMENT TO EXISTING** — `verification-before-completion`. Our
skill currently says "do not run broad suites by ritual when focused evidence is
decisive" — reasonable for evidence *selection*, but we don't explicitly require
disclosing every failing test *observed* during any broader run, including pre-existing/
out-of-scope ones. Worth adding an explicit non-omission rule: any red result actually
witnessed must be named in the evidence receipt, regardless of whether it's in scope.

### CHANGED: `skills/brainstorming/SKILL.md` (+47/-12)

Staged, path-specific approval gates (spike / bounded / architectural), with the rule
that "approval of an idea or feature scope does not approve artifacts that don't exist
yet" — a reply approves only the stage actually presented, and work resumes at the
earliest incomplete stage rather than treating one yes as blanket permission.

**Classification: SKIP** — no local analog skill (we don't have a "brainstorming" front
door; our `planning-and-task-breakdown` starts from an already-agreed outcome). Not
worth a dedicated fold-in; if anything, informs `grilling`/`adlc-intent` design
philosophy only tangentially. Low priority.

## 3. addyosmani/agent-skills

Activity: huge — 117 commits in window after pagination. Most are internal tooling
(skill-lint validator, eval harness, CI hooks) fixes with no content payload for us;
filtered those out. 25 skills total in the tree
(`gh api repos/addyosmani/agent-skills/git/trees/HEAD?recursive=1`).

### NEW: `skills/constraint-driven-development/SKILL.md` (merged 2026-08-28T23:23:03Z,
commit 2ce8d47/4be4bb7, PR #472 — right at the window's opening edge; no further
in-window changes)

Establishes a project's quality bar as a **written, numeric contract** (`CONSTRAINTS.md`)
that outlives the session and is checked mechanically, distinct from prose the agent
"may or may not follow." Key mechanics:
- **Detect before you ask** (stack, test runner, linters, coverage, CI, harness) then a
  bounded 4-question interview (each question has a stated default/guess so "I don't
  know" still produces a working config).
- `CONSTRAINTS.md` format: a **Floor** (always-on, no-setup rules: no new
  suppression comments, no unimplemented stubs, no skipped/deleted tests without a
  reason, no secrets), an **Enforced-with-numbers** table (dimension → rule → checking
  command → lifecycle stage), a **Measured-not-yet-enforced** "ratchet" table (record
  today's number, must-not-regress, for metrics with no agreed target), and an
  **Exceptions** table (rule, path, reason, owner, expiry).
- Wires each dimension to a real tool (tsc, eslint/biome, gitleaks --redact, vitest
  --coverage + git diff intersection, semgrep, osv-scanner, lighthouse, axe-core,
  dependency-cruiser, Stryker) rather than inventing a bespoke checker.
- **Guard the bar itself**: an explicit review pass, at PR time, for 5 ways an agent
  games its own constraints — threshold quietly lowered, a test made easier/deleted,
  a checker silenced (new `@ts-ignore`/`eslint-disable`/`istanbul ignore`/`nosemgrep`),
  unfinished work disguised as done (stub throw, empty catch), or an undiscussed new
  Exceptions-table row. Ships a reference `floor-guard` script (diff-scoped,
  `references/floor-guard.md`) so this isn't reinvented per project. Also asks: is at
  least one enforced dimension "external" (an outside authority like axe/osv-scanner)
  rather than 100% self-graded by the project's own test suite.

**Classification: NEW CAPABILITY (no owner) — highest-value single finding in this
sweep.** Closest local skills are `coding-standards` (static conventions, no numeric
contract or ratchet mechanism) and `verification-before-completion` (evidence-based
completion claims, but no persistent cross-session contract and no explicit
"detect agents gaming their own checks" pass). Nothing in our set produces a durable,
numeric, ratcheting quality contract, nor explicitly hunts for suppression-comment/
threshold-lowering/test-deletion gaming in a diff. Strong candidate either as a new
skill or as a substantial addition to `coding-standards`.

### CHANGED: `skills/planning-and-task-breakdown/SKILL.md` (commit 8300e1b, 2026-08-28)
— same skill *name* as ours, direct comparison

Added: "Never overwrite an incomplete plan" — before writing `tasks/plan.md`/
`todo.md`, check for unchecked tasks; if it's a revision of the *same* work, update in
place; if it's *different* work, stop and ask (may be mid-build in another session).

**Classification: SKIP (already covered)** — our `planning-and-task-breakdown` step 4
already says "Preserve another task's unfinished plan." Their version is slightly more
explicit about the same-work-vs-different-work branch, but not enough delta to warrant
a change.

### CHANGED: `skills/context-engineering/SKILL.md` (commit fd00a70, "Restartable Session
Boundaries")

A checklist for what to persist before ending a session so a fresh session can safely
resume (accepted scope/decisions, task status + next task, file/working-tree state,
exact verification commands+outcomes, unresolved questions/risks/approvals) plus a rule
against inferring approval from a prior conversation unless a durable artifact records
it.

**Classification: SKIP (duplicate)** — this is what our `handoff` skill already owns,
and ours is at least as thorough. No fold-in needed.

### CHANGED: `skills/code-review-and-quality/SKILL.md` and `skills/security-and-
hardening/SKILL.md`

- code-review-and-quality: trivial description tweak ("even when the diff is pasted
  inline") — **SKIP**, cosmetic.
- security-and-hardening: restored/clarified a couple of hardening details dropped in
  an earlier condensation pass — `sameSite: 'lax'|'strict'` as the actual CSRF defense
  (warn specifically against `'none'`), and `npm audit signatures` / `pnpm audit
  signatures` as the concrete command for registry signature verification.
  **Classification: SKIP (already covered at the right altitude)** — our
  `security-review` references/SURFACES.md already covers install/build-hook
  inspection and secret handling at an appropriately abstract level; these are minor
  concrete command/flag details, not a missing concept.

### Not investigated in depth (time-boxed out): `frontend-ui-engineering` (+UI finish
checks, #496), `observability-and-instrumentation` (log-entry-point ownership, #546),
`performance-optimization` (missing guard step), `spec-driven-development`/`doubt-
driven-development`/`source-driven-development` (no changes detected in window aside
from vocabulary/description tweaks). None of these have a local-skill collision in the
comparison list beyond what's already covered by `security-review`/`code-review`.

## 4. cursor/plugins (focus: pstack/ subtree)

Activity: 340 commits in window total repo-wide (131 after `--paginate`); the large
majority are **third-party MCP-plugin additions** (Trello, Buffer, Plaud, PostHog,
TinyFish, Shopify, eToro, Coinbase, Robinhood, Webull, Excalidraw, Google Docs/Sheets/
Slides, BigQuery, SharePoint, Teams, Grok Voice, X Money/Ads, Hunter, Attio, Statsig,
Gamma, Daloopa, Meltwater, Interactive Brokers, S&P Global, etc.) — irrelevant to skill
comparison, not itemized further. `pstack/` commits in window: 12d587d, b0b9c7a,
b42effe, 70b2dc8, 5bf2b15, 889ec4b, f5bdd68, f8abedd, 71ed0d1, d7cde2b, e8d856f,
7314f72, efa2a53, 23a56e2, 73f8be4.

pstack is Cursor's large in-house agent-methodology skill bundle
(`pstack/skills/*/SKILL.md`, ~50 skills incl. `architect`, `arena`, `blast-radius`,
`interrogate`, `how`/`why`, `poteto-mode` + ~20 playbooks, `create/maintain-
verification-skill`, `reflect`, `recall`, `swarm`, `unslop`, `teach`,
`typescript-best-practices`, and ~20 tiny single-idea `principle-*` skills).

### NEW: `skills/principle-test-behavior-not-implementation/SKILL.md` (added in
e8d856f, 2026-09-07)

A litmus test for weak tests: **"would this test still pass if every function it
imports returned `undefined`?"** If yes, rewrite or delete it. Enumerates 5 concrete
shapes that pass this failure test: weak/no assertion (`toBeDefined`, `not.toThrow`),
mock-only assertions (`toHaveBeenCalled` with no payload check), self-referential
assertions (`expect(f(a)).toBe(f(a))`), constant-pinning (`expect(LIMITS.max).toBe(8)`),
and fixture-asserts-fixture (subject never actually runs in the test body).

**Classification: IMPROVEMENT TO EXISTING** — `tdd`. Our `tdd` skill states the
principle abstractly ("without copying implementation details") but has no operational
test for it. This concrete undefined-return litmus test plus the 5-shape checklist is
directly graftable onto `tdd` (or `code-review`'s test-quality checks) with no
adaptation needed.

### NEW: `skills/principle-attack-the-premise/SKILL.md` (added in e8d856f, 2026-09-07)

For when 2+ fixes sharing one premise have failed the same gate: write the premise
down, take a census of which actor/entity holds the imbalance before the next fix
(not how big, but which), and if the same actors hold it on every run, something
*assigns* them that role — find the assignment and remove the asymmetry (rotate/
randomize/relocate the role) rather than compensating for it per-run.

**Classification: SKIP (narrow, marginal fit)** — this is a sharp, real pattern for a
specific bug class (fairness/load-imbalance across repeated fixes), but it's narrow
enough, and `diagnosing-bugs` is already broad/abstract enough, that folding it in adds
a fairly specific playbook `diagnosing-bugs` doesn't otherwise carry examples like.
Worth a passing mention if `diagnosing-bugs` is ever extended with a "recurring-fix"
pattern catalogue, not urgent.

### CHANGED: `skills/blast-radius/SKILL.md` (existing since 2026-06-17, substantively
touched 2026-09-23 in 70b2dc8 — tightened wording, same mechanics)

Methodology for assessing what a change could break beyond the diff, built around
**"don't trust your own writeup — prove the one load-bearing safety fact by running
code."** A 5-rung honesty ladder for every safety claim: (1) asserted only — worthless;
(2) pointed at a `file:line`; (3) walked the failure path and showed it can't happen;
(4) ran a script/test against the real code; (5) reproduced live in the running app.
Explicitly requires citing a real `file:line` for every risk, separating "risks
confirmed" from "risks checked and cleared," and writing "unproven" rather than
overstating when a fact can't be cheaply proven. Recommends multi-model `arena` review
for big/wide changes.

**Classification: NEW CAPABILITY (no owner) — second-strongest finding.** Notably,
**mattpocock's `pr` skill (repo 1, above) independently converged on the same concept**
as a PR-body field ("Merge Danger: Door + Blast Radius"), which is corroborating
evidence this is a real, recurring need. None of our skills (`code-review`,
`security-review`, `diagnosing-bugs`) have this specific "find the one fact the
change's safety depends on, then prove it by running code, with an explicit 5-level
confidence ladder and mandatory 'unproven' label when unprovable" methodology.
Strongest candidate: fold into `code-review` as an optional deep-review mode for
risky/small diffs, and reuse "Merge Danger: Door + Blast Radius" in `git-workflow`'s
pr-writing reference (see repo 1 finding above — same idea, two independent sources).

### CHANGED: `skills/poteto-mode/SKILL.md` (playbook-reply contract, commit f8abedd,
2026-09-09)

Added one line to the shared "how every playbook must reply" contract: **"Every claim
carries its evidence or its label in the same sentence: measured, inferred, or guess...
never hand the human a check you could run."**

**Classification: SKIP (minor, already substantively covered)** — our
`verification-before-completion` already distinguishes independently-verified vs.
"reported-green" evidence and requires an honest terminal state; the pstack phrasing
(inline measured/inferred/guess label per claim) is a punchier presentation of the same
idea, not new substance. Not worth a dedicated change, though the inline-per-claim
labeling style is arguably more scannable than our current claim-matrix table if we
ever revise that section's presentation.

### Not investigated in depth (time-boxed out): `interrogate` (code-review rubric,
touched 5x in window but appears to be prose-density passes only), `recall` (session-
memory skill, added alongside blast-radius pre-window, not touched in-window per commit
history), `poteto-mode/playbooks/hillclimb.md` (iterative benchmark-optimization loop —
niche, no local analog worth comparing), `setup-pstack` budget-ask commit 5bf2b15
(model-effort-selection UX, not applicable to our skill content), model-default
swaps (Opus 5.5/Grok 4.7) — infrastructure, not applicable.

## Summary ranking of findings (highest value first)

1. **`blast-radius` methodology (cursor/plugins)** + **"Merge Danger: Door/Blast
   Radius" PR field (mattpocock/skills)** — convergent, corroborated NEW CAPABILITY.
   Fold "prove the one safety fact, 5-level confidence ladder" into `code-review`;
   fold "Merge Danger" field into `git-workflow` pr-writing reference.
2. **`constraint-driven-development` (addyosmani/agent-skills)** — NEW CAPABILITY:
   durable numeric CONSTRAINTS.md contract + ratchets + explicit "agent gaming the
   bar" detection pass. No current owner; candidate new skill or major
   `coding-standards` addition.
3. **`principle-test-behavior-not-implementation` (cursor/plugins)** — concrete
   undefined-return litmus test + 5 weak-assertion shapes → graft onto `tdd`.
4. **Ledger/`Ruling:` pattern + severity-gated final review (obra/superpowers
   executing-plans)** → graft onto `implement`/`verification-before-completion`.
5. **Interfaces block (Consumes/Produces) + Review Focus section + plan self-review/
   proportion check (obra/superpowers writing-plans)** → graft onto
   `planning-and-task-breakdown`/`adlc-plan`.
6. **Mechanical-vs-judgement-call classification for coding standards (mattpocock
   retro)** → graft onto `coding-standards`.
7. **"Report every observed test failure, not just in-scope ones" (obra/superpowers
   tdd)** → tighten `verification-before-completion`.
8. Everything else: SKIP (duplicate, cosmetic, or too narrow/out of scope).
