# Sweep: nahid-sparktales/agent-dispatcher, 2026-08-28 .. 2026-09-27

Repo has substantial activity in the window. First commit in the repo overall
is ec7eec645 on 2026-09-19, so the ENTIRE repo history (v1 through the latest
merge c9f7f2d26 on 2026-09-25) falls inside the window — ~104 commits across
two pages (`commits?since=...`), all fetched successfully. No failed `gh api`
calls encountered.

Repo shape (confirmed via `git/trees/HEAD?recursive=1`, 751 blobs): a
Claude-Code/Codex dispatcher plugin. Top-level: `catalog/` (skills.json,
loadouts.json, signals.json, mcp.json, context-plan.schema.json),
`decision/` (engine.py, cli.py — "Jev" decision engine), `learning*.py`,
`repository_*.py`, `capability_health.py` / `capability_resolver.py` /
`skill_intelligence.py`, `context*.py`, `retrieval.py` / `llm_retrieval.py`,
`doctor.py`, `commands/`, `recipes/`, `skills/agent-dispatcher/` (installed
artifact), `sources/shared/` + `templates/` (role/guide source), `docs/`,
`evals/`. Confirms the task framing: not a SKILL.md library, but a
retrieval/routing/verification/learning system with roles (implementer,
tester, debugger, etc.) as installed Markdown+frontmatter artifacts built by
`build.py` from `templates/` + `catalog/`.

## Commit list (chronological, newest first) — see also commits_page1.txt /
commits_page2.txt in this scratchpad dir for the raw dump.

Highlights (full list captured; only substantive ones detailed below):
- c9f7f2d26 / 9d679cb0d (2026-09-25) — Capability intelligence
- a80959c11 (2026-09-24) — verification guide: targeted tests example
- 24a780113 / b894fd9d7 / 0f39f170a (2026-09-24) — efficiency/reliability pass
  + shared verification contract
- 4542a65cc (2026-09-24) — repository intelligence: evidence-backed retrieval
- 1d286c3ba (2026-09-23) — governed procedural learning layer
- e09372064 / 51bebb123 / 10a4f6a3c (2026-09-22) — repository memory
  (episodic/semantic/experience), oversized-file traceback-frame retrieval
- 1ff28acc4 / bb7e1a013 / d2422b0f9 (2026-09-21/22) — deep repo index,
  LLM-assisted retrieval (reranker, role_summary), offline localization bench
- 3de238273 (2026-09-20) — dispatcher doctor + recoverable install
- d3d59356d, d81a3b0de, a7091615b, c183eff9f, b39b0c61f (2026-09-20) — budgeted
  context, project maps, context evaluation coverage
- ec7eec645..a0d4f55e5..1aa8f0737..d709c8c13 (2026-09-19) — v1 launch through
  v2.0 (composable capability system) through v2.2 (Jev decision engine)
  through "Decide what the specialist is given, not just who it is"
  (context-plan vs execution-plan separation)

## Detailed findings

### 1. Shared VERIFICATION contract across implementer/tester/debugger roles
Commit: 0f39f170a "roles: shared verification contract for implementer,
tester and debugger" (2026-09-24T20:09:34Z).
Files: build.py, skills/agent-dispatcher/roles/{debugger,implementer,tester}.md,
templates/core/{implementer,tester}.md, templates/engineering/debugger.md,
tests/test_build.py.

One block (`VERIFY_CONTRACT` constant in build.py, ~682 bytes) substituted via
`{{VERIFY_CONTRACT}}` placeholder into all three role templates so it can't
drift between roles. Exact text (read from live build.py, lines 493-498):

> VERIFICATION
> Minimal verification is a floor, not a stopping point: never skip a stated
> requirement to keep work small; skip unrelated tests and full suites for
> small changes.
> 1. Give each stated requirement its own check, including required
>    compatibility or unchanged behavior; reuse a test only if you know what
>    it asserts.
> 2. Check the nearest way the change could still be wrong: a boundary, bad
>    input, a case to reject.
> 3. Check the riskiest behavior sharing the changed path; where filtering,
>    ordering, pagination, aggregation or early termination interact, vary
>    each alone and combined.
> 4. A pre-existing defect that blocks a stated requirement is in scope;
>    report any other.

Commit message explains item 3 was added after a concrete failure: a
`sqlglot executor_offset` task in their eval suite went wrong because an
interaction between filtering/ordering/pagination/etc. wasn't tested in
combination.

