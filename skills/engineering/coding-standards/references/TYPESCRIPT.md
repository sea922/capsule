# TypeScript standards

The project's compiler options, lint rules, and existing code decide; what
follows are defaults for where they are silent. This is the layer under the
TypeScript rules: it assumes "avoid `any`, type public APIs, validate input" and
covers the decisions those rules leave open. Skip the framework sections that do
not apply.

## Compiler settings

- Treat `strict` as the baseline. A codebase that cannot compile under it has a
  migration to plan, file by file, not a reason to leave it off.
- `noUncheckedIndexedAccess` makes indexed reads possibly `undefined`, which
  catches a common class of crash. When it is noisy, lift the element into a
  local and check it once instead of turning the flag off or adding `!`.
- `exactOptionalPropertyTypes` separates "absent" from "present and
  `undefined`". Turn it on early; it is expensive to add later.
- Changing a compiler flag is a project decision. Propose it; do not flip it
  inside an unrelated change.
- Slow type-checking pushes people away from the type system. On a large
  repository, look at incremental builds and project references before
  loosening types to save time.

## Modelling data

- **Variants are discriminated unions.** Give each shape a literal `kind` or
  `type` field, not a bag of optional fields where only some combinations are
  legal. Close every `switch` with a `never` check so a new variant is a compile
  error:

  ```ts
  default: {
    const unreachable: never = state
    throw new Error(`unhandled state: ${JSON.stringify(unreachable)}`)
  }
  ```

- **Build the shape so the illegal value cannot exist.** `[T, ...T[]]` for
  non-empty, `start` plus `duration` for a range that cannot be inverted. Do
  this where the loose type is already forcing a `!`, a cast, or a "should never
  happen" throw; keep the simple type everywhere else.
- **Brand identifiers and units that must not be mixed.** Structural typing
  cannot tell a customer id from an order id. A brand must come from a function
  that checks the value; a brand applied with a bare `as` proves nothing. Keep
  that function beside the validation that justifies it.
- **Derive before declaring.** Reach for `Pick`, `Omit`, `ReturnType`,
  `Awaited`, `typeof`, or a schema's inferred type before writing a second
  interface that must be kept in step by hand.
- **`satisfies` over a type annotation or `as`** when a value must match a shape
  and keep its literal types, such as lookup tables and configuration objects.
- **Constrain generics.** `T extends Shape` documents the assumption; a free `T`
  that is cast inside the function is `any` with extra steps.
- **Options objects** once a function has more than two or three parameters or
  any boolean flag. Make the fields the function depends on required: an
  all-optional options type accepts a misspelt key silently.
- **`readonly` parameters** for arrays and objects the function does not
  mutate. It costs nothing at runtime and stops accidental mutation of a
  caller's data.
- Keep heavy type machinery (conditional, mapped, and template-literal types)
  inside the module that needs it. A public API that needs a paragraph to read
  is too clever, and deep conditional types slow the compiler.

## Narrowing and trust

- Parse untrusted data once, where it enters: request handlers, queue
  consumers, file and environment loaders, `JSON.parse`, third-party responses.
  Use the project's schema library and infer the type from the schema, so the
  runtime check and the static type cannot drift. Inside the boundary, trust
  the type and do not re-validate.
- Prefer, in order: a discriminant check, `in`, `typeof` or `instanceof`, a
  user-defined guard, and only then a cast. A guard (`value is X`) or assertion
  function (`asserts value is X`) must check everything it claims; one that
  does not is worse than `as`, because its name says the value is safe.
- Every `as` is a claim the compiler has stopped checking. Keep casts inside
  the module that performed the validation. `as unknown as T` in application
  code is a finding in review.
- Compare against `undefined` or `null` explicitly when `0`, `''`, or `false`
  are legal values. `if (value)` and `value || fallback` drop them; `??` does
  not.
- A long `?.` chain that ends in a default often hides a state that should be
  an error. Decide which absences are legitimate and fail on the others.

## Errors

- Catch where the caller can act: at the request, job, or command boundary, or
  where there is a real recovery. A `try/catch` around every internal call
  produces layers of rewrapped or swallowed errors.
