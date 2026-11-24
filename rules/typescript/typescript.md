---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.mts"
  - "**/*.cts"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
---
# TypeScript and JavaScript

Defaults for where the project is silent. Its `tsconfig`, linter, and existing
code come first.

## Types

- Do not use `any`. Use `unknown` and narrow it, a generic, or a union. Do not
  silence the checker with `as any`, `@ts-ignore`, or a non-null `!` on a value
  that can be absent; if a suppression is unavoidable, use `@ts-expect-error`
  with the reason.
- Validate data that crosses a boundary (HTTP, storage, environment, JSON) with
  the project's schema library, and derive the type from the schema. A cast is
  not validation.
- Model states that exclude each other as a discriminated union, and handle
  every case, with a `never` check in the default branch.
- Give exported functions explicit parameter and return types. Prefer
  `readonly` and `as const` for values that should not change.

## Code

- Use `const` unless a value is reassigned, `===` over `==`, and optional
  chaining and `??` over hand-written null checks. Remember `||` also replaces
  `0`, `''`, and `false`.
- Return new objects and arrays instead of mutating arguments.
- Use ES modules with named exports, and match the project's import style and
  path aliases.

## Async and errors

- Every promise is awaited, returned, or explicitly handled. No floating
  promises, and no `async` callbacks passed to `forEach`.
- Run independent work with `Promise.all`; use `Promise.allSettled` when one
  failure must not hide the others.
- Throw `Error` objects, never strings, and keep the original as `cause` when
  rethrowing. A `catch` block handles, rethrows, or logs with context: never
  an empty one.
- Give network calls a timeout or an abort signal.

## Tests and tooling

- Use the project's test runner and its existing patterns. Test behavior
  through public interfaces, and do not assert on mocks you configured.
- Before saying work is done, run the project's type-check, lint, and test
  scripts from `package.json`, using the package manager its lockfile names.

## Security

- Never build SQL, shell commands, or HTML by joining strings with user input.
- Never use `eval`, `new Function`, or dynamic `require` on untrusted input.
- Keep secrets out of client bundles and logs. Read configuration from the
  environment and fail fast when a required value is missing.
