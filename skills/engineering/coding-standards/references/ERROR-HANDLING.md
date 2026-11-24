# Error handling

The project's existing error types, response format, and logging conventions
win over anything here. Use this reference when a change adds a failure path,
a catch block, a retry, or an error a user or client will see. It applies
across languages; the last section lists per-language mechanics.

## Decide what kind of failure it is

Handle a failure according to who can do something about it.

| Kind | Examples | What the code does |
| --- | --- | --- |
| Expected domain outcome | Not found, validation failed, conflict, insufficient funds | Returns or raises a typed error the caller branches on |
| Transient infrastructure | Timeout, connection reset, rate limit, 503 | Retries within a bound, then fails as below |
| Permanent infrastructure | Bad credentials, missing configuration, 4xx from a dependency | Fails at once with context; no retry |
| Programmer error | Null dereference, broken invariant, impossible state | Crashes the operation loudly; fixed in code, not caught |

Classify before writing the handler. Most poor error handling comes from
treating all four alike.

## Rules

1. **Catch only what you can act on.** A handler either recovers (a real
   alternative that still meets the requirement), converts (to a more useful
   type, keeping the cause), or adds context and re-raises. If it does none of
   these, let the error propagate.
2. **Never swallow.** An empty catch, a catch that only logs and continues as
   if the work succeeded, and a fallback value that hides a failed read are
   the same defect. If ignoring an error is truly correct, a comment says why.
3. **Fail early, at the boundary.** Validate input and configuration where
   they enter. Code past the boundary assumes valid data rather than
   re-checking it.
4. **Keep the cause.** When converting an error, chain the original so its
   stack and message reach the log. Add what this layer knows: the operation
   and the identifiers involved.
5. **Typed, not textual.** Callers branch on an error's type or stable code,
   never on message text. Give each distinct outcome a code; messages can
   then change freely.
6. **One log per failure.** Log where the error is finally handled, with full
   context. Logging at every layer on the way up produces duplicates that hide
   the real count.
7. **Separate the two audiences.** The user or client gets a safe message and
   a stable code. The log gets the stack, the cause, and identifiers. Stack
   traces, SQL, file paths, and dependency names never go to the client, and
   secrets and personal data never go to the log.
8. **Errors are part of the contract.** A public API lists the error codes
   and statuses it can return, and a change to them is a contract change.
9. **Leave state consistent.** A failure midway through must not leave half an
   operation applied. Use a transaction, a compensating action, or an order of
   steps that is safe to repeat. Release resources on every path.
10. **Do not lose errors in background work.** A fire-and-forget task, an
    unawaited promise, or a goroutine with no error path fails silently. Give
    each a place to report to.

## Fallbacks

A fallback is a product decision, not a convenience. Before returning a
default, cached, or partial result, check that the caller can tell it is
degraded and that being wrong is acceptable. Showing a cached price is
different from showing a zero balance. A fallback that fires is logged and
counted so that a permanent outage does not look like normal operation.

## Retries

- Retry only failures classified as transient. A validation error, an
  authorization failure, or a not-found will fail the same way again.
- Bound attempts and total elapsed time. Back off exponentially and add
  jitter so that clients do not retry in step.
- Respect a server's retry-after signal over your own schedule.
- A request that changes state is retried only when it is idempotent or
  carries an idempotency key; a timeout does not mean the first attempt
  failed.
- Retry at one layer. A client library, a service wrapper, and a job queue
  each retrying three times is twenty-seven attempts.
- When a dependency keeps failing, stop calling it for a period (a circuit
  breaker) rather than queueing more timeouts.
- After the last attempt, raise an error that carries the final cause and the
  number of attempts.

## Boundaries

Each boundary has one place that turns errors into its outward form.

- **HTTP API.** A single handler maps typed errors to a status and a
  consistent body with a stable code, a safe message, and a request
  identifier; anything unrecognised becomes a 500 with a generic message and
  a full log entry. Route handlers do not build error responses themselves.
  Follow the project's existing error body; where none exists, the
  problem-details format is a reasonable default.
- **User interface.** Rendering failures are contained by an error boundary
  (or the framework's equivalent) around independent regions, so that one
  broken widget does not blank the page. Failed requests show a message that
  says what happened and what the user can do, and keep what the user typed.
- **Jobs and consumers.** Distinguish retry, give up and record (dead-letter),
  and discard. A message that always fails must not block the queue or retry
  forever.
- **Command-line tools.** Print a one-line cause to standard error, exit
  non-zero, and keep the stack trace behind a verbose flag.
- **Process level.** A last-resort handler for uncaught errors logs and exits
  or restarts cleanly; it is a safety net, not flow control.

## User-facing messages

Map error codes to messages in one table rather than writing text at each
throw site. A good message says what happened in the user's terms, whether
their work was saved, and what to do next. Unknown codes fall back to a
generic message. Do not reveal whether an account exists on sign-in or
recovery failures.

## Language mechanics

- **TypeScript and JavaScript.** Extend a base application error carrying
  `code` and an optional `cause`. A caught value is `unknown`; narrow it before
  reading properties. An unawaited promise loses its rejection, so await it or
  attach a handler. A result type (a discriminated union of success and
  failure) suits expected outcomes where the compiler should force handling;
  follow whichever style the codebase uses.
- **Python.** Define a small exception hierarchy under one base class per
  package. Convert with `raise ... from err`. Avoid bare `except:` and
  `except Exception: pass`. See [PYTHON.md](PYTHON.md).
- **Go.** Return errors as values, wrap with `%w`, and match with `errors.Is`
  and `errors.As`. Keep `panic` for programmer errors. See [GO.md](GO.md).
- **C#.** Throw specific exception types, rethrow with `throw;`, and handle
  unrecognised exceptions in one middleware. See [CSHARP.md](CSHARP.md).

## Review checklist

- Does every catch recover, convert with cause, or add context and re-raise?
- Can any failure leave the caller believing the work succeeded?
- Is each retry bounded, limited to transient failures, and safe to repeat?
- Does the client see only a code and a safe message, and the log the rest?
- Is there a test for each new failure path, not only the success path?

The `code-review-silent-failures` agent reviews a change for swallowed errors,
hidden fallbacks, and lost background failures; `code-review` deep mode runs
it. Service-level retries, jobs, and idempotency are in
[BACKEND.md](BACKEND.md).
