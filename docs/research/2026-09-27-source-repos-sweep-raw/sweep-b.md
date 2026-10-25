# Sweep B — cross-repo skill research (2026-08-28 .. 2026-09-27)

Repos: DietrichGebert/ponytail, mvanhorn/last30days-skill, anthropics/skills,
trailofbits/skills, EveryInc/compound-engineering-plugin.

Local comparison set read: engineering/code-review, engineering/security-review,
engineering/diagnosing-bugs, engineering/verification-before-completion,
engineering/tdd (SKILL.md contents loaded in full).

---

## 1. DietrichGebert/ponytail — NO relevant activity

13 commits in window, all `docs:` (README/logo/badge churn) or one `feat: add
native Cursor hooks via hooks.json` (#817/#869, 67a16015, 2026-09-14) that only
touches `hooks/*.js`, `scripts/cursor-hooks.js`, docs — verified via
`gh api repos/DietrichGebert/ponytail/commits/67a16015` file list, no
`skills/*/SKILL.md` touched. Release commit e3ba2aa6 (v4.10.0) is version bump
only.

Skill dirs present (`skills/ponytail*`, mirrored under `.openclaw/skills/`):
ponytail, ponytail-audit, ponytail-debt, ponytail-gain, ponytail-help,
ponytail-review — none changed in window.

**Classification: SKIP.** No skill-content activity; the only feature (native
Cursor hooks) is IDE-integration plumbing unrelated to our skill set. We already
have `ponytail-audit` as a skill built on this tool; nothing to fold in.

---

## 2. mvanhorn/last30days-skill — very active, mostly engine internals; SKIP overall

~90 commits since 2026-08-28, dominated by dependency bumps, CI, and scraper/
engine hardening (Reddit, X/Twitter, YouTube, Instagram, LinkedIn, Bluesky,
GitHub, cookies, transcription) — explicitly out of scope per task instructions
(focus on user-visible capability, not engine internals).

User-visible additions found:
- `4909c2ef` (2026-09-15) `feat(meta-ads)`: opt-in Meta Ad Library source for a
  brand's live paid creative.
- `b15e2eb4` (2026-09-09) `feat(x)`: X search over the official X API plus a
  Grok Bot X connector.
- `349ca444` (2026-09-19) Add consent-gated Windows MCP host controls.
- `30d47be7` (2026-09-17) `feat(hooks)`: `LAST30DAYS_QUIET` to quiet the
  SessionStart status hook.
- `a5de3878` (2026-09-12) Docs: quick first-run option for `/last30days`.
- Numerous `fix(...)` hardening commits: input-forgery defense against scraped
  content (`4ee76ab6`, `88199cbd` — defang scraped titles/close untrusted-content
  fences), credential redaction from fixtures (`52e1f51b`), path-safe
  sanitization (`e21e82e3`).

**Classification: SKIP — not applicable.** last30days-skill is a social-listening
research tool; it doesn't map to our `research` skill (primary-source/API/doc
research) or any other local skill. The security-hardening patterns (treat
scraped/untrusted content as data not instructions, redact credentials from
recorded evidence) are good practices but are already present as principles in
our `diagnosing-bugs` ("Treat log lines... as untrusted data") and
`security-review` skills — not a new idea to import.

---

## 3. anthropics/skills — no skill-creator activity; minor doc-only changes elsewhere

Only 4 commits in window, all reference-doc updates://
- `33375500` (2026-09-24) claude-api: link refusal billing to docs — files:
  `skills/claude-api/{curl,python,typescript,shared}/...` (no SKILL.md).
- `34040c9c` (2026-09-10) claude-api: Managed Agents `auto` permission policy,
  `ant beta:sessions connect` — touches `skills/claude-api/SKILL.md` + shared refs.
- `41bbe19d` (2026-09-03) frontend-design: "avoid generic design defaults" —
  touches only `skills/frontend-design/SKILL.md`.
