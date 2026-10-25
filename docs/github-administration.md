# GitHub administration

This repository is maintained by one owner. Changes go through pull requests
with automated checks; a second person's approval is optional.

## Desired settings

| Setting | Policy |
| --- | --- |
| Default branch | `main` |
| Merge method | Squash only; PR title becomes the commit title |
| Branch cleanup | Delete merged feature branches |
| Auto-merge | Available after checks; no blanket automatic approval |
| Main protection | PR required, resolved review threads, up-to-date branch, linear history, no force pushes or deletion |
| Required check | `Repository checks` from the GitHub Actions app |
| Bypass actors | None; owner can change the ruleset for documented recovery |
| Actions default token | Read-only; release job explicitly requests its required writes |
| Action references | Full commit SHAs; Dependabot tracks updates |
| Fork workflow approval | All external contributors require approval |
| Dependencies | Dependabot weekly npm/Actions updates and security alerts/updates |
| Secrets | Secret scanning and push protection enabled |
| Security reports | Private vulnerability reporting enabled |

The desired main ruleset is stored in [.github/main-ruleset.json](../.github/main-ruleset.json).
It is a management payload, not automatically applied by CI. Inspect existing
rulesets before applying it; update the matching rule instead of duplicating it.
Enable the required check only after CI has run successfully on a real commit.

## Routine checks

```bash
gh api repos/sea922/capsule/rulesets
gh api repos/sea922/capsule/rules/branches/main
gh api repos/sea922/capsule/actions/permissions/workflow
gh api repos/sea922/capsule/private-vulnerability-reporting
```

`can_approve_pull_request_reviews` is GitHub's combined switch allowing Actions
to create and approve PRs. It remains enabled because Changesets creates release
PRs. The workflow does not submit PR reviews. Release writes are limited to its
job, including `actions: write` to approve the version PR's pending CI run and
enable auto-merge.

If the version PR stays blocked, check for a CI run awaiting approval
(`action_required`) on its head and approve it; a dispatched run on the branch
does not satisfy the PR's required check. If checks fail, repair the branch. Do not create fake passing
statuses or merge with an administrative bypass. In an emergency, the owner can
edit the ruleset in Settings; record the reason and restore the policy afterward.

Protecting `main` does not deploy content or publish an npm package. Version PRs
remain separate review decisions. Keep the private-package Changesets settings
unless the distribution model intentionally changes.
