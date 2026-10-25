# Runnable helpers and templates

Read this when collecting local Git context or starting a commit message. The
bundled [git-kit.mjs](../scripts/git-kit.mjs) uses Node.js 20+ and Git on PATH,
requires no npm install, and works from any directory. `SKILL_DIR` below is the
absolute path of the directory containing this skill's `SKILL.md`. Run `--help`
for the CLI contract.

## Inspect without changing Git state

```sh
node "SKILL_DIR/scripts/git-kit.mjs" status --repo "PATH_TO_REPO"
```

`status` emits JSON with the checkout root, HEAD, branch (`null` when detached),
parsed `changes`, and `worktrees` inventory. Paths keep Unicode and whitespace;
non-UTF-8 filename bytes are unsupported.

This is a local snapshot. Fetch deliberately through the normal workflow when
fresh remote state is needed. It does not verify forge rules, checks, active task
ownership, or whether a worktree can be retired. For an unborn branch, invalid
ref, or unavailable repository, use the reported error to resolve the missing
state. It performs no commits, pushes, merges, or cleanup.

## Start a commit message

```sh
node "SKILL_DIR/scripts/git-kit.mjs" template commit.txt --output "PATH_TO_NEW_COMMIT_MESSAGE.txt"
```

Output goes to stdout unless `--output` names a new file. The parent directory
must exist. Existing files, including symlinks, are refused rather than replaced;
choose another path or deliberately edit the existing file. Relative destinations
are relative to the invoking shell's directory, not `--repo` or the skill directory.

| Asset | Use |
| --- | --- |
| [commit.txt](../assets/commit.txt) | Plain imperative subject with optional motivation |
| [commit-conventional.txt](../assets/commit-conventional.txt) | Repository requires a Conventional Commit subject/footer |

Repository conventions take priority. Replace the subject placeholder and add
any body, then commit the filled file. `--cleanup=strip` removes the `#`
guidance lines; the `-c` pins the comment character for this invocation only:

```sh
git -c core.commentChar="#" commit --file "PATH_TO_FILLED_COMMIT_MESSAGE.txt" --cleanup=strip
```

This commits whatever is staged, so inspect the index first; use the
[selected-path recipe](recipes.md) when unrelated staging exists. For an
explicitly requested persistent setup, configure `commit.template` locally to a
stable absolute file path after preserving any existing setting. The helper
itself changes no Git configuration.

**Complete when:** context is tied to verified refs or the draft has been created
at the requested destination, and any resulting commit is separately verified
under the main skill's endpoint.
