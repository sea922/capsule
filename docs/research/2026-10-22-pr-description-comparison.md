# pr-description compared with Pocock's `pr` and Sentry's `pr-writer`

Date: 2026-10-22

Follow-up to a `/last30days` scan on "pull request skill". Builds on
[2026-10-09-pr-description-pocock.md](2026-10-09-pr-description-pocock.md),
which already adopted Pocock's visual menu, before/after evidence and Door /
Blast radius fields. That work is not repeated here.

## Sources

| Short name | File read | Revision |
| --- | --- | --- |
| **Ours** | [`skills/engineering/pr-description/`](../../skills/engineering/pr-description/SKILL.md): `SKILL.md`, `references/examples.md`, `references/visuals.md`, `assets/pr-short.md`, `assets/pr-standard.md`, `assets/pr-migration.md`, `evals/evals.json`, `agents/openai.yaml` (the folder has no scripts) | branch `research/pr-skills-comparison` at `59a78a0` |
| **Pocock** | [`mattpocock/skills` `skills/engineering/pr/SKILL.md`](https://github.com/mattpocock/skills/blob/5beb35b040e3de97e54fa9e386d7e42d15c295c2/skills/engineering/pr/SKILL.md), [`CREDITS.md`](https://github.com/mattpocock/skills/blob/5beb35b040e3de97e54fa9e386d7e42d15c295c2/skills/engineering/pr/CREDITS.md), [`agents/openai.yaml`](https://github.com/mattpocock/skills/blob/5beb35b040e3de97e54fa9e386d7e42d15c295c2/skills/engineering/pr/agents/openai.yaml) | repo `main` at `5beb35b` (2026-10-19). Last change to `SKILL.md` is still `e484a80` (2026-09-24), the revision the 2026-10-09 report read |
| **Pocock write-up** | [aihero.dev/skills-pr](https://www.aihero.dev/skills-pr) | fetched 2026-10-22 |
| **Sentry** | [`getsentry/skills` `skills/pr-writer/SKILL.md`](https://github.com/getsentry/skills/blob/f57ada2d0b640406ea7e25b11d636c530e77c58b/skills/pr-writer/SKILL.md), [`SPEC.md`](https://github.com/getsentry/skills/blob/f57ada2d0b640406ea7e25b11d636c530e77c58b/skills/pr-writer/SPEC.md), [`EVAL.md`](https://github.com/getsentry/skills/blob/f57ada2d0b640406ea7e25b11d636c530e77c58b/skills/pr-writer/EVAL.md), [`evals/scenarios/concise-docs-pr.json`](https://github.com/getsentry/skills/blob/f57ada2d0b640406ea7e25b11d636c530e77c58b/skills/pr-writer/evals/scenarios/concise-docs-pr.json) | repo `main` at `f57ada2` (2026-10-15). Last change to `SKILL.md` is `412f236` (#160, 2026-07-15) |
| **Sentry screenshots** | [`getsentry/skills` `skills/pr-screenshots/SKILL.md`](https://github.com/getsentry/skills/blob/f57ada2d0b640406ea7e25b11d636c530e77c58b/skills/pr-screenshots/SKILL.md) (sibling skill; read because Sentry splits visual evidence out of `pr-writer`) | same |
| **Sentry listing** | [awesomeskill.ai/skill/getsentry-skills-pr-writer](https://awesomeskill.ai/skill/getsentry-skills-pr-writer) | page says "Updated 5/28/2026" and lists `SKILL.md` at 8.5 KB |

The listing is stale. The current `SKILL.md` is 5,302 bytes; the version before
#160 (`89a1f01`) was 10,362 bytes and still had a `## Test Plan` block in an
example and a description mentioning "following Sentry conventions". Every
Sentry claim below comes from the GitHub files, not the listing.

## Comparison

| Dimension | Ours | Pocock `pr` | Sentry `pr-writer` |
| --- | --- | --- | --- |
| **Body structure** | Summary (1–2 sentences, optional smallest visual), Evidence, optional Review notes, Merge danger. Three assets: short (no headings), standard, migration (`SKILL.md` §2; `assets/`) | Fixed template: `## Summary` (a visual, not prose), `## Evidence`, `## Merge Danger` (`SKILL.md` template) | No default headings. "Do not add default `Summary`, `Changes`, or `Test Plan` sections." Small change = one paragraph; default = two paragraphs (what changed and its effect; why/risk/review focus if not obvious). A table picks extra content by change type (`SKILL.md` "Body Shape", "Boundaries") |
| **Risk / merge danger** | Required section: **Door** (two-way, or one-way with its recovery limit) and **Blast radius** (what breaks, and for whom) (`SKILL.md` §2 item 4) | Required: Door plus a "one-word" Blast Radius with optional ramifications (`SKILL.md` template). The write-up warns the agent grades its own change, so "two-way, small blast radius" deserves suspicion, and suggests documenting which changes a repo always treats as one-way (aihero.dev) | No risk section. Risk, tradeoffs and migration appear "only when useful". Breaking changes get `!` in the title and the affected surface plus compatibility/migration guidance in the body (`SKILL.md` "Core Rules", "Titles", "Body Shape") |
| **Opens or edits the PR?** | Both modes. Text-only requests end with text; otherwise `gh pr create`/`gh pr edit` with `--body-file`, explicit base/head, draft or ready by readiness and policy, then re-read metadata and return the URL. Pushing goes through `git-workflow` (`SKILL.md` §3) | Text only: a format reference that does not push, open PRs or choose content (aihero.dev; `SKILL.md` contains no commands) | Opens and edits. New PRs are always drafts (`gh pr create --draft --body-file`); updates use `gh api -X PATCH .../pulls/N`. Creates a feature branch if on `main`/`master`. Requires authenticated `gh` (`SKILL.md` "Inspect", "Create or Update") |
| **Repo PR templates** | A required template sets the sections; our parts map into its fields and Merge danger is appended if it has no field (`SKILL.md` §2) | Not read; the write-up says an existing `.github/pull_request_template.md` "can compete" with it and should be settled in agent docs (aihero.dev) | Deliberately ignored: "ignore repository PR templates" is a non-negotiable constraint, and mirroring templates is out of scope (`SPEC.md` "Runtime Contract", "Scope") |
| **Evidence** | Required. Before/after from observed results; screenshots strongest for visual changes; else the exact test or command that failed then passes. Name material checks not run; keep negative results (`SKILL.md` §2 item 2) | Required before/after. Screenshots "S-tier", execution "A-tier", exact test in pseudocode (`SKILL.md` "Evidence"). "Tests are green" alone is a claim, not evidence (aihero.dev) | Opposite default: "Omit routine validation unless it changes risk assessment"; omit it by default for docs, skills, copy or config; never paste commands, CI logs or validation dumps. Screenshots only "when visual evidence exists" (`SKILL.md` "Boundaries", "Reviewer Aids"). The separate `pr-screenshots` skill requires real-build captures of base and head, identical framing, redaction of private values, and a pixel diff that moves unchanged pairs to an **Unchanged** table |
| **Visuals** | Smallest visual from a menu (pseudocode, call/component/file tree, Mermaid, diff sketch) placed beside its sentence (`references/visuals.md`, adapted from Pocock) | Same menu; Summary *is* the visual (`SKILL.md` "Summary") | "Use an aid only when it reduces reviewer reconstruction work"; introduce each with one sentence saying what to notice; omit Mermaid when prose is clearer (`SKILL.md` "Reviewer Aids") |
| **Guard against restating the diff** | "File inventories and the conversation's implementation chronology add no review context"; weak-wording table bans "Add retry.ts and edit payment.ts" (`SKILL.md` §2; `references/examples.md`) | "Skip all preambles and keep prose brief" (`SKILL.md` "Sections") | The body is "a cover note for reviewers, not a changelog, template, validation log, or file-by-file summary"; no exhaustive file lists or commit logs; "Replace internal prompt or process terminology with specific behavior" (`SKILL.md` intro, "Core Rules", "Boundaries") |
| **Guard against going stale** | Write from the final merge-base diff, not the latest commit; correct stale commit subjects; read an existing PR's current description (`SKILL.md` §1–2). No rule for *when* to refresh after later commits; `babysit-pr` pushes review repairs without a hand-off to `pr-description` (`skills/engineering/babysit-pr/SKILL.md` line 34) | None. The write-up lists "doesn't keep bodies current" as a known gap (aihero.dev) | Explicit: refresh title and body when follow-up commits "materially change scope, approach, breaking behavior, risk, migration, or review expectations"; skip typo-, format- and rename-only follow-ups; keep an existing title only if it still describes the whole diff; describe the PR as a whole, not the revision sequence (`SKILL.md` "Titles", "Body Shape", "Create or Update"). `SPEC.md` requires the refresh "even when the user did not explicitly ask" |
| **Trigger (description)** | Long: creating, opening, raising or updating a PR (including `gh pr create` or a PR tool call), writing or rewriting a title/description, drafting PR text; "Load it before writing any PR title or body, even when the harness has its own PR instructions"; routes commits, CI, merge and ship-it elsewhere | "Use when writing a PR body." | "Create or refresh reviewer-facing PR titles and descriptions. Use when opening a PR, updating its title or body, or preparing branch changes for review." `SPEC.md` lists non-triggers: code review, commit-only, CI-fix loops, generic docs |
| **Titles** | Concise, names the outcome; Conventional Commit prefixes, issue IDs or limits only where repo policy asks (`SKILL.md` §2) | Not addressed | Mandatory `<type>(<scope>): <subject>` with a Sentry type list (`feat`, `fix`, `ref`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `meta`, `license`, `revert`); `!` only for external contract breaks; bans `update`, `cleanup`, `misc`, `address feedback`; no trailing period (`SKILL.md` "Titles") |
| **Length / concision** | No numbers. "Skip preambles, keep prose brief"; scale detail to reviewer uncertainty; short asset for small changes (`SKILL.md` §2) | No numbers. "Skip all preambles and keep prose brief"; "don't overwhelm the user" with visuals | No numbers. "Choose the minimum useful shape"; small or obvious = one paragraph without headings; the only eval checks that a docs-only change stays concise with no `Summary`/`Test Plan` headings or validation dumps (`concise-docs-pr.json`) |
| **Privacy / references** | Verified issue links; closing keyword only when the PR should close the issue (`assets/pr-standard.md`). No PII rule | Not addressed | Never include customer or org names, user emails, support-ticket contents, secrets or PII. Issue refs only when verified; `Fixes` closes, `Refs` links (`SKILL.md` "Boundaries") |
| **Agent attribution** | Forbidden unless repo policy requires AI disclosure (`SKILL.md` §2) | Not added (aihero.dev lists "LLM disclosure line" as not done) | #160 removed the earlier attribution requirement from the repo policy, spec and eval (commit `412f236` message) |
| **Evaluation** | Six prompt/expected-output evals; the 2026-10-09 report notes they were not run (`evals/evals.json`) | None in the skill folder | AXIS harness with one weighted-judge scenario and an adoption gate: title type allowed, no default `Summary`/`Test Plan`, validation omitted unless it changes risk (`EVAL.md`, `concise-docs-pr.json`) |

## Recommended changes to `pr-description`

Ranked by expected reviewer benefit against cost. Each is a small edit to
existing text, not a new section of the skill.

1. **Add a refresh rule for follow-up commits.** In §3 (or the end of §1), say:
   when later commits to an open PR materially change scope, approach, breaking
   behavior, risk, rollout or review expectations, rewrite the title and body
   from the new final diff; skip typo-, format- and rename-only commits; keep
   the existing title only if it still covers the whole diff; describe the PR
   as it now stands, not the revision history. Add a matching one-line hand-off
   in `babysit-pr` after it pushes a repair (that edit belongs to the
   `babysit-pr` owner and should be weighed with the separate babysit
   stop-conditions report).
   *Why:* our only stale-description guard works at write time; nothing makes
   anyone re-run it after review repairs, which is exactly when Merge danger
   and Evidence go out of date. Pocock's own write-up names this as a gap.
   *Source:* Sentry `SKILL.md` "Create or Update" and "Titles"; `SPEC.md`
   "Required update behavior"; aihero.dev. Supported by gstack's "never reuse
   a prior run's body" (`ship/sections/pr-body.md.tmpl`) and the
   description-update mode of EveryInc `ce-commit-push-pr`.

2. **Let Evidence shrink for changes with no behavior to exercise, and ban
   dumps.** Keep before/after as the rule for behavior changes. For docs,
   copy, comments and config with no runtime effect, allow one line (or none in
   the short asset) instead of an invented before/after. Add "do not paste
   command transcripts, CI logs or validation dumps; quote the one line that
   proves the point". Relax the §2 completion check to match ("or the change
   has no behavior to show").
   *Why:* our completion check requires before/after "or names why it cannot"
   for every PR, which pushes docs-only PRs toward filler. Sentry built its one
   regression eval around exactly this failure.
   *Source:* Sentry `SKILL.md` "Boundaries"; `concise-docs-pr.json`. We keep
   Pocock's evidence-first stance for behavior changes (aihero.dev: "tests are
   green" is a claim, not evidence).

3. **Bias the door call against self-grading.** Add to the Door field: changes
   that migrate or delete data, publish an API, schema or event, or send
   anything outward are one-way unless shown otherwise; when unsure, say
   one-way and why; honor any repo-documented list of always-one-way changes.
   *Why:* the author agent rates its own change, and "two-way, small blast
   radius" is the comfortable answer. One sentence closes most of that risk.
   *Source:* aihero.dev "Merge Danger" caveat.

4. **Add a privacy boundary.** One line in §2: never include customer or
   organization names, user emails, support-ticket text, secrets, tokens or
   other PII in the title, body, screenshots or quoted output.
   *Why:* our skill now encourages screenshots and pasted output as evidence,
   which raises the chance of leaking data into a PR that may be public. We
   have no rule at all here.
   *Source:* Sentry `SKILL.md` "Boundaries"; `pr-screenshots` Step 3. gstack
   goes further and scans the body for secrets and PII before posting
   (`ship/sections/pr-body.md.tmpl`); a written rule is enough here.

5. **Add screenshot integrity rules to the Evidence item (or to
   `references/examples.md`).** Before and after come from the real app on the
   base and head revisions, not a mock or injected CSS; both shots use the same
   region and size; private values are redacted before upload; a pair with no
   visible difference is reported as unchanged, not as evidence.
   *Why:* we call screenshots the strongest evidence but say nothing about what
   makes one trustworthy. A doctored or mismatched pair is worse than none.
   *Source:* Sentry `pr-screenshots` Steps 2–4. Keep it to three or four lines;
   Sentry's full capture workflow is product-specific.

6. **Name agent-process leakage in the editing checks.** Add a row to the
   weak-wording table in `references/examples.md`: wording from the prompt,
   plan or agent session ("per the spec", "addressed review feedback",
   "implemented step 3") becomes the concrete behavior it produced.
   Pair it with one test for every sentence: cut it if a reader could
   reconstruct it from the diff.
   *Why:* our rule bans the implementation chronology but not its vocabulary,
   which is the more common agent tell in practice, and our diff-restating
   guard names file lists but not the general case.
   *Source:* Sentry `SKILL.md` "Core Rules"; `SPEC.md` negative examples;
   EveryInc `ce-commit-push-pr/references/pr-description-writing.md` ("Cut any
   sentence a reader could reconstruct from the diff itself").

7. **Add a contract-change example.** In `references/examples.md`, add a
   breaking payload or schema change whose Summary shows before/after blocks of
   the contract and whose Blast radius names the consumers and the migration
   step.
   *Why:* our example table covers bug fix, feature, refactor, migration,
   dependency and stack, but not the API/schema change that reviewers most need
   a before/after for.
   *Source:* Sentry `SKILL.md` "Examples" (breaking contract) and the
   "Contract or breaking change" row of "Body Shape".

8. **Tighten the closing-keyword rule.** In `assets/pr-standard.md`, use a
   closing keyword only when this PR delivers the whole issue and that was
   verified; partial delivery links the issue (`Refs #N`) and names what is
   left.
   *Why:* "should close" is a judgment the author agent makes optimistically;
   a premature close hides remaining work.
   *Source:* gstack `ship/sections/pr-body.md.tmpl` (`Closes #N` only with
   every spec criterion verified); Sentry `SKILL.md` ("`Fixes` closes; `Refs`
   only links").

9. **Add three evals.** (a) A docs-only change: short body, no padded
   evidence, no validation dump. (b) Follow-up commits that change scope on an
   open PR: title and body rewritten without narrating revisions. (c) A
   repository with a required PR template: sections preserved, Merge danger
   appended. Run them, since the 2026-10-09 evals were never run.
   *Why:* recommendations 1 and 2 change behavior and need a regression check;
   (c) guards the template decision below.
   *Source:* Sentry `EVAL.md` adoption gate and `SPEC.md` holdout examples.

## Not adopting

- **Ignoring repository PR templates** (Sentry `SPEC.md`). Templates often
  carry checklists, legal or security attestations, and CI-parsed fields. The
  2026-10-09 report already kept templates authoritative over Pocock's fixed
  layout; Sentry's own history shows the opposite rule is a house choice for
  Sentry's repos (commit `f2cff98`, "Reuse the PR template for updates", refers
  to its own template, later dropped).
- **Dropping headings and the Merge danger section by default** (Sentry
  `SKILL.md` "Boundaries"). Merge danger is the part a skimming reviewer uses
  to decide how closely to read. Our short asset already gives small changes a
  heading-free body; that is the right amount of Sentry's minimalism.
- **Omitting validation by default for all changes** (Sentry `SKILL.md`). Only
  the narrow part is taken (no dumps; no padded evidence for docs-only). For
  behavior changes, before/after evidence is the point of the skill.
- **Always opening drafts** (Sentry `SKILL.md` "Create or Update"). Our skill
  picks draft or ready from the task's readiness and repository policy, which
  `ship-it` relies on.
- **A mandatory title format with Sentry's type list** (`ref`, `meta`,
  `license`, ...). Title conventions stay a repository policy. The banned-vague
  subjects are already covered by our weak-wording table.
- **Creating a feature branch from `main` inside the PR skill** (Sentry
  `SKILL.md` "Inspect the Change"). Branch work belongs to `git-workflow`, which
  §3 already calls.
- **`gh api -X PATCH` for updates** (Sentry `SKILL.md`). `SKILL.md` gives no
  reason for preferring it over `gh pr edit --body-file`, and the PATCH form has
  been there since the oldest revision checked (`24361e7`). No change without a
  concrete failure of `gh pr edit`.
- **Pocock's fixed template, one-word blast radius and narrow description.**
  Already rejected with reasons in the 2026-10-09 report; nothing in the
  current revision changes that.
- **Numeric length caps** (EveryInc: small changes "under ~300 characters",
  large ones ~100 lines capped at ~150; pstack: about 40 lines because the
  body becomes the squash commit). Neither compared skill uses numbers, and
  ours scales by reviewer uncertainty so a small risky change can run longer.
  Revisit only if evals show bloat that recommendation 2 does not fix.
- **A narrower trigger** (either skill). Both external descriptions are
  shorter, but PR #43 showed ours needs the broad phrasing to load on "create a
  PR". The only addition worth testing is the verb "refresh" once
  recommendation 1 lands.

## Preferred source repositories

Each repository in [`docs/source-repos.md`](../source-repos.md) was checked at
its `main` head on 2026-10-22 for PR-writing files (a path search of the full
tree, then the matching files read). Files outside the two compared skills were
read to test the recommendations, not to adopt new structure.

| # | Repository (head read) | Relevant file | Influence |
| --- | --- | --- | --- |
| 1 | `mattpocock/skills` (`5beb35b`) | `skills/engineering/pr/SKILL.md`, `docs/engineering/pr.md` (human-facing doc whose content matches the aihero.dev page) | Compared skill. Door self-grading caveat → recommendation 3; admitted staleness gap supports 1 |
| 2 | `obra/superpowers` (`2ce8aa1`) | `skills/finishing-a-development-branch/SKILL.md` | Its "Push and Create PR" option says only to follow the repo's PR template and conventions if present and report the URL; no body rules. Agrees with keeping repo templates authoritative; nothing else to adopt |
| 3 | `addyosmani/agent-skills` (`aeac41d`) | `.claude/commands/ship.md` | A go/no-go release gate with a mandatory rollback plan, not PR text. Its rollback plan overlaps our one-way door's recovery limit; no change |
| 4 | `cursor/plugins` (`eb4db2b`) | `harness/pstack/claude-code/skills/poteto-mode/playbooks/opening-a-pr.md`; `cursor-team-kit/skills/new-branch-and-pr/SKILL.md`; `dyl-stack/skills/dyl-ready-pr/SKILL.md` | pstack has a `## Blast Radius` section (1–2 sentences, who it touches and why safe or risky), bans file-by-file essays and SHA genealogy, and opens every PR ready. Supports keeping Merge danger and not adopting Sentry's always-draft rule. Its ~40-line cap is listed under Not adopting. The other two have no body rules beyond "summary and test notes" |
| 5 | `DietrichGebert/ponytail` (`09c434a`) | none | Over-engineering audits; no PR writing; not applicable |
| 6 | `mvanhorn/last30days-skill` (`0f524f1`) | `docs/pr-credits.md` only (repository credits, not a skill) | Not applicable to the skill. Used as the research method that surfaced this comparison |
| 7 | `anthropics/skills` (`dbd4588`) | none for PRs | `skill-creator` informs recommendation 9 (evals with expected outputs, run them) |
| 8 | `trailofbits/skills` (`f0dd11d`) | `plugins/code-improver/skills/pr-improver/SKILL.md` | Improves code inside a PR, not its description; not applicable |
| 9 | `EveryInc/compound-engineering-plugin` (`738067a`) | `skills/ce-commit-push-pr/SKILL.md`, `references/pr-description-writing.md` | Treats a project template "as a minimum unless the project explicitly requires an exact/template-only body", which confirms our template stance against Sentry's. "Cut any sentence a reader could reconstruct from the diff" → recommendation 6. Description-update mode supports 1. Numeric caps not adopted |
| 10 | `garrytan/gstack` (`514fbfd`) | `ship/SKILL.md.tmpl`, `ship/sections/pr-body.md.tmpl` | "Never reuse a prior run's body" supports 1; secret/PII scan supports 4; `Closes #N` only with every criterion verified → 8. Its long fixed section list and attribution footer conflict with our concision and no-attribution rules; not adopted |
| 11 | `affaan-m/ECC` (`90606c8`) | `commands/pr.md` | Fills repo templates and marks empty sections N/A (supports keeping templates), but prescribes a Files Changed table, the opposite of our diff-restating guard; nothing adopted |
| 12 | `wshobson/agents` (`0874a27`) | `plugins/git-pr-workflows/commands/pr-enhance.md` | Scored risk calculator, review-time estimates and per-category file lists. A cautionary contrast: a numeric risk score is less useful than a door and a named blast radius; nothing adopted |
| 13 | `nahid-sparktales/agent-dispatcher` (`564c3f0`) | `recipes/review-pull-request.md` | PR review, not description writing; not applicable |
| 14 | `humanlayer/skills` (`653b641`) | `plugins/visual-pr/skills/visual-pr/SKILL.md` and its `references/` (added 2026-09-17, after the 2026-10-09 report's `show-me` read) | New since the last report. Mandatory one-sentence "Why", 1–3 "Special things to note" bullets, and a `show-me` structural outline; no evidence or risk section; triggers only by explicit name. Our Summary visuals already come from the same `show-me` menu; no further change |

The pstack, EveryInc, gstack, ECC, wshobson, addyosmani and humanlayer readings
came from a delegated read of each file at the heads above; the quotes used in
recommendations 1, 4, 6 and 8 and the pstack readiness and Blast Radius lines
were re-checked against the source files before citing them.

## Verification

Report only; no skill, README or manifest was changed, so no repository checks
apply. Pocock's `SKILL.md` was confirmed unchanged since `e484a80`. The Sentry
listing was checked against the GitHub file sizes and history and found to
predate #158 and #160.
