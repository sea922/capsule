# Repository policy

Read this when selecting a branch or integration strategy, or when local
instructions leave publication conventions unclear. Discover policy before
suggesting changes to it.

## Resolve the contract

| Decision | Evidence to inspect |
| --- | --- |
| Integration target | User's requested target, existing PR base, maintained release lines, remote default |
| Naming and PR body | Repository instructions, contribution guide, applicable PR template, enforced title checks |
| Merge eligibility | Branch rules/rulesets, required status contexts and approvals, conversation resolution, queue requirements |
| Merge method | Allowed forge methods, contribution policy, existing release automation |
| Commit/release metadata | Commit checks, changelog or Changesets configuration, signing requirements |
| Checkout lifecycle | Host attachment/archival support, directory conventions, ownership and retention rules |

Record only decisions needed for this task, with their evidence. Examples from
old PRs illustrate practice but do not override explicit policy. Unavailable
branch-rule data means unknown requirements, not an unprotected branch. A
conflict between the requested operation and enforced controls needs resolution;
do not disable a check to complete the operation.

## Recommend when policy is absent

| Delivery constraint | Candidate policy | Cost to address |
| --- | --- | --- |
| Frequent delivery from one mainline | Focused branches, review/checks, prompt integration | Keep the mainline healthy; unfinished features may need flags |
| Several supported product versions | Explicit release branches and backport targets | Each line needs testing and a patch propagation policy |
| Large dependent change | Small stacked PRs with named parents and merge order | Retarget/rebase children as parents land |
| Shared feature branch | Additive commits and coordinated integration | Rewrites affect every collaborator |

For merging, squash offers one integrated commit per PR; merge commits preserve
branch topology; rebase-style integration yields a linear sequence with new commit
identities. Choose with the project's review and release needs. Title semantics
matter when the forge uses a PR title as a squash commit subject.

**Complete when:** the needed policy choices have evidence, or the user has a
concrete recommendation with the unresolved consequential choices identified.
