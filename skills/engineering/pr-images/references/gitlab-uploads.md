# GitLab uploads

How images reach a GitLab merge request, issue, or comment. `glab` has no
`--attach`, so `scripts/upload_gitlab.py` uploads each file through the
project uploads API and rewrites the body before anything is posted.

## Availability

Check `glab` and authentication for the host:

```sh
glab --version
glab auth status --hostname HOST
```

The upload goes to the project that holds the MR or issue: for a fork MR that
is the **target** project, because GitLab resolves a relative `/uploads/...`
link against the project rendering it. The account must be able to comment in
that project. A 401, 403, or 404 from the upload means there is no delivery
path; do not upload to the source project instead.

## Files and limits

The helper accepts png, jpg, jpeg, gif, webp, svg, mp4, mov, and webm, and
refuses files over 100 MB, the default maximum attachment size. An instance can
set a lower limit; the upload then fails with the server's message. GitLab
renders `![alt](/uploads/.../clip.mp4)` as a video player, so video keeps the
image syntax.

## What the helper rewrites

Reference every file as `./name.ext`, sitting beside the body file.

| In the body | Result |
| --- | --- |
| `![alt](./file.png)` or `[text](./file.png)` | Path replaced by the upload's `/uploads/...` URL |
| `<img src="./file.png">` | Path replaced, so HTML tables with spanning cells work directly |
| Reference-style definition `[x]: ./file.png` | Definition rewritten |
| A path inside a code fence or inline code | Left alone |
| A file referenced several times | Uploaded once, every reference rewritten |

It validates every reference before uploading any: a missing file, a path
outside the body's directory, an unsupported type, or an oversize file stops the
run with nothing uploaded. It writes `<body>.uploaded.md` beside the original,
leaves the original untouched, and posts nothing.

## Partial failure

Uploads run in order and stop at the first failure. The output body keeps the
uploaded URLs and leaves the failed and remaining files as local paths. The
helper prints JSON with `uploaded`, `failed`, and `not_attempted`, and exits
1. Retry only the failed files, or remove their rows, before posting.

## Posting

Post the rewritten body through the API with the body read from the file,
never typed into a shell command:

```sh
glab api --hostname HOST -X PUT "projects/PROJECT_PATH_ENCODED/merge_requests/IID" -F description=@body.uploaded.md
glab api --hostname HOST -X POST "projects/PROJECT_PATH_ENCODED/merge_requests/IID/notes" -F body=@body.uploaded.md
glab api --hostname HOST -X PUT "projects/PROJECT_PATH_ENCODED/issues/IID" -F description=@body.uploaded.md
glab api --hostname HOST -X POST "projects/PROJECT_PATH_ENCODED/issues/IID/notes" -F body=@body.uploaded.md
```

Read it back with a `GET` on the same endpoint (`.../notes/NOTE_ID` for a
comment) and confirm that no `./` image path remains.

## Visibility and permanence

Anyone who can see the project can open an upload by its URL, and in a public
project that means anyone with the link. Removing an image from the body does
not remove the file. Only a project maintainer can delete an upload, so treat
every upload as publication.