**Classification: IMPROVEMENT TO EXISTING — `engineering/verification-before-completion`.**
Our skill already has a strong claim-matrix method (step 1) and scope-appropriate
evidence table (step 2), and already says "do not run broad suites by ritual"
(see finding #2, which is otherwise a duplicate). What it does NOT have is
item 3's specific, concrete checklist: when the changed code path involves
filtering, ordering, pagination, aggregation, or early termination, test each
of those behaviors in isolation AND in combination, not just individually.
This is a precise, non-obvious heuristic (motivated by a real regression) that
could be folded into step 1 or step 2 as an added row/bullet — e.g. "for
data-processing-shaped changes (filter/sort/paginate/aggregate/short-circuit),
verify each behavior alone and combined, not just each in isolation."
Also worth reusing verbatim-ish: "minimal verification is a floor, not a
stopping point" is a good restatement of the skill's existing intent and
could tighten the framing, but is not new content.

Also relevant to `engineering/tdd` and `engineering/implement`, which could
inherit the same interaction-testing checklist when they touch data-shaped
logic; verification-before-completion is the primary owner since it's the
final gate.

### 2. Verification guide: targeted tests, not full suite, for small changes
Commit: a80959c11 "verification guide: example runs targeted tests, full
suite only when broad" (2026-09-24T22:37:49Z).
Files: skills/agent-dispatcher/VERIFICATION.md, sources/shared/VERIFICATION.template.md.

Concrete motivating data point in the commit message: in their "eff-v1"
pilot, a dispatcher worker followed the old guide's example (which ran
`unittest discover`, i.e. the whole suite) and re-ran all 1,161 sqlglot tests
five times investigating pre-existing environment errors: 786s vs stock's
473s for the same fix. Fix: replace the example with `unittest TEST_MODULES`
(named modules) and add the line "Test the changed area; run a full suite
only for broad changes or on request."

**Classification: SKIP (duplicate).** `engineering/verification-before-completion`
step 2 already states verbatim-equivalent guidance: "Do not run broad suites
by ritual when focused evidence is decisive, and do not use a focused unit
test to support a broader integration or deployment claim." Our skill already
owns this principle. The dispatcher's finding is useful as an anecdotal
confirmation (5x reruns, 786s vs 473s) but adds no new technique beyond what
we already encode. Not worth a change.

### 3. Capability intelligence: health-aware routing + governed skill evaluation
Commit: 9d679cb0d "Capability intelligence: scoped health, setup/checkup
views, health-aware routing, governed skill evaluation" (2026-09-25T03:56:54Z,
merged as PR #13 / c9f7f2d26). Large feature: capability_health.py,
capability_resolver.py, skill_intelligence.py + docs/capability-intelligence.md
+ docs/capability-intelligence-audit.md.

Core ideas (from docs/capability-intelligence.md):
- Separates two questions with explicit evidence: "which capabilities can
  this host actually use right now" (capability_health.py, 9 independent
  health dimensions: presence, configuration, exposure, connectivity,
  authentication, authorization, compatibility, policy, freshness) vs "which
  skills have demonstrated value for this task/model/host"
  (skill_intelligence.py, frozen experiments, paired analysis, preregistered
  gates).
- `checkup` view: every MCP/skill/plugin bucketed into working / needs
  attention / unsure / not in use, each with the smallest next step. Crucially,
  "unsure" (no evidence either way — deferred, callable but unused, found but
  never run) is a first-class state, distinct from both "working" and
  "broken" — never inferring health from absence of evidence.
- `setup` view: lists only installed-but-not-configured servers/plugins,
  grouped by the exact remaining action (sign in / install a program / set an
  env var / enable / fix / reconnect).
- Probes are opt-in on three axes (listed in user's own settings, explicit
  `--deep N --refresh`, explicit `--allow-process`/`--allow-network` flag) and
  never automatic; anything else is `skipped` with a reason, never `failed`.
  Evidence from a prior session is shown as `STALE`, never as current.
- capability_resolver.py: routing runs deterministic gates (disabled/blocked/
  quarantined/retired always rejected) -> operation requirements -> equivalent
  fallback (must match operation, access, environment, resource, identity
  boundary, sensitivity) -> mandatory verification checks carried through
  unchanged (a missing one becomes an explicit `verification_blocker`).
  Rollout is `off`/`shadow`/`on`, default `shadow`.