- Expected outcomes (validation failed, not found, conflict) can live in the
  return type as a result union, so the caller must handle them. Keep
  exceptions for the unexpected. Follow whichever style the codebase already
  uses; mixing both in one module is worse than either.
- Rewrap with `new Error(message, { cause })` so the original failure survives.
  Building a message from `String(error)` discards the stack and the type.
- The value in `catch` is `unknown`. Narrow it before reading `.message`.
- An `async` function turns every throw into a rejection. A plain function that
  returns a promise can also throw synchronously, which forces callers to
  handle two paths; mark it `async` or reject.

## Async work

- `Promise.all` is all-or-nothing and fails fast. Use `Promise.allSettled` when
  results are independent and one failure should not discard the rest, then
  handle each outcome; do not ignore the rejected ones.
- Bound fan-out. Mapping thousands of items to promises at once exhausts
  sockets, connection pools, and rate limits. Use the project's concurrency
  helper or a small worker pool.
- Pass an `AbortSignal` through outbound and long-running work so a caller can
  cancel. A timeout built with `Promise.race` stops the wait, not the work;
  say so when the underlying operation cannot be aborted.
- A promise that is neither awaited nor returned loses its error. Enable the
  type-aware floating-promise lint rule where the project uses typescript-eslint.

## Modules

- Export a deliberate surface. Consumers import from the module that owns a
  type, not from its internals.
- Barrel files (`index.ts` that re-exports a directory) make the bundler and
  the dev server load everything behind them and are a common source of import
  cycles. Follow the project's convention, but do not add a barrel to a hot
  import path.
- An import cycle means two modules share something neither owns. Move the
  shared type into a module both depend on; do not break the cycle with a lazy
  `require` or a type-only escape.
- Types that cross a boundary belong in a contract module; implementations
  import contracts, never the reverse.
- Prefer the platform (`Map`, `Set`, `Intl`, `structuredClone`, `URL`) to a
  dependency for a small job. Each dependency is something to audit and upgrade.

## Testing and tooling

