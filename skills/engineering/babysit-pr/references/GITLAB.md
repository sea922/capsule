# GitLab merge requests

Read when the target is a GitLab merge request (MR) on gitlab.com or a
self-managed host. The loop, triage and recovery rules do not change; this
maps their GitHub surfaces to GitLab ones. "PR" elsewhere in this skill means
the MR.

## Identity

Record the host, the full project path (groups nest: `group/subgroup/project`)
and the MR **IID** from `https://HOST/PATH/-/merge_requests/IID`, never the
global MR `id`. API paths take the URL-encoded project path
(`group%2Fsubgroup%2Fproject`) or the numeric project ID. Use authenticated
`glab` and pass `--hostname HOST` on every `glab api` call; check access with
`glab auth status --hostname HOST`.

For a fork MR, the MR, discussions and approvals belong to the target project,
pushes go to `source_project_id`, and the head pipeline can run in either
project. Read jobs and logs from `head_pipeline.project_id`.

## Surface map

All paths are relative to `projects/ID/merge_requests/IID` unless absolute.
Paginate every list with `per_page=100` and `--paginate`.

| Concept | GitHub | GitLab |
| --- | --- | --- |
| State | `OPEN` / `MERGED` / `CLOSED` | `state`: `opened` / `merged` / `closed`. `locked` is transient while merging, not terminal |
| Head and base | `headRefOid` / `baseRefOid` | `sha` / `diff_refs.base_sha` (the merge base) |
| Review threads | GraphQL `reviewThreads` | `discussions` whose notes are `resolvable`, with `resolved` and `resolved_by` |
| Inline comments | `pulls/N/comments` | Discussion notes of `type: "DiffNote"`; location in `position` (`new_path`, `new_line`, `old_line`, `line_range`). Outdated when `position.head_sha` is not the current `sha` |
| Top-level comments and review summaries | `issues/N/comments`, review bodies | Non-resolvable discussions with one note. A submitted review's summary arrives as one of these |
| Pending review | `PENDING` review | Draft notes. They stay out of `discussions` until submitted; leave them out |
| System events | Not included | Notes with `system: true` ("added 1 commit"). The watcher drops them; they are never feedback |
| Review gate | `reviewDecision`, `CHANGES_REQUESTED` | `approvals` (`approved`, `approvals_left`, `approved_by`) and `detailed_merge_status` of `not_approved` or `requested_changes` |
| Checks | `statusCheckRollup` | Head pipeline jobs (`projects/PID/pipelines/PIPELINE/jobs`). A job with `allow_failure: true` does not block. External statuses: `projects/ID/repository/commits/SHA/statuses` |
| Annotations | Check-run annotations | None. Read failing job logs (`projects/PID/jobs/JOB/trace`) and `projects/PID/pipelines/PIPELINE/test_report` |
| Changed hunks | `pulls/N/files` | `diffs` |
| Merge verdict | `mergeable`, `mergeStateStatus` | `detailed_merge_status`: `mergeable` is the only ready value; `checking`, `unchecked`, `preparing` and `approvals_syncing` are unknown, so re-read. Also `has_conflicts`, `blocking_discussions_resolved`, `draft` |
| Auto-merge and queue | `autoMergeRequest`, merge queue | `merge_when_pipeline_succeeds`; merge trains at `projects/ID/merge_trains/merge_requests/IID` |
| Bot author | `user.type == "Bot"`, `[bot]` login | Note authors carry no bot flag. Treat `project_N_bot…` and `group_N_bot…` usernames and known service accounts as bots; when unsure, read `bot` from `users/USER_ID` |

The ledger key becomes `<host>/<project-path>!<iid>/<surface>/<note-id>`, and
`thread_id` is the discussion ID.

## Writes

Write only within the scope recorded in step 1 of the skill. Put every body in
a file; `-F body=@FILE` reads it without shell interpretation.

```text
glab api --hostname HOST -X POST "projects/ID/merge_requests/IID/discussions/DISCUSSION/notes" -F body=@reply.md
glab api --hostname HOST -X PUT  "projects/ID/merge_requests/IID/discussions/DISCUSSION" -F resolved=true
glab api --hostname HOST -X POST "projects/ID/merge_requests/IID/notes" -F body=@round-summary.md
glab api --hostname HOST -X POST "projects/PID/jobs/JOB/retry"
glab api --hostname HOST -X PUT  "projects/ID/merge_requests/IID/merge" -f sha=EXPECTED_HEAD
```

The merge `sha` is the expected-head precondition: GitLab refuses the merge
when the head has moved. Set `squash` and `should_remove_source_branch` from
repository policy rather than defaults. Where the project uses merge trains,
add the MR to the train with the same `sha` instead of merging directly; train
entry, like auto-merge, is a waiting state.

## Readiness

Ready on GitLab means, for the current `sha`: `detailed_merge_status` is
`mergeable`, the head pipeline succeeded or the project does not require one,
`approvals_left` is 0, `blocking_discussions_resolved` is true, and the MR is
not a draft. The skill's step 4 still applies in full.
