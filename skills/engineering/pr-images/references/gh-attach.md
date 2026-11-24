# gh --attach

Behavior of GitHub CLI's attachment flag, read from the `cli/cli` source
(`internal/attachments`) through v2.104.0. Recheck `--help` when the installed
version is newer.

## Availability

`--attach '<file>#<alt text>'` exists on `gh pr create`, `gh pr edit`,
`gh pr comment`, `gh issue create`, and `gh issue comment` from **v2.99.0**.
It is repeatable, up to 50 files per command. `--web` and `--dry-run` reject it.
Check that the command you will run lists `--attach` and that auth succeeds:

```sh
gh pr edit --help
gh auth status
```

## Permission and host

The upload needs admin, maintain, or write permission on the target repository.
For `gh pr create` the target is the **base** repository, so contributors
without write access to the upstream cannot attach to a fork PR. The endpoint
answers 404 for read or triage access; gh reports it as "attaching files
requires write access to the repository". GitHub App installation tokens are
accepted only from some apps, so an upload under an app token can fail even
with write access.

GitHub Enterprise Server is refused. github.com and ghe.com tenants work.

## Files and limits

| Type | Extensions | gh limit |
| --- | --- | --- |
| Image | png, jpg, jpeg, gif, webp, svg | 10 MB |
| Video | mp4, mov, webm | 100 MB (the server enforces 10 MB on free plans) |

The alt text follows the last `#` that leaves an existing path, so `#` in a
file name is safe. Without alt text, an image's alt is its file name without
the extension. Video takes no alt text. Standard input and the same file given
twice are refused.

## How references are rewritten

| In the body | Result |
| --- | --- |
| `![alt](./file.png)` | Path replaced by the uploaded URL; alt kept |
| `[text](./file.png)` | Path replaced |
| Reference-style definition `[x]: ./file.png` | Definition rewritten, so every use follows |
| `![alt](./clip.mp4)` alone in a paragraph | Replaced by the bare URL, which renders as a player |
| A path inside a code fence or inline code | Left alone |
| An attached file the body never references | Appended at the end as `![alt](url)`, or a bare URL for video |
| `gh pr edit --attach` with no body flag | Existing body kept, images appended |

## Path resolution by version

- **v2.99.0 – v2.102.x:** a body reference resolves against the working
  directory only.
- **v2.103.0 and later:** against the `--body-file`'s directory first, then the
  working directory.

Running gh from the directory that holds both the body file and the images,
with `./name.png` in the body and in `--attach`, matches on every version.
Because that temporary directory is outside the git repository, pass
`--repo OWNER/REPO` (and `--base` and `--head` for `gh pr create`) explicitly.
A body file in the images directory run from the repository root works only on
2.103+; on older versions the reference stays a broken local path and the image
is appended a second time.

## Partial failure

gh uploads in order and stops at the first failure. If at least one file
uploaded, it still writes the PR, issue, or comment with the successes, leaves
the rest as local paths, prints the URL, and exits non-zero. If none uploaded,
it writes nothing. Validation errors (missing file, oversize, wrong type) stop
before any upload.

So after a non-zero exit: never repeat `create`; read the body back, remove or
re-attach the references still pointing at local paths with `gh pr edit`, and
report the failures.

## HTML tables

`<img src="./x.png">` is not rewritten. When cells must span rows, for example
one location row with light and dark sub-rows, attach first without
referencing the files, copy the appended URLs into the `<img>` tags, delete
the appended lines, and write the final body with `--body-file`.

## Visibility and permanence

In private and internal repositories only people with access to the repository
can view the files. There is no endpoint to delete an upload; editing it out of
the body leaves the file reachable by its URL. Treat every upload as
publication.
