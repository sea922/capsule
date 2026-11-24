# C# and .NET standards

The project's own analyzers, `.editorconfig`, target framework, and existing
code win over anything here. This reference goes deeper than a C# rule set: it
covers the decisions and traps a style guide leaves open. Read the sections the
change touches.

## Language traps

- **Nullable annotations are compile-time only.** A non-nullable reference can
  still be null at runtime when it comes from deserialization, reflection, or
  un-annotated code. Validate at the boundary. The `!` operator silences the
  compiler without making the value safe; each use needs a reason.
- **Deferred execution.** A LINQ query runs every time it is enumerated.
  Enumerating an `IEnumerable<T>` twice can run a database query or an
  expensive computation twice; materialise once with `ToList()` when reuse is
  intended.
- **Records.** Equality is by value, and `with` makes a shallow copy, so a
  record holding a mutable list shares that list between copies. Use immutable
  collections inside records.
- **Struct copies.** Structs are copied on assignment and when read through a
  readonly field; a mutating method then changes a temporary. Keep structs
  small and immutable (`readonly struct`).
- **Closures capture variables**, not values. A lambda capturing a `for` loop
  variable sees its final value.
- **Disposal.** Anything implementing `IDisposable` or `IAsyncDisposable` gets
  a `using` or `await using`, unless the container owns it. Do not dispose a
  dependency you were given.
- **Exceptions.** `throw;` preserves the stack trace; `throw ex;` resets it.
  Catch the specific type you can handle, and use exception filters
  (`when`) rather than catch-and-rethrow for conditions.
- **Culture.** String comparison, casing, and number or date parsing default
  to the current culture. Use ordinal comparison for identifiers and the
  invariant culture for machine-readable formats.
- **Time.** Store and compare instants as UTC (`DateTimeOffset`), and inject a
  time provider where time decides behaviour.

## Async

- `async void` is for event handlers only; an exception thrown from one
  cannot be caught by the caller and can end the process. Return `Task`.
- Never block on a task with `.Result`, `.Wait()`, or
  `GetAwaiter().GetResult()`; it starves the thread pool and can deadlock.
  Make the call chain async from the entry point down.
- Accept a `CancellationToken` as the last parameter of every async method that
  does I/O and pass it on. A token that is accepted and then dropped is worse
  than none, because callers believe cancellation works.
- A task that is not awaited loses its exception. For true background work use
  a hosted service or a queue with its own error handling and scope, not a
  discarded `Task.Run` from a request.
- `Task.WhenAll` runs independent operations together and surfaces the first
  exception while the others still complete; inspect the tasks when every
  failure matters. Bound concurrency over large inputs.
- A database context is not thread-safe. Do not run parallel queries on one
  context; create a context per operation through a factory.
- Use `ValueTask` only on measured hot paths, and await it exactly once.
  Library code that must not capture a context uses `ConfigureAwait(false)`;
  application code on modern ASP.NET Core does not need it.

## Structure and dependency injection

- **Lifetimes.** A singleton must not depend on a scoped service; the scoped
  instance is captured for the life of the process. When a singleton or
  background service needs scoped work, create a scope per unit of work.
  Enable scope validation so the container reports this at start-up.
- **HTTP clients** come from the client factory (named or typed), not from
  `new HttpClient()` per call (socket exhaustion) nor from a static instance
  that never refreshes DNS.
- **Options.** Bind configuration sections to typed options, validate them
  with data annotations or a validator, and validate on start so a missing
  setting fails the deployment instead of the first request.
- **Constructors** receive dependencies and assign them. Work, I/O, and
  `new`-ing collaborators belong elsewhere.
- **Expected failures** can be a result type the caller must handle
  (not found, validation, conflict) while exceptions stay for the unexpected.
  Follow whichever the codebase already uses; mixing both in one layer is the
  worst outcome.
- **Abstractions.** An interface per class is not a requirement. Add one at a
  boundary that has a second implementation or needs a test seam. With an ORM
  that already provides a unit of work and repositories, another generic
  repository layer usually hides useful features and adds little.
- **Guard clauses** at the top of public methods (`ArgumentNullException
  .ThrowIfNull` and its siblings) keep invalid state out early.

## ASP.NET Core

- Handle unhandled exceptions in one place (exception-handling middleware or a
  handler) that logs the detail and returns a problem-details response with no
  internals. Controllers and endpoints do not each wrap themselves in
  try/catch.
- Middleware order is behaviour: exception handling first, then HTTPS and
  routing, then CORS, authentication, authorization, and endpoints. A
  misplaced line silently disables a protection.
