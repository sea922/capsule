# Ship It

`ship-it` carries finished changes to a verified delivery endpoint. It is
model-invoked for requests such as "ship it" and can also be selected explicitly.

Bare "ship it" means a merge-ready PR. "Open a PR" stops at publication;
"merge when ready" continues until the remote PR reports merged. Deployment
requests add release preparation and verification in the target environment.
The skill states its endpoint and retains permissions already established in
the conversation, within repository and host policy.

## Examples

- "Ship the login fix; get it merge-ready and I'll merge."
- "Ship this change and merge when the required checks pass."
- "Resume shipping this branch from the existing PR."
- "Ship this release to staging and verify it is serving the new revision."

## Composition

The skill coordinates existing owners: `code-review` for supported findings,
`implement` for repairs, `verification-before-completion` for fresh evidence,
`git-workflow` for commits and push, `pr-description` for the PR text, and
`babysit-pr` for remote follow-through. It
reuses existing reviews and PRs where they cover the current change. Repairs
and base changes trigger the affected checks again.

It preserves unrelated work and staging. Repository policy determines version
bumps and release documents. Merge, deployment, reviewer messages and thread
resolution retain their own authorization. A delivery handoff carries the
selected endpoint explicitly so a receiving skill cannot silently change it.

Standalone Git tasks and existing PR monitoring have their own entry points.
This skill does not own initial feature design or a product completeness audit.
The similarly named LunkiBR skill checks UX details and solves a different problem.

## Evidence and limits

The [research](../research/2026-09-26-ship-it-research.md) records all thirteen
preferred repositories. Cursor's concise review-and-ship sequence and ship-kit's
composition informed the coordinator; gstack and the release-verification
sources informed conditional delivery checks. The instructions are original;
no upstream workflow is vendored into the skill.

The repeatable scenarios are in `skills/engineering/ship-it/evals/evals.json`.
The [evaluation record](../research/2026-09-26-ship-it-validation.md) distinguishes
paired text-scenario results from structural validation. Text simulations do not
prove real Git preservation, CI monitoring, merges or deployment behavior.
