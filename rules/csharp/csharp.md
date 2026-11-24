---
paths:
  - "**/*.cs"
  - "**/*.csx"
---
# C#

Defaults for where the project is silent. Its `.editorconfig`, analyzers,
target framework, and existing code come first.

## Style and types

- Use the language version the project targets. Follow its naming: PascalCase
  for types and members, camelCase for locals and parameters, and the project's
  convention for private fields.
- Keep nullable reference types enabled and resolve the warnings. Do not hide
  one with the `!` operator unless a comment says why the value cannot be null.
- Use records or `init`-only properties for data that should not change, and
  `readonly` for fields that are set once.
- Prefer pattern matching and switch expressions to chains of type checks.
  Use `var` when the type is clear from the right-hand side.
- Use `decimal` for money. Return empty collections, not `null`.

## Async

- Use `async` and `await` all the way through. Never block on a task with
  `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()`.
- Return `Task` or `ValueTask`; `async void` is only for event handlers.
- Accept a `CancellationToken` in async methods that do I/O and pass it on.
- Suffix asynchronous methods with `Async` where the project does.

## Errors and resources

- Catch the specific exception you can handle. Never an empty `catch`, and
  rethrow with `throw;`, not `throw ex;`, to keep the stack trace.
- Dispose of `IDisposable` and `IAsyncDisposable` with `using` or
  `await using`.
- Log through `ILogger` with message templates, not string interpolation, and
  never log secrets or personal data.

## Design

- Take dependencies through constructor injection and register them with the
  correct lifetime. Do not resolve services from a static locator.
- Reuse `HttpClient` through `IHttpClientFactory`; do not create one per call.
- With LINQ, watch for multiple enumeration and for queries that pull whole
  tables into memory before filtering.

## Tests and tooling

- Use the project's test framework and assertion and mocking libraries, with
  one behavior per test.
- Run `dotnet build` with warnings addressed, `dotnet test`, and the project's
  formatter and analyzers before saying work is done.

## Security

- Use parameterized queries or the ORM's parameters; never concatenate input
  into SQL, including raw SQL methods.
- Validate input at the boundary, and apply authorization on the server for
  every protected action.
- Keep secrets in the project's secret store or environment, never in
  `appsettings` committed to the repository.
- Use `RandomNumberGenerator` for tokens, not `Random`.
