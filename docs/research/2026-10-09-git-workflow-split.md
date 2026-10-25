# Splitting git-workflow

Date: 2026-10-09

## Decision

Split `git-workflow` into three model-invoked skills:

| Skill | Owns |
| --- | --- |
| `git-workflow` | Commits, branches, rebases and syncs, stacks, backports, local integration, branch policy, recovery |
| `pr-description` | PR titles and bodies from the final diff, the merge-danger line, PR templates |
| `git-worktrees` | Selecting, preparing, retiring, and recovering isolated checkouts and their environments |

`babysit-pr` becomes the only owner of merging a PR on its forge, including
queues and auto-merge. `ship-it` is unchanged apart from routing PR text to
`pr-description`. No `release` skill was added; deployment stays in `ship-it`'s
deployment reference.

## Why

A review of `git-workflow`, `babysit-pr`, and `ship-it` found that
`babysit-pr` and `ship-it` each had one job and a clear endpoint, while
`git-workflow` did not:

- Its description listed six unrelated triggers: commits, branch policy,
  worktree lifecycle, PR writing, integration, and recovery. Requests such as
  "write a PR description", "set up a worktree", and "I committed to the wrong
  branch" use different vocabulary, and one description diluted each.
- The SKILL.md body was mostly a routing table over five references, a sign that
  several skills shared one file.
- References chained two or three levels deep (branching → recipes →
  integration; worktrees → environments).
- Merging a remote PR was described both in `branching.md` and in `babysit-pr`.

PR writing and worktree lifecycle each have a distinct leading word, their own
evals, and callers that need to reach them directly (`ship-it` for PR text,
`orchestrate` for parallel checkouts), which is the `writing-for-agents` test
for splitting off a model-invoked skill. Recovery stays in `git-workflow`: it is
small and shares the core's Git vocabulary, so a separate description would
cost context without improving reach.

## Consequences

- `git-kit.mjs` lost `pr-context` and the PR templates. Skills are linked
  individually, so `pr-description` cannot call a script in another skill;
  `pr-context` wrapped four standard Git commands, which the skill now lists
  directly. Its tests were removed with it; the remaining kit and Git lab tests
  pass.
- PR #43 had broadened `git-workflow`'s description so everyday requests such
  as "create a PR" and `gh pr create` load the skill instead of harness PR
  defaults. Those triggers, including "load before writing any PR title or
  body", moved to `pr-description`; commit, push, rebase, and recovery triggers
  stayed with `git-workflow`, and `ship-it` routes each accordingly. The two
  #43 trigger evals moved to `pr-description`.
- Blind evals moved with their content: the PR text rewrite case to
  `pr-description`, the checkout reuse and retirement cases to `git-worktrees`.
  Each skill gained routing cases for its neighbours.
- No new external research was done. The content and its source influences come
  from the [git-workflow research](2026-09-26-git-workflow.md) and
  [preferred-source audit](2026-09-26-git-workflow-preferred-sources.md);
  `docs/source-repos.md` was not re-consulted because no guidance changed.
