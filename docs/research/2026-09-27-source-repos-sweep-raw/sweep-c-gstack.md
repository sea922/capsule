# gstack sweep — 2026-08-28 to 2026-09-27

Repo: garrytan/gstack. All `gh api` calls succeeded (no errors encountered).
Commit window query returned 27 commits total (single page, no pagination needed).
Full recursive tree fetch: 3033 items, not truncated, 67 SKILL.md paths (66 real
skill dirs + 3 test-fixture SKILL.md files + 1 root SKILL.md).

## Commit list (2026-08-28 .. 2026-09-26), newest first

- 01593aa67c 2026-09-26 v1.91.2.0 fix: consolidate gstack reliability wave (#2959) — mass boilerplate/preamble sync across ~45 skills (shared instruction-block updates), not feature work.
- 2a113ae7e6 2026-09-25 v1.91.1.0 fix: harden Impeccable plugin discovery (#2978) — UI-slop-detector plugin discovery fix (design vertical).
- 7b534d3e90 2026-09-25 v1.90.2.0 perf: halve local free-suite time and preserve coverage (#2972) — land-and-deploy test-speed rewrite (CI perf, internal).
- a84b0b5b6d 2026-09-25 v1.90.0.0 feat: make browser cookie imports explicit and safe (#2964) — browse/setup-browser-cookies, browser-automation vertical.
- 730a1017d1 2026-09-24 v1.89.1.0 fix: remove continuous checkpoint commits (#2970) — removes an autosave-commit habit across many skills; internal workflow tweak.
- 06ed920a97 2026-09-24 v1.89.0.0 feat: add shared-code extraction audit (#2925) — **adds new skill `deslop-shared-libs`** (225 lines). See finding #4.
- b9706f3635 2026-09-23 v1.88.1.0 fix: harden credential boundaries and owned state (#2942) — internal redaction/credential-scanning bug fixes in gstack's own tooling (symlinked settings targets, masking bound to original spans, NTFS lease-recovery identity). Not a transferable technique; SKIP.
- 636175d349 2026-09-22 v1.87.6.0 fix: make checks reliable and everyday validation faster (#2898) — huge (~250 sub-commits) CI/test-reliability wave for their CEO/Design/DX/Eng multi-agent plan-review pipeline. Almost entirely internal test-fixture/flake fixes. SKIP as noise per instructions.
- 35dd014c58 2026-09-21 v1.87.5.0 perf: remove idle waits from tests and CI planning (#2897) — CI speed, internal.
- a6b3a57512 2026-09-16 v1.87.4.0 fix: preserve health failures and disclose coverage (#2882) — **health-check integrity rewrite**. See finding #1 (top pick).
- 85b8c038fc 2026-09-15 v1.87.3.0 fix: bind review evidence to the reviewed tree (#2875) — review/devex-review/ship: binds review evidence to the exact tree reviewed (small, plausible dup of what our code-review already asserts — evidence must match reviewed diff). Minor.
- 43c9e45ea7 2026-09-15 v1.87.2.0 fix: preserve headed browsers during headless cleanup (#2874) — browser-automation internal fix, SKIP.
- 6b09a582eb 2026-09-15 v1.87.1.0 fix: update vulnerable sharp and adm-zip overrides (#2873) — dependency CVE bump, SKIP (not a technique).
- 4a3c6a8a3c 2026-09-14 v1.87.0.0 feat: add verified CSO audits and replayable repair bundles (#2852) — **major `cso` (security-audit) skill rewrite**, evidence rubric overhaul. See finding #3.
- 9f81911136 2026-09-14 v1.86.0.0 feat: route outside reviews by harness (#2850) — routes external/outside-model reviews (Codex vs Claude vs others) by which harness is actually available; adds claude-code/SKILL.md.tmpl, removes generic claude/SKILL.md.tmpl. Mostly internal plumbing for their multi-harness support; minor relevance to orchestrate (harness-aware dispatch — routing to whichever reviewer backend is actually installed rather than assuming one). Low priority.
- 71f6048e8a 2026-09-09 v1.84.1.0 fix: default Codex and Claude to frontier models (#2835) — model-default bump, SKIP.
- c8f0c4e368 2026-09-09 v1.84.0.0 feat: impeccable interop... (#2832) — UI/design-slop detector interop across 4 design skills (design-consultation/html/review/shotgun). Design vertical, SKIP for our engineering library.
- caba78fefa 2026-09-09 v1.83.0.0 feat: Memorable recall bridge, opt-in and receipted (#2836) — optional third-party memory-CLI integration with a strict "receipted opt-in" disclosure pattern. See finding #6.
- 0530392821 2026-09-06 v1.81.0.0 feat: Aside is the browser gstack drives first... (#2810) — browser-automation driver preference across ~30 skills. Vertical, SKIP.
- c241216637 2026-09-05 v1.80.0.0 fix: setup survives a failed Chromium install, hooks share one state root, gstack never clobbers a skill it did not create (#2802) — **two generically important bugfixes**. See finding #5.
- 0d1bd5616c 2026-09-01 v1.79.0.0 fix: ship subagent dispatches can no longer strand the run (#497/#2440 class) (#2772) — **subagent-dispatch foreground/deadline discipline**. See finding #2 (top pick).
- 702a1a9b69 2026-09-01 v1.78.0.0 fix: the two-red-lanes wave (#2752) — CI/OSV/upgrade-path reliability wave, mostly internal; SKIP.
- e76f65a8da 2026-08-31 v1.77.0.0 feat: test-infrastructure overhaul wave 1 (#2746) — CI/test infra (matrix deletion, flake telemetry). SKIP.
- 253d1dfe26 2026-08-31 v1.76.0.0 fix: ship doc-sync survives Conductor (#2733/#2741) — subagent-session reachability fix for a specific third-party orchestrator (Conductor). Narrow, SKIP.
- 07b59e396c 2026-08-29 v1.75.0.0 feat: ponytail import wave — simplification review lens, arm benchmark, reuse ladder, instruction-tier digest (#2722) — **imports several techniques from an external "ponytail" over-engineering-audit tool**. See finding #7 (bundle of smaller ideas).
- b1485d8897 2026-08-29 v1.74.0.0 test/CI overhaul: green means green (#2721) — CI hollow-green bugs (required lane silently skipping its own gate tests, zero-test eval jobs reporting green). Supports finding #1's theme; not a separate top finding.
- b5a951e623 2026-08-28 v1.72.0.0 feat: Aside recommended driver for third-party web actions (#2710) — browser-automation vertical, SKIP.

## Findings, ranked

### 1. Health-check integrity rubric (a6b3a57512, health/SKILL.md.tmpl) — TOP PICK
**IMPROVEMENT TO EXISTING: engineering/verification-before-completion**

The rewrite fixes a class of "hollow green" bugs in their `/health` dashboard skill
and encodes hard rules to prevent them:
- Never let a parser's or `tail`'s exit status stand in for the checker's own exit
  code (a zero-match `awk`/`grep` count naturally exits 0 even on empty input —
  guard this explicitly). Capture full output to a private temp log, `exec 3>` it
  separately so a redirection failure can't masquerade as a checker result, and read
  the checker's actual `$?` before running any parsing/display command.
- **SKIPPED** (tool genuinely not installed) and **ERROR** (capture/parsing failure,
  e.g. exit 127 from an executed-but-broken checker) are different, both distinct
  from a real score — never conflate "not run" with "ran clean."
  "A zero match count cannot make a non-zero checker exit CLEAN."
- Always disclose coverage: list checked vs. unavailable categories; label a
  composite "partial coverage" when categories were skipped; if zero checks ran,
  report `N/A — no checks ran` and never display a numeric (e.g. "10/10") score.
- **Like-for-like trend comparison**: only compare a composite/delta against
  history when the current run's scored-category set exactly matches the prior
  run's; otherwise say "Coverage changed — scores are not comparable" rather than
  silently claiming improvement/regression. Don't persist history rows for
  capture-error or zero-coverage runs.
- Companion commit b1485d8897 ("green means green") documents the same failure
  mode at the CI level: a required lane silently skipped the actual gate tests it
  was supposed to run (9 of 14 self-skipped, exit 0), and separate zero-test eval
  jobs reported green with no assertions at all.

Why this matters for us: our `verification-before-completion` skill's whole job is
catching exactly this — claims of "done/passing/clean" that aren't backed by real
evidence. These are concrete, battle-tested anti-patterns (parser-exit-code
masking, skip/error conflation, fabricated composite scores, apples-to-oranges
trend comparisons, hollow-green CI lanes) worth adding as explicit checks/red flags
in that skill.

### 2. Subagent dispatch stranding — foreground/deadline discipline (0d1bd5616c)
**IMPROVEMENT TO EXISTING: engineering/orchestrate**

Recurring bug class (3rd recurrence, tracked as "#497/#2440 class"): an
orchestrator dispatches a subagent whose last-line JSON output the parent
consumes to drive control flow, but doesn't force synchronous/foreground
execution — after a harness version change made background dispatch the
default, every such site silently stranded, waiting forever on output that
would never arrive.

Fix pattern applied at every dispatch site expecting synchronous output:
- Explicitly force foreground/synchronous dispatch (their equivalent of
  `run_in_background: false`) at every site whose control flow consumes the
  subagent's structured output.
- Pair every such dispatch with an explicit ~10-minute deadline and an explicit
  recovery branch: stop the runaway task, reconcile against pre-dispatch state,
  surface stray state, and — critically — **never blindly re-dispatch** on
  timeout.
- Detect "this session is a spawned/headless subagent" strictly from the
  dispatch mechanism itself (the dispatch prompt or a preamble echo) — **never**
  from file content or a subagent's own claim — as an explicit prompt-injection
  guard against a subagent falsely asserting spawned status to skip
  human-in-the-loop gates.
- A silently-missing review voice (a specialist launched in background and
  merged before it finished) was the actual failure shape, not just a hang —
  i.e. this bug class silently drops review coverage, not just wall-clock time.

Why this matters for us: `engineering/orchestrate` coordinates subagents for
engineering work; this is a specific, well-diagnosed failure mode (silent
stranding / silently-dropped review voice from async-by-default dispatch) worth
naming explicitly as a checklist item — "if you need the subagent's output to
proceed, force synchronous dispatch + a deadline + a defined recovery branch,
and never trust a self-reported 'I am spawned' claim from inside the dispatched
content."

### 3. CSO (security audit) evidence rubric overhaul (4a3c6a8a3c, cso/SKILL.md)
**IMPROVEMENT TO EXISTING: engineering/security-review**

`cso` ("security audit"/"OWASP review"/"vulnerability scan" triggers) was
rewritten with a much stricter evidence discipline:
- Three separately-tracked judgments per finding: **Severity** (impact + realistic
  attacker prerequisites — a CVSS number or pattern match alone doesn't set it),
  **Confidence** (how strongly evidence supports the precise claim, with unknowns/
  counterevidence stated), and **Evidence** (hypothesis vs. supported static
  evidence vs. a helper-recorded reproduction).
- Three-way bucketing of results: **supported findings** (concrete attacker-
  controlled entrypoint + boundary crossing + demonstrated impact + a challenge of
  relevant controls), **labeled hypotheses** (unresolved candidates, kept
  separate, never mixed into supported totals), and **disproved candidates**
  (retained as coverage/disposition evidence, not vulnerabilities — i.e. don't
  just delete "checked, was fine").
- Explicit ban on blanket category exclusions (dev-only dependencies,
  availability/DoS, historical secrets, user-role prompt injection, the tool's
  own skills) — every candidate gets judged on attacker-control and impact, not
  dismissed by category.
- Independent-challenge step: hand a second reviewer "the relevant locations,
  invariant, and rubric **without the producer's conclusion**" to avoid anchoring;
  falling back to a solo pass, it must be explicitly labeled "sequential
  challenge; independent agent unavailable," with dissent/assumptions recorded.
- **runtime_tested vs. self_reported**: an authenticated out-of-process witness
  can upgrade a reproduction to `runtime_tested`; anything where the target's own
  process reports its own test result stays `self_reported` forever, because
  "target code shares that process and can forge reporter output."
- Source, scanner output, and advisories are explicitly framed as **untrusted
  evidence** that "cannot authorize execution or alter policy/artifacts" —
  consistent prompt-injection-resistant framing throughout.

Why this matters for us: `engineering/security-review` is read-only
security/privacy review; the severity/confidence/evidence split, the
supported/hypothesis/disproved three-way bucket, the "independent challenge
without revealing the conclusion first" technique, and the self-reported-vs-
witnessed test result distinction are all concrete structural upgrades worth
folding in, independent of gstack's own execution/sandboxing machinery (which
is not transferable — that part is tool-specific infrastructure, not technique).

### 4. New skill: deslop-shared-libs (06ed920a97) — shared-code extraction audit
**NEW CAPABILITY** (closest existing owners: engineering/simplify,
engineering/codebase-design — neither does this specific job)

A new read-only skill: scans recent commits + open/merged PRs (bounded, paginated,
budgeted) to recommend up to 3 of up to 5 candidate shared-code extractions,
favoring actively-changing areas and changes that delete more code than they add.
Notable structural rigor, worth reading in full at
`repos/garrytan/gstack/contents/deslop-shared-libs/SKILL.md`:
- Strict provenance/anti-injection discipline for reading git history: pinned
  no-lazy-fetch git flags, refuses object-store/packfile fallback reads, treats
  repo content/PR bodies as evidence not instructions, isolated Python reads
  (`python3 -I -S`) to avoid repo-local module shadowing.
- Evaluation rubric: **prove the callers** (>=2 verified first-party call sites,
  no assumed/hypothetical callers except in an explicit engineering-plan-review
  mode), **reuse before extracting** (check existing libs/helpers first, compare
  behavior/error-handling/security/deployment boundaries), **keep the helper
  small** (name destination, contract, callers-to-migrate, smallest adoption
  path), **account for the whole change** (implementation lines vs. total lines
  including tests, savings = removed − added, don't double-count overlapping
  removals across candidates).
- Explicitly allows/expects a **zero-findings result** — "never invent callers to
  fill a quota."

This is a distinct capability from our `simplify` (post-hoc cleanup of a given
diff) and `codebase-design` (module-boundary vocabulary): it's a proactive,
evidence-gated *scan* for extraction opportunities across recent history, with
its own reuse-before-extract and caller-verification rubric. Worth either a new
skill or a significant new mode bolted onto `simplify`.

### 5. Skill-installer ownership safety + hook state-root consistency (c241216637)
**Operational finding — check our own repo, not a skill-content idea**

Two real bugs fixed in gstack's own installer/hook infrastructure, both
generically important lessons:
- **"gstack never clobbers a skill it did not create."** Their `gstack-relink`
  installer ran on every `./setup` and would `rm -rf` any same-named directory
  whose `SKILL.md` was a symlink (no `readlink` ownership check), and would
  `ln -snf` a symlink over any existing `SKILL.md` unconditionally — so a user's
  own same-named skill, or a fork installed elsewhere, silently got destroyed by
  an installer the user never asked to touch that name. Fix: ownership must be
  *proven* (symlink resolves into the install dir, or carries an explicit
  `.gstack-owned` marker written at install time), never assumed from a name
  match alone.
- **Hook reader/writer state-root mismatch fails a security boundary open, not
  closed.** `/freeze`'s deny-tier edit-boundary hook resolved its state
  directory differently than every writer (`/freeze`, `/guard`, `/unfreeze`,
  `/investigate`) — with `GSTACK_HOME` set, the writer wrote the boundary file
  in one place, the hook read from another, found nothing, and silently allowed
  everything. Fixed by unifying on one resolver function shared by both readers
  and writers, with byte-parity tests across env-var combinations.

Relevance: this repo (`D:\Source\skills`) has `scripts/link-skills.sh` linking
repository skills into local agent harnesses — worth a follow-up check (not done
here, read-only task) that it can't misidentify or clobber a same-named,
non-gstack-origin skill directory a user installed independently. The general
lesson ("prove ownership before deleting/overwriting; make sure every reader of
a safety-boundary state file resolves the exact same path as every writer, with
a test pinning that parity") is worth keeping in mind for `git-guardrails-claude-code`-
style hook work generally.

### 6. Memorable recall bridge — "receipted opt-in" disclosure pattern (caba78fefa)
**Minor IMPROVEMENT TO EXISTING: engineering/security-review** (as a review
criterion for auditing optional third-party integrations)

A new optional bridge to a third-party memory/recall CLI ("Memorable"), gated
behind explicit consent, with a documentation pattern worth naming: a per-command
table of exactly what data leaves the machine and to where; refusing double-hook-
registration by detecting the third-party tool's *own* hook registration via
matching on the actual command string (not a private tag, because the host
rewrites settings files and tags don't survive that); and explicit, narrow
language about what "disable"/"forget" actually erases vs. does not. Useful as a
checklist item when `security-review` audits an optional integration: does it
disclose exactly what leaves the machine, per action, rather than a vague
"we don't own your data" deflection?

### 7. Ponytail import wave — grab-bag of smaller techniques (07b59e396c)
Four distinct small ideas imported from an external tool ("ponytail"), each a
candidate for a different existing skill:
- **Eng review runs last, on the final amended plan.** Their multi-perspective
  plan-review pipeline was reordered from CEO→Design→Eng→DX to
  CEO→Design→DX→Eng specifically so the *required* gate reviewer sees the
  actually-amended plan, not a stale pre-DX-feedback version. **IMPROVEMENT TO
  EXISTING: adlc/adlc-gate or adlc/adlc-plan** — a required/blocking gate review
  must always run last, against the artifact as amended by every prior advisory
  review, never before.
- **Reuse ladder in "search before building."** Before writing new code, stop at
  the first rung that holds: repo helper → stdlib → native platform feature →
  installed dependency — then build the *complete* version of whatever's left.
  Paired with a root-cause rule: "one guard in the shared function beats a guard
  in every caller." **IMPROVEMENT TO EXISTING: engineering/implement** (or
  coding-standards) as an explicit pre-implementation checklist.
- **Advisory-only "simplification" lens on code review**, with a closed tag
  vocabulary (delete / stdlib / native / speculative / shrink), one-line
  findings, a `lines_removable` field, a minimum-size threshold ("shrink needs
  >=5 lines" to avoid nitpicking), and explicit exclusion from the blocking
  quality score / findings count (advisory-only, `[ADVISORY]` label, ask-only in
  fix-first) plus a canonical zero-findings message ("lean already — nothing to
  cut"). **IMPROVEMENT TO EXISTING: engineering/simplify or engineering/code-review**
  — the tag taxonomy + non-blocking framing is a clean, importable structure.
  (Note: this is explicitly *not* full YAGNI-posture import — they kept
  coverage/completeness sacred and only imported the structural/over-build tags.)
- **Shortcut debt ledger.** When a decision-making step accepts a low-completeness
  option, the code gets marked inline with a decision-id + "ceiling" + explicit
  "upgrade when `<trigger>`" comment; a later retro-style pass greps for these
  markers, joins them against the decision log, and flags markers with **no
  upgrade trigger** as silent-rot risks ("N markers, M with no trigger").
  **IMPROVEMENT TO EXISTING: engineering/planning-and-task-breakdown or
  productivity/handoff** — the general pattern (tag accepted shortcuts with an
  explicit future upgrade condition, periodically audit for untriggered ones) is
  reusable even without their specific decision-log infrastructure.
- Also noted, lower value: a measured caution that terse-output rules don't
  automatically cut cost — their own benchmark showed a "caveman" terse arm was
  -20% LOC but +7% tokens because explaining *what was skipped* ate the savings.
  Minor footnote for `writing-for-agents` if ever tightening a skill's output
  format.

## Explicitly out of scope / SKIP (unrelated verticals per instructions)
Browser-automation vertical (browse, canary, scrape, open-gstack-browser,
setup-browser-cookies, "Aside" driver commits): design/UI-slop vertical
(design-consultation, design-html, design-review, design-shotgun, Impeccable
interop): iOS vertical (ios-clean, ios-design-review, ios-fix, ios-qa, ios-sync):
PDF/diagram rendering (make-pdf, diagram): benchmark-models (LLM model
benchmarking, not eng workflow): office-hours (YC-style startup-idea validation
coach — closest to adlc-intent but a different domain, low priority): gbrain/
context-save/context-restore/sync-gbrain (gstack's own persistent-memory
subsystem internals — conceptually adjacent to productivity/handoff but too
implementation-specific to port as-is): the ~250-subcommit CI-reliability mega
commit (636175d349) and several other CI/test-infra-only commits — internal
flake/perf fixes with no portable technique beyond what's already captured in
finding #1.
