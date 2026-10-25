# Integration pitfalls

Read before rewriting published history, landing stacked changes, interpreting
merge eligibility, or deciding whether integrated branches can be retired.

| Signal | Correct response |
| --- | --- |
| Squash-merged PR but original tip is not an ancestor of base | This is expected: squash creates a different commit. Verify forge merge state and preserved final changes; inspect post-merge commits before any branch deletion. |
| Passing checks refer to an older head | Re-read head/check identity. Validate relevant changes on the current revision and honor required forge checks. |
| Base advanced after local verification | Inspect the new integration result or use required up-to-date/queue checks. Earlier feature checks alone do not prove the combined tree. |
| Force-with-lease rejection | Treat it as new remote information. Inspect the competing commits; do not merely refresh the expected value and retry. |
| Rebase conflict labels say ours/theirs | During rebase the sides can differ from the developer's intuitive branch labels. Read actual content and both intents before choosing a resolution. |
| Parent PR squash-merged while child remains open | Transplant child-only commits using the recorded old parent boundary; retargeting alone may leave parent commits in the child diff. |
| Branch checks passed but PR is in a merge queue | Queue admission is not merge completion. Respect integration checks and confirm the final merged state. |
| Text conflict resolved without errors | Inspect semantic behavior and tests; syntactic resolution can still remove either side's intended change. |

For a justified published rewrite, capture the remote branch tip after inspecting
it and retain that expected SHA through the push. The explicit pattern is
`git push --force-with-lease=refs/heads/BRANCH:EXPECTED_SHA REMOTE HEAD:refs/heads/BRANCH`.
Verify the destination branch and repository first. A bare lease can depend on
remote-tracking refs updated by background fetches, weakening the protection the
operator intended. Coordinate shared branches even when a lease succeeds.

**Complete when:** current head/base and integration evidence agree, dependencies
are correctly represented, and no unresolved concurrency or preservation issue
is hidden by a successful command.

Primary references: [push](https://git-scm.com/docs/git-push),
[rebase](https://git-scm.com/docs/git-rebase),
[merge queues](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue).
