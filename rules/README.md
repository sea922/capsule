# Rules

Short, always-loaded guidance for Claude Code, installed into a project's
`.claude/rules/`. A skill loads only when a request matches it; a rule applies
in every session, or whenever a matching file is touched. Rules are kept short
for that reason, and each defers to the project's own conventions.

Rules are optional. Installing the capsule plugin does not install them.

| Set | Loads | Covers |
| --- | --- | --- |
| `common` | Always | Precedence, evidence before claims, Git safety, untrusted content, scope, and which capsule skill to use |
| `typescript` | TypeScript and JavaScript files | Types, async, errors, tests, security |
| `react` | `.tsx` and `.jsx` files | Components, hooks, state, accessibility |
| `web` | HTML, CSS, and component template files | Semantic HTML, CSS, accessibility, performance |
| `python` | Python files | Style, errors, async, tests, security |
| `java` | Java files | Types, errors, design, concurrency, security |
| `golang` | Go files | Style, errors, concurrency, tests, security |
| `csharp` | C# files | Types, async, errors, design, security |

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

## Writing a rule

Keep each file to 80 lines or fewer. A stack rule starts with a `paths:` header
so it loads only for its files; a common rule has none. State defaults, not
absolutes, and point to the skill that holds the detail instead of repeating it.
`rules/install.test.mjs` checks these.
