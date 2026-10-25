# PR description

`pr-description` writes pull request titles and bodies from the final diff, on
GitHub or as a GitLab merge request. It is model-invoked and can also be
requested directly.

Try: “Write the PR description for this branch,” “Rewrite PR 88's title and body
to match what it does now,” or “Draft the PR text before I publish.” A text-only
request returns the title and body without touching Git or the forge.

The skill reads the project's title rules and PR template, inspects the full
merge-base diff (locally or through the forge's diff API), and writes for the
reviewer. Titles describe the final outcome. Bodies are brief and use the
project's domain language:

- **Summary:** what changes and why, with the smallest visual that makes the
  point when the change has a shape (pseudocode, a call, component, or file
  tree, a Mermaid diagram, or a diff sketch).
- **Evidence:** before and after: screenshots of the real app on both revisions
  for a visual change, otherwise the exact test or command that failed and now
  passes, quoted rather than pasted as logs. Unrun checks are named. A docs or
  copy change gets one line on how it was checked.
- **Review notes**, when needed: decisions the diff cannot explain, and rollout
  or compatibility implications.
- **Merge danger:** whether the change is a one-way or two-way door, and its
  blast radius: what breaks, for whom, if it is wrong. When unsure, it says
  one-way.

Required
project templates and naming conventions remain authoritative. PRs credit the
human author only; agent "Generated with" footers are left out unless a
repository policy requires AI-use disclosure. Customer names, emails, ticket
text, and secrets stay out of the title, body, and screenshots.

When later commits materially change an open PR's scope, risk, or rollout, the
skill rewrites the title and body from the new final diff instead of narrating
the revisions.

When creating or updating a PR is authorized, it passes the body through a UTF-8
file (`gh pr create --body-file` on GitHub, a `glab api` description field on
GitLab) and re-reads the saved metadata. Branches, commits, and pushes belong to
[git-workflow](git-workflow.md); CI repair, review follow-up, and merging belong
to [babysit-pr](babysit-pr.md).

## References

| Need | Reference |
| --- | --- |
| Choose a summary visual: pseudocode, trees, Mermaid, or diff sketches | [Visuals](../../skills/engineering/pr-description/references/visuals.md) |
| Wording and evidence for a fix, feature, refactor, contract change, migration, dependency, or stacked PR | [Examples](../../skills/engineering/pr-description/references/examples.md) |
| Starting structure for short, standard, or migration PRs | [Assets](../../skills/engineering/pr-description/assets/) |

## Design and evidence

This skill was split out of `git-workflow` so PR-writing requests trigger on
their own; the [split record](../research/2026-10-09-git-workflow-split.md)
explains the boundary. The writing guidance comes from the
[git-workflow research](../research/2026-09-26-git-workflow.md): EveryInc informed
outcome-led PR writing, and Cursor pstack and Matt Pocock informed review context
and evidence. The merge-danger section follows Matt Pocock's `pr` skill, first
recorded in the [2026-09 source sweep](../research/2026-09-27-source-repos-sweep.md).
The summary visuals, before/after evidence, and structured merge danger were
adopted from the same skill, whose visual menu comes from Dex Horthy's `show-me`;
the [adoption record](../research/2026-10-09-pr-description-pocock.md) lists
what was taken and what was not. The refresh rule, lighter evidence for
docs-only changes, screenshot, privacy, and closing-keyword rules come from a
[comparison with Sentry's `pr-writer`](../research/2026-10-22-pr-description-comparison.md),
which also records why Sentry's choice to ignore repository templates was not
followed.
