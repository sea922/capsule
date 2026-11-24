# Go standards

The project's own layout, linter configuration, and existing code win over
anything here. This reference goes deeper than a Go rule set: it covers the
decisions and traps that formatting and a short pattern list leave open. Read
the sections the change touches.

## Language traps

- **Nil interface holding a nil pointer.** An interface value carrying a typed
  nil pointer is not `== nil`. Return a literal `nil` error, never a nil
  pointer of a concrete error type.
- **Slices share storage.** `append` may or may not copy, so a sub-slice
  handed to a caller can be overwritten later. Copy when the slice crosses an
  ownership boundary, and use the full slice expression `s[a:b:b]` to force a
  copy on the next append.
- **Maps.** Writing to a nil map panics; concurrent writes crash the program.
  Iteration order is random by design. Guard shared maps with a mutex.
- **`defer` in loops** runs at function exit, not per iteration, so files and
  locks pile up. Move the loop body into a function.
- **Deferred `Close` on a writer** discards the error that reports a failed
  flush. Check it explicitly on the write path.
- **Shadowing with `:=`** inside an `if` or `for` creates a new `err` that
  the outer scope never sees.
- **Value versus pointer receivers.** Use pointer receivers when a method
  mutates, when the struct holds a mutex, or when it is large, and then use
  them for every method on the type. Never copy a struct that contains a lock.
- **Zero values.** Design types so the zero value is usable or obviously
  invalid, and say which. A constructor is needed only when it is not.
- **Named results and naked returns** obscure what is returned in anything
  longer than a few lines. Keep named results for documentation or for a
  deferred function that must adjust the error.

## Errors

- Wrap with `%w` and context that names the operation and its key input, once
  per layer. Do not both log and return the same error; the top of the call
  chain logs it.
- Callers match with `errors.Is` for sentinel values and `errors.As` for
  typed errors, never by comparing message text. Export a sentinel or type
  only when callers need to branch on it; each one becomes part of the API.
- Wrapping with `%w` exposes the inner error to callers. Use `%v` when the
  cause is an implementation detail they should not depend on.
- `panic` is for programmer errors and impossible states, not for failures a
  caller could handle. A server recovers panics at the request boundary; a
  library does not panic across its API.
- Discarding an error with `_` needs a comment saying why it cannot matter.

## Concurrency

- **Every goroutine has an owner and an exit.** Before starting one, know what
  makes it stop: a closed channel, a cancelled context, or completed work. A
  goroutine blocked forever on a send or receive is a leak.
- **Context** is the first parameter, is passed down rather than stored in a
  struct, and is checked in loops and before blocking work. Always call the
  cancel function. Context values carry request-scoped data, not optional
  parameters.
- **Channels.** The sender closes; the receiver never does. Use a buffered
  channel when the sender must not block on a receiver that may have left.
  Prefer a mutex for protecting state and channels for handing off work.
- **Fan-out with a limit.** Use an error group (with a concurrency limit) or a
  fixed worker pool rather than a goroutine per item on unbounded input. The
  group cancels siblings on first failure and returns that error.
- **Shared state.** Run tests with the race detector. `sync.Once` for lazy
  initialisation, atomics for single counters, a mutex for anything compound.
- **Shutdown.** Listen for the termination signal, stop accepting work, and
  give in-flight work a bounded time through the server's shutdown call.
- **Timers.** `time.After` in a loop allocates a timer per iteration; reuse a
  timer or ticker and stop it.

## Structure

- Use the repository's layout. Where there is none, `cmd/<binary>` for entry
  points and `internal/` for everything not meant for import is enough; add
  packages when a boundary appears, not ahead of it.
- Name a package for what it provides (`invoice`, `auth`), not for its kind
  (`utils`, `helpers`, `models`). The package name is part of every call site,
  so avoid stutter such as `user.UserService`.
- Declare an interface in the package that consumes it, with only the methods
  that consumer calls. Do not create one for a single implementation unless a
  test needs the seam.
