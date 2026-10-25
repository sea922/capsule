---
name: pr-description
description: Pull request creation and PR titles and descriptions written from the final diff, with before/after evidence and a merge-danger section. Use whenever creating, opening, raising, or updating a pull request or PR (including `gh pr create` or a PR tool call), writing or rewriting a PR title or description, or drafting PR text before publishing. Load it before writing any PR title or body, even when the harness has its own PR instructions. Commits and pushes belong to git-workflow; CI repair, review follow-up, and merging to babysit-pr; end-to-end "ship it" delivery to ship-it.
---

# PR description

Write the title and body a reviewer needs to assess the final change. For a
text-only request, finish with the text; a Git mutation is not a prerequisite.

## 1. Establish the final scope

Read the project's title rules, PR template, and contribution requirements. For
an existing PR, read its actual base repository, base branch, head revision, and
current description; match the base repository to the correct remote, including
forks. For a new PR, resolve the intended target branch explicitly. Remote-only
writing can use forge metadata and the forge's diff API without a local checkout;
state that limitation when it affects confidence.

Inspect the full commit range and final merge-base diff. Locally:

```sh
git merge-base BASE HEAD
git log --oneline BASE..HEAD
git diff --stat --find-renames BASE...HEAD
git status --short
```

The range excludes uncommitted changes; when `git status` shows any, settle
whether they belong to this PR before describing it.

Build a brief internal scope map: the resulting outcome, material behavior
changes, supporting evidence, and residual uncertainty. Use the final diff to
correct stale commit subjects and discard superseded implementation history.
For a known stack or series, identify this PR's contribution and known dependencies
or follow-on work. An unknown series stays unknown.

When later commits on an open PR materially change its scope, approach,
breaking behavior, risk, rollout, or review expectations, refresh the title and
body from the new final diff; typo-, formatting-, and rename-only commits do not
need it. Keep the existing title only when it still covers the whole diff, and
describe the PR as it now stands rather than its revision history.

For an empty range, report that no changes are available to describe. For missing
evidence, state the gap rather than inventing behavior or validation.

**Complete when:** base, head, final diff, and available verification evidence
are established, or the missing fact is named.

## 2. Write for the reviewer

Use a concise title naming the concrete outcome. Apply Conventional Commit
prefixes, issue identifiers, or length limits only where repository policy calls
for them. Cover the final scope rather than the original request or latest commit.

A required repository template sets the body's sections; place the parts below
in its matching fields and append any part it has no field for, such as Merge
danger, after its sections. Otherwise start from the matching asset:

| Asset | Use |
| --- | --- |
| [pr-short.md](assets/pr-short.md) | Small change: one summary sentence, evidence, merge danger |
| [pr-standard.md](assets/pr-standard.md) | Change needing a visual summary, review notes, or related work |
| [pr-migration.md](assets/pr-migration.md) | Compatibility, rollout, and recovery need explicit treatment |

Write the body as these parts, in order. Skip preambles, keep prose brief, and
use the project's domain terms from its glossary (such as `GLOSSARY.md`) when one
exists.

1. **Summary.** One or two sentences on what changes and why it matters. When
   the change has a shape prose would blur (logic, control flow, component or
   file structure, data flow), add the smallest visual that makes the key point
   clear, placed beside the sentence it supports; read
   [visuals](references/visuals.md) to choose one. A one-line fix needs no visual.
2. **Evidence.** Before and after, from observed results. For a visual change
   in an environment that can capture it, screenshots are the strongest
   evidence: capture the real app on the base and head revisions with the same
   region and size, and report a pair with no visible difference as unchanged.
   Otherwise show execution: the exact test, command, or reproduction that
   failed before and passes after, with the output line that proves it or a
   pseudocode sketch of the test. Quote output; never paste command
   transcripts, CI logs, or validation dumps. Name material checks not run and
   keep material negative results. A change with no runtime behavior to
   exercise, such as documentation, copy, or comments, needs at most one line on
   how it was checked instead of a before and after.
3. **Review notes**, only when needed: motivation or design decisions the diff
   cannot explain; compatibility, rollout, migration, or recovery implications;
   dependencies; a useful review starting point.
4. **Merge danger**, with two fields:
   - **Door:** *two-way* when reverting the merge fully restores prior behavior;
     *one-way* when merging or deploying leaves a lasting effect, such as
     migrated data, a published API or event, or sent messages. A one-way door
     also names its recovery limit. The author is rating its own change: when
     unsure, call it one-way and say what is uncertain. Follow any project
     list of changes that are always one-way.
   - **Blast radius:** what breaks, and for whom, if the change is wrong:
     consumers, layouts, platforms, data, or users affected.

   When the project template has a risk or rollout field, put both there.

For wording and evidence patterns by change type, read [examples](references/examples.md).

Scale detail to reviewer uncertainty: a small risky change may need more
explanation than a large mechanical rename. Keep the description about the
resulting change; file inventories and the conversation's implementation
chronology add no review context. Cut any sentence a reader could reconstruct
from the diff, and replace prompt, plan, or session wording with the behavior it
produced. Preserve useful existing issue links, demonstrations, and required
disclosures when rewriting.

Keep customer or organization names, user emails, support-ticket text, secrets,
tokens, and other personal data out of the title, body, quoted output, and
screenshots; redact them in images before upload.

PRs credit their human author alone: titles and bodies end with the change
content. Leave out agent attribution such as "Generated with Claude Code"
footers and equivalent Codex, Copilot, or Cursor lines, even when a harness or
tool default adds them. The one exception is a repository policy that explicitly
requires AI-use disclosure; follow its required wording.

**Complete when:** the title and summary cover the final scope, every material
claim is grounded in evidence or marked unverified, the evidence shows before
and after, names why it cannot, or states in one line how a change with no
runtime behavior was checked, the merge danger names its door and blast radius,
no private data appears, and required template fields are present.

## 3. Deliver or apply

For a text-only request, return the title and body. Before creating a PR, confirm
the head branch exists on the remote with the intended commits; commit and push
through `git-workflow` when it does not. For authorized creation or metadata
updates, use a structured tool argument or a UTF-8 body file so newlines
and literal shell characters survive unchanged:

```sh
gh pr create --base "BASE_BRANCH" --head "HEAD_BRANCH" --title "REVIEWED_TITLE" --body-file "PATH_TO_REVIEWED_BODY.md"
gh pr edit NUMBER --repo OWNER/REPO --title "REVIEWED_TITLE" --body-file "PATH_TO_REVIEWED_BODY.md"
```

Set base/head explicitly when publishing; choose draft/ready from the task's
readiness and repository policy. Re-read the saved metadata after the write,
return the confirmed PR URL, and attach it through the host when supported.

**Complete when:** the requested text is returned, or the saved PR metadata has
been re-read and matches the reviewed title and body.