**Classification: IMPROVEMENT TO EXISTING — `engineering/orchestrate`.**
Orchestrate's step 1 already says "Skill discovery alone does not prove agent
registration," gesturing at the same problem, but has no structured way to
act on it. Concrete idea to fold in: before dispatch, do a lightweight
"capability checkup" of the skills/tools/roles a worker contract depends on —
bucket each into working / needs attention / unsure / not in use with the
smallest next step, rather than either assuming declared capability works or
treating any unconfirmed capability as broken. This directly strengthens
orchestrate's existing "capability gap" reporting requirement in steps 1 and
6 by giving it a concrete evidence vocabulary (four states, not a binary).
The "evidence from a prior session is STALE, not current" rule is also worth
a one-line addition to orchestrate step 4 (recovery/staleness) or step 6
(verify): a worker's earlier "capability confirmed" claim from before the
current dispatch is stale evidence, re-confirm rather than trust.

Lower priority / not adopted: the full 9-dimension health model, probe
adapters (cli.version/mcp.stdio.enumerate/http.read), and the skill
evaluation statistics engine are infrastructure-heavy and specific to a
tool/MCP-installation problem our skill library doesn't own — we don't ship
a runtime that manages MCP installs. Not recommended for adoption beyond the
checkup-vocabulary idea above.

### 4. Governed procedural learning layer (off by default)
Commit: 1d286c3ba "learning: governed procedural learning layer (off by
default)" (2026-09-23T01:32:33Z). docs/procedural-learning.md.

Turns explicitly recorded task outcomes into reviewed, evaluated,
human-approved overlays on bundled guidance (per-skill/role/recipe "learned"
additions), with a strict lifecycle: observation -> deterministic pattern
review (or host/provider-assisted proposal) -> immutable content-addressed
candidate revision -> Tier A structural/security validation -> Tier B
component checks -> Tier C paired evaluation against a frozen incumbent ->
human approval bound to the exact candidate/evaluation/bundle/generation ->
atomic publish -> bounded runtime composition, with correction, retirement,
and rollback. Ships disabled; when enabled starts in `shadow` mode (computes
and reports what would change, changes nothing) until proven. A learned
overlay has "no authority": cannot touch credential redaction, path
admission, permissions, or required verification.

**Classification: NEW CAPABILITY (no current owner among our 22 skills), but
low near-term priority.** No skill in our library has a mechanism for
"a skill's guidance evolves from accumulated task experience, gated by
human-approved, rollback-able promotion." This is conceptually interesting
but heavy infrastructure (a store, statistics, digests, approval workflow)
that doesn't map cleanly onto a single Markdown-instructions skill. The
transferable idea, if we ever want it, is narrow: any mechanism for
"skill self-improvement from experience" should (a) ship inert until
explicitly turned on, (b) run in shadow/report-only mode before affecting
behavior, and (c) require a human approval bound to an exact, immutable
version — not auto-promote. Not recommending action now; flagging for
awareness only.

### 5. Repository memory (episodic / semantic / experience) + "digest"/"consolidate"
Commits: 10a4f6a3c (2026-09-22T20:41:05Z) "memory: optional episodic,
semantic and experience repository memory"; 51bebb123 (2026-09-22T21:22:03Z)
"memory: unify task experience on the shared store, on by default"; 4542a65cc
(2026-09-24T00:26:21Z) adds `consolidate` (read-time candidate descriptive
claims from recorded experience: independent task families, contradictions,
freshness, scope backoff — nothing stored/voted/promoted) and `digest`
(explicit, task-local working memory, never read by retrieval).
docs/repository-memory.md.

Pattern: new signal types ship in `shadow` mode (computed and reported, never
changes ranking) until they "earn" `on`. Also: three named layers matching
persistent-fact memory (episodic: commits/changes), derived-knowledge memory
(semantic: module summaries), and session-outcome memory (experience: task
records, corrections, forgetting) — a clean three-way taxonomy.

**Classification: SKIP for direct adoption.** This is a retrieval-ranking
feature for their own indexer; our skills don't run a persistent index. The
shadow-before-on rollout discipline is good general practice but is standard
(canary/feature-flag) and not a distinctive technique worth a specific skill
edit. The episodic/semantic/experience taxonomy is mildly interesting for
`productivity/handoff` (which preserves resumable task state) but handoff
already separates "what happened" from "what's next" adequately; the
dispatcher's version is solving a different problem (many tasks across time
in one repo) vs handoff's (one task across a context reset). Not applicable
enough to justify a change.