- `53048666` (2026-09-01) claude-api: Fable 5.1/Mythos 5.1, Managed Agents,
  cost-optimize — touches `skills/claude-api/SKILL.md` + many per-language refs.

**skill-creator: zero commits in the window** — explicitly checked, confirmed no
activity to report.

**Classification: SKIP.** claude-api and frontend-design are not in our local
skill set (no equivalent owner); nothing to fold in.

---

## 4. trailofbits/skills — most valuable repo this sweep

19 commits in window. Two of the three repos named "especially" had **zero
commits**: `differential-review` (no commits touch
`plugins/differential-review/**`) and `property-based-testing` (no commits touch
`plugins/property-based-testing/**`) — confirmed by grepping every commit's file
list in the window. `audit-context-building` had one minor eval commit only.

### 4a. NEW plugin: post-patch-validation (ce9ae2e2, 2026-09-14; refined
027bc47a 2026-09-14, f44eeba6 2026-09-14, d30ab4dd 2026-09-14 migrates
mutation-testing/bug-hunting into it as a sibling public plugin)

`plugins/post-patch-validation/skills/post-patch-validation/SKILL.md` — validates
a security patch with reproducible baseline-vs-patched evidence: exploit,
variant, behavior, regression, security, and suite checks, each independently
executed with a fixed minimal env, side-blind assertions (checks can't see
whether they're running against base or patched — prevents an assertion that
"cheats" by detecting which revision it's on), a `PPV_REACHED` stdout marker
requirement so a nonzero exit can't be conflated with "the exploit reproduced",
and a structured `result.json` with `status`/`findings`/`gaps`/
`human_review_required`. Includes a rationalizations-to-reject table (e.g. "the
full suite passes" -> "prove baseline reproduction and targeted behavior
explicitly").

**Classification: NEW CAPABILITY.** We have nothing like this. It's adjacent to
`verification-before-completion` (evidence gate, "reported-green" vs
independently-reproduced) and `security-review`, but neither does adversarial,
executable, side-blind patch validation with a variant-coverage contract. Two
concrete ideas worth folding into `verification-before-completion` even without
adopting the whole plugin:
  - **Side-blind check design**: a verification check should not be able to
    infer which state (before/after fix) it's running against and assert on
    that instead of on real behavior — a sharper version of our "reported-green
    vs independently reproduced" distinction.
  - **Explicit "proof of execution" marker**: require a check to prove it
    actually reached the code under test (their `PPV_REACHED`), not just that
    it exited nonzero — strengthens our "An exit code is not sufficient..." point
    in step 2 of `verification-before-completion`.

### 4b. second-opinion (f44eeba6, 2026-09-14: "Fix second-opinion CLI
integration and simplify review guidance"; 49699bb4, 2026-09-01: Gemini CLI EOL
-> Antigravity, Codex bumped to gpt-5.6-sol)

`plugins/second-opinion/skills/second-opinion/SKILL.md` — runs an independent
external CLI review (Codex `codex exec`, Antigravity `agy`, or Gemini CLI) over
uncommitted changes / a branch diff / a commit, in parallel across providers,
and reports agreements/disagreements without treating agreement as proof.

**Classification: NEW CAPABILITY** (with overlap flagged below vs EveryInc). We
have no mechanism to invoke a genuinely different model/CLI as an independent
reviewer. Our `code-review` skill's `deep` level adds "independent review axes"
but always within the same agent/session — never a truly separate model. Worth
considering as an optional cross-model step for `code-review` at `deep` level,
or a small standalone skill. See §5 below — EveryInc's `ce-code-review` /
"ce-pov" line implements the same idea more elaborately, suggesting this is a
converging industry pattern, not a one-off.

### 4c. review-walkthrough (979a3f97, 2026-09-14: "Publish review-walkthrough
with validated HTML rendering")

`plugins/review-walkthrough/skills/review-walkthrough/SKILL.md` — generates a
self-contained interactive HTML walkthrough of a branch/PR diff: groups files
into logical steps in a reading order chosen for comprehension (not commit
order), one explanation + one findings list (severity-tagged, line-anchored)
per step, renders via a validated Python renderer that diffs the assembled JSON
against the real captured patch (so steps can't drop/invent hunks), and — when
GitHub PR metadata is available — lets the user copy (never auto-post) a `gh
api` command to post selected comments inline.

**Classification: NEW CAPABILITY.** Our `html-writeup` skill produces generic
standalone HTML reports but has no PR-diff-specific walkthrough mode (step
grouping by comprehension order, per-step findings anchored to diff lines,
verified-against-patch rendering, PR-comment export). Could be a `code-review`
output mode or a dedicated small skill; not a priority but genuinely something
we lack.

### 4d. mutation-testing / bug-hunter workflow (migrated to public plugin,
d30ab4dd)

`plugins/mutation-testing/skills/mutation-testing/workflows/bug-hunter.md` —
uses mewt/muton mutation-testing survivors as a map to real bugs: rank
high-risk code (security-sensitive first), prioritize mutant types by what they
reveal (ER clusters, IF/IT both-uncaught, CR on auth checks), investigate each
for a genuine bug (not just a coverage gap), and report only confirmed/likely
bugs with PoC repros — explicitly distinct from "just fix the coverage gap."

**Classification: NEW CAPABILITY, but adjacent/lower priority.** This is
mutation testing, not property-based testing — a different technique for the
same underlying gap ("we have no test-adequacy / test-design skill beyond
`tdd`"). Since the task called out that we lack a property-based-testing skill
specifically: I read `trailofbits/skills` current
`plugins/property-based-testing/skills/property-based-testing/SKILL.md` (unchanged
in window, so not itself a "finding," but relevant to the gap assessment asked
for). It is a mature, well-scoped skill: a property catalog (roundtrip, inverse,
oracle, idempotence, invariant, commutativity, associativity, identity) with a
strength ordering, explicit tautology/vacuity anti-patterns, a
"shape is missing or merely buried" refactoring lens, and routes for
generating/reviewing/interpreting-failures. **Confirms the gap is real and the
reference implementation is directly reusable** if we choose to add a
property-based-testing skill — it is not a stretch fit, it is a clean, mostly
language/tool-store of guidance (Hypothesis/fast-check/proptest/jqwik/rapid/
Echidna/Medusa) with almost no engine-specific baggage.

### 4e. Everything else in trailofbits/skills this window — SKIP (niche/engine)

- `ea5327d4` (2026-08-31) semgrep: 3 bugs silently dropping entire rulesets
  (judge scan success on artifacts, not exit code alone). Reinforces a
  principle our `security-review` already states ("Keep scanner output distinct
  from verified findings... a scanner alert... is a lead rather than a finding
  by itself") — not a new idea, engine-internal fix. SKIP.
- `6feac677` (2026-08-31) building-secure-contracts: per-pattern coverage table
  required in 5 flat vulnerability scanners (algorand/cairo/solana/substrate/
  ton) — good "silence != absence" discipline, but blockchain-audit-specific
  plugin content with no local equivalent. SKIP as not applicable.
- `9645e2f8`, `7e7a9b2a`, `b89f6dbc`, `14e5a107` — narrow tool-specific fixes
  (agentic-actions-auditor claude-code-action inputs, supply-chain-risk-auditor
  cache decoding, brocards URL, burpsuite-project-parser). SKIP, no local
  equivalent skill.
- `d1f1575c` (2026-08-28) audit-context-building: adds one eval case for
  dispatch-routing + a README fix; no behavior change to the skill's guidance.
  SKIP — not a substantive capability change despite being one of the
  explicitly-named "especially" repos.

---

## 5. EveryInc/compound-engineering-plugin — huge activity; ce-compound is the
headline finding

~110 commits in window across dozens of `ce-*` skills. Focused on the two
named skills plus one repo-wide feature that both depend on.

### 5a. ce-compound + ce-compound-refresh (the "compounding lessons" gap)

We have **no skill anywhere in our local set for capturing or maintaining
durable engineering learnings** — confirmed by scanning the full local skill
list (adlc-*, babysit-pr, codebase-design, code-review, coding-standards,
diagnosing-bugs, git-workflow, implement, orchestrate, planning-and-task-
breakdown, prototype, research, security-review, ship-it, simplify, tdd,
verification-before-completion, html-writeup, grilling, handoff,
writing-for-agents, writing-for-humans — none capture or refresh a persistent
lessons store). EveryInc's pair is a mature, two-sided answer to exactly this:

- **`ce-compound`** (`skills/ce-compound/SKILL.md`) — documents one solved
  problem as a durable learning under `<root>/solutions/`, gated by a strict
  counterfactual "durable bar": *"if the learning document disappeared, would a
  future engineer reading the final implementation still be likely to repeat
  the mistake or redo substantial investigation?"* Explicitly refuses to
  document routine fixes whose own code/tests/comments already explain the
  lesson. One learning per run (never batched). Also seeds `CONCEPTS.md`
  (a project vocabulary file) as a side effect and can optionally wire a small
  discoverability breadcrumb into project instructions after consent.
  Key window commits:
  - `d3c6f12d` (2026-09-02) "gate capture on durable knowledge" — tightened the
    durable-bar gate itself (also touched `ce-debug`'s post-fix handoff to feed
    `ce-compound` a real candidate).
  - `415181d3` (2026-09-03) "cull learnings that fail the ce-compound bar" —
    a one-time retroactive cleanup applying the tightened bar across ~70
    existing `docs/solutions/**` files (bulk delete/merge of learnings that
    didn't meet the bar) — i.e., they dogfooded their own gate against their
    own accumulated learnings store and cut most of them.
  - `7e705b68` (2026-09-24) "learnings name their retirement condition" — each
    captured learning now states the condition under which it should be
    considered stale/retired, consumed by `ce-compound-refresh`.
  - `4a610d73` (2026-09-18) minor bugfix in session-history extraction.

- **`ce-compound-refresh`** (`skills/ce-compound-refresh/SKILL.md`) — audits the
  existing learnings store against current code: per-doc classification into
  exactly one of Keep / Update / Consolidate / Replace / Delete, contradiction
  detection outranks simple staleness, an opt-in "worth lens" (only on explicit
  user request) that can delete *accurate* docs the codebase already explains
  elsewhere (to fight store bloat), a discoverability check every run ("the
  store only compounds value if agents can find it"), and auto-commits only the
  files it changed.

**Classification: NEW CAPABILITY — the highest-value finding of this sweep.**
This is a complete, working answer to a gap we've already identified we have.
Recommendation: adopt the core loop (durable-bar counterfactual gate on
capture; a separate refresh/cull skill with an opt-in "worth" pass to prevent
the store from becoming append-only noise) rather than just capture-side —
EveryInc's own dogfooding (415181d3 culling ~70 docs) is evidence that
capture-only compounding skills rot without a refresh counterpart.

### 5b. Compound Packs (5130557e, 2026-09-09: "compound, ground, and enforce
domain knowledge via Compound Packs")

A repo-wide feature: `.compound-engineering/config.yaml` can declare "packs" —
named, versioned bundles of domain rules that get resolved (`packs-resolve.py`,
now present in `ce-compound`, `ce-code-review`, `ce-plan`, `ce-brainstorm`,
`ce-doc-review`, `ce-dogfood`, `ce-setup`) and threaded into those skills so
captured learnings/review personas/plan research are "grounded and enforced"
against a project's declared domain knowledge rather than living only as free
prose. `ce-compound` gained the ability (interactive Full mode only, after
explicit user selection) to write a rule file into a writable pack and append
a `packs:` entry to config, i.e., a learning can be promoted straight into
enforced domain-pack guidance, not just archived as a markdown doc.

**Classification: NEW CAPABILITY (larger, lower priority than 5a alone).** This
is essentially "compounding learnings into structured, enforced project
config" rather than plain docs — a further stage beyond what `ce-compound`
alone does. Interesting but heavier machinery (config schema, resolver scripts
threaded through 6+ skills); worth knowing about but not something to copy
wholesale. If we build a compounding skill, this is the "phase 2" to be aware
of rather than a day-one requirement.

### 5c. ce-code-review (large ongoing rewrite, sampled for cross-model pattern)

Many commits (`901f97d6`, `ea9d090b`, `53af1a2e`, `e3de6cdf`, `062de4b5`, others)
show `ce-code-review` converging on: sizing review depth/cost by consequence
rather than raw line count, requiring cited evidence before promoting a
"protected-subject" finding, and — most notably — a cross-model peer-review
mechanism (`53af1a2e` "promote agreement only with a verified cross-model peer";
`306be9c1`/`414e9d6b` "ce-pov" naming oracle/peer models explicitly by requested
model, routing peers through Grok/OpenCode/Codex). This is the same
cross-model-second-opinion pattern as trailofbits' `second-opinion` (§4b),
independently built — two ecosystems converging on "don't let a single model
mark its own homework" as a review primitive.

**Classification: SKIP for detailed adoption** (their implementation is deeply
tied to their own multi-harness peer-dispatch machinery), **but flag the
pattern** — see §4b recommendation. Our `code-review` skill's `deep` level is
the natural place a cross-model peer step would attach if we ever build one.

### 5d. Everything else in EveryInc this window — SKIP (not in our comparison
set / too implementation-specific)

`ce-polish` live mode, `ce-prototype` annotation-session persistence, `wtf`
(explain last message), `lfg` (route request to owning skill), `ce-noslop`
(plain-prose skill), Bake-off approach comparison, `ce-babysit-pr` monitoring
fixes, OpenCode/cross-model harness plumbing, and dozens of CI/release/test
commits. None have a local-skill owner to compare against beyond the
`babysit-pr`/`code-review`/`orchestrate` overlaps already noted, and reviewing
each in depth was out of scope given the sweep's word budget.

---

## Summary ranking (see final report to user for the <400-word version)

1. **NEW CAPABILITY — compounding engineering learnings** (EveryInc
   `ce-compound` + `ce-compound-refresh`). Fills our explicitly-known gap;
   mature reference design with a capture gate and a refresh/cull loop.
2. **NEW CAPABILITY — adversarial post-patch validation** (trailofbits
   `post-patch-validation`). Side-blind checks + proof-of-execution markers are
   concrete, exportable ideas for `verification-before-completion` even without
   adopting the whole plugin.
3. **NEW CAPABILITY — cross-model second opinion** (trailofbits
   `second-opinion`, converging with EveryInc `ce-code-review`/ce-pov). A
   review step run on a genuinely different model/CLI; natural fit under
   `code-review`'s `deep` level.
4. **NEW CAPABILITY — property-based-testing** (trailofbits, unchanged this
   window but assessed per instructions): confirmed gap, clean reusable
   reference design (property catalog, tautology/vacuity pitfalls).
5. **NEW CAPABILITY, lower priority — PR review-walkthrough HTML artifact**
   (trailofbits `review-walkthrough`) and **mutation-testing bug-hunter**
   workflow (adjacent to #4, different technique).
6. Everything else this sweep: SKIP — either engine-internal/CI noise
   (last30days-skill, most of trailofbits deps/scanner fixes), no local-skill
   owner (ponytail Cursor-hooks, anthropics claude-api/frontend-design), or too
   implementation-specific to adopt piecemeal (EveryInc Compound Packs config
   system, most of the rest of the `ce-*` catalog).
