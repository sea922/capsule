# Git workflow kit expansion

The user authorized expansion of the existing skill on 2026-09-26. The same
session's [preferred-source audit](2026-09-26-git-workflow-preferred-sources.md)
remains the source comparison for all 11 repositories; it was consulted rather
than repeating discovery. The preference order in `docs/source-repos.md` is
unchanged. Its source influences and non-applicability remain as recorded:
EveryInc/Matt Pocock/Cursor for PR evidence and context, Superpowers for ownership,
Addy/ECC for policy alternatives, and the remaining sources for bounded review,
authoring, or repository-specific rules rather than universal Git policy.

## New primary checks

Official documentation was consulted for the expanded command recipes and
failure modes. These establish technical behavior, not recent popularity:

- [git-commit](https://git-scm.com/docs/git-commit): path-scoped commits use the
  selected paths' working-tree content; unrelated staged paths remain separate.
- [git-push](https://git-scm.com/docs/git-push): explicit expected-value leases
  avoid relying on remote-tracking refs refreshed by background fetches.
- [git-rebase](https://git-scm.com/docs/git-rebase): transplanting a selected range
  with `--onto`, and the conflict-side interpretation during rebase.
- [git-cherry-pick](https://git-scm.com/docs/git-cherry-pick): provenance option and
  merge-parent selection for backports.
- [git-reflog](https://git-scm.com/docs/git-reflog): local reference history for
  finding candidate recovery points; it is not a durable backup guarantee.
- [git-worktree](https://git-scm.com/docs/git-worktree): linked checkout metadata,
  repair, shared state, and submodule limitations.
- [git-merge](https://git-scm.com/docs/git-merge): abort limitations with pre-existing
  local edits and squash integration behavior.
- [GitHub merge queues](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue):
  queued integration has its own eligibility/check lifecycle.

## Design

Common state/authority steps stay in SKILL.md. Policy and recovery have direct
conditional pointers; branch, worktree, and PR paths disclose recipes, integration
pitfalls, environment preparation, and examples. Each file supplies a completion
criterion. Examples are explicitly fictional and contain evidence placeholders.

Evaluation separates rubric-hidden agent responses from executable local Git
mechanics. Neither substitutes for real forge controls or managed archive recovery.
Results are recorded in the existing [validation report](2026-09-26-git-workflow-validation.md).

## Runnable kit follow-up

The user subsequently requested directly runnable helpers and PR/commit templates.
The design adds one dependency-free Node CLI with local state inspection,
explicit-base PR context, and allowlisted template output. Its only intended
write is exclusive creation of a requested draft file. Publication, configuration,
and destructive Git actions stay in the deliberate workflow.

Five original templates cover short/standard/migration PRs and plain/conventional
commit subjects and bodies. They carry placeholders and evidence prompts rather
than checked boxes or fabricated validation. Existing repository templates remain
authoritative. Git's previously consulted commit manual grounds template/editor
and comment-cleanup guidance. The existing preferred-source audit continues to
ground PR wording and policy; no new upstream material is vendored.

The [Git environment documentation](https://git-scm.com/docs/git) was also checked
for `GIT_NO_LAZY_FETCH`, `GIT_ALLOW_PROTOCOL`, and `GIT_OPTIONAL_LOCKS`. The helper
disables demand fetching, denies transport protocols, and disables optional index
refresh writes. External diff/textconv and filesystem-monitor commands are
disabled for these inspection commands.
