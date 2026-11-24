---
name: pr-images
description: Screenshots, GIFs, and short videos on GitHub pull requests, GitLab merge requests, issues, and their comments. Use whenever a PR, MR, or issue should show a visual change, when asked to add, attach, upload, retake, or embed screenshots, before/after images, or a demo on a PR, MR, issue, or comment, or when pr-description's evidence calls for screenshots. PR title and body text belong to pr-description; CI and review follow-up to babysit-pr.
---

# PR images

Put images on a PR (GitLab: merge request, MR), issue, or comment only when they
prove something a reviewer judges by looking. An uploaded image cannot be
deleted on GitHub and only by a maintainer on GitLab, so every one is checked
before upload. The body text around the images belongs to
`pr-description`; this skill supplies the images, their table, and the upload.

## 1. Decide whether images belong

Capture only when the change makes a material visual claim: layout, styling,
on-screen text, a new or changed screen, state, or component, or a visual bug
fix. CLI output, logs, and API responses go in a code block, never a picture of
text. Passing tests do not show that a screen looks right, so a visual change
with only test evidence still needs images. A body that already has a
`## Screenshots` or `## Demo` section keeps it unless the user asks for new
images or later commits change what they show (step 6).

Project instructions decide whether running the app, opening a browser, or
taking screenshots needs permission, and where PR images go. Follow them. A
claim in them that the forge cannot take uploads is not a reason to skip; step 2
decides that.

Pick the forge without asking, as `pr-description` does: from the PR or MR URL,
otherwise from the `origin` remote's host. Steps 2 and 5 have a path for each.

**Complete when:** the change has a stated visual claim, or the decision is no
images with no further work.

## 2. Check the preconditions before capturing

All three must hold. Check them first, because without a delivery path the
images cannot reach the PR.

- **A delivery path.** A destination the project names; otherwise, on GitLab,
  `glab` authenticated for the host (`glab auth status --hostname HOST`) with
  permission to comment in the project that holds the MR or issue; read
  [gitlab-uploads](references/gitlab-uploads.md). On GitHub, `gh` with
  attachment support: `gh pr create --help` (or the `edit` or `comment`
  command you will run) lists `--attach`, `gh auth status` succeeds, and the
  account can write to the repository the PR targets. For `gh pr create` that
  is the base repository, so a fork PR to a repository you cannot push to has
  no path. GitHub Enterprise Server has none either. Read
  [gh-attach](references/gh-attach.md) for the version and permission details.
- **A tool that writes image files.** A browser or screenshot tool the host
  already has. A tool that shows you the screenshot without saving a file does
  not qualify. Do not install a browser stack to get one.
- **The app running at the changed route.** A dev server already running, or
  one the project documents that starts without new dependencies, secrets, or
  seeded data.

When the capture tool or running-app precondition fails, go to step 7. When
only the delivery path fails: if the user explicitly asked for screenshots or a
demo, capture and check them locally under steps 3–4, then go to step 7 to hand
the files and Markdown table to the user; if images are being added
automatically as part of a PR description, skip capture and go straight to
step 7 with the one-line reason.

**Complete when:** all three preconditions are confirmed, or the failing one is
named.

## 3. Capture

Capture the real app. Never screenshot a story, mock page, or harness built for
the PR unless the change is to that story, and never draw or generate an image
of a screen you did not capture.

Take the before image from the first source that exists:

1. A capture of the base revision that the user, a caller, or a project tool
   already produced.
2. A deployed copy without this change: a preview of the base branch, or the
   production URL for the same route.
3. The base revision run locally, only when the user asks for it.
4. None. Post after images alone and say in one line why there is no before.

Never fake a before image, for example by undoing the change in devtools.
Net-new UI has no before. Record where the before came from (commit or URL),
because a production URL may not match the PR's base.