### 6. Context plan vs execution plan (structural separation)
Commit: d709c8c13 "Decide what the specialist is given, not just who it is"
(2026-09-19T07:30:53Z).

Core idea: "A context plan says what an agent needs; an execution plan says
what it will do. The dispatcher owns the first, the specialist the second,
and the build keeps them apart — catalog/context-plan.schema.json may never
grow a steps field." Enforced structurally (schema validation), not just by
convention. Also: `catalog/signals.json` names, per conditional-skill-bucket,
whether each signal is decided "by the repository, by the request, or by
what the session actually provides," plus "the specific wrong inference to
avoid" for each — i.e., every heuristic condition documents its own failure
mode up front.

**Classification: IMPROVEMENT TO EXISTING — `engineering/orchestrate`, minor.**
Orchestrate's worker contract (step 3) already has separate "Inputs and
evidence" vs implicit "how" left to the worker, so this is *largely* already
followed — but it's implicit, not stated as an explicit rule. Worth a small,
concrete addition: state explicitly that the root's contract must supply
objective + inputs/evidence + acceptance criteria, and must NOT prescribe
execution steps/method — that decision belongs to the delegated role. This
guards against a coordinator drifting into micromanaging workers (which
duplicates the worker's own planning and creates conflicting authority over
"how"). Rank this lower than findings #1 and #3 — it's a codification of
something orchestrate already does right, not a gap.

### 7. Traceback-frame-aware retrieval / oversized-file structural records
Commit: e09372064 (2026-09-22T22:16:01Z) "retrieval: traceback frames and
structural records for oversized files."

When a request contains a stack trace (`File "...", line N, in f` or
`at f (path:line:col)`), frames are parsed and the longest matching path
suffix votes in file retrieval, with the line anchoring the excerpt and the
function name treated as a symbol. Measured impact was small (fires on 3/474
dev tasks, neutral) — their own eval showed this wasn't a big win.

**Classification: SKIP.** `engineering/diagnosing-bugs` already instructs to
"trace data and control flow backward from the symptom" and to preserve
exact error text; explicitly parsing stack-trace frames to anchor file/line
priority is a reasonable but fairly obvious refinement, and the dispatcher's
own measurement found it near-neutral in practice. Not distinctive enough to
warrant a skill edit given its own authors saw little benefit.

### 8. LLM-assisted retrieval, reranking, deep repo index, dispatcher doctor
Commits: d2422b0f9, bb7e1a013, 1ff28acc4, 3de238273, and surrounding retrieval/
eval commits (2026-09-19 through 2026-09-22). These are all about their own
code-search/indexing subsystem (candidate retrieval, LLM reranking, held-out
benchmarks comparing local Qwen vs Claude Haiku/Sonnet, an installer
doctor/health-check command). Read docs/llm-assisted-retrieval.md headers and
docs/architecture.md structure to confirm scope.

**Classification: SKIP.** These are implementation details of building a
retrieval/indexing product, not workflow techniques transferable to
Markdown-instruction skills like `research`, `codebase-design`, or
`diagnosing-bugs`. Our skills already tell the agent *how to search and
verify* using its host's native tools (Grep/Glob/Read); we don't own or want
to own a custom indexer.

## Summary of classifications
- IMPROVEMENT: verification-before-completion — add the filter/order/
  paginate/aggregate/early-termination interaction-testing checklist (#1).
- IMPROVEMENT: orchestrate — adopt four-state capability checkup vocabulary
  (working/needs attention/unsure/not in use) before dispatch, plus "prior
  capability evidence is stale" rule (#3).
- IMPROVEMENT (minor): orchestrate — make explicit that worker contracts
  supply inputs/acceptance criteria but not execution steps (#6).
- NEW CAPABILITY (low priority, infra-heavy, not recommended now): governed
  procedural learning / skill self-improvement lifecycle (#4).
- SKIP: verification guide targeted-tests example — duplicate of existing
  verification-before-completion guidance (#2).
- SKIP: repository memory taxonomy/shadow-rollout — not applicable, standard
  practice (#5).
- SKIP: traceback-frame retrieval — already implied, dispatcher's own eval
  found it near-neutral (#7).
- SKIP: LLM-assisted retrieval / reranking / deep index / doctor — product
  internals of their own retrieval engine, not transferable workflow
  technique (#8).
