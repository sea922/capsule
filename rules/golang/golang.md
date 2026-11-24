---
paths:
  - "**/*.go"
  - "**/go.mod"
---
# Go

Defaults for where the project is silent. Its linter configuration, module
layout, and existing code come first.

## Style

- Format with `gofmt` and organize imports with `goimports`. No debate.
- Use short, clear names: receivers of one or two letters, no `Get` prefix on
  getters, and package names that are short, lowercase, and not `util` or
  `common`.
- Accept interfaces and return concrete types. Define an interface where it is
  used, and keep it small.
- Make the zero value useful where you can. Return early instead of nesting.
- Document every exported name with a comment that starts with the name.

## Errors

- Check every error. Never discard one with `_` unless a comment says why.
- Wrap with context using `fmt.Errorf("doing x: %w", err)`, and inspect with
  `errors.Is` and `errors.As`, not string matching.
- Handle an error once: log it or return it, not both.
- Do not `panic` in library code for conditions a caller can handle.

## Concurrency

- Pass `context.Context` as the first parameter of anything that blocks or
  does I/O, and honor its cancellation. Never store a context in a struct.
- Every goroutine has a known way to stop. Do not start one you cannot wait
  for or cancel.
- Protect shared state with a mutex or own it in one goroutine. The sender
  closes a channel, never the receiver.
- Run `defer` right after acquiring a resource, including `Close` and
  `Unlock`, and mind `defer` inside loops.

## Tests and tooling

- Write table-driven tests with subtests (`t.Run`), and use `t.Helper()` in
  helpers and `t.Cleanup` for teardown.
- Run `go test -race ./...` and `go vet ./...`, plus the project's linter,
  before saying work is done.
- Keep `go.mod` and `go.sum` tidy with `go mod tidy`; do not edit `go.sum` by
  hand.

## Security

- Use query parameters with `database/sql`; never build SQL with `Sprintf`.
- Set timeouts on HTTP clients and servers; the defaults have none.
- Use `crypto/rand` for tokens, not `math/rand`.
- Validate and bound external input, and use `filepath.Clean` and containment
  checks before touching paths built from it.