- Avoid package-level mutable state and `init` functions with side effects.
  Build dependencies in `main` and pass them through constructors.
- Reach for functional options when a constructor has several optional
  settings; a plain config struct is simpler when all callers set most fields.
- Embedding promotes every method of the embedded type into your API. Embed to
  compose behaviour deliberately; otherwise hold a named field.
- A little copying is cheaper than a dependency. Check what the standard
  library offers before adding a module.

## HTTP and data access

- Set server read, write, and idle timeouts; the defaults wait forever. Reuse
  one configured HTTP client rather than the default client, which has no
  timeout.
- Always close a response body, and drain it when the connection should be
  reused. Cap what you read from untrusted peers with a limited reader.
- Pass the request context into database calls so a cancelled request stops
  its queries. Close rows and check `rows.Err()` after iterating.
- Size the connection pool for the database's limits and set a connection
  lifetime so load balancers and failovers are picked up.
- Use placeholders for every query value. Build dynamic column or sort names
  only from an allow-list.

## Testing

The `tdd` skill owns the red-green cycle. These are the Go-specific choices:

- **Table-driven tests** suit one behaviour over many inputs. Give each case a
  name, run it with `t.Run`, and include error cases with the expected error
  matched by `errors.Is`. When cases need different setup or assertions, write
  separate tests instead of adding flags to the table.
- **Helpers** call `t.Helper()` so failures point at the caller, register
  teardown with `t.Cleanup`, and use `t.TempDir` and `t.Setenv` for state that
  must be undone.
- **Parallel tests** (`t.Parallel`) surface shared-state bugs and need
  independent fixtures. `t.Setenv` and parallel do not mix.
- **Fakes over mocks.** A small hand-written fake of a consumer-side interface
  is usually clearer than a generated mock, and it can be shared. Prefer a
  real dependency in a container for storage behaviour.
- **HTTP.** Test a handler with a recorder for unit checks and a test server
  for client code and middleware. Assert status, headers, and decoded body.
- **Golden files** suit large structured output. Regenerate them behind an
  explicit flag and review the diff like code.
- **Fuzzing** fits parsers, decoders, and anything taking untrusted bytes.
  Seed the corpus with known edge cases and commit failing inputs as
  regression cases. Assert properties (no panic, round-trip equality), not
  fixed outputs. The `property-based-testing` skill covers choosing them.
- **Benchmarks** report allocations, reset the timer after setup, and compare
  several runs with a statistics tool before a claim. Use the `benchmark`
  skill when a decision depends on the numbers.
- **No sleeping.** Synchronise with channels, wait groups, or a polling helper
  with a deadline; inject the clock where time decides behaviour.
- **Coverage** shows untested branches; read the profile for the changed
  package rather than chasing a total. Exclude generated code.

## Verification commands

Run what the project defines first (a `Makefile`, task runner, or CI script).
Where it defines nothing: `go build ./...`, `go vet ./...`, the configured
linter (commonly `golangci-lint run`), `go test -race ./...`, and
`govulncheck ./...` for known vulnerabilities in called code. After changing
dependencies, `go mod tidy` should leave no diff. Report each command and its
result; `verification-before-completion` owns the claim.

## Security

- Run external commands with an argument list, never through a shell with
  interpolated input.
- Join untrusted path segments, then confirm the cleaned result stays inside
  the allowed root.
- Use `crypto/rand` for tokens and constant-time comparison for secrets.
- Render HTML with `html/template`, which escapes by context; `text/template`
  does not.
- Bound request bodies, decompressed sizes, and recursion depth for input you
  do not control.

## Neighbouring skills

Use `tdd` for test-first work, `performance` and `benchmark` for measured
speed work, `security-review` for an audit, and `codebase-design` for package
boundaries. Cross-language error design is in
[ERROR-HANDLING.md](ERROR-HANDLING.md); service concerns in
[BACKEND.md](BACKEND.md).