For each pair, keep the same route, viewport, data state, and image size.
Prefer viewport or component captures to full pages. Take desktop by default
and add a mobile pair when the change is responsive. Take the few images that
prove the claim, not a tour. Use stills; include GIFs or video only when motion
is the change or the user supplied them. Use dev or seed data. Save everything
in one new temporary directory outside the repository, with file names free of
spaces. Never commit the images.

**Complete when:** each claimed visual change has an after image and, where one
exists, a matching before image, all in the temporary directory.

## 4. Check every image

Open and look at every image before it goes anywhere. Retake any image that
shows credentials, tokens, session or API URLs with secrets, personal data,
customer or organization names, or internal hostnames, using data that does not
contain them. Never blur or crop to hide them; drop the image if a clean retake
is impossible. Compare each pair; a pair with no visible difference moves to an
**Unchanged** table or is dropped.

**Complete when:** every image has been viewed and contains nothing private, and
each pair shows the difference it claims.

## 5. Lay out and upload

Write the images as a Markdown table under `## Screenshots` (or `## Demo` for
motion), in the evidence position `pr-description` uses. Reference each file by
the same relative path you will pass to `--attach`, with alt text naming the
row and side:

```markdown
## Screenshots

**Changed**

| Before | After |
|:---:|:---:|
| ![Settings before](./settings-before.png) | ![Settings after](./settings-after.png) |
```

An after-only table uses a single `After` column. On GitHub, use Markdown, not
HTML `<img>` tags, because `gh` rewrites only Markdown references; read
[gh-attach](references/gh-attach.md) when cells must span rows.

**GitLab.** Write the full body to a file in the temporary directory, beside
the images, then upload and rewrite in one run:

```sh
python <skill>/scripts/upload_gitlab.py --host HOST --repo GROUP/PROJECT --body "$SHOTS_DIR/body.md"
```

It writes `body.uploaded.md` and posts nothing. Post that file with the
`glab api` command for the MR, issue, or comment in
[gitlab-uploads](references/gitlab-uploads.md); for a new MR, hand it to
`pr-description` as the body so the MR is created once with its images. HTML
`<img>` tags are rewritten too. Before posting over a body someone else may have
changed, fetch it again and change only your section. After an exit of 1, post
nothing until the failed rows are retried or removed.

**GitHub.**

Write the full body to a file in the temporary directory, run `gh` from that
directory, and pass one `--attach` per image. Because `cd "$SHOTS_DIR"` leaves
the git repository, always pass `--repo OWNER/REPO` (and `--base` and `--head`
for `gh pr create`):

```sh
cd "$SHOTS_DIR"
gh pr edit 123 --repo OWNER/REPO --body-file body.md \
  --attach './settings-before.png#Settings before' \
  --attach './settings-after.png#Settings after'
```

Before editing a body someone else may have changed, fetch it again and change
only your section. After a non-zero exit, never run `gh pr create` or
`gh issue create` again: the item may exist. Read the saved body back (`gh pr view`,
`gh issue view`, or the comment endpoint), repair or remove any reference still
pointing at a local path, and report which images did not upload.

**Complete when:** the saved body, read back from the forge, shows every image as
an uploaded URL and no local paths, or the images that failed are named.

## 6. Keep images current

When later commits change what an image shows, retake the affected pairs,
re-check the **Changed** and **Unchanged** split, and replace those rows without
waiting to be asked. Keep the rest of the body, including the user's edits.
Removing an image from the body does not delete the uploaded file.

**Complete when:** every image matches the PR's current head.

## 7. Degrade honestly

When a precondition fails, do not use workarounds: no commits of images to the
PR branch or an asset branch, no release assets, no browser session cookies,
and no driving the web editor's upload box. Add one line where the screenshots
would go saying they were not attached and why, for example "Screenshots not
attached: gh 2.89 has no `--attach`." or "Screenshots not attached: no upload
access to the target project." If images were captured, hand the files to
the user with the table already written so they can drag them into the web
editor.

**Complete when:** the PR or reply states why images are missing, and any
captured files are with the user.
