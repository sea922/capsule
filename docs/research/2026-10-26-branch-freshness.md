# git-workflow: branch freshness

Date: 2026-10-26

Trigger: a `/last30days` run on Theo Browne's `modernize` skill, followed by a
request for the behaviour it implies: "check the branch and make sure it is up
to date, pull latest changes if needed and see if these changes/fixes are in PR
that came in." The owner chose to extend `git-workflow` rather than add a new
skill, with a verdict on the branch or PR as well as the sync.

The result is [`references/freshness.md`](../../skills/engineering/git-workflow/references/freshness.md),
loaded from the `git-workflow` table when a branch or PR may be stale, already
landed, or superseded.

## Primary inspiration

[`t3dotgg/tstack` `skills/modernize/SKILL.md`](https://github.com/t3dotgg/tstack/blob/main/skills/modernize/SKILL.md)
(repository created 2026-10-24; 472 stars by 2026-10-26). It decides a
disposition before pushing (MODERNIZE, REWORK, or CLOSE), checks for conceptual
conflicts with base-branch changes since divergence, compares the series with
`git range-diff`, and pushes only with a lease. Adopted: verdict before sync,
the REWORK stop, "a clean rebase is not proof", and "age and sunk effort are not
evidence". Not adopted: it says nothing about *how* to detect that the work
already landed, which is the core of the request here. Community discussion of
the skill was too thin to weigh; see the saved
`theo-tstack-modernize-skill-raw-v3.md` run.

## Preferred sources

Revisions are each repository's default-branch head on 2026-10-26.

| # | Repository | Read | Influence |
| --- | --- | --- | --- |
| 1 | [mattpocock/skills `5beb35b`](https://github.com/mattpocock/skills/tree/5beb35b0) | `skills/engineering/triage/SKILL.md`, `skills/engineering/pr/SKILL.md` | Triage closes an issue when the feature already exists and points at where it lives, judged by domain concept rather than wording. Adopted as "confirm supersession from the other PR's diff and behavior, not its title". |
| 2 | [obra/superpowers `2ce8aa1`](https://github.com/obra/superpowers/tree/2ce8aa15) | `skills/finishing-a-development-branch/SKILL.md` | Infer the base, then confirm when unsure; delete only safely. Adopted in the base-resolution sentence. No landed-work detection. |
| 3 | [addyosmani/agent-skills `aeac41d`](https://github.com/addyosmani/agent-skills/tree/aeac41d4) | `skills/git-workflow-and-versioning/SKILL.md` | Short-lived branches, delete after merge, discourages habitual squash. Its squash aversion is why detection cannot assume squash-free history. Age is treated as a hint only. |
| 4 | [cursor/plugins `99b609a`](https://github.com/cursor/plugins/tree/99b609a7) (pstack) | `harness/pstack/claude-code/skills/poteto-mode/playbooks/worktree-cleanup.md`, its `scripts/worktree-audit.sh`, `cursor-team-kit/skills/fix-merge-conflicts/SKILL.md` | Strongest match. The audit layers `merge-base --is-ancestor`, then PR state by head branch, then buckets, and never deletes. It cannot see a squash without the forge. Adopted: layered evidence and "propose, never delete". Our synthetic squash and residual fill its squash gap. |
| 5 | [DietrichGebert/ponytail `09c434a`](https://github.com/DietrichGebert/ponytail/tree/09c434ab) | Tree listing | Over-engineering audits only. Not applicable. |
| 6 | [mvanhorn/last30days-skill `6f9052c`](https://github.com/mvanhorn/last30days-skill/tree/6f9052cc) | Tree listing | Research skill; used for the trigger run, nothing on Git. |
| 7 | [anthropics/skills `dbd4588`](https://github.com/anthropics/skills/tree/dbd4588f) | Tree listing | Authoring and document skills. Not applicable; `writing-for-agents` covered authoring. |
| 8 | [trailofbits/skills `196a907`](https://github.com/trailofbits/skills/tree/196a9073) | `plugins/differential-review/README.md` | Security review of diffs, including re-introduced vulnerabilities via history. The reintroduction idea parallels our residual classification, but the skill targets security regressions, not branch currency. Not adopted. |
| 9 | [EveryInc/compound-engineering-plugin `9f5b16f`](https://github.com/EveryInc/compound-engineering-plugin/tree/9f5b16fc) | `docs/guides/ce-compound-refresh.md` | Keep, Update, Replace, Delete verdicts from evidence, with uncertain cases reported rather than edited. Closest structural analogue; adopted as "when evidence cannot separate two verdicts, report both". |
| 10 | [garrytan/gstack `7ee7e8b`](https://github.com/garrytan/gstack/tree/7ee7e8bd) | `ship/SKILL.md` | Base from PR target, then repo default; continue when already current; stop when a PR lookup is ambiguous. Adopted in base resolution. |
| 11 | [affaan-m/ECC `25278e7`](https://github.com/affaan-m/ECC/tree/25278e7d) | Tree search of `skills/` and `.agents/skills/` for git, branch, rebase, PR, merge | No matching skill. Not applicable. |
| 12 | [wshobson/agents `0874a27`](https://github.com/wshobson/agents/tree/0874a27b) | `plugins/git-pr-workflows/commands/git-workflow.md` (searched) | Mentions verifying no conflicts with the target branch before a PR. No landed or superseded detection. Not adopted. |
| 13 | [nahid-sparktales/agent-dispatcher `564c3f0`](https://github.com/nahid-sparktales/agent-dispatcher/tree/564c3f0e) | `commands/agent-git.md` | "Never lose work" principle, already covered by `git-workflow`. |
| 14 | [humanlayer/skills `653b641`](https://github.com/humanlayer/skills/tree/653b6411) | Tree listing | Loop and prompt skills. Not applicable. |
| 15 | [testdouble/han `abba73a`](https://github.com/testdouble/han/tree/abba73a7) | Tree listing | Release and documentation skills. Not applicable. |

Limits: repositories 5-7, 11, 14, and 15 were checked by tree listing or search,
not by reading every file. Repository 12's command file was searched, not read
in full.

## Git facts

- **`git cherry` and squashes.** [git cherry](https://git-scm.com/docs/git-cherry)
  matches commits by patch-id, which hashes one commit's diff. A multi-commit
  squash matches none of the branch's commits; a one-commit squash does. A
  synthetic squash (`git commit-tree HEAD^{tree} -p MERGE_BASE`) restores the
  match when the landed diff is identical.
- **The residual.** [git merge-tree](https://git-scm.com/docs/git-merge-tree)
  `--write-tree` performs a merge without touching the index or worktree, prints
  the result tree, and exits 1 on conflict. It is documented from Git 2.38. A
  clean result equal to `BASE^{tree}` means the branch would change nothing.
  The comparison idiom is an inference from the documented output, not a
  documented use.

## Live case

This repository's own `feat/skill-evolve` was squash-merged as #59, and the
release PR #60 then used up its changeset. Run against it on 2026-10-26:

- `git cherry origin/main feat/skill-evolve` printed `-`, but only because the
  branch had a single commit.
- The residual was not empty: merging the branch would re-add
  `.changeset/skill-evolve.md`, which would trigger a spurious release. Its
  only history on `main` was the add in #59 and the delete in #60, so it
  classifies as a reintroduction and the verdict is LANDED.

This is why the reference classifies residual paths instead of treating a
non-empty residual as remaining work.

## Validation

**Executable mechanics.** Two tests added to
[`git-lab.test.mjs`](../../skills/engineering/git-workflow/evals/git-lab.test.mjs):
a multi-commit squash shows `+` for every commit under plain `git cherry` and
`-` for the synthetic squash; and the residual is empty right after a squash
and becomes exactly `A .changeset/feature.md` once the base consumes the
changeset. All eight lab tests pass on Git 2.52.

**Blind scenarios.** Evals 8-10 in
[`evals.json`](../../skills/engineering/git-workflow/evals/evals.json). One
baseline run with no skill and one treatment run with `SKILL.md` and its
selected references, both Claude Sonnet, answers captured before grading. The
first baseline run answered only scenario 8; scenarios 9 and 10 were rerun
separately for it.

| Eval | Baseline | Treatment |
| --- | --- | --- |
| 8, the owner's request on a squash-merged branch | Found #59 and proposed switching to `main`, but called the changeset deletion expected without noticing that syncing would restore it, claimed a squash can never match by patch-id, and proposed `git branch -D` after confirmation | LANDED; ran forge, `git cherry`, synthetic squash, and residual; classified the changeset as a reintroduction; no rebase or push; updated `main` and left the branch |
| 9, teammate PR superseded by #350 | Inspected #350 before rebasing, would not force-push, recommended asking about closing | SUPERSEDED with the same safeguards, plus a residual check for any unique piece |
| 10, three commits cherry-picked | `git cherry`, rebase drops duplicates, tests, lease push after confirming | PARTIAL; same steps plus `range-diff` and an explicit expected-SHA lease |

The baseline was already competent on 9 and 10. The skill's measured gain is
on 8, the requested case: the reintroduction, and a consistent verdict. This is
one run per arm on one model, so variance is unmeasured. The treatment read
`SKILL.md`, `freshness.md`, and `branching.md`, which confirms that the load
table routes these prompts.
