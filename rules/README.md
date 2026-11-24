# Rules

Always-loaded guidance for Claude Code, installed into a project's
`.claude/rules/`. A skill loads only when a request matches it; a rule applies
in every session, or whenever a matching file is touched. Each defers to the
project's own conventions.

Rules are optional. Installing the capsule plugin does not install them.

| Set | Loads | Files |
| --- | --- | --- |
| `common` | Always | `precedence`, `evidence`, `scope`, `untrusted-content`, `skill-routing`, `coding-style`, `testing`, `security`, `code-review`, `git-workflow`, `development-workflow`, `patterns`, `agents`, `hooks`, `performance` |
| `typescript` | TypeScript and JavaScript files | `coding-style`, `patterns`, `testing`, `security`, `hooks` |
| `react` | `.tsx`, `.jsx`, and component and hook files | `coding-style`, `patterns`, `hooks` (React hooks), `testing`, `security` |
| `web` | HTML, CSS, and component template files | `coding-style`, `design-quality`, `patterns`, `performance`, `testing`, `security`, `hooks` |
| `python` | Python files | `coding-style`, `patterns`, `testing`, `security`, `hooks`, `fastapi` |
| `java` | Java files | `coding-style`, `patterns`, `testing`, `security`, `hooks`, `springboot` |
| `golang` | Go files | `coding-style`, `patterns`, `testing`, `security`, `hooks` |
| `csharp` | C# files | `coding-style`, `patterns`, `testing`, `security`, `hooks` |

The `common` set is about 750 lines and loads in every session. Install a stack
set only for the stacks a project uses.

## Install

From a checkout of this repository, preview and then apply:

```sh
node rules/install.mjs --target /path/to/your-project --sets common,typescript,react
node rules/install.mjs --target /path/to/your-project --sets common,typescript,react --apply
```

Without `--sets` it installs `common`. Files go to
`<project>/.claude/rules/capsule/<set>/`. The installer never overwrites a file
that differs from capsule's: it stops, lists the files, and writes nothing, so
your edits are safe. Remove or rename a listed file to take capsule's version.

## Precedence

`common/precedence.md` sets the order: the user's request, then the project's
own instructions, then its tooling and existing code, then these rules. If your
project already has rules on the same topics, install only the sets that add
something.

## Origin

These rules are adapted from [affaan-m/ECC](https://github.com/affaan-m/ECC)
under the MIT License; see [THIRD-PARTY-NOTICE.md](THIRD-PARTY-NOTICE.md).
capsule's changes: references point to capsule's skills, agents, and hooks;
fixed standards became defaults that defer to the project; five `common`
rules were added; and `java/springboot.md` was written for capsule.

## Writing a rule

Keep each file to 250 lines or fewer. A stack rule starts with a `paths:` header
so it loads only for its files; a common rule has none. State defaults, not
absolutes, and name only skills and agents capsule has.
`rules/install.test.mjs` checks these.
