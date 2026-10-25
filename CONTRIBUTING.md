# Contributing

Use Node.js 24 LTS and npm 11. Install locked dependencies and run local checks:

```bash
npm ci --ignore-scripts
npm run check
```

`npm run check` tests repository tooling and validates skill metadata, publication
entries, local Markdown file links, eval structure, synchronized versions, and
workflow permissions, timeouts, and action pins.
It does not prove that a skill changes agent behavior or validate remote links.
Run meaningful paired scenario evaluations for behavioral changes and record
what was exercised and what remains unproven.

## Add or change a skill

Read [AGENTS.md](AGENTS.md) and the [preferred sources](docs/source-repos.md).
Keep the skill and its references, assets, scripts, and evals together. Use
`scripts/list-skills.sh` to inspect discovery. Add the top-level README entry,
bucket entry, human-facing docs page, and plugin manifest path for a new skill.

Use `npm run changeset` for a released behavior change. A new skill normally
receives a minor changeset; fixes normally receive a patch. Documentation and
tooling-only changes need a changeset only when they affect the distributed
package. Keep research reports under `docs/research/`; prefer cited findings and
pinned source paths over copied upstream files or raw session dumps.

After changing either plugin manifest, run `claude plugin validate . --strict`.
This command validates the marketplace at the root; `npm run validate` checks
the referenced skill entries and version relationship. Direct strict validation
of the plugin manifest also warns about the root `CLAUDE.md`, which is intentional
checkout context and is not distributed context for installed skills.

## Pull requests

Use a focused branch and a Conventional Commit PR title. Explain the resulting
behavior, evidence, and limitations. PRs require the `Repository checks` status,
resolved conversations, and an up-to-date branch. A second maintainer's approval
is not required for this individually maintained library. Squash merging keeps
one logical change per commit; feature branches are deleted after merge.

## Releases

The release workflow creates or updates the Changesets version PR. Its
`npm run version:skills` command updates the package, plugin manifest, and root
lockfile versions together, then validates the result. Every merged PR with a
changeset therefore produces a version bump: the release job approves the
version PR's CI run and enables auto-merge, and the PR lands once the required
checks pass on its head. The workflow tags private-package releases; it does not
publish this repository to npm.

The repository requires approval before Actions runs for external
contributors, and GitHub counts the `github-actions` bot as one. The release job
approves that pending run itself. A merge made by `GITHUB_TOKEN` starts no
further workflows, so the release tag lands on the next push to `main`. If
auto-merge stalls, approve the pending run on the version PR under Actions and
merge it. Keep the release workflow's PR creation permission enabled; it does
not grant permission to bypass branch checks.


settings and recovery procedure.
