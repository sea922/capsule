# Repository and GitHub setup

Date: 2026-09-13. Baseline: `7405922c950b68942ba09d04add24b46cc85adeb`.

## Findings and implementation

The initial repository had no PR CI, no branch protection, write-default Actions
tokens, mutable action tags, no Dependabot configuration, and no contribution or
security guide. Secret scanning, push protection, dependency security updates,
squash-only merging, and branch cleanup were already enabled and are retained.
Private vulnerability reporting was disabled. The release command updated the
package independently of the plugin manifest. Pinned YAML overrides were affected
by current advisories.

Implemented a Node-based repository validator with negative fixtures, release
version synchronization, Windows/Linux CI, a stable aggregate required check,
dependency audit, commit-pinned Actions, explicit release-job permissions, and
version-branch CI dispatch. Added contribution/security docs, PR and issue
templates, CODEOWNERS, Dependabot, line-ending/editor settings, and targeted
ignores for local caches/secrets. The pre-existing research SQLite file remains
on disk and is now ignored. It was not deleted.

The validator covers core skill metadata, unique discovery, manifest inclusion,
documentation entries, inline local file links outside code fences, eval JSON
and fixtures, and package/plugin/lockfile version agreement. It is deliberately
not a full Markdown renderer or an agent-behavior benchmark. Research captures
are excluded from link checking because they may quote historical source paths.

## Primary sources and decisions

- [Agent Skills specification](https://agentskills.io/specification): naming,
  description bounds, and portable directory structure. Harness-specific fields
  remain supported rather than rejected by a universal allowlist.
- [GitHub Actions security guidance](https://docs.github.com/en/actions/reference/security/secure-use):
  pin actions to reviewed SHAs and use explicit permissions.
- [GitHub workflow dispatch](https://github.blog/changelog/2022-09-08-github-actions-use-github_token-with-workflow_dispatch-and-repository_dispatch/):
  bot-created version branches receive real CI without a personal access token.
- [Changesets private-package versioning](https://github.com/changesets/changesets/blob/main/docs/versioning-apps.md):
  retain private-package versioning and tagging. Inspecting the pinned
  [action metadata](https://github.com/changesets/action/blob/a45c4d594aa4e2c509dc14a9f2b3b67ba3780d0d/action.yml)
  confirmed the v1 `version` input and `pullRequestNumber` output.
- [Node release schedule](https://nodejs.org/en/about/previous-releases): Node 24
  is an LTS line; use it consistently for local tooling and CI.
- [YAML advisory](https://github.com/advisories/GHSA-2883-xcg3-v3hh): replace
  vulnerable overrides with 4.3.2 and 3.15.2 on their existing major lines.

## Preferred sources

Reused the same-day pinned source inspection recorded in
[coding-standards research](coding-standards-skill-research.md) and its source
index; this is repository setup rather than a new skill research run.

| Preferred repository | Influence or non-applicability |
| --- | --- |
| mattpocock/skills | Keep discoverability and documented repository conventions; retain the existing simple layout. |
| obra/superpowers | Use behavior verification, but avoid adopting an entire mandatory delivery methodology. |
| addyosmani/agent-skills | Turn quality expectations into proportionate checks rather than long prose rules. |
| cursor/plugins, pstack | Preserve explicit tool/context boundaries; no need for its full orchestration system. |
| DietrichGebert/ponytail | Use small native Node tools instead of a new build framework. |
| mvanhorn/last30days-skill | Keep source provenance; exclude generated research caches from Git. |
| anthropics/skills | Validate skill discovery and keep scenario evals distinct from schema checks. |
| trailofbits/skills | Negative tests and trust-boundary awareness; no need for a dedicated large audit platform. |
| EveryInc/compound-engineering-plugin | Maintain durable findings and retire duplicated instructions; no automatic learning pipeline. |
| garrytan/gstack | Explicit workflow roles inform separation of validation and release; no browser-app QA pipeline needed here. |
| affaan-m/ECC | Preserve domain skill separation; its broader harness runtime is unnecessary for repository administration. |

## Verification record

The validator's no-op control passed the valid fixture and failed five negative
cases. Implementing checks made all six pass. A seventh test verifies repeated
version synchronization preserves unrelated metadata. The initial repo run
exposed backtick-formatted README labels; support was corrected rather than
rewriting valid existing documentation. Dependency updates reduced npm audit to
zero known vulnerabilities in the local run. Final CI and live GitHub read-back
are recorded in the delivery response.