- Most build tools transpile without type-checking. Confirm that CI runs the
  type-checker (`tsc --noEmit` or the project's equivalent) as its own step.
- Lock a public type's contract with a type-level test (`expectTypeOf` in
  Vitest, `tsd`, or the project's tool). A type that silently widens is a
  regression no runtime test catches.
- The type-checked typescript-eslint presets turn unsafe `any` flows into lint
  errors. They are the practical way to stop `any` from spreading.
- Do not mock what can run. A typed fake that satisfies the real interface
  survives refactors; `as unknown as Service` in a test does not.

## Bun

Skip this section unless the project runs on Bun or is deciding whether to.
Bun combines a runtime, package manager, bundler, and test runner; it moves
quickly, so confirm commands and flags against the installed version's docs.

- **Choosing:** Bun is reasonable for a new service, script, or tool where one
  toolchain and fast installs matter and the deployment platform supports it.
  Stay on Node when a dependency relies on native addons or Node internals,
  when tooling assumes Node, or when the platform's Bun support is partial.
  Check the platform before committing; do not infer it from local success.
- **Compatibility:** Bun aims to run Node code but is not identical. Native
  addons, less common `node:` modules, and packages that reach into Node
  internals are where it breaks. Run the full test suite on Bun, not a smoke
  test, before relying on it.
- **Package manager:** it writes its own lockfile. Commit it, install with the
  frozen-lockfile option in CI, and keep exactly one package manager's lockfile
  in the repository so installs cannot diverge.
- **Test runner:** the API resembles Jest's, but mocking, timers, isolation
  between files, and coverage differ. Migrate a suite on evidence that it still
  fails when it should.
- **Bundler and built-ins:** Bun's bundler and its built-in file, server, and
  database APIs can replace dependencies, and they tie the code to Bun. Keep
  them behind a module boundary when the code may need to run on Node.
- **Migration:** change the runtime, package manager, and test runner as
  separate steps, each verified, so a failure points at one of them. Use the
  same runtime locally, in CI, and in production.

## NestJS

- **Thin controllers.** A controller parses HTTP input, calls one provider, and
  returns a response DTO. Business rules and multi-step writes live in
  injectable services; a controller that coordinates two repositories has
  taken on a service's job.
- **Modules own their domain.** Keep DTOs, providers, and guards with the
  feature module, and export only what another module needs. Filters,
  interceptors, and decorators used everywhere go in a shared folder.
- **One global validation pipe** with unknown properties stripped or rejected
  (`whitelist`, `forbidNonWhitelisted`) and `transform` set deliberately. A
  per-route pipe configuration drifts.
- **Response DTOs, not entities.** Returning an ORM entity leaks password
  hashes, tokens, and audit columns the moment someone adds a field.
- **Guards for coarse access, services for the record.** A role guard cannot
  know whether this user may touch this row; check ownership where the row is
  loaded.
- **One exception filter, one error envelope.** Throw the framework's HTTP
  exceptions for expected client errors; log and wrap unexpected ones centrally
  and never return a stack trace.
- **Validate configuration at boot.** Fail startup on a missing or malformed
  variable. Read configuration through a typed config service, not
  `process.env` scattered across features.
- **Transactions belong to the service that owns the unit of work**, not to a
  controller or to a repository method called from several places.
- **Tests.** Unit-test providers with their dependencies replaced through the
  testing module. For guards, pipes, and filters, write request-level tests
  that apply the same global pipes and filters as `main.ts`; a test app that
  skips them proves nothing about production behaviour.
- Keep queue consumers and scheduled jobs in their own modules, with
  initialization that fails loudly and a health check that reflects the
  database and cache clients.

## Prisma

Check the installed version first (`npx prisma --version`): package names,
driver adapters, where the datasource URL lives, and whether relations load by
join have all changed between major releases. Let the compiler and the current
docs tell you which form applies.

- **One client per process.** Each `PrismaClient` opens its own pool. Create it
  once and, in development, keep it on `globalThis` so hot reload does not
  leak pools.
- **Serverless needs a small pool and an external pooler.** Each instance
  holds its own connections; set the limit in the connection URL as the
  provider documents.
- **`select` on hot paths and wide tables; `include` when most columns are
  needed.** Map results to a response shape before returning them from an API.
- **Loops that query are N+1.** Load relations with `include` or one `in`
  query. Where relations load by join, a large one-to-many set multiplies
  rows; measure both strategies.
- **Transactions.** Use the array form for independent writes and the
  interactive form when a later step needs an earlier result. The interactive
  form has a short default timeout; keep email, HTTP, and other slow calls
  outside it.
- **Cursor pagination** for feeds and large tables: fetch `limit + 1` to learn
  whether another page exists, and include a unique column as a secondary sort
  so rows with equal timestamps do not shift between pages.
- **Index** every foreign key and every column used to filter or sort. A
  `@unique` field already has an index.
- **Identifiers.** Random UUIDs fragment indexes on high-write tables;
  auto-increment ids expose record counts when public. Choose per table.

Traps that pass review and fail in production:

| Trap | What happens | Do instead |
| --- | --- | --- |
| `updateMany` / `deleteMany` result | Returns a count, not rows | Read the ids first, or re-query |
| `deleteMany()` with no `where` | Empties the table | Always pass a `where`; treat its absence as a defect |
| `@updatedAt` with bulk writes | Not set by `updateMany` | Set the column explicitly |
| Soft delete with `findUniqueOrThrow` | Returns soft-deleted rows; adding `deletedAt` to a unique `where` does not type-check | `findFirstOrThrow` with the filter |
| Soft delete in middleware or an extension | Hidden filtering that is hard to debug | Filter explicitly, or document the extension where queries are written |
| `migrate dev` on a shared database | May offer to reset it on drift | `migrate deploy` everywhere except a private local database |
| Editing an applied migration | Checksum mismatch on every environment that ran it | Add a new migration |
| Raw ORM error returned to a client | Leaks schema details | Catch known request errors at the service boundary and map their codes (unique, not found, foreign key) to domain errors |

Renames, new `NOT NULL` columns, and other non-additive schema changes need
separate expand, backfill, and contract steps; `database-migrations` owns that
sequence.
