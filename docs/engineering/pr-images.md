# PR images

`pr-images` puts screenshots, GIFs, and short videos on GitHub pull requests,
GitLab merge requests, issues, and their comments. It is model-invoked and can also be requested
directly.

Try: "Add before/after screenshots to PR 412," "Retake the screenshots on this
PR after my last commit," or "Attach a screenshot of the error to issue 90."

The skill works in seven steps:

- **Decide.** Images only for a material visual claim: layout, styling,
  on-screen text, a changed screen or state, or a visual bug. Logs and CLI
  output stay text.
- **Check before capturing.** A delivery path (a project-named destination, or
  `gh` 2.99+ with `--attach`, authenticated, with write access to the target
  repository; on GitLab, an authenticated `glab` that can comment in the
  project holding the MR or issue), a tool that saves image files, and the app
  running without new setup. Fork PRs to GitHub repositories you cannot push to
  and GitHub Enterprise Server have no upload path.
- **Capture.** The real app, never a mock built for the PR. The before image
  comes from an existing capture or a deployed base, never faked; each pair
  keeps route, viewport, data, and size. Images go in a temporary directory
  outside the repository and are never committed.
- **Check.** Every image is viewed. Anything showing credentials, tokens,
  personal data, or internal hostnames is retaken, not blurred, because GitHub
  uploads cannot be deleted.
- **Upload.** A Markdown Before/After table, written to a body file and
  uploaded with one `--attach` per image from the images directory, so paths
  match on every `gh` version. On GitLab, `scripts/upload_gitlab.py` uploads
  each referenced file to the project and writes a rewritten body, which is
  then posted through `glab api`. After a partial failure nothing is re-created:
  the body is read back and repaired.
- **Refresh.** Later commits that change what an image shows get those pairs
  retaken and replaced, keeping the rest of the body.
- **Degrade.** Without a delivery path there are no workarounds (no image
  commits, asset branches, release assets, or session cookies). The PR says in
  one line why images are missing, and the captured files go to the user.

The surrounding title and body text belong to
[pr-description](pr-description.md); CI repair and review follow-up to
[babysit-pr](babysit-pr.md).

## References

| Need | Reference |
| --- | --- |
| `gh --attach` versions, permissions, limits, rewriting rules, partial failure, and HTML tables | [gh-attach](../../skills/engineering/pr-images/references/gh-attach.md) |

## Design and evidence

The [PR images research](../research/2026-11-17-pr-images.md) records why this
skill exists: GitHub CLI 2.99.0 added `--attach`, which replaced the browser,
cookie, branch, and release-asset workarounds earlier skills used. The capture
and delivery rules come mainly from Every's `ce-commit-push-pr` visual-evidence
reference and Sentry's `pr-screenshots`; the gh behavior, including the fork
limit and the 2.103 path-resolution change, was read from the `cli/cli`
source. Theo Browne's `tstack` contributed the rule that green mocked tests do
not prove a user experience works. The report lists the influence of each
preferred source repository.
