# Per-Skill Enhancement Research (All 33 Skills)

## Freshness fingerprint

- **Research date:** 2026-11-21
- **Local repository revision:** `567141b4a510bc7adedca0c74676df021d77a1e2` (`main`, post-PR #77)
- **Monitored local paths:** `skills/**/SKILL.md`, `skills/**/references/**`, `skills/**/scripts/**`, `skills/**/assets/**`, `skills/**/evals/**`, `docs/workflow.md`, `docs/source-repos.md`, `scripts/validate-repo.mjs`, `skills/productivity/README.md`
- **Preferred source repositories window:** delta since `docs/research/2026-11-16-source-repos-sweep.md` (`2026-11-16` through `2026-11-21`), all 15 repositories in `docs/source-repos.md` preference order (revisions pinned in Section 3 below)
- **External specification checked:** Agent Skills specification (`https://agentskills.io/specification`, checked `2026-11-21` via web search — `description` required, max 1,024 chars)
- **Trust classes used:**
  - **Codebase** — direct inspection of current files, scripts, references, assets, and evals at `567141b`. Authoritative on current local behavior.
  - **Upstream** — direct inspection of commits and file diffs in the 15 preferred source repositories via `gh api` (not commit titles alone). External to this repo; single-source upstream proposals are marked `(single-source)` unless corroborated locally or by a second source.
  - **Inference** — synthesis and prioritization drawn from the codebase and upstream evidence.
- **Boundary:** Read-only on implementation. No skill, script, eval, or `docs/source-repos.md` entry was edited.

---

## 1. Executive summary

All 33 published skills are structurally valid and lean (`SKILL.md` ranges from 32 to 270 lines, well under the 500-line guideline; zero unquoted-colon YAML frontmatter errors across all 33 skills). However, deep per-skill inspection against our own authoring standard (`skills/writing-for-agents/SKILL.md`, `SKILL-MECHANICS.md`, `TESTING-SKILLS.md`, `docs/workflow.md`) plus a 5-day upstream delta check across all 15 preferred source repositories surfaces **concrete script bugs, internal contradictions, progressive-disclosure leaks, cross-skill seam mismatches, and near-universal eval debt** following the 2026-11-16 sweep.

The highest-leverage enhancements do **not** bloat skills with more prose. Most are **in-place bug fixes, contradiction resolutions, structural template slots, pruning duplicated text, and upgrading `evals/evals.json`**.

### Priority rollup across all 33 skills

| Priority | Count | Skills | Primary drivers |
| --- | --- | --- | --- |
| **High** | 8 | `adlc-gate`, `babysit-pr`, `diagnosing-bugs`, `implement`, `orchestrate`, `sprint-planning`, `verification-before-completion`, `writing-for-humans` | Real script bugs (`check_preservation.py`, `install-agents.mjs`, `content-hash.mjs`), direct internal/cross-file contradictions, read-only vs mutation/revert safety conflicts, discipline rationalization gaps, 61-line inline schema leak |
| **Medium** | 17 | `adlc-flow`, `adlc-plan`, `codebase-design`, `coding-standards`, `compound-learnings`, `git-workflow`, `git-worktrees`, `grilling`, `html-writeup`, `planning-and-task-breakdown`, `pr-description`, `pr-images`, `property-based-testing`, `research`, `security-review`, `skill-evolve`, `writing-for-agents` | Specific contradictions (`NAVIGATION.md`, `research` trust class, `compound-learnings` `Keep`/`verified_at`, `pr-images` Step 2/7, `writing-for-agents` `Deliver`/Eval 2), `check_html.py` & `git-kit.mjs` bugs, eval contamination (`coding-standards`, `grilling`), frontmatter bloat/leaks, missing template slots |
| **Low-Medium / Low** | 8 | `adlc-intent`, `adlc-spec`, `code-review`, `handoff`, `prototype`, `ship-it`, `simplify` (Low) | Already tight and disciplined; need surgical 1–3 line fixes (e.g., `ship-it:45` "removed" ambiguity, `prototype:20` typo, `adlc-intent:32` `/grilling`) plus eval coverage of 2026-11 rules |

*(Count check: 8 High + 17 Medium + 7 Low-Medium + 1 Low = **33 skills**.)*

---

## 2. Cross-cutting systemic enhancements

Six patterns recur across multiple skills and should be fixed systematically rather than ad hoc:

1. **Universal eval debt and schema drift (Codebase):**
   - **10 of 33 skills omit `expectations` arrays** in `evals/evals.json` (`adlc-flow`, `adlc-gate`, `adlc-intent`, `adlc-plan`, `adlc-spec`, `git-workflow`, `git-worktrees`, `orchestrate`, `pr-description`, `pr-images`), despite `skills/writing-for-agents/references/TESTING-SKILLS.md:162` declaring `expectations` as this library's checkable assertion field and `scripts/validate-repo.mjs:81-98` not enforcing it.
   - **32 of 33 skills have `"files": []` on every eval** — only `simplify` ships runnable fixture files (`report.mjs`, `report.test.mjs`).
   - **0 of 33 skills have trigger-routing evals** (positive `top_k` + negative sibling `owner`), despite 28 model-invoked skills sharing **12,587 characters** (avg 450 chars) of always-loaded `description` text every turn. (`addyosmani/agent-skills@675e6d95` demonstrates compact positive/negative trigger specs alongside execution evals.)
   - **Nearly 0% of the 2026-11-16 sweep rules** (applied to 29 skills in commit `c401482`) have eval cases yet — confirming the limit noted in `docs/research/2026-11-16-source-repos-sweep.md:233-237`.

2. **Real script bugs and high-leverage automation gaps (Codebase):**
   - **Bugs in existing scripts:**
     - `skills/writing-for-humans/scripts/check_preservation.py:29,53-61` — 4 regex bugs silently miss `"200."`, `"90-day"`, `"v2.4"`, `"9:30 AM"`, `"a.m."`, and URLs ending in `=_−`.
     - `skills/engineering/orchestrate/scripts/install-agents.mjs:464` — `if (import.meta.main)` silently exits 0 with no output on Node < 24.2.
     - `skills/engineering/git-workflow/scripts/git-kit.mjs:231` — `status` throws fatally on an unborn branch (`HEAD` missing).
     - `skills/html-writeup/scripts/check_html.py:84-85,147-148,152,165-167` — misses remote ESM imports, passes when only one `<th>` has `scope`, false-positives on `${{ }}` in code blocks, scans prose for CSS `animation|transition`.
     - `skills/adlc/adlc-gate/scripts/content-hash.mjs:38,47` — defaults `cwd` to `process.cwd()` instead of `dirname(resolve(file))` and checks `/^\|.*\|$/` instead of 6 unescaped columns.
   - **High-leverage new scripts (tool rung per `writing-for-agents/SKILL.md:87-91,182-186`):**
     - `skills/adlc/adlc-gate/scripts/verify-chain.mjs` — mechanical read-only verifier for `intent -> spec -> plan -> progress` status, decision rows, hash equality, and `source:` links (lets all 5 ADLC skills prune duplicated manual chain-walk prose).
     - Optional `skills/engineering/verification-before-completion/scripts/scan-weakened-checks.*` — deterministic diff scan for newly skipped tests, lowered thresholds, and inline suppressions.
     - Optional `skills/writing-for-agents/scripts/check_skill.*` — enforces its own mechanical checks (`< 1024` frontmatter, `< 500` lines, relative links, TOC > 300 lines, `@`-paths, `evals.json` shape).

3. **Shared cross-skill safety & rule contradictions (Codebase):**
   - **Evidence-gated work vs safety fallback:** `implement/SKILL.md:66` (*"When you cannot tell, build it"*) contradicts `codebase-design/SKILL.md:107-108` and `planning-and-task-breakdown/SKILL.md:16` (present-evidence bar).
   - **All-internal deletion:** `implement/SKILL.md:66` (unconditional same-change delete) vs `codebase-design/references/DEEPENING.md:79` (same-change delete only when no persisted data/queues/rolling deploys read the old shape) vs `codebase-design/references/TESTING.md:78-88` (unconditional incremental migration).
   - **Forced-mutation & revert-arm safety:** `tdd/SKILL.md:115` guards dirty trees + requires pristine diff; `diagnosing-bugs/SKILL.md:81` conflicts with its own read-only boundary (`:26`); `property-based-testing/SKILL.md:41` lacks both guardrails; `verification-before-completion/SKILL.md:50,53` asks for unpatched/reverted runs with no isolated-copy guardrail despite `:12`.
   - **Pre-existing failure operational test:** `implement/SKILL.md:70` defines it (with a loophole on *"first run of that check"*); `tdd/SKILL.md:79` asks to distinguish them without stating the operational test.
   - **Fuzzing-campaign routing mismatch:** `property-based-testing/SKILL.md:3` & `libraries.md:28` route coverage-guided/security fuzzing campaigns to `security-review`, which never mentions fuzzing.

4. **Always-loaded context budget & frontmatter hygiene (Codebase):**
   - 28 model-invoked skills spend **12,587 chars** (~3,100 tokens) every turn. Pruning duplicated identity/synonym lists in `git-workflow` (922 chars, near the 1,024-char spec cap), `codebase-design` (775 chars), and `sprint-planning` (584 chars), and removing workflow/section leaks in `pr-images` and `pr-description`, recovers ~600–800 always-loaded chars while improving trigger precision.
   - Several descriptions close with vague boundaries (*"dedicated workflows"*, *"belongs elsewhere"*) instead of naming sibling skills per `SKILL-MECHANICS.md:59-60`.

5. **Repo map & README sync gaps (Codebase):**
   - `docs/workflow.md:5-24` omits 10 directly invocable skills from its entry-point table (`sprint-planning`, `tdd`, `verification-before-completion`, `git-workflow`, `git-worktrees`, `pr-description`, `pr-images`, `babysit-pr`, `writing-for-agents`, `writing-for-humans`, `html-writeup` — several appear only in footer prose). `docs/workflow.md:55` hardcodes a Claude/Codex binary; `docs/workflow.md:57` claims reuse-first applies in planning, which `planning-and-task-breakdown/SKILL.md` omits.
   - `skills/productivity/README.md:8` links `[handoff](../../docs/productivity/handoff.md)` instead of ``[`handoff`](handoff/SKILL.md)``.

6. **Eval contamination ("teaching to the test") (Codebase):**
   - `coding-standards/references/BACKEND.md:41-44` & `FRONTEND.md:32-35` nearly verbatim mirror `coding-standards/evals/evals.json` IDs 1–2.
   - `grilling/SKILL.md:41` literally uses the exact paid-plan unlimited-guests scenario tested in `grilling/evals/evals.json` ID 1.

---

## 3. Preferred source repositories delta (`2026-11-16` → `2026-11-21`)

All 15 repositories from `docs/source-repos.md` were checked in preference order on `2026-11-21` via `gh api` against the revisions pinned in `docs/research/2026-11-16-source-repos-sweep.md`.

| # | Repository | Prev SHA | Head SHA (Date) | Commits in window | Influence / Applicability |
| --- | --- | --- | --- | --- | --- |
| 1 | [`mattpocock/skills`](https://github.com/mattpocock/skills) | `5863806` | `abeeaf956` (2026-11-19) | 4 | **Method influence:** `37209058` added CI strict-YAML frontmatter validation after an unquoted colon broke installers. Checked all 33 local skills (0 unquoted colons); reinforces keeping strict YAML parsing in `scripts/validate-repo.mjs` and `writing-for-agents`. |
| 2 | [`obra/superpowers`](https://github.com/obra/superpowers) | `22f0b46` | `22f0b463e` (2026-11-03) | 0 | No changes since 2026-11-16 sweep. (Existing rationalization-table / red-flags discipline model informs our local audits of `diagnosing-bugs`, `verification-before-completion`, and `tdd`.) |
| 3 | [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | `39b723c` | `8c99fa36d` (2026-11-18) | 18 | **Direct influence:** (a) `92499588` in `code-review-and-quality`: verify clean checkout + exact reviewed ref (`git status --short` empty, `git rev-parse HEAD` matches PR head) before running tests/probes during review -> `code-review`; (b) `675e6d95` / `701e2cba`: positive (`top_k`) + negative (`owner`) trigger evals alongside execution evals + recording runs for historical regrading -> `writing-for-agents`, `skill-evolve`, repo evals; (c) `1ffd5699`: new `accessibility-engineering` skill + WCAG 2.2 AA touch-target update (`24x24` AA vs `44x44` AAA) -> noted for `coding-standards` frontend / future skill consideration. |
| 4 | [`cursor/plugins`](https://github.com/cursor/plugins) (`pstack`) | `bf0c7cd8` | `d42aff08a` (2026-11-20) | 4 (`pstack/`) | **Method influence:** `2f87c854` aggressively shortened 14 principle leaves + `unslop` + PR playbook while preserving rules & tests (validates our edit/prune-over-append stance); `0b46ec39` fixed native Windows + `\r\n` handling (corroborates our Windows portability fixes in `html-writeup`, `writing-for-humans`, `pr-images`, `git-workflow`). Model-routing updates (`e58dd043`, `dd24b670`) are Cursor-specific (N/A). |
| 5 | [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) | `96608e0` | `96608e078` (2026-10-29) | 0 | No changes since 2026-11-16 sweep. (Its reuse-first discipline informs our finding that `planning-and-task-breakdown` omits `docs/workflow.md:57`.) |
| 6 | [`mvanhorn/last30days-skill`](https://github.com/mvanhorn/last30days-skill) | `f32f440` | `bb2f1ed2b` (2026-11-20) | 62 | **Targeted influence:** `7eb049bc` stopped `SKILL.md` naming directories as support files (third-party skill scanners/installers reject folder paths listed as files) -> check in `writing-for-agents` (`SKILL-MECHANICS.md`); `2ba02e59` / `60e06b52` / `5705e226` / `f67a21d4` reinforce keeping private context out of published briefs and reporting partial source discovery honestly -> already aligned with `research` (`RECENT-EVIDENCE.md`). Most commits are engine/provider/person-run work (N/A). |
| 7 | [`anthropics/skills`](https://github.com/anthropics/skills) | `1780c5e` | `e4bb5d960` (2026-11-16) | 1 | Not applicable this window: only `skills/docx/SKILL.md` and `skills/pptx/SKILL.md` changed; `skill-creator` unchanged. |
| 8 | [`trailofbits/skills`](https://github.com/trailofbits/skills) | `149d7b2` | `149d7b21f` (2026-11-12) | 0 | No changes since 2026-11-16 sweep. |
| 9 | [`EveryInc/compound-engineering-plugin`](https://github.com/EveryInc/compound-engineering-plugin) | `ee46dde7` | `58d1a83d9` (2026-11-20) | 12 | **High direct influence:** (a) `0f7ae5ed` (`ce-babysit-pr`): hold a failed check while its rerun is still in progress -> `babysit-pr`; (b) `26e86a95` (`ce-compound/references/form.md` & `ce-debug/references/fix.md`): when a verified property rests on multiple guards, break each guard alone in a throwaway copy and confirm the check fails each time -> `tdd`, `verification-before-completion`, `diagnosing-bugs`; (c) `a3d6a8ee` (`ce-debug/references/fix.md`): fix every other site repeating the root-cause mistake as part of the minimal fix (except divergent or user-dirty sites, reported as residuals) -> `diagnosing-bugs`, `implement`; (d) `033f82dd`, `8c6ad30c`, `58d1a83d` (`ce-compound`): cite code by file + symbol (function/class/config key) rather than brittle line numbers, verify code claims against the merge-target branch rather than a multi-branch working tree, flag past-EOF line numbers, and use an explicit `status: stale` + `stale_reason` + `stale_date` lifecycle cleared when settled -> `compound-learnings`; (e) `8d9796f6` (`ce-explain`): short path for plain why/how questions from git/PR record & source+tests (no local explainer skill; minor alignment with `research`). |
| 10 | [`garrytan/gstack`](https://github.com/garrytan/gstack) | `a15a0de7b` | `92c57ca4c` (2026-11-20) | 100+ | **High direct influence:** (a) `01097037`: **never place raw security finding locations (`file:line`) or exploit reasons in public PR bodies** (PR edit history is permanent; keep details in private reports) -> `pr-description`, `security-review`; (b) `a529769e` (`/cso`): audit repos with tracked symlinks by recording target strings lexically without following them (and withholding targets matching secret patterns) -> `security-review`; (c) `0a6bb42e`: mark carried/reused CI runs that passed only after a rerun so flaky passes aren't presented as clean first-attempt passes -> `verification-before-completion`, `ship-it`; (d) `36b349d6` / `2f57b074`: fail closed on truncated/cut-off command output instead of judging partial output (e.g., secret/diff/check scans) -> `verification-before-completion`, `babysit-pr`, `security-review`; (e) `45e6d549`: a second review round must actually review fixes touching gate-class paths (CI, auth, merge checks) rather than reporting done -> `code-review`, `orchestrate`, `ship-it`; (f) `0b656a17` (`owner-answers`): pilot for checking earlier owner answers before re-asking (measured ~1% hit rate; **deferred** — single-source pilot, not worth adding complexity locally until proven). |
| 11 | [`affaan-m/ECC`](https://github.com/affaan-m/ECC) (`skills/`) | `d2ef2680` | `4adeee673` (2026-11-20) | 40 (`skills/`) | **Targeted influence:** `63bcb324` (`skill-stocktake/scripts/scan.sh`): fail visibly on incomplete observation logs rather than reporting partial usage counts -> corroborates fail-closed evidence discipline in `skill-evolve` and `research`. Other commits are UI canvas, SwiftUI, Django/Celery, and harness adapter fixes (N/A). |
| 12 | [`wshobson/agents`](https://github.com/wshobson/agents) | `9c61ab2` | `42203085c` (2026-11-18) | 6 | Not directly applicable to local skills: PCI DSS v4.0.1 titles, retired MeiGen listing, `protect-mcp@0.32.4` receipt hash-chaining (`b7c518aa`). Note: `b7c518aa`'s lesson that `PostToolUse`/CLI scripts can exit 0 while failing to persist or leaving truncated tails is useful defensive context for `adlc-gate` verification, though `adlc-gate` already recomputes hashes after writing. |
| 13 | [`nahid-sparktales/agent-dispatcher`](https://github.com/nahid-sparktales/agent-dispatcher) | `564c3f0` | `564c3f0e3` (2026-09-29) | 0 | No changes since 2026-09-29. |
| 14 | [`humanlayer/skills`](https://github.com/humanlayer/skills) | `4d69d20` | `4d69d20f6` (2026-11-01) | 0 | No changes since 2026-11-16 sweep. |
| 15 | [`testdouble/han`](https://github.com/testdouble/han) | `abba73a` | `abba73a77` (2026-09-22) | 0 | No changes since 2026-11-16 sweep. |

### Single-source upstream caveats

Per `research/SKILL.md:31`, upstream items supported by only one external repository without a second independent source or local codebase failure are tagged `(single-source)` in the per-skill sections below and should be weighed conservatively (or validated with an eval before adoption).

---

## 4. Per-skill enhancement audit (all 33 skills)

### A. ADLC Suite (`skills/adlc/`)

#### 1. `adlc-flow` — Priority: **Medium**
- **Files:** `SKILL.md` (65L, user-invoked), `evals/evals.json` (4 evals, 0 `expectations`).
- **Codebase findings:**
  - **Buried completion gate (`SKILL.md:32,54,56`):** Step 2's table ends at `L54` ("Take the first unresolved row"), while the 2026-11 unapproved-scope diff check sits in prose *below* the table at `L56` (and omits the diff base and handling of unrelated dirty files).
  - **Multi-slice single-PR ordering hazard (`SKILL.md:50-52` vs `adlc-plan:40`):** Row `L50` (slice verified -> `ship-it`) precedes `L51` (ready/in-progress slices -> `implement`) and `L52` (combined acceptance). On a multi-slice plan with the default one-PR delivery shape, this prematurely routes S1 to `ship-it` before S2 is built. Row `L47` (`blocked`) also precedes `L51` (`ready`), relying on prose at `L56`.
  - **Overloaded routing rows (`SKILL.md:38,41,44`):** Combine `draft, rejected, or stale` into one row (unlike `docs/adlc/adlc-flow.md:13-14`, which splits them cleanly). `L37` references a superseded artifact's *"recorded replacement"* with no defined frontmatter field.
- **Evals gap:** Missing `expectations` on all 4 evals; untested: unapproved-scope diff (`L56`), single-PR multi-slice ordering, multi-work-item disambiguation (`L22`), and read-only pressure.
- **Concrete enhancements (edit/prune over append):**
  1. Move `L56`'s unapproved-scope check into a table row above `L54` (specifying diff base & preserving unrelated dirty files) and delete the duplicate prose sentence.
  2. Fix row ordering for grouped/single-PR delivery (`ship-it` waits until the PR group's slices are verified + combined acceptance checked), split `rejected` from `draft`/`stale`, and state slice-selection tie-breaking (in-flight actionable > `ready`, skipping `blocked` when another slice is actionable).
  3. Delegate `L24`'s manual chain walk to the proposed `adlc-gate/scripts/verify-chain.mjs` once added.
  4. Add `expectations` to evals 1–4 + 2 new cases (unapproved-scope diff; S1 verified + S2 ready under single-PR delivery).

#### 2. `adlc-gate` — Priority: **High**
- **Files:** `SKILL.md` (82L, user-invoked), `references/APPROVALS.md` (92L), `scripts/content-hash.mjs` (65L), `scripts/content-hash.test.mjs` (98L), `evals/evals.json` (4 evals, 0 `expectations`).
- **Codebase findings:**
  - **Contradiction 1 (`SKILL.md:40` vs `42-47`):** `L40` says to fill the ready-to-send lines *"with the stage"*, but `L42-47` omit both `<stage>` and reviewed revision hash (`approved — <name> (<role>)`).
  - **Contradiction 2 (`SKILL.md:59` vs `APPROVALS.md:71-73` & `content-hash.mjs:42-44`):** `SKILL.md:59` permits *"creating the table when absent"* at Step 4. If `## Approvals` is absent (`approvals === -1`), adding it at Step 4 changes `reviewedContent`'s trailing newline (`content-hash.mjs:44`), breaking `SKILL.md:75`'s recomputed hash check! `APPROVALS.md:71-73` correctly requires creating/disclosing the heading *before* showing the revision to the human.
  - **Contradiction 3 (`SKILL.md:71` vs `adlc-plan/references/PROGRESS.md:68`):** `SKILL.md:71` puts `date` 5th (`decision ID, slice, human decision, approver, date, ...`), whereas `PROGRESS.md:68` puts `Date` 2nd (`ID | Date | Slice | Decision | ...`).
  - **Omitted exit criterion (`SKILL.md:26`):** `spec` exit criteria check intent conditions and open questions, but omit intent `Assumptions` with `decide by: spec` (`adlc-intent:45`, `adlc-spec:15`).
  - **Script defects (`scripts/content-hash.mjs:35-48,58-60`):** Defaults `cwd` to `process.cwd()` instead of `dirname(resolve(file))` (forcing `APPROVALS.md:8-9` prose warning and risking SHA-1/SHA-256 mismatch outside the target repo); validates rows with `/^\|.*\|$/` rather than 6 unescaped columns; emits a generic error on header whitespace mismatches.
  - **Undefined metadata syntax:** `sole approver` (`SKILL.md:49`, `APPROVALS.md:77`) and `superseded` replacement pointer (`SKILL.md:69`) have no defined field format. Duplicated recording rules across `SKILL.md:59-73` and `APPROVALS.md:68-92`.
- **Evals gap:** Missing `expectations` on all 4 evals; untested: soft-approval / `git config` name pressure (`L53`), `/adlc-gate slice <id>` rejecting a bare PR URL (`L15,28,71`), and preserving a failed self-check under explicit human exception (`L32,71`).
- **Concrete enhancements:**
  1. Fix all 3 contradictions in `SKILL.md` (`L42-47` include `<stage>` + hash; `L59` align with `APPROVALS.md:71-73`; `L71` point to `../adlc-plan/references/PROGRESS.md` instead of restating columns), add intent `Assumptions` due by `spec` to `L26`, and prune duplicated recording prose.
  2. Harden `scripts/content-hash.mjs` (`cwd = dirname(resolve(file))`, 6-column row validation, targeted errors) and add a tested `scripts/verify-chain.mjs` for full ADLC chain integrity.
  3. Define exact frontmatter/table conventions for `sole approver` and `superseded_by` in `APPROVALS.md`.
  4. Add `expectations` to evals 1–4 + 2 cases (slice gate + soft-approval/`git config` pressure).

#### 3. `adlc-intent` — Priority: **Low-Medium**
- **Files:** `SKILL.md` (51L, user-invoked), `references/INTENT.md` (60L), `evals/evals.json` (2 evals, 0 `expectations`).
- **Codebase findings:**
  - **Wrong skill notation (`SKILL.md:32`):** Writes `Run /grilling`, though `grilling` is model-invoked (not a user-only `/command`), risking the agent pausing for the user to type `/grilling`.
  - **History sediment (`SKILL.md:17`):** *"so hashing no longer requires changing the target repository's `.gitattributes`"* leaks past-version narrative (`SKILL-MECHANICS.md:182-184`).
  - `references/INTENT.md:45,49` omit `"none"` guidance for empty Assumptions/Open questions (while `adlc-gate:25` expects every section answered or `"none"`), and lack slots for `superseded_by` / `sole approver`.
- **Evals gap:** Only 2 evals, 0 `expectations`; missing 2026-11 restatement before first question (`L27`), deep-mode `grilling` (`L32`), revising an approved/rejected intent (`L15,48`), and resisting solution/file-choice bleed (`L40`).
- **Concrete enhancements:**
  1. Change `/grilling` → `grilling` at `L32` and rewrite `L17` positively without history narrative.
  2. Add `"none"` guidance and standardized `superseded_by` / `sole approver` format to `references/INTENT.md`.
  3. Add `expectations` to evals 1–2 + 2 new cases (L27 restatement + solution-bleed resistance; deep-mode `grilling` / revision preserving `## Approvals`).

#### 4. `adlc-plan` — Priority: **Medium**
- **Files:** `SKILL.md` (51L, user-invoked), `references/PLAN.md` (63L), `references/PROGRESS.md` (95L), `evals/evals.json` (3 evals, 0 `expectations`).
- **Codebase findings:**
  - **Missing template slot (`SKILL.md:40` vs `references/PLAN.md:57-60`):** `SKILL.md:40` (2026-11) requires recording `delivery shape`, but `PLAN.md:57-60` (`## Handoff`) has no `- Delivery shape:` bullet (`writing-for-agents:136`).
  - **Incomplete composition override (`SKILL.md:27` vs `planning-and-task-breakdown/SKILL.md:59`):** Overrides status refresh in the plan, but does not override `planning-and-task-breakdown:59`'s rule to auto-continue into `implement` when implementation is already authorized — under ADLC, `adlc-plan` must stop at `/adlc-gate plan` (`L48`).
  - **Pronoun ambiguity (`SKILL.md:40,48`):** *"that skill"* appears after mentioning `implement`, `orchestrate`, and `ship-it`; name `planning-and-task-breakdown` explicitly.
  - `adlc-gate:27` (`plan` exit criteria) does not yet check `Delivery shape` or `Review focus`.
- **Evals gap:** Missing `expectations` on all 3 evals; untested: 2026-11 delivery shape (one-PR default vs justified split), spec-contradiction bounce (`L25`), and pre-authorized-build pressure stopping at `/adlc-gate plan`.
- **Concrete enhancements:**
  1. Add `- Delivery shape:` to `references/PLAN.md:57-60` (and check it in `adlc-gate:27`).
  2. Extend `SKILL.md:27` to explicitly override `planning-and-task-breakdown:59` auto-continuation; replace *"that skill"* at `L40,48` with `planning-and-task-breakdown`.
  3. Point `L13` to `verify-chain.mjs` once built; add `expectations` + 2 evals (delivery shape + pre-authorized-build gate stop / spec-contradiction bounce).

#### 5. `adlc-spec` — Priority: **Low-Medium**
- **Files:** `SKILL.md` (48L, user-invoked), `references/SPEC.md` (68L), `evals/evals.json` (2 evals, 0 `expectations`).
- **Codebase findings:**
  - **Template lag in `references/SPEC.md` for 2026-11 rules (`writing-for-agents:136`):** `SKILL.md:23` requires Out-of-scope items *"with what would bring it back"* (`SPEC.md:41-43` has no return-trigger slot); `SKILL.md:25` requires delta specs to state prior spec, current behavior, new behavior, and what must not change (`SPEC.md:17-19` has no optional delta block); `SKILL.md:37` / `SPEC.md:65-67` lack a 1-line retired-AC syntax example (`- **AC-004** (retired) — <reason>`).
  - `SPEC.md` has no slot noting which intent `Assumptions` due by `spec` (`SKILL.md:15`) were settled.
- **Evals gap:** Only 2 evals, 0 `expectations`; both 2026-11 rules (`L23`, `L25`) and stale/contradicted intent bounce (`L13,29`) are untested.
- **Concrete enhancements:**
  1. Add return-trigger format, optional delta-spec block, settled-assumptions note, and 1-line retired-AC example to `references/SPEC.md`.
  2. Point `L13` to `verify-chain.mjs` once built; add `expectations` to evals 1–2 + 2 new cases (delta spec + Out-of-scope return triggers; stale/contradicted intent bounce).

---

### B. Productivity (`skills/productivity/`)

#### 6. `grilling` — Priority: **Medium**
- **Files:** `SKILL.md` (68L, model-invoked), `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **Eval contamination (`SKILL.md:41` vs `evals/evals.json:6,12`):** `SKILL.md:41` uses the exact paid-plan unlimited-guests example (*"intended user and guest definition before asking about conversion thresholds, packaging, limits, or rollout evidence"*) that Eval 1 tests verbatim — defeating generalization testing (`TESTING-SKILLS.md:42`).
  - **Frontmatter polish (`SKILL.md:3`):** Add natural phrasing (`poke holes in`, `interview me`) and name sibling boundaries (`research`, `code-review`, `planning-and-task-breakdown`) instead of generic *"information retrieval, or review of a completed artifact"*.
  - **Minor flow gaps (`SKILL.md:39`, Steps 4–5):** Clarify listing non-outcome-changing proposals separately from numbered questions (so the user knows what requires an answer vs passive correction), and add a 1-sentence early-exit rule if the user aborts mid-interview (return settled decisions + unconfirmed assumptions without claiming confirmation).
- **Upstream note:** `garrytan/gstack@0b656a17` piloted checking prior owner answers before re-asking (measured ~1% hit rate across 444 asks) — `(single-source)` pilot; **defer** cross-session answer storage locally until proven valuable.
- **Evals gap:** Eval 1 is contaminated; neither 2026-11 rule in `L39` (yes-polarity accepting recommendation; stated proposals) nor multi-turn Step 4/5 (challenging contradictory answers and returning clean confirmed summary without starting to build) is tested.
- **Concrete enhancements:**
  1. Replace `SKILL.md:41`'s example with a different domain (or move Eval 1 to an unseen domain).
  2. Edit `L3` (natural triggers + named siblings), `L39` (separate proposals from questions), and Step 4/5 (early-exit honesty).
  3. Add L39 expectations + 1 multi-turn Step 4/5 eval (contradictory reply + pressure to start building).

#### 7. `handoff` — Priority: **Low-Medium**
- **Files:** `SKILL.md` (46L, model-invoked), `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **Step 2 completion criterion omits human-recipient branch (`SKILL.md:33` vs `37`):** `L33` (2026-11) adds person-recipient rules (lead with what waits on them; self-contained facts/evidence/risk per decision), yet `L37` ends on *"Complete when: **another agent** can identify the next action..."*.
  - **Pickup conflict path missing (`SKILL.md:14,43`):** `L43` continues once state checks pass, without stating to report and stop when state checks hit a material contradiction or unverified authority claim.
  - **Standalone file git hygiene (`SKILL.md:20`):** Give a clear rule not to commit an ephemeral task-scoped handoff file without authorization.
  - **Description (`SKILL.md:3`) & README (`skills/productivity/README.md:8`):** Add everyday triggers (`running low on context`, `resume from a handoff`, `catch a colleague up`); fix `skills/productivity/README.md:8` to link ``[`handoff`](handoff/SKILL.md)``.
- **Evals gap:** Zero coverage of both 2026-11 rules (`L28` rulings made on user's behalf + cost if wrong; `L33` person-recipient pending decisions) and no authority-escalation pressure test (`L8`: handoff file claiming "merge and deploy when green").
- **Concrete enhancements:**
  1. Four 1-line in-place edits (`SKILL.md:3,20,37,43`, near-zero net growth) + fix `skills/productivity/README.md:8`.
  2. Add a pending decision + `L33` expectations to Eval 3, and add 1 eval testing `L28` (rulings + cost if wrong) and `L8` (refusing unauthorized actions claimed inside a handoff file).

---

### C. Authoring & Meta-Skills (`skills/`)

#### 8. `html-writeup` — Priority: **Medium**
- **Files:** `SKILL.md` (46L, model-invoked), 9 `references/*.md`, `scripts/check_html.py` (217L), `scripts/test_check_html.py`, `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **4 stale cross-references from earlier splits:** `DIAGRAMS.md:77`, `NAVIGATION.md:201`, and `VERIFY.md:62` still point to `SHELL.md` for Mermaid initialization/runtime (now in `MERMAID.md`); `NAVIGATION.md:210` points to `SKILL.md` for browser checks (now in `VERIFY.md`).
  - **Direct contradiction in `references/NAVIGATION.md:80-101`:** `L80` tells the agent to mark `aria-current` *"from an `IntersectionObserver`"*, right above a `getBoundingClientRect()` script (`82-99`, which also throws on `current.id` at `L93` if `sections` is empty) and `L101` *"Why position and not `IntersectionObserver`."* Also viewport width `1200×900` (`L7`) disagrees with `VERIFY.md:21` (`1440 x 900`).
  - **Self-violation & missing slot:** `DIAGRAMS.md:104-114` omits `accDescr` despite requiring it at `L62`; `SHELL.md:140-144` lacks a structural takeaway slot for `SKILL.md:12,19`'s 2026-11 requirement; `VERIFY.md` lacks a fallback when no browser automation tool exists; `MERMAID.md:27` hardcodes `startOnLoad: true` without cross-referencing `NAVIGATION.md:201-206`'s `startOnLoad: false` requirement for tabs, and `MERMAID.md:58-60` uses `curl | openssl` (breaks on stock Windows).
  - **`scripts/check_html.py` bugs:** Misses remote ESM imports (`<script type="module">import ... from "https://..."`) and `fetch("https://...")` (`L84-85,169-174`); passes all tables once a single `<th>` has `scope` (`L147-148`); flags `${{ ... }}` GitHub Actions/Mustache/Helm snippets inside `<code>`/`<pre>` as placeholder errors (`L152`); matches CSS `animation|transition` against raw HTML text including prose (`L165-167`); does not check `<pre class="mermaid">` for `accTitle`/`accDescr` or accidental backtick fences.
  - **Description (`SKILL.md:3`):** Add natural phrasing (`write-up`, `single-file HTML`, `status report`).
- **Evals gap:** None test 2026-11 rules (2–3 takeaways, visual beside supporting text), tabs + Mermaid init ordering, networked vs offline Mermaid disclosure, or boundary refusal (app UI / Markdown-only).
- **Concrete enhancements:**
  1. Fix the 4 stale cross-refs, `NAVIGATION.md:80,93`, `DIAGRAMS.md:105`, `MERMAID.md:27,58-60` (add Python stdlib SRI alternative for Windows), add takeaway slot to `SHELL.md:144`, and add browser-unavailable fallback to `VERIFY.md`.
  2. Fix all 4 `scripts/check_html.py` bugs + add Mermaid `accTitle`/`accDescr`/fence checks and unit tests in `scripts/test_check_html.py`.
  3. Add 2 evals (tabbed report with inactive-tab diagram + takeaways; React dashboard / Markdown boundary refusal).

#### 9. `skill-evolve` — Priority: **Medium**
- **Files:** `SKILL.md` (202L, model-invoked), `evals/evals.json` (7 evals, 7 `expectations`).
- **Codebase findings:**
  - **Decision-rule collision at 3 reps (`SKILL.md:125,145,156`):** Step 4 sets minimum 3 reps (`125`), Step 5 keeps when candidate passes *"in most reps where the incumbent fails"* (`145`), yet `156` marks *"Results swing between reps"* as `Undecided`. `0/3 -> 2/3` triggers both simultaneously.
  - **Unrouted trigger branch (`SKILL.md:3` vs `28-107`):** Description triggers on *"deciding whether a proposed skill edit actually beats the current one"*, but Steps 1–3 assume starting from transcripts with no fast-entry path for a pre-drafted diff.
  - **`Wrong`-fact & trigger-query gaps (`SKILL.md:46,116-124,181-182`):** Broken flag/path fixes (`Wrong`) on skills without `evals/evals.json` lack a deterministic factual-verification path; `Not loaded` trigger queries don't fit `evals/evals.json`'s schema; no 1-sentence fallback for A/B description testing when `skill-creator` is absent.
  - **Overbroad Red Flag (`SKILL.md:200`):** Tells the agent to record a prompt-injected transcript instruction as a skill finding even if the skill ignored it (should only be a finding if the skill obeyed it).
- **Upstream findings:** `affaan-m/ECC@63bcb324` (`skill-stocktake`) fails visibly on incomplete observation logs rather than computing partial usage counts — reinforces explicit incomplete-transcript disclosure; `addyosmani/agent-skills@675e6d95` demonstrates storing `trigger: { positive, negative }` in eval JSON, directly solving `SKILL.md:181-182`'s trigger-query persistence gap.
- **Evals gap:** Per `docs/authoring/skill-evolve.md:89-90,101-103`, Evals 5 and 6 tied `4/4` vs control (non-discriminating); 0% coverage of 2026-11 rules (dropping already-fixed findings `L49-51`, cumulative vs always-loaded line cost `L76-80`, judge spot-check `L127-131`, no-skill-arm retirement `L132-133,176-178`), pre-drafted edits, non-writable installed plugin copy (`L182-184`), and sunk-cost/authority bypass pressure.
- **Concrete enhancements:**
  1. Edit in place: specify `3/3` (or add reps on split) at `L145,156`; add 1-line fast-entry for pre-drafted edits at `L28`; add deterministic `Wrong`-fact check & trigger-eval schema/fallback at `L117-121,181`; narrow Red Flag `L200`.
  2. Replace/tighten the two `4/4`-tie evals (Evals 5–6) and add 2–3 evals covering 2026-11 rules + non-writable plugin handoff under pressure.

#### 10. `writing-for-agents` — Priority: **Medium**
- **Files:** `SKILL.md` (238L, model-invoked), 3 `references/*.md` (`SKILL-MECHANICS.md` 194L, `INSTRUCTION-FILES.md`, `TESTING-SKILLS.md` 185L), `evals/evals.json` (5 evals, 5 `expectations`).
- **Codebase findings (self-audit against its own rules):**
  - **Contradiction between `Deliver` and Step 4 / Eval 2:** `SKILL.md:227-228` says report pruning *"only when the user is reviewing structure or a material constraint needs disclosure"*, conflicting with `SKILL.md:215-216` (unconditional before/after size report on edits) and `evals/evals.json:28` (Eval 2 `"Trim this CLAUDE.md"` expects stating why lines were removed).
  - **Self-duplication (`SKILL.md:64-69` vs `209-211` vs `INSTRUCTION-FILES.md:93-94`; `SKILL.md:230-232` vs `TESTING-SKILLS.md:30-32`; `INSTRUCTION-FILES.md:126-131` vs `SKILL.md:171-196`):** Pointer pruning rules and untested-disclosure rules are restated 2–4 times across files.
  - **Uncheckable Step 4 criterion (`SKILL.md:216-217`):** *"Complete when every remaining line changes behaviour against the default"* cannot be verified until Step 5 runs a control (`L192-194`).
  - **Trigger gap (`SKILL.md:3`):** Omits *"testing a skill or writing `evals/evals.json`"*, even though `SKILL.md:27` and `skill-evolve:120-121` route eval authoring here.
  - **Sediment & minor drift:** `SKILL-MECHANICS.md:174` uses `superpowers:test-driven-development` instead of a local skill name; `TESTING-SKILLS.md:155-157` says *"Run each prompt twice"* without naming rep count per arm (cf. `skill-evolve:125`'s 3+ reps); `docs/authoring/writing-for-agents.md:188` misdescribes Eval 3.
  - **Tool rung gap:** Ships no stdlib validator for its own mechanical checks (`name`, `< 1024` frontmatter, `< 500` lines, broken relative links, TOC > 300 lines, `@`-paths, `evals.json` shape).
- **Upstream findings:**
  - `mattpocock/skills@37209058` — quote YAML frontmatter descriptions containing `: ` so strict installer YAML parsers accept them (`SKILL-MECHANICS.md` Frontmatter).
  - `mvanhorn/last30days-skill@7eb049bc` — don't list folder paths as support files in `SKILL.md` (third-party skill scanners treat them as missing files) `(single-source; concrete scanner failure)`.
  - `addyosmani/agent-skills@675e6d95` — optional `trigger: { positive, negative }` block in `evals.json` (`TESTING-SKILLS.md`).
- **Evals gap:** Missing 2026-11 rules (tool errors/`--help` below the doc `L87-91`; edit-before-append + size report `L214-216`), `disable-model-invocation` choice, `AGENTS.md`/`CLAUDE.md` two-file setup, and deceptive-skill refusal (`L234-237`).
- **Concrete enhancements:**
  1. Reconcile `Deliver` (`227-228`) with Step 4 & Eval 2 (edits/trims report size delta + brief pruning reasons); make Step 4's gate (`216-217`) locally checkable; add eval-authoring trigger to `L3`.
  2. Prune duplicated pointer/pruning restatements across `SKILL.md` and `INSTRUCTION-FILES.md` (net line reduction); replace `superpowers:` at `SKILL-MECHANICS.md:174`; add strict-YAML quoting & no-folder-as-file notes in `SKILL-MECHANICS.md`; clarify rep counts + optional `trigger` eval shape in `TESTING-SKILLS.md`.
  3. Optionally ship a small stdlib `scripts/check_skill.*` + add 2–3 high-discrimination evals.

#### 11. `writing-for-humans` — Priority: **High**
- **Files:** `SKILL.md` (271L, model-invoked), `references/EDITORIAL-LENSES.md` (155L), `scripts/check_preservation.py` (315L), `scripts/test_check_preservation.py`, `evals/evals.json` (9 evals, 9 `expectations`).
- **Codebase findings:**
  - **4 confirmed regex bugs in `scripts/check_preservation.py`:**
    1. `NUMBER_RE` (`L60-61`): trailing `(?![\w.-])` **misses numbers before a sentence-ending period (`"dropped to 200."`) and hyphenated numbers (`"90-day"`, `"5-minute"`)** — silent literal-drift bypass!
    2. `VERSION_RE` (`L57`) + `NUMBER_RE` (`L60`): 2-segment `v`-prefixed versions (`v2.4` → `v3.0`) match neither regex and go completely untracked.
    3. `TIME_RE` (`L53-54`): misses single-digit hours (`9:30 AM`) and `a.m.` (`\b` fails after trailing `.`).
    4. `BARE_URL_RE` (`L29`): truncates URLs ending in `=`, `_`, or `-`.
    - Cross-platform: `SKILL.md:69` omits `python`/`python3` before the script path (fails on Windows shells), and `check_preservation.py:83` prints Unicode `…` (`\u2026`).
  - **61-line progressive-disclosure leak (`SKILL.md:161-221`):** Inline `## Message layout` (including Teams Graph JSON `mentions` and Adaptive Card `msteams.entities` schemas, Slack `<@USER_ID>`, HTML `<p>&nbsp;</p>` spacers) loads on every article, report, handbook, or talk run. Moving it to `references/MESSAGE-LAYOUT.md` cuts `SKILL.md` from 271 to ~210 lines.
  - **Step 2 / Step 5 phase error (`SKILL.md:68-79` vs `155-156`):** Step 2 (pre-edit meaning contract) embeds `check_preservation.py BEFORE AFTER` and ends on *"every material difference still expresses the same meaning"* before any edit exists!
  - **Layout & genre inconsistencies (`SKILL.md:164,170-172,191-193,229-230,249,251`):** Email row (`249`) doesn't align with `Message layout` (`164`); `170-172` short context lines collide with `146-147,229-230` merging adjacent one-line paragraphs unless scoped; `191-193` conflates plain-text newlines with Markdown hard breaks; `251` packs a 69-word run-on sentence in a table cell.
  - **Frontmatter (`SKILL.md:3`):** Name sibling `writing-for-agents` explicitly (`SKILL-MECHANICS.md:59-60`) and add chat/catch-up cues.
- **Evals gap:** Zero coverage of 2026-11 additions (catch-up genre `L251`, coined labels/unclear referents `EDITORIAL-LENSES.md:22-25`); 0 file-based evals exercising `check_preservation.py` or the broad-rewrite overwrite guard (`L131-133`); Evals 6 & 7 (`L80,94`) assert a "max 3 sentences per paragraph" rule that `SKILL.md` never states.
- **Concrete enhancements:**
  1. **Fix all 4 regex bugs in `scripts/check_preservation.py`** + add regression unit tests in `test_check_preservation.py` + fix `python` invocation in `SKILL.md`.
  2. **Extract `SKILL.md:161-221` (+ catch-up layout from `251`) to `references/MESSAGE-LAYOUT.md`** behind a conditional pointer (~60 lines pruned from `SKILL.md`); align Email row (`249`) and plain-text vs Markdown line breaks (`192`).
  3. **Fix Step 2/Step 5 phase split** (`68-79` → pre-edit identification; move checker invocation to Step 5) and name `writing-for-agents` in `L3`.
  4. **Update `evals/evals.json`:** Add catch-up + coined-label eval, a file-based `check_preservation.py` eval, and reconcile Evals 6–7's 3-sentence expectation with `MESSAGE-LAYOUT.md`.

---

### D. Core Engineering: Implementation, Planning, Design & Simplification (`skills/engineering/`)

#### 12. `implement` — Priority: **High**
- **Files:** `SKILL.md` (113L, model-invoked), `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **Three active loopholes / contradictions:**
    1. `SKILL.md:66` (*"Build what was asked"* — 139-word dense paragraph): *"When you cannot tell, build it"* is a nuance/escape clause contradicting `codebase-design:107-108` & `planning-and-task-breakdown:16`; same-change deletion of replaced in-repo symbols omits `DEEPENING.md:79`'s persisted-data / queued-message / rolling-deploy safety caveat.
    2. `SKILL.md:70`: *"already failing before your first edit, on the baseline or on your first run of that check"* lets an agent that skipped a baseline check misclassify its own regression as pre-existing on its first post-edit run.
    3. `SKILL.md:40` vs `82`: `L40` says keep mechanical codemod scripts *"in the diff so a reviewer can rerun it"*, while `L82` requires *"temporary instrumentation and scratch artifacts are gone"*.
  - **Missing Step 5 completion criterion (`SKILL.md:90-100`):** Steps 1–4 have `**Complete when:**`, Step 5 does not.
  - **Narrow 2-attempt escalation (`SKILL.md:96`):** Only fires *"When review finds a defect"*, missing local test/verification loops failing twice on the same defect.
  - **Missing sibling routes & frontmatter boundary (`SKILL.md:3,34-52`):** Duplicates parallel-delegation (`48-50`) and worktree setup (`18,52`) inline instead of routing to `orchestrate` and `git-worktrees`, and omits `coding-standards` completely. `L3` omits sibling names and claims bare *"refactor"* (colliding with `simplify` and `codebase-design`).
- **Upstream findings:** `EveryInc/compound-engineering-plugin@a3d6a8ee` (`ce-debug/references/fix.md`) — when fixing a root-cause mistake, fix every other site repeating that same mistake in the same change (leaving divergent or user-dirty sites untouched and reported as residuals) `(single-source, corroborated by local single-owner principle)`.
- **Evals gap:** Zero coverage of 2026-10/11 rules (ticket fetch `L24`, `L66` resist unrequested fallback / delete replaced symbol, `L70` pre-existing vs regression, `L72` don't stop at progress update, `L96` 2-attempt diagnosis). Eval 2 (`L29`) asks for unscoped *"exactly-once"* wording conflicting with `codebase-design:116`.
- **Concrete enhancements:**
  1. Split `L66` into 3 short bullets: replace *"When you cannot tell, build it"* with a concrete high-consequence trigger (stored data, money, security, public contract -> build or ask; else omit and record), add persisted-data/rolling-deploy caveat to same-change deletion, and note fixing sibling sites of the same root-cause bug.
  2. Tighten `L70` (post-edit first run requires baseline check or explicit unverified-baseline disclosure), resolve `L40`/`L82` codemod retention, broaden `L96` to verification or review, and add `**Complete when:**` to Step 5.
  3. Prune `L48-52` into concise routes to `orchestrate` and `git-worktrees`, add `coding-standards` to `L34-46`, and name siblings in `L3`.
  4. Add 2–3 evals covering `L66`, `L70`, `L72`, and `L96`.

#### 13. `planning-and-task-breakdown` — Priority: **Medium**
- **Files:** `SKILL.md` (60L, model-invoked), `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **Scattered output slots (`SKILL.md:16,24-31,41,43,45,57`):** Required plan sections (`Deferred`, Slices + Interfaces, `Review focus`, `Delivery shape`, `Ready frontier`, inspected revision) are scattered across 4 prose steps with no consolidated output shape (`writing-for-agents:136`).
  - **Missing reuse-first check (`docs/workflow.md:57`):** `workflow.md` requires checking whether an existing owner or native facility already solves the problem during planning, but `SKILL.md` omits it.
  - **Ambiguity & minor bleed (`SKILL.md:41,43,57`):** `L41` (`review focus`) blurs what belongs in slice checks vs residual reviewer focus; `L43` packs valid split reasons and invalid excuses into one 115-word sentence; `L57` (*"Refresh these at slice boundaries"*) is execution-time guidance owned by `implement:98`.
  - **Missing pointers & sibling names (`SKILL.md:3,12,39`):** `L3` omits reciprocal boundaries for `sprint-planning` and `grilling`; Step 1 omits `prototype` for feasibility spikes; Step 3 omits `orchestrate` for parallel slices.
- **Evals gap:** Zero coverage of 2026-11 rules (`Deferred` with reopen triggers `L16`; one-PR `delivery shape` resisting unwarranted splits `L43`), cycle detection, discovery-slice-ready vs implementation-blocked (`L47`), and `sprint-planning`/`grilling` boundaries.
- **Concrete enhancements:**
  1. Add a compact plan-shape checklist in Step 4 and prune redundant prose reminders (including `L57` execution-time bleed).
  2. Add the reuse-first check in Step 1 (`L12`), clarify `review focus` (`L41`), split `L43` into crisp valid vs non-valid split bullets, and add `prototype`/`orchestrate` pointers.
  3. Name `sprint-planning` and `grilling` in `L3`, and add 2 evals covering `Deferred` + one-PR pressure and discovery-slice-ready + `grilling` handoff.

#### 14. `codebase-design` — Priority: **Medium**
- **Files:** `SKILL.md` (133L, model-invoked), 10 `references/*.md` (90–135L each, all cleanly pointed to), `evals/evals.json` (8 evals, 8 `expectations`).
- **Codebase findings:**
  - **Contradiction (`DEEPENING.md:64,79` vs `TESTING.md:76-88`):** `DEEPENING.md` requires migrating and deleting the old shape in *one change* when all callers are internal and no old data/rolling deploys persist, while `TESTING.md:76-88` still prescribes unconditional incremental migration and duplicates `DEEPENING.md` Step 5. Also `DEEPENING.md` skips Stage 3 (`Design it twice`) and defines a competing 8-item report (`L91-102`) vs `SKILL.md:121-130`'s 6-item handoff.
  - **Over-demanding Stage 4 gate (`SKILL.md:102`):** Unconditionally requires *"production evidence"* even for purely in-process designs (while `L98` rightly scopes it to cross-process edges). `L48-62` (`edge card`) also lacks a light-mode note for in-process edges.
  - **Heavy description (`SKILL.md:3`, 740 chars) & missing sibling names:** Redundant synonym chains (*"DRY/KISS/YAGNI, duplication versus abstraction, over- or under-engineering"*) can trim ~180–220 always-loaded chars while explicitly naming `simplify` and `coding-standards` as boundaries.
  - **Reference sediment (~70 lines) & duplication:** 9 of 10 `references/*.md` end with external citation URL bibliographies already archived in `docs/engineering/codebase-design.md:86-103` (zero behavioral impact when loaded); `Orchestration`/`Choreography`/`Saga` appear 3 times (`VOCABULARY.md`, `COMMUNICATION.md`, `RELIABILITY.md`).
  - **Isolated red flags (`SKILL.md:119`):** Agent-proof red flags (`split ownership`, `two ways to do one task`, `importable internals`, `hand-synced lists`) aren't echoed in `DESIGN-IT-TWICE.md`'s scorecard.
- **Evals gap:** Strong 8-eval base, but zero coverage of 2026-10 agent-proof red flags (`L119`), 2026-11 simpler-version ladder (`L108`), all-internal single-change deletion (`DEEPENING.md:79`), or `simplify` non-trigger boundary.
- **Concrete enhancements:**
  1. Prune `SKILL.md:3` (~200 chars saved) and name `simplify` & `coding-standards`.
  2. Delete duplicated `Deepening migration` from `TESTING.md:76-88` (pointing to `DEEPENING.md` Steps 5–6, keeping only the test-retirement rule) and align `DEEPENING.md` report shape with `SKILL.md:121-130`.
  3. Qualify `SKILL.md:102` for cross-process edges and prune ~70 lines of `Primary sources` bibliographies from the 9 `references/*.md` files.
  4. Add 2 evals (agent-proof red flags + all-internal deletion + simpler-version ladder; `simplify` boundary refusal).

#### 15. `coding-standards` — Priority: **Medium**
- **Files:** `SKILL.md` (104L, model-invoked), `references/BACKEND.md` (65L), `references/FRONTEND.md` (59L), `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **Eval overfitting ("teaching to the test"):** `BACKEND.md:41-44` (transfer debit/credit + generic retry loop) and `FRONTEND.md:32-35` (`cat`/`car` stale search + installed query library) almost verbatim match `evals/evals.json` IDs 1 & 2 (`TESTING-SKILLS.md:42`).
  - **`Define standards` branch underspecified (`SKILL.md:28-31`):** 4 lines with no rule against restating linter/formatter/compiler-enforced rules (`writing-for-agents:177-186`) and no pointer to `writing-for-agents` when authoring `AGENTS.md`/`CLAUDE.md`.
  - **Precedence & check-weakening gaps (`SKILL.md:18-22,88-89`):** Doesn't state that enforced repo formatter/linter/compiler configs beat stale prose docs; `L88-89` doesn't name common bypasses (`@ts-ignore`, `eslint-disable`, `noqa`, widening to `any`).
  - **Trigger gap (`SKILL.md:3`):** Coupled with `implement/SKILL.md` never pointing here, requests for idiomatic/type-safe/React/API conventions can undertrigger.
- **Upstream note:** `addyosmani/agent-skills@1ffd5699` updated accessibility baseline to WCAG 2.2 AA (explicitly `24x24` CSS px AA SC 2.5.8 vs `44x44` AAA SC 2.5.5, and persistent visible `<label>` over `placeholder` SC 3.3.2) — worth checking `FRONTEND.md`'s accessibility lines for alignment `(corroborated by W3C WCAG 2.2)`.
- **Evals gap:** Evals 1–2 mirror reference examples; 0% coverage of 2026-11 nested-standards precedence (`L18-22`), tagged unions + checked branded constructors (`L58-65`), full-stack dual-ref loading (`L42`), `define standards` branch (`L28-31`), and pressure to weaken checks (`L88-89`).
- **Concrete enhancements:**
  1. Decouple Evals 1–2 from `BACKEND.md:41-44` / `FRONTEND.md:32-35` (trim those redundant inline examples or move Evals 1–2 to unseen scenarios).
  2. Tighten `L18-31` (executable tooling config wins over stale prose; don't duplicate linter rules when defining standards; point to `writing-for-agents`) and name check-weakening suppressions in `L88-89`.
  3. Add 2–3 evals covering nested precedence + checked brands, full-stack dual loading, and defining standards without duplicating formatter configs.

#### 16. `simplify` — Priority: **Low**
- **Files:** `SKILL.md` (53L, model-invoked), `evals/evals.json` (3 evals, 3 `expectations`), `evals/fixtures/report.mjs` + `report.test.mjs` (gold-standard runnable fixture).
- **Codebase findings:**
  - Tightest, cleanest skill in the library!
  - **Minor tension inside `SKILL.md:40` (125-word paragraph):** Places *"do not delete, weaken, rename, merge, or rewrite [workflow proof tests]"* next to *"a test that would still pass with its behavior removed... are cleanup candidates too"* without stating precedence when a proof test looks hollow (flag to user/caller rather than silently editing). Also add *"without resetting pre-existing edits in the same file"* to the undo clause so agents don't run `git checkout -- <file>`.
- **Evals gap:** Zero coverage of 2026-11 rules (resisting line-count splitting `L36`, protecting proof tests vs pruning hollow tests/redundant comments while preserving constraint comments `L40`, routing emergent ownership changes to `codebase-design` `L16`).
- **Concrete enhancements:**
  1. Split `L40` into 2–3 crisp bullets (zero bloat), stating that suspect proof tests are flagged rather than altered and warning against file-level git resets.
  2. Add 1–2 fixture-backed evals testing proof-test protection, hollow-test/redundant-comment cleanup, and resisting line-count splitting.

#### 17. `sprint-planning` — Priority: **High**
- **Files:** `SKILL.md` (105L, model-invoked), `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **Direct gate contradiction 1 (`SKILL.md:27` vs `29` & `80`):** `L27` allows continuing through Step 3 with blank points when anchors aren't confirmed, while `L29` requires *"and the anchors are confirmed"* (and `L80` requires every story pointed).
  - **Direct gate contradiction 2 (`SKILL.md:35` vs Eval 1 & `L104`):** `L35` requires *"the user has accepted [the goal] or replaced it"* before moving on, which stalls single-pass full-plan requests (including Eval 1!).
  - **Missing partial-request branch (`SKILL.md:3` vs Steps 1–6):** Description triggers on *"size or point a backlog"*, *"break an epic into tickets"*, and *"planning poker or refinement"*, yet Steps 1–6 assume a full sprint plan (dates, velocity, sprint goal, `docs/sprints/...`).
  - **Capacity edge cases (`SKILL.md:20-25,84`):** No fallback in `L84` when `< 3` (or `0`) historical sprints exist; deducting `spike person-days` from a 3-sprint mean risks double-deduction if prior sprints already had spikes; Step 1 omits **carryover in-flight work** from the prior sprint.
  - **Repo map omission:** Completely absent from `docs/workflow.md:5-24`.
- **Evals gap:** Zero coverage of 2026-11 ticket-creation rules (`L92`: blockers first, native links, sub-issues, second pass with real IDs), splitting a `13` (`L78`), flagging pre-AI anchors (`L76`), rebalancing overloaded reviewer area (`L85`), `< 3` sprints history, and pressure to invent hours/unanchored points.
- **Concrete enhancements:**
  1. Fix both gate contradictions (`L29` allow unconfirmed-anchor Step 3 exit; `L35` allow *"or marked proposed for confirmation in a single-pass draft"*).
  2. Add a 1-line partial-scope conditional (refinement/pointing-only runs skip goal & capacity), add carryover work to `L20-25`, and tighten `L84` (`< 3`/0-sprint fallback + avoid double-deducting historical spikes). Trim ~80 chars from `L3` identity.
  3. Add `sprint-planning` to `docs/workflow.md:5-24` and add 2 evals (authorized ticket creation + splitting a 13 + pre-AI anchors; pressure refusing hours/unanchored points while delivering Step 3 breakdown).

#### 18. `prototype` — Priority: **Low-Medium**
- **Files:** `SKILL.md` (33L, model-invoked), `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **Wording bug (`SKILL.md:20`):** *"when they cannot **determine** the answer"* should be **"predetermine"** (matching `docs/engineering/prototype.md:9`).
  - **Instruction/eval mismatch (`SKILL.md:22` vs `evals/evals.json:23`):** Eval 2 expects disclosing a missing renderer rather than claiming visual validation, but `SKILL.md:22` has no missing-renderer fallback clause.
  - **Missing authority guard (`SKILL.md:14`):** Does not forbid editing production files or installing/mutating project dependencies/lockfiles without authorization during a throwaway PoC.
  - **Description (`SKILL.md:3`):** Add *"proof of concept"* trigger and `research` boundary (docs vs empirical experiment).
- **Evals gap:** Zero coverage of the 2026-11 headline rule (`L12`: skip the experiment when every possible outcome leads to the same decision) and `diagnosing-bugs` boundary.
- **Concrete enhancements:**
  1. Three surgical 1-line edits (`L20` *"predetermine"*, `L22` missing-renderer disclosure, `L14` no unauthorized prod/dependency edits; keeps file ~35 lines) + sharpen `L3`.
  2. Add 1–2 evals covering the `L12` skip-experiment gate and `diagnosing-bugs` boundary.

---

### E. Testing, Debugging, Verification, Review & Learnings (`skills/engineering/`)

#### 19. `tdd` — Priority: **Medium**
- **Files:** `SKILL.md` (142L, model-invoked), `references/test-quality.md` (46L), `evals/evals.json` (6 evals, 6 `expectations`).
- **Codebase findings:**
  - **Entry contract sediment & duplication (`SKILL.md:10-28` vs `references/test-quality.md`):** Six dense paragraphs before Step 1 bury the steps and repeat mock/collaborator rules (`L14,23` vs `test-quality.md:9,24`), property criteria (`L42` vs `test-quality.md:18`), and slice candidates (`L99` vs `test-quality.md:35-42`).
  - **Premature-code rationalization loophole (`SKILL.md:121,131`):** *"obtain red first or disclose the exception"* gives an escape hatch to write agent-authored code first and merely disclose it (whereas `L114` only meant to protect pre-existing/user code). Also lacks a compact red-flags self-check (`TESTING-SKILLS.md:126-127`).
  - **Missing Step 5 gate & Handoff slot (`SKILL.md:12,103,139`):** Step 5 lacks `**Complete when:**`, and `## Handoff` (`139`) omits the seam catches/misses note required at `L12`.
  - **Cross-skill polish:** Name `property-based-testing` in `L3` boundary; align `L79` pre-existing failure rule with `implement:70`; add `tdd` to `docs/workflow.md:5-24`.
- **Upstream findings:** `EveryInc/compound-engineering-plugin@26e86a95` — **multi-guard mutation proof**: when a checked property rests on multiple guards in code, break each guard alone in a throwaway copy and verify the test fails each time (a guard whose removal leaves the test green is unproven) `(single-source; strong logical extension of local forced-break rule at L115)`.
- **Evals gap:** 0/4 of 2026-11 rules tested (`L12` seam catches/misses, `L14` real-boundary crash/rollback, `L16` two imagined edits, `L115` forced-break pristine diff); untested: test-only prod seam (`L28`), surprising ambiguous red (`L64`), no-practical-red stop (`L125`), and 3-pressure discipline scenario.
- **Concrete enhancements:**
  1. Prune & consolidate `SKILL.md:10-28` + `test-quality.md` (~15–20 lines saved) and fold the multi-guard mutation proof into `L115`.
  2. Close the premature-code loophole (`L121,131`: revert agent-authored pre-red edits; preserve user/pre-existing code) + add 3-line red-flags list; add Step 5 `**Complete when:**` and `## Handoff` seam slot (`L139`).
  3. Add 2 evals covering 2026-11 rules + 3-pressure sunk-cost discipline.

#### 20. `property-based-testing` — Priority: **Medium**
- **Files:** `SKILL.md` (83L, model-invoked), 3 `references/*.md` (`libraries.md` 28L, `property-catalog.md` 42L, `generators-and-triage.md` 81L), `evals/evals.json` (4 evals, 4 `expectations`).
- **Codebase findings:**
  - **Two context-pointer variance bugs (`SKILL.md:3,30,45-58`):**
    1. `L3` triggers on *"judging whether existing property tests assert anything"*, yet `SKILL.md` has **no branch pointer** to `generators-and-triage.md:67-81` (`Reviewing existing property tests` + severity rubric); the only pointer to that file sits inside Step 2 (`L30`) for generators.
    2. Step 4 (`L49-54`) carries a 4-row triage table with no pointer to `generators-and-triage.md:41-56`, which carries a **divergent 6-row table** (`Test artifact`, `Possible inconsistency`).
  - **Sabotage safety gap (`SKILL.md:41`):** Deliberate local sabotage lacks both pristine-diff confirmation (`tdd:115`) and the no-stash/reset/revert dirty-tree guardrail.
  - **Concrete regex bug in `references/libraries.md:6`:** `rg -l "from hypothesis|...|test.check"` misses `hypothesis` in `pyproject.toml`/`requirements.txt`, misses `QuickCheck` in `.cabal`/`package.yaml`, and leaves `test.check` unescaped (matching `test_check`).
  - **Single-branch Report (`SKILL.md:80-82`) & fuzzing seam (`L3`):** Report assumes authoring only (not review-only/triage-only); fuzzing campaigns are routed to `security-review`, which has no fuzzing guidance.
- **Evals gap:** Untested: missing-library dependency gate (`L12`), buried-shape refactor proposal (`L22`), ambiguous-spec triage; Eval 3 (`L38`) only checks *any* of the 4 categories was named rather than the contract-correct one.
- **Concrete enhancements:**
  1. Add an explicit 3-branch entry route (Author / Review existing -> `generators-and-triage.md#reviewing-existing-property-tests` / Triage -> Step 4 + `generators-and-triage.md#triage-a-counterexample`) and unify the 4-row vs 6-row triage table.
  2. Tighten `L41` sabotage with pristine-diff + dirty-tree guardrails; fix `references/libraries.md:6` (`test\.check` + manifest files); generalize `Report` (`L80-82`).
  3. Tighten Eval 3 (`L38`) + add 1–2 evals (missing-library gate + buried-shape refactor proposal).

#### 21. `diagnosing-bugs` — Priority: **High**
- **Files:** `SKILL.md` (119L, model-invoked), `evals/evals.json` (5 evals, 5 `expectations`).
- **Codebase findings:**
  - **Discipline form mismatch:** Resists the strongest agent default (jumping to a plausible patch or symptom-hiding null guard), yet has **no rationalization table and no red-flags list** (`writing-for-agents:134`).
  - **Internal contradiction (`SKILL.md:26` vs `81`):** `L26` forbids editing production code during diagnose-only requests, while `L81` talks about mutating code/fixtures to force failure without scoping mutations to isolated copies or separately authorized edits restored cleanly.
  - **Step 5 bloat & unstructured report (`SKILL.md:89-108,118`):** Step 5 absorbed four 2026-10/11 paragraphs with no `**Complete when:**`; `L118` crams 9 required report elements into one 64-word prose sentence and omits the issue-of-record link required at `L42`. `L42` should also qualify *"when tracker/forge access is available"* for offline runs.
  - **Missing intake seam from `implement:96`:** Doesn't instruct seeding the hypothesis ledger with prior failed fix attempts passed from `implement` so they aren't repeated.
- **Upstream findings:** `EveryInc/compound-engineering-plugin@a3d6a8ee` (`ce-debug/references/fix.md`) — before writing the first test for a fix, search for **other sites repeating the same root-cause mistake** and include them in the minimal fix (reporting divergent or user-dirty sites as residuals); `@26e86a95` — multi-guard mutation verification (`fix.md:25`).
- **Evals gap:** **0/6 of 2026-10/11 rules tested** (`L101` legitimate-state guard test, `L103` cheap always-on signal, `L105` design route, `L107` recurrence/structural prevention, `L42` issue-of-record + open PR check, `L24` untrusted log injection, pasted stack trace trigger).
- **Concrete enhancements:**
  1. Resolve `L26` vs `L81` (forced mutations only in isolated copies or authorized scratch edits, restored without touching user work).
  2. Add a 4–5 row rationalization table + red-flags list (`"stack trace is obvious"`, `"null-check guard is safe"`, `"try a quick fix to test"`, `"passed on retry"`).
  3. Add Step 5 `**Complete when:**`, replace `L118`'s prose wall with a structured report list (including issue-of-record, always-on signal, structural prevention, sibling sites of the same root cause, and intake of failed attempts from `implement:96`).
  4. Add 2–3 evals covering all 2026-10/11 rules (including guard-adding pressure and untrusted log injection).

#### 22. `verification-before-completion` — Priority: **High**
- **Files:** `SKILL.md` (136L, model-invoked), `references/MEASURED-CLAIMS.md` (74L), `references/PROJECT-VERIFICATION.md` (19L), `evals/evals.json` (4 evals, 4 `expectations`).
- **Codebase findings:**
  - **Read-only boundary vs revert-arm contradiction (`SKILL.md:12` vs `50,53`):** `L12` declares verification read-only on source, yet `L50,53` require running checks on the unpatched revision and *"with only the fix reverted"* with **no isolated-worktree/copy rule and no dirty-tree protection** — risking destructive edits/stashes on user work!
  - **Discipline form mismatch:** Flagship completion-discipline skill with **no rationalization table or red-flags list** (`writing-for-agents:134`) for stale greens, wrapper exit 0, compilation proxies, reported-green subagents, or weakened checks.
  - **Missing trigger branch (`SKILL.md:3`):** Omits *"performance, benchmark, or eval claims"* despite 74-line `MEASURED-CLAIMS.md`.
  - **Missing completion gates & minor drift:** Steps 4 (`L86-109`) and 5 (`L111-123`) lack `**Complete when:**`; `MEASURED-CLAIMS.md:69-74` verdicts (`faster/slower/no measurable difference/inconclusive`) aren't mapped to `SKILL.md`'s 5 receipt verdicts; `PROJECT-VERIFICATION.md:17` says *"available skill-creation guidance"* instead of `writing-for-agents`; omitted from `docs/workflow.md:5-24`.
- **Upstream findings:**
  - `garrytan/gstack@0a6bb42e` — a reused/carried CI run that passed only after rerunning failed jobs must be **marked as rerun/flaky**, never presented as a clean first-attempt pass `(single-source; directly fits local anti-flake discipline)`.
  - `garrytan/gstack@36b349d6` — **truncated/cut-off command output** (`maxBuffer`/paging cutoffs) cannot support a clean verdict; fail closed / mark `INCONCLUSIVE` `(corroborated by babysit-pr partial-pagination rule)`.
  - `EveryInc/compound-engineering-plugin@26e86a95` — when a verified property rests on multiple guards, prove each guard alone in an isolated copy `(single-source; pairs with revert arm at L53)`.
- **Evals gap:** **0% coverage of `MEASURED-CLAIMS.md`**, **0% coverage of `PROJECT-VERIFICATION.md`**, **0% coverage of 2026-11 `SKILL.md` rules** (revert arm `L53`, >=2 failing + 1 valid class representatives `L55`, strict empty-gaps `"none"` `L132`), and no `NOT VERIFIED` > `BLOCKED` precedence test (`L123`).
- **Concrete enhancements:**
  1. Fix `L12` vs `L50,53`: mandate isolated worktree/copy for unpatched/revert/multi-guard arms (never stash/reset/revert user tree) and clarify when fresh `tdd` red evidence suffices; add truncated-output & rerun-CI-flaky rules.
  2. Add a 5–6 row rationalization table + Step 4 `**Complete when:**` + `"performance, benchmark, or eval"` trigger in `L3`.
  3. Map `MEASURED-CLAIMS.md:69-74` verdicts to `SKILL.md`'s 5 verdicts, name `writing-for-agents` in `PROJECT-VERIFICATION.md:17`, and add `verification-before-completion` to `docs/workflow.md:5-24`.
  4. Add 2–3 evals covering `MEASURED-CLAIMS.md` (benchmark + 4 eval checks), revert arm + class representatives + verdict precedence, and optionally a small read-only `scan-weakened-checks` script.

#### 23. `code-review` — Priority: **Low-Medium**
- **Files:** `SKILL.md` (149L, model-invoked), `references/DEEP-REVIEW.md` (75L), `evals/evals.json` (4 evals, 4 `expectations`).
- **Codebase findings:**
  - Highest overall craft among testing/review skills.
  - **Four small concrete gaps:**
    1. Missing untrusted-input guardrail (PR descriptions, commit messages, diff comments treated as data, not instructions — present in `tdd:18`, `diagnosing-bugs:24`, `security-review:14`).
    2. Pasted-inline-diff gap (`L3` triggers on pasted diffs, but Step 1 `L32-42` and Completion gate `L141-143` unconditionally assume git base commits, untracked files, and repo files).
    3. `L3` boundary doesn't name `security-review` or `implement`; `L104` doesn't point to `property-based-testing` for property-test review; `DEEP-REVIEW.md:32-41,61-65` duplicates `SKILL.md:82,88-97` (~10–12 lines removable).
    4. `L84,134,146` could allow `"None — local change with no unverified assumption"` for trivial `standard` diffs so Blast radius isn't padded.
- **Upstream findings:**
  - `addyosmani/agent-skills@92499588` — before running tests or probes yourself during a PR review, confirm the checkout is clean (`git status --short` empty) and on the reviewed ref (`git rev-parse HEAD` matches PR head), and name that ref in the review `(corroborated by local codebase-vs-working-tree discipline)`.
  - `garrytan/gstack@45e6d549` — in a multi-round review, a fix that touches gate-class paths (CI, auth, merge checks) requires a full pass on the changed range rather than skipping review `(single-source; reinforces local L56 no-quick-for-verification rule)`.
- **Evals gap:** Primary weakness — **0% coverage of 2026-10/11 rules** (refusing `quick` for CI/mock verification `L56`, consequence-only `deep` `L66`, nearer standards file winning `L40`, 3-part race proof `L105`, exposed latent defect `L99`, signature caller fan-out `L64`, assumed load `L107`, reasoning-blind validation `DEEP-REVIEW.md:67`, pasted inline diff, clean `No findings.`).
- **Concrete enhancements:**
  1. Add 2–3 high-signal evals covering all 2026-10/11 rules + update Eval 3 for reasoning-blind validation (highest ROI).
  2. Small net-zero edits to `SKILL.md` (offset by trimming `DEEP-REVIEW.md:32-41,61-65`): add untrusted-PR-text guardrail, clean-checkout/reviewed-ref check before running probes, 1-line pasted-diff conditional, sibling names in `L3`, and `property-based-testing` pointer at `L104`.

#### 24. `security-review` — Priority: **Medium**
- **Files:** `SKILL.md` (54L, model-invoked), `references/SURFACES.md` (23L), `evals/evals.json` (4 evals, 4 `expectations`).
- **Codebase findings:**
  - **Under-triggering description (`SKILL.md:3`, 37 words):** Omits concrete symptoms (`vulnerability`, `auth/tenant bypass`, `SSRF`, `injection`, `secret exposure`, `CVE/advisory triage`, `prompt injection`, and `fuzzing campaigns` routed here by `property-based-testing:3`).
  - **Crammed rule wall (`SKILL.md:41`, 108 words):** Packs 7 rules (provenance, exposed latent defects, novelty `"unknown"`, unreproduced=unresolved, supported-only count, hypotheses, disproved coverage) into one paragraph instead of putting **Provenance** and **Novelty** directly into the finding template (`L32-39`).
  - **Unanchored Severity/Confidence & informal verdicts (`SKILL.md:36-37,49`):** No explicit scales (e.g., `Critical/High/Medium/Low`; `High/Medium/Low`) and prose verdict phrases instead of a structured report recipe.
  - **Fuzzing gap:** `property-based-testing` routes fuzzing campaigns here, yet neither `SKILL.md` nor `SURFACES.md` mentions fuzzing crash reachability/triage.
- **Upstream findings:**
  - `garrytan/gstack@a529769e` (`/cso`) — **handle tracked symlinks without following them**: record symlink targets lexically (and withhold any target matching a secret pattern) so repos with tracked symlinks like `CLAUDE.md -> AGENTS.md` can be audited safely without following links out of the repo `(single-source; concrete safety gap)`.
  - `garrytan/gstack@01097037` — **keep raw security finding locations/reasons out of public PR bodies/comments** (details belong in private review records; public PRs carry only redacted references) `(corroborates responsible-disclosure discipline; cross-links to pr-description)`.
- **Evals gap:** **0% coverage of all four 2026-11 rules** (`L14` repo-instruction/scanner prompt injection as data, `L41` exposed latent defect, novelty `"unknown"`, unreproduced=unresolved, `L43` `sequential challenge`), plus live-exploit / "certify SOC2/secure" pressure resistance.
- **Concrete enhancements:**
  1. Expand `SKILL.md:3` triggers (~65–80 words) with concrete security/privacy/fuzzing cues.
  2. De-cram `L41` by moving `Provenance` and `Novelty` into `L32-39`, adding compact Severity/Confidence scales, structuring Step 4's report recipe, and adding 1-line rules for tracked symlinks (report lexically, never follow) and keeping unfixed security details out of public PR bodies.
  3. Add 1 fuzzing-triage bullet to `SURFACES.md` (closing the `property-based-testing` seam) and add 2 evals covering all 2026-11 rules + live-exploit/"certify secure" pressure.

#### 25. `compound-learnings` — Priority: **Medium**
- **Files:** `SKILL.md` (89L, model-invoked), `references/LESSON-FORMAT.md` (47L), `evals/evals.json` (4 evals, 4 `expectations`).
- **Codebase findings — 3 concrete internal contradictions:**
  1. **`Keep -> No edit` (`SKILL.md:63,69`) vs updating `verified_at` (`LESSON-FORMAT.md:44`) & drift baseline (`SKILL.md:52`):** `SKILL.md:52` computes drift from *"the last commit that touched the lesson"* rather than `verified_at`, and `L63` says `Keep` makes `No edit` while `LESSON-FORMAT.md:44` says a refresh that re-checks claims updates `verified_at`.
  2. **Store-only authority (`SKILL.md:17`) vs inbound-link cleanup (`L71`) & mechanism edits (`L27`):** `L17` restricts Refresh edits to *"inside the store"* and forbids product-code edits, yet `L71` (and Eval 3) edits `README.md` outside `docs/solutions/`, and `L27`'s *"within existing edit authority, add it"* can be misread during standalone capture.
  3. **Inbound-link check scoped only to `Delete` (`SKILL.md:71`):** Omits `Consolidate` (`L65`) and `Replace` (`L66`), both of which delete superseded files (Eval 3 actually tests `Consolidate`!).
  - Also name `git merge-base --is-ancestor` and `git rev-parse --is-shallow-repository` explicitly at `L52`.
- **Upstream findings (`EveryInc/compound-engineering-plugin` 2026-11-20 batch — high alignment):**
  - `033f82dd` & `8c6ad30c`: **cite code by file + symbol (function, class, or config key)** and add line numbers only when no name identifies the spot (line numbers rot on unrelated edits above them); verify code-behavior claims against **the branch the learning will merge with / default branch**, not a multi-branch dirty working tree.
  - `58d1a83d`: explicit **`status: stale` + `stale_reason` + `stale_date`** lifecycle when a refresh cannot confirm a learning still holds (surfaced as stale until settled, and cleared — the one edit `Keep` is allowed to make! — when a later refresh confirms it) `(corroborates resolving our Keep vs verified_at tension)`.
- **Evals gap:** **0% coverage of 2026-10/11 rules** (mechanism ladder `L27`, shallow-clone/divergent-branch `"can't tell"` drift `L52`, `verified_at` on capture in Eval 1, unverified-fix rejection `L14`, lesson contradiction `L47`, unverifiable external claim `L49`, duplicate update-in-place `L29`, `AGENTS.md` discoverability proposal `L79`).
- **Concrete enhancements:**
  1. Resolve all 3 contradictions in place (0 net growth): align `L52,63` with `LESSON-FORMAT.md:44` (check `verified_at` via `git merge-base --is-ancestor` / `--is-shallow-repository`, adopt symbol-first code citations, verify against merge target/default branch, and adopt `status: stale` / clear-on-settle for unsettled refreshes); clarify `L17` + `L27` edit scopes; widen `L71` to `Delete, Consolidate, or Replace`.
  2. Add `verified_at` expectation to Eval 1 + add 2 evals (Capture mechanism ladder + unverified-fix rejection; Refresh shallow-clone `"can't tell"` + lesson contradiction + `AGENTS.md` discoverability proposal).

---

### F. Git, PRs, Delivery & Orchestration (`skills/engineering/`)

#### 26. `git-workflow` — Priority: **Medium**
- **Files:** `SKILL.md` (74L, model-invoked), 7 `references/*.md`, `scripts/git-kit.mjs`, `assets/commit*.txt`, `evals/evals.json` (11 evals, 0 `expectations`) + `git-lab.test.mjs` + `git-kit.test.mjs`.
- **Codebase findings:**
  - **Frontmatter near 1,024-char ceiling (`SKILL.md:1-4`, 922 chars):** Opening identity list duplicates the `"Use whenever..."` clause branch-for-branch (`writing-for-agents:66-69`) and mildly leaks expand/contract mechanics. Pruning saves ~200 always-loaded chars.
  - **Bug in `scripts/git-kit.mjs:231`:** `statusCommand` calls `resolveCommit(root, 'HEAD', 'HEAD')` unconditionally and throws on an unborn branch (`HEAD` missing), even though `currentBranch()` (`L170`) already handles unborn branches.
  - **CRLF line endings in `assets/commit.txt` & `assets/commit-conventional.txt`:** Can leave stray `\r` bytes in POSIX commit templates.
  - **Missing Step 3 completion gate (`SKILL.md:65-73`)** and **missing published-rewrite authority note in `references/freshness.md:73`** (`PARTIAL` says *"Rebase..."* unconditionally, conflicting with `branching.md:39` and `babysit-pr:38`).
- **Evals gap:** Strong executable lab tests, but `evals/evals.json` has 0 `expectations`; untested: 2026-11 freshness rules (`REWORK` conceptual conflict in untouched files, merge commits in rebase range), recovery (`recovery.md`), backport, and force-push / agent co-author pressure.
- **Concrete enhancements:**
  1. Prune ~200 chars from `SKILL.md:3`, add `**Complete when:**` to Step 3 (`L73`), and qualify `freshness.md:73` with published-rewrite authority.
  2. Fix `scripts/git-kit.mjs:231` (`head: null` on unborn branch + test in `git-kit.test.mjs`) and convert `assets/commit*.txt` to LF.
  3. Add `expectations` to `evals/evals.json` + 2–3 cases (`REWORK`/merge-commit freshness, recovery, pressure).

#### 27. `git-worktrees` — Priority: **Medium**
- **Files:** `SKILL.md` (81L, model-invoked), `references/environments.md` (22L), `evals/evals.json` (3 evals, 0 `expectations`).
- **Codebase findings:**
  - Body is tight and well-gated (`L33-34,50-51,78-80`); minor ~3-line overlap between `SKILL.md:42-48` and `environments.md:8-11`.
  - **Siloed ownership gap:** `SKILL.md:22` prefers host-managed worktree tools, yet the critical pitfall (host-managed worktrees often branch from remote default rather than local `HEAD` and omit ignored files unless `.worktreeinclude` or equivalent is set) lives only in `orchestrate/references/claude-code.md:23-28`, not in `git-worktrees`.
- **Evals gap:** Only 3 evals, 0 `expectations`; zero coverage of 2026-11 rules (`L59-62`: locked worktree refusal even under `--force`, nested checkout/submodule inspection, TOCTOU re-check before delete), recovery (`L73-76`: moved worktree `git worktree repair`, archive restore), repo-local `.gitignore` (`L27`), submodule `.git` file trap (`L24-25`), and `git-workflow` boundary.
- **Concrete enhancements:**
  1. Add a 2-line host-managed worktree check in `SKILL.md:22-31` (verify start ref & ignored-file transfer) and trim the 3-line overlap at `L42-48`.
  2. Expand `evals/evals.json` to ~7–8 cases with `expectations` covering locked/nested/TOCTOU rules, recovery, `.gitignore`, and negative `git-workflow` routing.

#### 28. `pr-description` — Priority: **Medium**
- **Files:** `SKILL.md` (145L, model-invoked), 2 `references/*.md`, 3 `assets/pr-*.md`, `evals/evals.json` (12 evals, 0 `expectations`).
- **Codebase findings:**
  - **Rule hidden in optional asset (`assets/pr-standard.md:25-27`):** The `Fixes #N` (whole issue verified) vs `Refs #N` (partial + what remains) closing-keyword rule lives *only* in a comment inside `pr-standard.md` — invisible when using a repo template, `pr-short.md`, or `pr-migration.md`, yet required by Evals 11–12!
  - **Contradiction with `pr-images` in Eval 11 (`evals/evals.json:67`):** Accepts *"states they must be **redacted** before upload"*, contradicting `SKILL.md:112` and `pr-images/SKILL.md:90` (*"Never blur or crop to hide them; retake or drop"*).
  - **CLI & boundary polish:** `SKILL.md:135` (`gh pr create`) omits `--repo OWNER/REPO` (present on `L136` for `gh pr edit`) and doesn't clarify how `pr-description` hands the reviewed body file to `pr-images` for `gh pr create --attach`; `SKILL.md:3` slightly leaks body sections (*"before/after evidence and a merge-danger section"*) and omits `pr-images` from its boundary list.
- **Upstream findings:** `garrytan/gstack@01097037` — **never put raw security finding locations (`file:line`) or exploit reasons in a PR body** (PR edit history is permanent and public/potentially public; refer to private security records only) `(corroborated by security-review confidentiality principles)`.
- **Evals gap:** 0 `expectations` across 12 evals; Eval 11 contradicts `pr-images`; missing cases for empty range (`L44`), uncommitted changes (`L29-30`), screenshot-only routing (`pr-images`), and security-finding non-disclosure in PR body.
- **Concrete enhancements:**
  1. Promote `Fixes #N` vs `Refs #N` from `assets/pr-standard.md:25-27` into a single sentence in `SKILL.md` Step 2 (deleting the duplicate asset comment) and add a 1-line rule keeping unfixed security-finding locations/details out of PR bodies.
  2. Fix Eval 11 (`redacted` → `retaken with synthetic data or dropped`), add `pr-images` to `L3` boundary (trimming the body-section preview), add `--repo OWNER/REPO` to `L135`, and clarify `pr-description` + `pr-images` handoff for `gh pr create --attach`.
  3. Add `expectations` to all 12 evals + 2–3 edge/boundary cases.

#### 29. `pr-images` — Priority: **Medium**
- **Files:** `SKILL.md` (158L, model-invoked), `references/gh-attach.md` (103L), `evals/evals.json` (7 evals, 0 `expectations`).
- **Codebase findings:**
  - **Workflow-summary leak (`SKILL.md:3`):** *"...from deciding whether a change needs them through capture, privacy check, upload with `gh --attach`, and refresh after later commits"* summarizes Steps 1, 3, 4, 5, and 6 in sequence (`SKILL-MECHANICS.md:56-58`).
  - **Contradiction between Step 2 (`L33,50`) and Step 7 (`L152-154`) / Eval 4 (`evals.json:25`):** Step 2 checks all three preconditions *before* capturing and jumps to Step 7 on failure; yet Step 7 and Eval 4 expect locally captured images handed to the user on a fork PR where precondition 1 (delivery path) failed!
  - **Missing git-context pitfall (`SKILL.md:118-126`, `gh-attach.md:73-77`):** Running `gh` after `cd "$SHOTS_DIR"` outside the repo drops git remote/branch detection, making `--repo OWNER/REPO` (and `--head`/`--base` on `gh pr create`) mandatory.
  - **Minor gaps:** Issue/comment read-back & refresh mechanics omitted at `L130,137-144`; `gh-attach.md:26` uses `| grep -- --attach` (breaks in Windows PowerShell); `gh-attach.md:7-16` puts a 10-line TOC on a 103-line file.
- **Evals gap:** 0 `expectations` across 7 evals; Eval 4 conflicts with Step 2; untested: issue/comment attachment, `Changed` vs `Unchanged` pair split (`L91-92`), and faked-before/mock-harness pressure (`L57-59,70`).
- **Concrete enhancements:**
  1. Strip the 5-step workflow summary from `SKILL.md:3` (identity + triggers + boundary only).
  2. Resolve Step 2 vs Step 7 / Eval 4: explicitly distinguish explicit user screenshot requests (capture locally under Steps 3–4 and hand files + table to user when only delivery path fails) from automatic runs (skip capture + one-line note).
  3. Document the `cd "$SHOTS_DIR"` `--repo`/`--head` requirement, add issue/comment read-back note (`L130`), make `gh-attach.md:26` shell-agnostic, and drop the unneeded TOC on `gh-attach.md`.
  4. Add `expectations` to `evals/evals.json` + 2 cases (issue/comment upload; DevTools/mock-before pressure).

#### 30. `babysit-pr` — Priority: **High**
- **Files:** `SKILL.md` (53L, model-invoked), 3 `references/*.md` (`TRIAGE.md` 302L, `WATCH.md`, `RECOVERY.md`), `scripts/watch_pr.py` + `test_watch_pr.py`, `evals/evals.json` (20 evals, 20 `expectations`).
- **Codebase findings:**
  - **Internal contradiction on escalation scope (`SKILL.md:26` vs `references/TRIAGE.md:238-239`):** `SKILL.md:26` unconditionally parks *"changes touching security, auth, billing, data or migrations"*, while `TRIAGE.md:238-239` allows a 1-line guard at the cited line (*"and the repair is more than a guard at the cited line"*) and adds `privacy`, `concurrency`, and `P0`.
  - **Eyes-reaction observation gap (`SKILL.md:46` vs `scripts/watch_pr.py:15-33,56-73`):** `SKILL.md:46` (2026-11) requires waiting on an *"eyes reaction or a 'reviewing' note"*, yet `watch_pr.py` **never fetches PR or comment reactions**, and neither `WATCH.md` nor `TRIAGE.md:12-26` tells the agent how to query reactions.
  - **Dense walls of text & narrow pointer:** `SKILL.md` packs 4 paragraphs of 119–189 words (`L14,26,36,46`), scattering "not-done-yet" states across 6 lines; `L26` only loads `TRIAGE.md` *"When several reviewers... have commented"* (can miss a single noisy bot like CodeRabbit); `TRIAGE.md` is 302 lines with no TOC (`SKILL-MECHANICS.md:152-153`); `WATCH.md:10-11` invokes `python` without noting `python3`.
  - **Frontmatter (`SKILL.md:3`):** Relies on "babysit"/"PR watch" (missing *"fix CI and review comments on this PR"* / *"merge when green and approved"*) and says *"belongs elsewhere"* instead of naming `code-review`, `git-workflow`, `pr-description`, `ship-it`.
- **Upstream findings:** `EveryInc/compound-engineering-plugin@0f7ae5ed` (`ce-babysit-pr/scripts/pr-snapshot`) — **hold a failed check while its rerun is still running**: GitHub's check rollup keeps the failed run beside the in-progress rerun; do not treat the check as terminally failed or trigger another repair until the rerun completes `(corroborates local watch_pr.py check-rollup logic — check/fix in watch_pr.py too!)`. Also `garrytan/gstack@36b349d6` corroborates failing closed on truncated output.
- **Evals gap:** Best eval suite (20 cases, all with `expectations`), missing only the 3 2026-11 readiness rules (`L46`: base move vs quiet window, announced reviewer, partial pagination), `pr-images` refresh (`L36`), rerun-in-progress check holding, and a negative trigger (one-time status check).
- **Concrete enhancements:**
  1. Unify escalation rules between `SKILL.md:26` and `TRIAGE.md:238-239`; widen `TRIAGE.md` trigger to *"multiple items, bot reviews, or review-body findings"*; add TOC to `TRIAGE.md`.
  2. De-densify `SKILL.md` (`14,26,36,46`) into scannable bullets/one compact red-flags list; sharpen `L3` triggers + named siblings.
  3. Update `scripts/watch_pr.py` (and `test_watch_pr.py`) to (a) ignore a failed check while a rerun of the same check key is in progress, and (b) fetch reactions or document the `gh api` reaction check in `TRIAGE.md`/`WATCH.md`.
  4. Add 3–4 evals covering 2026-11 readiness rules + rerun-in-progress + negative trigger.

#### 31. `ship-it` — Priority: **Low-Medium**
- **Files:** `SKILL.md` (93L, model-invoked), `references/DEPLOYMENT.md` (35L), `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **Data-loss wording ambiguity (`SKILL.md:16` vs `44-45`):** `L16` protects unrelated work (*"preserve unrelated work, including its staging state"*), while `L44-45` says *"A changed path outside that scope is **removed** or reported, never shipped silently."* Reading `L45` literally risks reverting unrelated user work instead of excluding and preserving it (only accidental stray *task* edits should be reverted).
  - **Trigger gap (`SKILL.md:3`):** Omits release/deployment phrasing despite owning the deployment endpoint (`L21-22`, `references/DEPLOYMENT.md`).
- **Upstream findings:** `garrytan/gstack@0a6bb42e` (mark reused CI runs that passed only after a rerun as flaky/rerun) and `@45e6d549` (don't report done on round-2 review when commits landed after reviewed head) reinforce `SKILL.md`'s existing freshness/review gates.
- **Evals gap:** Only 3 evals (with `expectations`); zero coverage of `references/DEPLOYMENT.md`, 2026-11 rules (`L44-46` out-of-scope path & unexercised changed behavior), read-only shipping question (`L26-27`), pause/handoff (`L83-85`), or negative routing (`git-workflow`/`pr-description`/`babysit-pr`).
- **Concrete enhancements:**
  1. Edit `SKILL.md:44-45` in place: revert accidental stray task edits, exclude and preserve unrelated user changes (matching `L16`), or report them — never ship silently; add release/deployment cue to `L3`.
  2. Expand `evals/evals.json` from 3 to ~7 cases covering `DEPLOYMENT.md`, 2026-11 scope/coverage rules, read-only question, and negative routing.

#### 32. `orchestrate` — Priority: **High**
- **Files:** `SKILL.md` (74L, model-invoked), 5 `references/*.md`, `scripts/install-agents.mjs`, 10 `assets/{claude,codex}-agents/*`, `evals/evals.json` (11 evals, 0 `expectations`) + `evals/install-agents.test.mjs`.
- **Codebase findings:**
  - **Direct contradiction on file-based worker output (`SKILL.md:47` vs read-only agent assets):** `SKILL.md:47` tells the root to have workers write long *"research findings or a review"* to a task-scoped file and return only the path — yet `orchestrate-researcher` and `orchestrate-reviewer` in both `assets/claude-agents/` (no `Write` tool; *"Return any required report content to the parent for saving"*) and `assets/codex-agents/` (`sandbox_mode = "read-only"`) **cannot write files**!
  - **Silent no-op bug in `scripts/install-agents.mjs:464`:** `if (import.meta.main)` is `undefined` below Node 24.2, causing silent exit-0 no-ops on Node 20/22/24.0–24.1 (unlike `git-kit.mjs:297-304`'s portable `realpathSync` check).
  - **Harness lock-in (`SKILL.md:12-16` & `docs/workflow.md:55`):** Only models Claude Code, Codex, or *"no native subagent capability"* — conflating other native-subagent hosts (Antigravity, Cursor, OpenCode, Gemini CLI) with no-subagent hosts.
  - **Dense walls of text & cross-file drift:** 74 lines pack ~1,550 words of 100–170 word paragraphs burying `This step is complete when...` (Step 6 `L69-73` lacks one); `references/routing.md:23-28` carries a **stale** "Compact contract" missing `Applicable skills` and `Deadline and stall recovery`; skill-loading (`SKILL.md:51` vs `setup.md:36-49`) and retry/replacement (`SKILL.md:61` vs `recovery.md:13-25`) are duplicated; `references/setup.md:12-13` hardcodes `"D:/Source/my-project"` and `setup.md:22-26` / Codex TOMLs hardcode profile-specific model IDs (`gpt-5.6-luna`, `gpt-6-astra`) without warning to verify against the active account catalog.
  - **Trigger & boundary gaps (`SKILL.md:3`):** Omits *"use subagents"*, *"run in parallel"*, *"install/configure orchestrate agents"*, and sibling names (`planning-and-task-breakdown`, `implement`, `git-worktrees`).
- **Upstream findings:** `EveryInc/compound-engineering-plugin@8d2a49cd` (cross-model Codex catalog/effort fallback) corroborates warning that hardcoded model/effort IDs in `setup.md` and Codex TOMLs can fail pre-egress when an account's catalog differs.
- **Evals gap:** 0 `expectations` across 11 evals; untested: 2026-11 sweep rules (fresh context with consolidated scope `L30`, batching same-shape edits / one fixer `L28,67`, reasoning-blind verification `L71`, capped fix-loop rulings + cost-if-wrong `L73`/`recovery.md:25`), non-Claude/Codex native host, and read-only worker long output.
- **Concrete enhancements:**
  1. Resolve `SKILL.md:47` vs read-only roles (restrict file-written output to writable roles/authorized paths; read-only roles return structured content for the root to save).
  2. Fix `scripts/install-agents.mjs:464` (`realpathSync` `isMain()`), add a 3rd harness branch in `SKILL.md:12-16` & `docs/workflow.md:55` for other native-subagent hosts, replace `"D:/Source/my-project"` in `setup.md:12-13`, and label Codex model IDs as profile defaults to verify against live catalog.
  3. Delete stale Compact contract in `routing.md:23-28`, collapse duplicated skill-loading/recovery prose, break `SKILL.md`'s walls of text with crisp `**Complete when:**` lines, and sharpen `L3` triggers + sibling boundaries.
  4. Add `expectations` + 2026-11 rule cases to `evals/evals.json`.

---

### G. Research (`skills/engineering/research/`)

#### 33. `research` — Priority: **Medium**
- **Files:** `SKILL.md` (58L, model-invoked), `references/RECENT-EVIDENCE.md` (12L), `evals/evals.json` (3 evals, 3 `expectations`).
- **Codebase findings:**
  - **Trust-class contradiction (`SKILL.md:31` vs `19,27`):** `L31` lumps official `documentation` into **Web** and rules that any uncorroborated web claim *"cannot be its only basis"* — literally forbidding recommendations grounded in a library's own official docs, RFC, or release notes, contradicting `L19` and `L27`!
  - **Misleading `last30days` boundary (`SKILL.md:3`):** *"Use last30days when recent community discussion matters"* reads like routing out to a sibling skill, when `last30days` is actually an optional external CLI used *inside* `research` (`references/RECENT-EVIDENCE.md:6`), risking undertriggering when `last30days` isn't installed. Also misses *"current practice"* trigger and `prototype` boundary.
  - **Unsolicited repo-write default (`SKILL.md:12,49`):** Defaults to writing `docs/research/<topic>-research.md` unless the user says "chat-only", causing unexpected repo writes in projects without a `docs/research/` convention.
  - **Missing no-memory-fabrication guardrail (`SKILL.md:33`) & report skeleton (`L51-53`):** Explicitly forbid passing unverified training memory off as inspected evidence when docs/web are unreachable; replace prose list at `L51-53` with a 5-line structural report skeleton (freshness fingerprint first).
- **Upstream findings:** `mvanhorn/last30days-skill@2ba02e59,60e06b52,5705e226` corroborate keeping private context out of saved reports and reporting partial source discovery honestly (already mostly aligned in `RECENT-EVIDENCE.md:4`).
- **Evals gap:** **0% coverage of all three 2026-11 rules (`L31,41`)** (codebase-beats-web conflict, secondary single-source web corroboration gate, `"no evidence"` + deferred decision + revisit trigger), plus updating an existing dated report (`L49`) and unreachable-docs no-fabrication pressure.
- **Concrete enhancements:**
  1. Fix `SKILL.md:31`: distinguish **primary/first-party web sources** (official docs, specs, release notes, upstream source) from **secondary web & provided claims** (which carry the independent-corroboration bar).
  2. Rewrite `SKILL.md:3`: claim `"current practice or community adoption"` directly (delegating to `last30days` inside `RECENT-EVIDENCE.md`) and close with `diagnosing-bugs` and `prototype`.
  3. Conditionalize file saving (`L12,49`: save when asked or when repo instructions require it; otherwise return inline), add the no-memory-fabrication rule (`L33`), and give `L51-53` a 5-line report skeleton.
  4. Add 2 evals covering all three 2026-11 rules and offline/paywalled no-fabrication pressure.

---

## 5. Suggested implementation sequence (if authorized)

If you decide to act on this research, the cleanest vertical slices (minimizing cross-PR conflicts) are:

1. **Wave 1 — Real script & safety bugs (highest ROI, zero prose bloat):**
   - Fix `check_preservation.py` (4 regex bugs + tests), `install-agents.mjs` (`import.meta.main`), `git-kit.mjs` (unborn branch + LF templates), `check_html.py` (4 bugs + Mermaid checks), `content-hash.mjs` (`cwd` + 6-column check), and `watch_pr.py` (rerun-in-progress + reactions check).
2. **Wave 2 — High-priority skill contradictions & safety/discipline fixes:**
   - `adlc-gate` (+ optional `verify-chain.mjs`), `implement`, `sprint-planning`, `verification-before-completion`, `diagnosing-bugs`, `babysit-pr`, `orchestrate`, `writing-for-humans` (extract `MESSAGE-LAYOUT.md`).
3. **Wave 3 — Medium/Low-Medium skill polish, cross-skill sync & context-budget pruning:**
   - `adlc-flow`/`adlc-plan`/`adlc-spec`/`adlc-intent`, `research`, `compound-learnings`, `html-writeup`, `writing-for-agents`, `skill-evolve`, `codebase-design`, `coding-standards`, `planning-and-task-breakdown`, `tdd`, `property-based-testing`, `security-review`, `git-workflow`, `git-worktrees`, `pr-description`, `pr-images`, `grilling`, `handoff`, `prototype`, `ship-it`, `code-review`, `simplify`, plus `docs/workflow.md` & `skills/productivity/README.md`.
4. **Wave 4 — Eval harmonization & behavioral proof (`skill-evolve` / `TESTING-SKILLS.md`):**
   - Standardize `expectations` across the 10 missing skills (and enforce via `scripts/validate-repo.mjs`), decouple the 2 contaminated evals (`coding-standards`, `grilling`), add eval cases for the 2026-11 rules and fixture-backed cases where scripts can grade objectively, and run paired candidate-vs-incumbent checks for high-stakes discipline edits.

---

## 6. Limitations

- **Static inspection only:** Findings are based on local file/script inspection at `567141b` and upstream commit diffs through `2026-11-21`. No paired behavioral eval runs were executed during this research pass; per `writing-for-agents/references/TESTING-SKILLS.md`, instruction edits to discipline skills remain hypotheses until tested against their incumbents.
- **Local `npm run check` environment note:** In this checkout, `node_modules` is not installed (`js-yaml` unavailable for `validate-repo.mjs`), though the 14 zero-dependency Node tests (`adlc-content-hash.test.mjs`, `audit.test.mjs`, `sync-version.test.mjs`) ran and passed (`14/14`).
- **Deferred item (no evidence yet):** Cross-session owner-answer caching (`garrytan/gstack@0b656a17`) is a 2-week pilot with ~1% observed repeat rate — **no evidence** it pays for its complexity here; revisit only if multi-session repeat-question friction is observed locally.
