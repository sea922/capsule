# Git workflow validation

Date: 2026-09-26.

## Structural checks

- `npm run check`: eight tooling tests passed; repository validation passed.
- `claude plugin validate . --strict`: marketplace validation passed.
- `scripts/list-skills.sh`: new skill discovered using Git for Windows Bash.
  The initial system `bash` attempted WSL and failed because Bash was absent there.
- Plugin and package remain at 0.1.0; a minor Changeset records the future release.

## Paired scenario inspection

Two fresh-context agents answered the same three cases, one without the skill
and one reading the skill and applicable references. Both saw evals.json, including
expected outputs. This is a rubric-visible rehearsal, not a blind experiment;
it cannot establish incremental benefit or a quantitative success rate.

| Scenario | Without skill | With skill |
| --- | --- | --- |
| Text-only PR rewrite; final scope adds retries and duplicate-charge protection | Covered both, preserved upstream release base, disclosed unrun integration test, no mutations | Same scope/authority result; title could express the user outcome more directly |
| Free managed worktree has stale name; primary has unrelated staged changes | Reused checkout and preserved primary staging | Also detailed process ownership, setup, fixtures, and baseline evidence |
| Squash-merged PR; worktree still in use with needed ignored database | Retained worktree and separated data preservation/branch deletion | Same decision, with eventual lifecycle and verification steps |

The with-skill pass identified unclear evidence for free ownership and an
underspecified destination for ignored assets. The reference now requires host,
repository, and known process evidence; unresolved ownership retains the checkout.
Preserved assets must live outside the retiring checkout with a recorded path and
verified contents. Static inspection confirmed these edits; scenarios were not
rerun after those clarifications.

No live Git mutation, forge publication, recovery drill, trigger evaluation, or
end-to-end PR integration was executed. Those behaviors remain unproven by this
documentation and scenario validation.

## Kit expansion: blind comparison

Two new fresh-context agents received only prompts 4-6, with no rubric or prior
conversation. The baseline had no skill/tools; the treatment was allowed to read
SKILL.md and conditionally required references, explicitly excluding evals and
research. Both inherited the same model/settings. This is one qualitative pair,
not a statistical benchmark or proof of autonomous skill selection.

### Captured baseline answers

A) Inspect and preserve the fetched collaborator commit. Rebase the authorized
rewrite onto that exact remote tip, resolve conflicts, run tests, then push with
`--force-with-lease` against the reviewed tip. If the commit is unacceptable,
stop for review rather than overwrite it.

B) Fetch `origin`, then rebase C with `git rebase --onto origin/develop abc123`,
retaining its two commits. Resolve conflicts, verify P's squash result is in
`develop`, inspect the log and diff, run tests, force-push with lease, retarget
C's PR to `develop`, and verify CI and the final diff.

C) Sunlight contains many wavelengths, and raindrops refract and internally
reflect them at different angles. Those separated wavelengths reach your eyes
as the rainbow's colors.

### Captured skill-guided answers

A) Stop and inspect the rejection plus the collaborator commit. Preserve the
prior local tip and remote tip, review the unreviewed commit, then coordinate
whether to incorporate or retain it. Reconcile histories as authorized; push
only with an explicit `--force-with-lease` naming the inspected remote SHA, then
verify the remote branch contains the intended result.

B) Verify P's squash merge and identify its new commit on `develop`. Preserve
C's old tip and boundary `abc123`; confirm `abc123..C` contains exactly the two
child commits. Transplant them with `rebase --onto NEW_BASE abc123 C`, resolve
and test conflicts, then push with a checked lease, retarget C's PR to `develop`,
and validate that its diff contains only child changes and checks cover the
rewritten head.

C) Sunlight entering a raindrop is refracted and dispersed into wavelengths,
internally reflected, then refracted out; each wavelength bends differently.
Many droplets send these separated rays to your eyes, producing the curved
spectrum called a rainbow.

### Assessment

Both answers preserve collaborator work and describe an appropriate stack
transplant. The baseline assumes `origin` and the active child checkout; the
treatment names the child branch, preserves old tips, explicitly checks the
two-commit range, and ties checks to the rewritten head. Both answer the unrelated
question directly. Because the treatment was explicitly loaded, this is relevance
restraint, not a measured discovery/trigger test. No claims about repeated-run
success or real forge writes follow from these answers.

## Kit expansion: executable mechanics

`node --test skills/engineering/git-workflow/evals/git-lab.test.mjs` passed all
six exercises after the final test edits (0 failures, approximately 6.1 seconds):

1. Path-scoped commit preserves unrelated staging, including its index blob.
2. Detached commit becomes reachable through a rescue branch.
3. Explicit lease rejects a concurrent remote change even after fetching that
   change into the local remote-tracking ref.
4. Rebase onto a squash result preserves exactly two child commits and excludes
   parent changes from the child diff.
5. Merge abort restores an initially clean checkout after a deliberate conflict.
6. Clean worktree removal preserves the feature branch, whose ancestry remains
   distinct from the squash commit.

All operations used generated temporary repositories and local bare remotes.
The runner isolates inherited Git configuration/hooks, bounds each subprocess,
and verifies its temporary cleanup root. The primary checkout was not used for
test Git mutations. This supersedes the initial report's absence of local Git
exercises; forge publication, managed archival, and recovery of pre-existing
dirty state remain untested. `npm run check` also passed all eight tooling tests
and repository validation during this expansion.

## Runnable helper and templates

The combined helper and Git mechanics suites passed **19/19 tests** on 2026-09-26:
thirteen helper tests and the six mechanics exercises above. Helper coverage includes
explicit non-main base resolution, dirty-state preservation, rename paths and
counts, staged renames and Unicode paths, detached HEAD, worktree inventory and
newline fields, invalid arguments with specific error messages, unborn branches,
unrelated histories, the exact JSON field sets, execution through a linked skill
directory, asset lookup from another directory, exclusive output, traversal
rejection, and committing a filled commit template with `--cleanup=strip`.
Manual smoke checks also confirmed an empty HEAD-to-HEAD range and template stdout.

Independent review found and prompted corrections to rename/numstat parsing,
worktree inventory, newline handling, and partial-clone fetch prevention. A test
fixture initially compared against a base predating the renamed file; it was
corrected to rename a file present at the base. A later review found that the CLI
exited 0 without output when run through a symlinked or junctioned install,
that ref errors did not name the failing ref, and that JSON output duplicated
raw and parsed fields; these were fixed with regression tests. The helper's
timeout path is not covered by a test. Partial-clone fetch prevention and tab-containing filenames
have not been exercised by a regression test; arbitrary non-UTF-8 filename bytes
are outside the helper's supported output contract.

`npm run check` passed its eight repository-tooling tests and metadata/link/version
validation. `claude plugin validate . --strict` and `git diff --check` passed.
The work was published as PR #29; no persistent Git configuration was installed.
