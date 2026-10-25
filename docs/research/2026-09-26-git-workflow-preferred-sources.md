# Git workflow, PR title/body, worktree, and branching research

Research date: 2026-09-26. The preferred repositories were taken from
[`docs/source-repos.md`](../source-repos.md), in its listed order. GitHub
`gh api` was used for the `main` branch trees, file contents, and (where
available) commits since 2026-08-27. The 30-day window is therefore
2026-08-27 through 2026-09-26. “Current” below means the file at `main` at
research time; “30-day delta” is a change observed in that window and is not
silently treated as a timeless rule.

## Verified matrix

### 1. mattpocock/skills

**Current snapshot.** [`skills/in-progress/pr/SKILL.md`](https://github.com/mattpocock/skills/blob/main/skills/in-progress/pr/SKILL.md)
is a PR-body format reference: start with a compact Summary visual (diagram,
diff sketch, or tree), give before/after Evidence, then describe Merge Danger
(one-way/two-way door) and Blast Radius. It asks for brief prose in the user's
domain language and the smallest visual that makes the change clear. It is a
body-shape reference, not a git execution workflow. The
[`git-guardrails-claude-code` skill](https://github.com/mattpocock/skills/blob/main/skills/misc/git-guardrails-claude-code/SKILL.md)
blocks push, hard reset, clean, `branch -D`, and broad checkout/restore, and
asks whether the hook is project-local or global. The
[`resolving-merge-conflicts` skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/resolving-merge-conflicts/SKILL.md)
requires checking history and primary sources, preserving both intents where
possible, running automated checks, and completing the merge/rebase.

**30-day delta.** The PR reference was added/moved and iterated on
2026-09-17–18: [4cfa4cd2](https://github.com/mattpocock/skills/commit/4cfa4cd2ae),
[00cf26ea](https://github.com/mattpocock/skills/commit/00cf26ea57),
[73a3e94e](https://github.com/mattpocock/skills/commit/73a3e94e6a),
[35f59264](https://github.com/mattpocock/skills/commit/35f5926439),
[74ca5fe0](https://github.com/mattpocock/skills/commit/74ca5fe077), and
[c55ee460](https://github.com/mattpocock/skills/commit/c55ee46073). The
changes moved it to the in-progress bucket, changed Evidence to explicit
before/after pairs, removed an HTML-artifact section, and made the template
more scannable. Treat the current compact template as the latest form.

### 2. obra/superpowers

**Current snapshot.** [`using-git-worktrees/SKILL.md`](https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/SKILL.md)
detects an existing linked worktree using `GIT_DIR`/`GIT_COMMON`, guards
against confusing submodules with worktrees, prefers native host worktree
tools, and uses a git fallback only when needed. The fallback checks that
`.worktrees/` or `worktrees/` is ignored, creates a branch worktree, and runs
baseline tests. [`finishing-a-development-branch/SKILL.md`](https://github.com/obra/superpowers/blob/main/skills/finishing-a-development-branch/SKILL.md)
verifies tests before integration, determines the real base branch, presents
merge / push-and-create-PR / keep-as-is choices, preserves a worktree while a
PR is under review, and cleans only worktrees it owns. Discard is an explicit
request requiring the typed word `discard`. [`requesting-code-review/SKILL.md`](https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/SKILL.md)
uses `git merge-base origin/main HEAD` as the safe multi-commit review base
and sends a bounded description, requirements, base SHA, and head SHA to a
reviewer.

**30-day delta.** The path-specific API query returned no standalone commits
for the worktree or finishing files. The 2026-09-19 release commit
[5bf4e780](https://github.com/obra/superpowers/commit/5bf4e78011) aggregates
recent refactors documented in its message, including native-worktree
guarding and the current three-option finish flow. The current `main` files
are the authority; do not reconstruct older menus from release history.

### 3. addyosmani/agent-skills

**Current snapshot.** [`skills/git-workflow-and-versioning/SKILL.md`](https://github.com/addyosmani/agent-skills/blob/main/skills/git-workflow-and-versioning/SKILL.md)
is the most direct general workflow source. It recommends deployable `main`,
short-lived feature branches (1–3 days), feature flags over long branches,
atomic commits, Conventional-Commit-style type prefixes with the message
explaining why, and separate concerns. It gives `feature/`, `fix/`, `chore/`,
and `refactor/` branch names, worktrees for parallel agents, cleanup after
merge, staged-diff/secrets/tests/lint/typecheck checks before commits, and
semantic-version tags plus a human-facing changelog. Its target sizes are
about 100 lines per commit/PR and a split above roughly 1,000 lines.
[`CONTRIBUTING.md`](https://github.com/addyosmani/agent-skills/blob/main/CONTRIBUTING.md)
adds a useful PR gate: search existing skills/open PRs/rejection history,
justify the gap, keep a change focused, and provide eval evidence for skill
changes.

**30-day delta.** No changes to the git-workflow skill were returned since
2026-08-27; its latest path commit was 2026-07-30
([cda4542a](https://github.com/addyosmani/agent-skills/commit/cda4542ade)).
Contribution guidance did change on 2026-09-02, 15, and 18, but those commits
concern authoring rules, the rejection ledger, and hook tests rather than git
branching or PR title/body policy.

### 4. cursor/plugins

**Current snapshot.** [`new-branch-and-pr/SKILL.md`](https://github.com/cursor/plugins/blob/main/cursor-team-kit/skills/new-branch-and-pr/SKILL.md)
requires a clean or explicitly handled tree, a descriptive branch from
latest `main`, tests, focused commits, and a concise PR with summary/test
notes. [`make-pr-easy-to-review/SKILL.md`](https://github.com/cursor/plugins/blob/main/cursor-team-kit/skills/make-pr-easy-to-review/SKILL.md)
inspects commits, diff size, paths, generated files, and the description;
requires agreement before history rewriting; and compares the original and
new tree IDs after a rewrite. [`review-and-ship/SKILL.md`](https://github.com/cursor/plugins/blob/main/cursor-team-kit/skills/review-and-ship/SKILL.md)
requires targeted checks, correctness/security/regression review, focused
commits, and `gh pr checks`.

The pstack [`opening-a-pr.md`](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/opening-a-pr.md)
is the strongest verified title/body source: work from a worktree off main;
keep commits small and ordered; use `type(scope): imperative subject` with
no trailing period; and write a body with `## Why`, `## Scope`, optional
`## Tradeoffs`, `## Blast Radius`, and `## Verification`. It says a PR body
should brief the reviewer, state why/scope/proof, avoid SHA/rebase history,
and open ready rather than draft. It also defines stacked PRs as a parent
branch chain and resolves the forge before the first PR operation. The
[`worktree-cleanup.md`](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/worktree-cleanup.md)
requires inventory from `git worktree list`, cross-checking active/pinned
work, showing uncommitted work before deletion, and remembering that branch
refs survive worktree removal.

**30-day delta.** Relevant pstack changes include forge-neutral playbooks on
2026-09-01 ([23a56e2d](https://github.com/cursor/plugins/commit/23a56e2dac)),
prose passes on 2026-09-07/08 ([e8d856f0](https://github.com/cursor/plugins/commit/e8d856f027),
[d7cde2b8](https://github.com/cursor/plugins/commit/d7cde2b84e)), and rule
conflict resolution on 2026-09-23
([12d587df](https://github.com/cursor/plugins/commit/12d587dfb2)). The
worktree-cleanup prose was also touched by d7cde2b8. These are current-policy
refinements, not evidence that every Cursor plugin follows the pstack rules.

### 5. DietrichGebert/ponytail

**Current snapshot.** [`ponytail-review/SKILL.md`](https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail-review/SKILL.md)
is an over-engineering-only diff review. It gives terse `delete`, `stdlib`,
`native`, `yagni`, and `shrink` findings and explicitly routes correctness,
security, and performance issues elsewhere. The README's YAGNI/native-feature
ladder is useful for keeping a change small, but no verified branch naming,
worktree lifecycle, PR title, or PR body workflow exists in the inspected
files.

**30-day delta.** 2026-09-14 release/native Cursor-hook commits
([e3ba2aa6](https://github.com/DietrichGebert/ponytail/commit/e3ba2aa6f1),
[67a16015](https://github.com/DietrichGebert/ponytail/commit/67a1601553))
do not add task-specific git workflow guidance. Influence: nonapplicable
except for the general scope/minimality check.

### 6. mvanhorn/last30days-skill

**Current snapshot.** [`CONTRIBUTING.md`](https://github.com/mvanhorn/last30days-skill/blob/main/CONTRIBUTING.md),
[`PULL_REQUEST_TEMPLATE.md`](https://github.com/mvanhorn/last30days-skill/blob/main/.github/PULL_REQUEST_TEMPLATE.md),
and [`AGENTS.md`](https://github.com/mvanhorn/last30days-skill/blob/main/AGENTS.md)
provide a concrete PR checklist: 1–3 sentence Summary, tests, a changelog
fragment when release-facing, AI-review disclosure, security review, notes,
relationship disclosure, and related issues. Feature PRs must not edit
`CHANGELOG.md` or version manifests; release preparation is a dedicated
Action/script. The repository's external marketplace process branches from
main and pins a full commit SHA, which is a useful release-integration detail
but not a general feature-branch rule.

**30-day delta.** On 2026-09-18, [25a5cea5](https://github.com/mvanhorn/last30days-skill/commit/25a5cea5bf)
made Dependabot PRs automatically exempt from the changelog-fragment gate;
this is a repository-specific CI exception. The current branch/PR guidance
should be used for this repository's own PRs, not generalized as a universal
workflow. The repo had many engine changes in the window, but no verified
change to the general title/body or worktree model.

### 7. anthropics/skills

**Current snapshot.** [`skills/skill-creator/SKILL.md`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)
is about authoring/evaluating skills: capture intent, define triggers and
outputs, write a lean progressively disclosed skill, run with-skill and
baseline evals, inspect qualitative/quantitative evidence, and iterate. It
does not define git branching, worktrees, commit messages, or PR titles/body.
Influence is limited to the evidence/evaluation discipline for a new skill.

**30-day delta.** No commits to `skill-creator/SKILL.md` were returned in the
window. No task-specific git guidance was found in the inspected tree.

### 8. trailofbits/skills

**Current snapshot.** [`differential-review/SKILL.md`](https://github.com/trailofbits/skills/blob/main/plugins/differential-review/skills/differential-review/SKILL.md)
is security-focused review of PRs/commits/diffs: use git history/blame,
calculate blast radius, check tests, cite evidence and lines, state coverage
limits, and write a report artifact. [`audit-context-building/SKILL.md`](https://github.com/trailofbits/skills/blob/main/plugins/audit-context-building/skills/audit-context-building/SKILL.md)
requires mapping assumptions, call relationships, and open questions before
hunting for defects. [`property-based-testing/SKILL.md`](https://github.com/trailofbits/skills/blob/main/plugins/property-based-testing/skills/property-based-testing/SKILL.md)
is testing-specific and has no influence on branch/worktree/PR policy.

**30-day delta.** [d1f1575c](https://github.com/trailofbits/skills/commit/d1f1575cff)
on 2026-08-28 added an audit-context dispatch-routing eval. No verified
differential-review or property-testing workflow change occurred in the
window. Use this source for evidence-backed review and explicit uncertainty,
not for naming or branch policy.

### 9. EveryInc/compound-engineering-plugin

**Current snapshot: path inventory only.** The GitHub tree exposed highly
relevant files: [`ce-commit-push-pr/SKILL.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-commit-push-pr/SKILL.md),
its [`branch-creation.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-commit-push-pr/references/branch-creation.md)
and [`pr-description-writing.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-commit-push-pr/references/pr-description-writing.md)
references, [`ce-worktree/SKILL.md`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-worktree/SKILL.md),
and the requested [`ce-compound`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-compound/SKILL.md)
and [`ce-compound-refresh`](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-compound-refresh/SKILL.md)
skills. These paths are likely high-value sources for the requested skill,
but their bodies were not retrieved before the research cutoff. No specific
rule is treated as verified here.

**30-day delta.** A path-level commit audit was not completed. Treat this row
as an explicit follow-up source, not evidence for implementation.

### 10. garrytan/gstack

**Current snapshot: not verified.** The repository was confirmed reachable
and its default branch is `main`, but the relevant tree/content was not
retrieved before the cutoff. No workflow rule, title/body convention, or
recent change is attributed to it in this report.

**30-day delta.** Not audited. Follow up with the GitHub tree and relevant
skill/guide contents before relying on this repository.

### 11. affaan-m/ECC

**Current snapshot: path inventory only.** The tree exposed direct candidates
including [`skills/git-workflow/SKILL.md`](https://github.com/affaan-m/ECC/blob/main/skills/git-workflow/SKILL.md),
[`skills/github-ops/SKILL.md`](https://github.com/affaan-m/ECC/blob/main/skills/github-ops/SKILL.md),
[`commands/pr.md`](https://github.com/affaan-m/ECC/blob/main/commands/pr.md),
[`commands/prp-pr.md`](https://github.com/affaan-m/ECC/blob/main/commands/prp-pr.md),
and worktree lifecycle sources under
[`scripts/lib/worktree-lifecycle`](https://github.com/affaan-m/ECC/tree/main/scripts/lib/worktree-lifecycle).
The file bodies were not retrieved before the cutoff, so no detailed rule is
treated as verified.

**30-day delta.** Not audited at path level. Follow up before using ECC as a
source for current branch, worktree, or PR conventions.

## Synthesis for the target skill

The strongest verified overlap is:

1. Inspect current isolation and repository state first. If a worktree is
   needed, prefer the host-native mechanism; otherwise use an ignored,
   project-local worktree and run a clean baseline test.
2. Branch from the current base, keep one intent per focused branch/commit,
   use short-lived descriptive names, and retain a clean/reversible history.
   Worktrees are especially useful for parallel agents; preserve a PR's
   worktree while feedback is active.
3. Before integration, verify the merged tree and make the integration choice
   explicit. Avoid destructive cleanup, branch deletion, force push, or
   history rewriting without the user's explicit decision and a recoverable
   checkpoint. If rewriting, compare the original and resulting tree IDs.
4. Use a short imperative Conventional Commit-style PR title such as
   `fix(scope): handle ...`, with no trailing period. Keep the body as a
   reviewer briefing: `Why`, `Scope`, relevant `Tradeoffs`, `Blast Radius`,
   and `Verification`; include concrete test outcomes and before/after
   evidence where it proves the claim.
5. Review against the merge base, cite primary evidence and risk, calculate
   blast radius where material, and state uncertainty. Repository-specific
   changelog, release, forge, draft/ready, and disclosure rules must be
   detected from the target repository rather than hard-coded globally.

The verified sources disagree on how much ceremony to impose: Superpowers
asks for consent before creating a worktree when no preference is declared,
while Cursor's pstack playbook assumes worktree-first execution. Preserve
that as an environment/repository decision point rather than collapsing it
into one universal command sequence.


## Root follow-up: completed content consultation

After the delegated cutoff, the root retrieved the following current main files directly with GitHub's contents API on 2026-09-26. This supersedes the content-access limitations in rows 9-11; their historical commit audits remain incomplete.

- **EveryInc:** Read the core principle, project contract, base/range resolution, sizing, assembly, and coverage audit of [pr-description-writing.md](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-commit-push-pr/references/pr-description-writing.md). It explains outcomes beyond what the diff shows, derives scope from the full commit range and final diff, sizes detail by reviewer uncertainty, and respects project templates. Influence: the strongest support for outcome-led titles and bodies with proportionate evidence. The displayed long file was truncated in its middle; no unseen section is claimed as reviewed. ce-compound/refresh are indexed but are not needed to establish the requested PR-writing rules.
- **gstack:** Read [.github/PULL_REQUEST_TEMPLATE.md](https://github.com/garrytan/gstack/blob/main/.github/PULL_REQUEST_TEMPLATE.md). It requires why, live before/after evidence, changed scope, who verified, and what was not tested. Its contributor liveness screenshot rule is repository-specific and is not adopted. Influence: concrete behavior evidence and honest verification limits.
- **ECC:** Read [skills/git-workflow/SKILL.md](https://github.com/affaan-m/ECC/blob/main/skills/git-workflow/SKILL.md). It compares GitHub Flow, trunk-based development, and GitFlow; gives conventional titles and a What/Why/How/Testing body; and discusses merge/rebase and branch cleanup. Influence: branching decision coverage and naming examples. Do not adopt team-size cutoffs, line-count thresholds, broad destructive command examples, or universal global Git settings as mandatory policy. Its rebase guidance also needs reconciliation: it shows force-with-lease for a sole contributor yet later says never rebase pushed branches. Prefer explicit ownership and coordination rules.

Final synthesis qualification: Conventional Commit-style titles are a source preference, not universal. Repository policy determines prefixes, template, draft/ready status, and integration strategy. Existing user authorization takes precedence over imported source approval rituals.
