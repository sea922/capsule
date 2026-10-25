# Sweep C — affaan-m/ECC `skills/` subtree, 2026-08-28 .. 2026-09-27

## Method note (important — a `gh api` bug was hit and worked around)

Step 1 as literally specified (`gh api "repos/affaan-m/ECC/commits?since=...&path=skills"`)
returned 28 commits, but **every single one of them was bogus**: each `html_url` pointed to
`https://github.com/wshobson/agents/commit/...` (a different, unrelated public repo), and
direct lookup of any of those SHAs via `repos/affaan-m/ECC/commits/{sha}` returned
`422 No commit found for SHA`. This looks like a GitHub API quirk where the `path`
history-simplification filter, combined with content-identical blobs vendored from another
public repo, misattributes commit provenance. **Do not trust `commits?path=...` for this
repo.**

Workaround used instead:
1. `gh api "repos/affaan-m/ECC/commits?sha=main&since=2026-08-28T00:00:00Z&until=2026-09-28T00:00:00Z&per_page=100"` paginated (3 pages, 294 raw rows, 250 after client-side date-window filtering) — these all had correct `affaan-m/ECC` html_urls and resolved fine individually.
2. To find exactly which files under `skills/` changed in the window without the 300-file cap of the `compare` API, did an exact tree diff: got the `skills` subtree sha at HEAD (`3a9b96de52ff19a09cb3f9747df9133db4efd309`) and at the commit immediately before the window (`e72191ba74085a440fd2bd5023e210a94d5da70f`, tree `81749d0a111dfd6cfdf04dcc2e8e12873f5859c6`), fetched both recursively, and diffed path→blob-sha line lists. This is authoritative and exhaustive (unlike the compare API which truncates at 300 files repo-wide, most of which weren't skills/ files anyway — repo has heavy hook/install/security work outside skills/ in this window).
3. Read raw SKILL.md content (head + base-ref) for the changed/added skills via `gh api repos/affaan-m/ECC/contents/skills/<path>?ref=<sha> -H "Accept: application/vnd.github.raw"`.

No `gh api` calls failed except the ones probing the (buggy) path-filtered commit shas above — all real-repo calls succeeded, rate limit never came close to exhausted (5000/5000 available throughout).

## Repo confirmation

`affaan-m/ECC` — description: "The agent harness performance optimization system. Skills,
instincts, memory, security, and research-first development for Claude Code, Codex, Opencode,
Cursor and beyond." Real repo, real activity, `skills/` is a plain directory (not a submodule)
with ~250 skill directories. Very active in the window: 250 commits landed on `main` in range,
the overwhelming majority about hooks/install/security/CI/dependency-bumps *outside*
`skills/`. Only a modest slice actually touched `skills/`.

## Full list of skills/ paths added, modified, or removed in window (from tree diff)

Modified (content changed, file already existed before window):
- `autonomous-agent-harness/SKILL.md` — substantial rewrite, see below
- `benchmark-methodology/SKILL.md` — frontmatter description reformatted (en-dash → "to", YAML long-string → single line). Cosmetic. SKIP.
- `continuous-learning-v2/agents/observer-loop.sh`, `continuous-learning-v2/hooks/observe.sh` — script-level fixes, SKILL.md itself unchanged in window. See below for what the skill does overall (not new to the window, but notable).
- `cost-tracking/SKILL.md` — added description of an incremental byte-cursor cache pattern for reading session cost totals without full rescans (bounded 16MiB catch-up per hook invocation, prune >30 days or >512 sessions). Domain-specific (LLM cost tracking, no analog in our library). SKIP, minor technique note only.
- `eval-harness/SKILL.md` — added ~35 lines "Local Framework Utilities": hash-linked capsule/journal, replay via content-addressed fixtures (fail closed if missing), and critically: candidate code execution is refused on every OS "because no verified OS containment backend is implemented" — no trust flag or caller-supplied executor can bypass the refusal. See below.
- `fal-ai-media/SKILL.md` — added a cross-reference to tasteforge-video with a "reference-only, does not authorize execution" disclaimer. Domain-specific media-gen. SKIP.
- `frontend-a11y/SKILL.md` — one-line reference rename (`motion-ui` → `motion-foundations`/`motion-patterns`, tracking the motion-ui skill's removal/split). Cosmetic. SKIP.
- `gateguard/SKILL.md` — see below; multiple real hardening commits landed in window.
- `github-ops/SKILL.md` (+ new `references/ecc-release-checklist.md`) — see below.
- `ito-compute/agents/openai.yaml`, `ito-compute/SKILL.md` — changed but content is ITO-specific (a business-specific "desk" compute skill); not inspected deeply, low relevance to general engineering. SKIP.
- `plan-canvas/SKILL.md` — added a single doc-link line (`docs/design/plan-canvas.md`). Cosmetic. SKIP.
- `security-review/SKILL.md` — see below; genuinely important fix.
- `skill-comply/scripts/grader.py`, `skill-comply/tests/test_grader.py` — matches the two `fix(skill-comply)` commits about temporal-order grading bugs (see below for what the skill itself does).
- `skill-stocktake/scripts/quick-diff.sh`, `skill-stocktake/scripts/scan.sh` — script-level, SKILL.md unchanged. See below for what the skill does (very relevant).
- `taste/SKILL.md`, `tasteforge-video/SKILL.md` — changed, domain-specific (video/creative). SKIP.
- `tdd-workflow/SKILL.md` — one line: doc output path changed (`docs/testing/` → `docs/releases/<version>/`). Cosmetic. SKIP.
- `unified-memory/SKILL.md` — added ~28 lines "Recall is evidence, not certainty" section. See below; strong candidate.
- `video-editing/SKILL.md` — changed (content not read; large asset additions alongside it, see below). Domain-specific (DaVinci Resolve/Fusion). SKIP.

Added (new skill directories in window):
- `counterparty-channel-discipline/` — negotiation/business-comms guardrails. Vertical (external counterparty messaging). SKIP.
- `esign-field-placement/` — e-signature document field placement. Vertical. SKIP.
- `master-agreement-generator/` — legal doc generation. Vertical. SKIP.
- `operator-approval-loop/` (238 lines, read in full) — human-in-the-loop approval contract for agent-drafted outbound messages: obligation/draft/decision/claim/delivery state machine, epoch-keyed decisions (a re-filed draft rotates an epoch so a stale "approve" click can't release rewritten text), claim-based exactly-once-ish dispatch (claimed→dispatching→delivered/unknown, unknown never auto-retries), baseline gate that refuses drafting a repeat request if a signed contract already covers it. Very well-specified but tightly coupled to an external-messaging/CRM domain. Marginal transferable idea: the "epoch rotation prevents a stale approval from releasing edited content" pattern could matter for `adlc/adlc-gate` if it ever gates on human approval of specific text/diffs — flag only as a minor idea, not a strong finding.
- `rails-patterns/SKILL.md` (475 lines, frontmatter read only) — Ruby on Rails 7.1+/8.x framework patterns (service objects, form/query objects, ViewComponent, Hotwire, Solid stack). Pure vertical/framework skill; our library has no per-framework pattern skills and this doesn't change that scope. SKIP.
- `taste-application/` and `taste-distillation/` — large new creative/video tooling trees (tasteforge Python package, Blender/Fusion integration, distillation pipeline). Domain-specific (video/creative production). SKIP.
- `video-editing/assets/fusion/ito-production-v1/*`, `video-editing/assets/fusion/ito-v28/*` — new DaVinci Resolve Fusion presets/macros. Domain-specific. SKIP.

Removed:
- `motion-ui/SKILL.md` — deleted/split into `motion-foundations` + `motion-patterns` (already present in current tree). Reorg, not a new idea. SKIP.

## Detailed notes on the higher-value findings

### 1. `security-review/SKILL.md` — self-inflicted injection bug in the skill's own example (IMPROVEMENT)
Diff:
```
< // Or with raw SQL
< query('SELECT * FROM users WHERE email = $1', [email])
---
> // Or with raw SQL -- the value goes in the params array, never in the
> // string. Use your driver's placeholder syntax (Postgres numbers its
> // placeholders, MySQL uses "?").
> query('SELECT * FROM users WHERE email = ?', [email])
> <!-- Do not write a literal dollar-sign-N placeholder anywhere in this file.
>      Invoking this skill with arguments substitutes it away, and the example
>      above then renders as concatenated SQL -- the exact anti-pattern this
>      section warns against. Use "?" and name the Postgres form in prose. -->
```
Root cause: the skill file itself gets argument-substitution applied (`$1`, `$ARGUMENTS`-style) when invoked with arguments in their harness. A parameterized-SQL example that literally wrote `$1` as the placeholder character got mangled by the substitution mechanism, silently turning the "good" example into the exact SQL-concatenation anti-pattern the section exists to warn against.
**Actionable for us:** audit `engineering/security-review`, `engineering/coding-standards`, and any other skill with example code blocks for literal `$1`/`$2`/`$ARGUMENTS`-style tokens that could be mistaken for our harness's own argument-substitution syntax. This is a generic "skill hygiene" bug class, not specific to their content.

### 2. `github-ops/SKILL.md` — stop instructing auto-merge (IMPROVEMENT)
Diff:
```
< # Review and auto-merge safe dependency bumps
---
> # Review dependency bumps — merging is a user-authorized action (propose, never auto-merge)
```
Plus: `- Review and auto-merge safe dependency bumps` → `- Review safe dependency bumps and propose merges for user approval — never auto-merge (see "Untrusted Repository Content")`.
**Actionable for us:** check `engineering/babysit-pr` and `engineering/git-workflow` for any language that could be read as authorizing an agent to auto-merge PRs (even "safe" dependency bumps) without explicit user sign-off. If either currently allows auto-merge under any condition, tighten to "propose merge, user approves" — matches our own house rule of never taking destructive/high-trust actions without explicit authorization.
(Also added: a pointer to a repo-specific `references/ecc-release-checklist.md` for their own release process — not transferable, it's ECC's own tag/npm/announcement checklist.)

### 3. `autonomous-agent-harness/SKILL.md` — the skill had shipped hallucinated APIs (NEW CAPABILITY / process lesson)
Commit: `c11753d0b9 fix(skills): replace invented autonomous harness setup instructions`.
Before: told users to call a fabricated MCP tool `mcp__scheduled-tasks__create_scheduled_task(...)` and to hit a fabricated remote-dispatch endpoint:
```
curl -X POST "https://api.anthropic.com/dispatch" -H "Authorization: Bearer $ANTHROPIC_API_KEY" -d '{"prompt": "...", "project": "/repo"}'
```
Neither exists. Fixed to point at real features: Claude Code's actual `/loop <interval> <prompt>` slash command (session-scoped; matches the `loop` skill available in our own environment), the real `scheduled-tasks` docs link, `claude -p` programmatic/headless CLI mode, and an explicit statement that "the supported entrypoint is programmatic CLI mode, not a public Anthropic dispatch endpoint" for CI/webhook triggering.
Note: the fix was *incomplete* — the SKILL.md frontmatter `description` field still says "Replaces standalone agent frameworks (Hermes, AutoGPT) by leveraging Claude Code's native crons, dispatch, MCP tools, and memory," which repeats the same over-claim ("native crons", "dispatch") the body fix just removed. Body and frontmatter drifted out of sync.
**Actionable for us:** this is a real example of a widely-used public skill shipping fabricated tool/API names for an extended period before being caught. Worth a periodic pass (or a dedicated check inside `writing-for-agents` / `skill-creator`-adjacent tooling, if we had one) that specifically greps skills describing automation/scheduling/dispatch for tool or endpoint names and verifies each one actually exists. Not urgent, but a good habit to fold into review of any of our own automation-flavored skills (e.g. anything touching `/loop`, `/schedule`, webhooks).

### 4. `skill-stocktake` (NEW CAPABILITY — strong candidate)
Full skill read. A slash-command skill (`/skill-stocktake`) that audits an entire skills library for quality/overlap/staleness:
- Two modes: **Quick Scan** (re-evaluate only skills changed since last run, 5-10 min, via `scripts/quick-diff.sh` comparing mtimes against a cached `results.json`) and **Full Stocktake** (20-30 min, evaluates everything).
- Phase 1 inventory (`scripts/scan.sh` — enumerates skill files, extracts frontmatter, collects mtimes and 7d/30d usage).
- Phase 2: dispatches a general-purpose subagent per ~20-skill chunk against a fixed checklist (overlap with other skills, overlap with MEMORY.md/CLAUDE.md, staleness of technical references via WebSearch, usage frequency) and a closed verdict set: `Keep` / `Improve` / `Update` / `Retire` / `Merge into [X]`.
- Enforces non-lazy reasoning: explicitly bans one-word reasons like "unchanged" or "superseded" — every verdict must restate concrete evidence (what defect, what covers the same need, what section/line range to cut).
- Persists results with resume support (`status: in_progress` resumes from the first unevaluated skill) and requires retire/merge to get explicit user confirmation before acting.
**Why this matters to us:** this is almost exactly the task we were just asked to do manually (sweep an external skills library for quality signal), except aimed at *our own* `D:\Source\skills\skills\` directory on a recurring basis. We have no equivalent self-audit skill. This is the single strongest "we should build something like this" finding in the whole sweep — a lightweight adaptation (scan + mtime-diff + subagent-chunked verdicts against a checklist, cached results.json, Keep/Improve/Update/Retire/Merge) would give us a repeatable way to catch exactly the kind of drift the `autonomous-agent-harness` and `security-review` bugs above represent, without a human having to do a manual GitHub archaeology sweep each time.

### 5. `gateguard` (NEW CAPABILITY — real hardening activity in window)
Full skill read (206 lines). A PreToolUse hook that blocks the *first* Edit/Write/MultiEdit touch to a file and every destructive Bash command, and demands concrete investigation facts (who imports this file, what's the data schema, quote the user's instruction verbatim) before allowing the action — explicitly framed as "self-evaluation doesn't work, ask 'are you sure' and the answer is always yes; investigation itself is what changes the output," backed by a small but real A/B measurement (+2.25 pts average across 2 tasks, gated vs ungated).
Real commits landed in-window closing evasion gaps in the destructive-Bash gate specifically:
- `7b7dfc6412` "detect destructive SQL passed quoted to SQL clients" (#3107)
- `bf70150eb2` "sanitize dangerous invisible unicode in denial paths" (#3103)
- `db61d1c76a` "warn that parallel-batch siblings may already be applied" (#3136) — now documented in SKILL.md as: when several edits to a not-yet-touched file are sent in one parallel batch, the first is denied but the siblings can still land (nothing rolls back), so dependent edits to a new file must be sent sequentially, not batched.
- `7cfc9b3608` "ignore heredoc prose for tee and path-qualified sinks" (#2886) — false-positive reduction.
**Why this matters to us:** we have no skill or hook that intercepts destructive Bash/Edit/Write calls and forces evidence before allowing them — our closest analogs (`engineering/diagnosing-bugs`, `engineering/verification-before-completion`) are about post-hoc verification, not pre-action gating. The "parallel-batch siblings can land even though the first call was denied" behavior is a subtle, concrete gotcha worth remembering if we ever build something similar or use hooks alongside our skills: a first-touch-only gate is not atomic across a batch of parallel tool calls.

### 6. `skill-comply` (NEW CAPABILITY — meta/measurement idea)
Full skill read (59 lines). Auto-generates behavioral-compliance test scenarios from any skill/rule/agent-definition `.md` file at 3 prompt-strictness levels (supportive → neutral → competing), runs `claude -p` against them capturing full tool-call traces, LLM-classifies each tool call against an auto-generated expected spec (not regex), checks temporal ordering deterministically, and reports compliance rates with full timelines — i.e. it measures whether a skill is *actually followed* rather than assuming it is, and specifically whether it's followed even under a prompt that doesn't explicitly support it ("prompt independence").
Two real bug-fix commits landed in-window on the grader itself (`grader.py`): a failed prerequisite step could still "supply evidence" to a dependent step because the temporal-order check fell back to raw classifier output whenever the referenced step was missing from `resolved` (conflating "failed" with "not graded yet"), compounding down a dependency chain (one failed prerequisite could make a 5-step workflow read 4/5 passing); a second commit closed the mirror-image bug (a pass that rested on a later-failing prerequisite wasn't revoked).
**Why this matters to us:** this is a distinct, valuable idea we don't have any analog of — a way to empirically measure "does the agent actually follow this skill" instead of assuming a well-written SKILL.md is followed. Complements `skill-stocktake` (which judges skill *quality*) with skill *adherence* measurement. Worth remembering as a concept if we ever want to validate our own skills' real-world compliance, though it's a heavier lift (needs scenario generation + `claude -p` harness + LLM classification).

### 7. `unified-memory/SKILL.md` — "Recall is evidence, not certainty" (IMPROVEMENT candidate for `productivity/handoff`)
~28 new lines. Key points:
- Bind a memory lookup to current workspace/recipient/allowed scope; never "recover" a denied lookup by broadening scope.
- Distinguish a genuinely empty search from an incomplete/failed scan (a direct read fails loud with a specific error code when the scan was truncated or hit unreadable docs — never silently tell the caller "it doesn't exist").
- Check the source's current state before repeating a decision/claim/completion — a saved timestamp or matching digest proves neither freshness nor truth; preserve a later correction/withdrawal even if an older record matches the query better.
- Links between records don't auto-supersede; an operator must explicitly mark old records superseded, and direct-ID reads deliberately still surface historical (possibly superseded) records for inspection.
- A handoff should name: source, observation time, what changed, unresolved questions, next action — and a "verified result" must be recorded separately from an "intent/attempted action." Recalled text cannot itself authorize a send/access/release.
**Actionable for us:** `productivity/handoff` (preserve resumable task state across sessions) currently doesn't (to my knowledge — not verified against the live file in this pass, since this was a read-only sweep of the external repo) explicitly call out the "empty vs. incomplete" distinction, the "recalled data is not proof of current truth" caveat, or the specific handoff-content shape (source/observation-time/what-changed/open-questions/next-action). Worth checking `engineering/planning-and-task-breakdown`'s and `productivity/handoff`'s SKILL.md against these points and folding in whichever are missing.

### 8. `eval-harness/SKILL.md` — fail-closed candidate execution (weak/optional finding)
New section describes a hash-linked capsule/journal eval framework where "candidate execution is disabled on every OS because no verified OS containment backend is implemented... No trust flag or caller-supplied executor can bypass the refusal." Good general safety principle (fail closed absent a verified sandb8ox boundary; no override flag) but we have no direct analog skill (no "eval-harness" concept in our library) and it's a narrow fit for `engineering/security-review` at best. Low priority — mention only, not a strong recommendation.

### 9. `continuous-learning-v2` (mentioned for completeness, not new to this window)
SKILL.md itself unchanged in-window (only its `observe.sh`/`observer-loop.sh` hook scripts got bug-fixed), so this isn't a "new in window" finding, but it's a notable capability we otherwise have no analog for: a hooks-driven (100%-reliable, not skill-probabilistic) system that observes every tool call, extracts atomic confidence-scored "instincts" (project-scoped vs. global, auto-promoted to global after appearing in 2+ projects at confidence ≥0.8), and evolves clusters of instincts into full skills/commands/agents via `/evolve`. Infra-heavy (background Haiku agent, hook wiring) — flagging only as a "big idea to know exists," not something to fold in casually.

### 10. `operator-approval-loop` (see "Added" list above) — noted, weak transferable value only.

## Summary of classifications
- NEW CAPABILITY (strong): `skill-stocktake` (self-audit-the-library tool), `skill-comply` (measure actual skill compliance, not assumed).
- NEW CAPABILITY (real but narrower fit / heavier infra): `gateguard` (pre-action fact-forcing gate + destructive-Bash evasion hardening), `continuous-learning-v2` (hook-driven instinct learning — not new-in-window but worth knowing about).
- IMPROVEMENT TO EXISTING: `engineering/security-review` (audit example code for literal `$1`/`$ARGUMENTS`-style tokens that our own harness might substitute away), `engineering/babysit-pr` / `engineering/git-workflow` (make sure neither implies auto-merge without explicit user approval, matching ECC's github-ops fix), `productivity/handoff` (add "recall is evidence not certainty": empty-vs-incomplete search distinction, recalled data isn't proof of current truth, explicit handoff-content shape).
- PROCESS LESSON (not a specific skill diff, but worth acting on): `autonomous-agent-harness`'s history of shipping fabricated MCP tool names / API endpoints for an extended period is a caution to periodically re-verify that any of our own skills describing automation/scheduling/dispatch only reference tools and endpoints that actually exist.
- SKIP (vertical/domain-specific, no generic engineering-workflow value): `rails-patterns`, `counterparty-channel-discipline`, `esign-field-placement`, `master-agreement-generator`, `operator-approval-loop` (mostly), `taste`/`tasteforge-video`/`taste-application`/`taste-distillation`, `video-editing` + Fusion assets, `fal-ai-media`, `ito-compute`, `frontend-a11y` (cosmetic rename only), `cost-tracking` (minor cache-pattern note only), `eval-harness` (weak fit), `benchmark-methodology`/`plan-canvas`/`tdd-workflow` (cosmetic-only diffs), `motion-ui` (removed/reorg only).