- Validate request models at the boundary and return validation problem
  details; domain code assumes valid input.
- Keep endpoints thin, whether controllers or minimal APIs: bind, authorize,
  call a service, map the result. Group related minimal endpoints so shared
  policies and filters are applied once.
- Use authorization policies, including resource-based checks for ownership,
  rather than role strings scattered through handlers.
- Log with message templates and named properties (`"Order {OrderId}
  failed"`), not string interpolation, so logs stay structured and cheap when
  the level is disabled.
- Expose health checks that distinguish "process is up" from "dependencies are
  reachable".

## Data access with Entity Framework Core

- Read-only queries use `AsNoTracking()` and project to the shape needed with
  `Select`, instead of loading entities and mapping afterwards.
- Lazy loading turns a loop into a query per row. Load related data
  explicitly with `Include`, or project it. Several collection includes on one
  query multiply rows; split the query.
- Keep filtering on the server. A method the provider cannot translate either
  throws or, after an `AsEnumerable()`/`ToList()`, silently filters in memory.
- A context's lifetime is one unit of work. `SaveChangesAsync` is the
  transaction boundary for the changes it tracks; use an explicit transaction
  when several saves must succeed together.
- Protect concurrent updates with a concurrency token and handle the
  resulting conflict exception deliberately.
- Raw SQL uses the interpolated or parameterised APIs; never concatenate.
- Do not apply migrations automatically at application start-up in a
  multi-instance deployment. Use the `database-migrations` skill for changes
  to live data.

## Testing

The `tdd` skill owns the red-green cycle. These are the .NET-specific choices,
with the libraries the project already uses:

- **Isolation.** xUnit creates a new class instance per test; put per-test
  setup in the constructor and teardown in `Dispose`. Share expensive resources
  with class or collection fixtures, and remember that tests in different
  classes run in parallel unless grouped in a collection.
- **Data-driven tests.** `[Theory]` with inline data for simple values and
  member data for complex cases. One behaviour per theory.
- **Async tests** return `Task`. Assert exceptions with the async assertion
  form; never `.Result`. Replace `Thread.Sleep` with awaiting the condition or
  a fake time provider.
- **Mocks.** Substitute interfaces at the system edge. Assert on outcomes
  first; verify a call only when the call itself is the behaviour (a message
  sent, a payment requested). Too many verifications tie a test to the
  implementation.
- **Integration tests.** Host the app with `WebApplicationFactory`, replace
  only what must be replaced (external HTTP, the clock, authentication
  scheme), and go through HTTP so routing, filters, model binding, and
  serialization are exercised. Cover unauthenticated and forbidden requests.
- **Database.** The in-memory provider does not enforce constraints,
  transactions, or real SQL translation. Use the real engine in a container
  for anything that depends on those, and reset state between tests.
- **Test data builders** with sensible defaults keep each test to the values
  it cares about.
- **Assertions** on typed properties, not on `ToString()` output. Several
  asserts about one outcome are fine; several outcomes in one test are not.
- **Cancellation.** Where a method takes a token, test that a cancelled token
  stops the work.

## Verification commands

Run what the project defines first (a build script, solution filter, or CI
definition). Where it defines nothing: `dotnet restore`, `dotnet build`
with warnings treated as the project treats them, `dotnet format
--verify-no-changes`, `dotnet test` with the project's coverage collector, and
`dotnet list package --vulnerable --include-transitive`. For an EF Core change,
confirm the model has no pending changes without a migration. Report each
command and its result; `verification-before-completion` owns the claim.

## Security

- Deserialization of untrusted data must not carry type information; avoid
  type-name handling and legacy binary formatters.
- Hash passwords with the framework's password hasher or a vetted algorithm,
  never a bare digest. Use the cryptographic random generator for tokens and
  fixed-time comparison for secrets.
- Keep anti-forgery validation on for cookie-authenticated form posts, and
  restrict CORS to named origins when credentials are allowed.
- Validate uploaded file size and content, generate the stored name, and keep
  uploads outside the web root.
- Bound request body size and model-binding depth for public endpoints.

## Neighbouring skills

Use `tdd` for test-first work, `database-migrations` for schema and data
changes, `performance` for measured slowdowns, `security-review` for an audit,
and `codebase-design` for module boundaries. Cross-language error design is in
[ERROR-HANDLING.md](ERROR-HANDLING.md); service concerns in
[BACKEND.md](BACKEND.md).
