# Java standards: Spring Boot

The project's own conventions win. Read this with [JAVA.md](JAVA.md) when the
build uses Spring Boot. Annotation and property names change between major
versions; confirm them against the version in the build file.

## Structure

- Controllers translate HTTP to a service call and back: binding, validation,
  status code. Business rules live in services, queries in repositories.
- Request and response types are DTOs, not entities. Exposing an entity leaks
  columns and lets a client set fields it should not.
- Validate at the controller with Bean Validation on the DTO, and handle the
  failure in one central advice that returns the project's error shape. Where
  the project has none, the framework's problem-details support is a
  reasonable default.
- Bind configuration to typed, validated properties classes instead of
  scattering `@Value`, so a missing setting fails at startup.
- Profiles select environment settings. Do not branch on profile names in
  business code.

## Proxy traps

Transactions, caching, async execution, and method security all work through a
proxy around the bean. The same rules follow for each:

- A call from one method to another on the same object skips the proxy, so the
  annotation does nothing.
- The annotation needs a method the proxy can intercept; private methods are
  not intercepted.
- **Transactions** roll back on unchecked exceptions by default. State the
  rollback rule when a checked exception should also roll back, and do not
  swallow the exception inside the transactional method.
- **Async** methods need a bounded executor and a place where failures are
  reported. Security and logging context do not follow to the new thread
  unless configured to.
- **Caching** needs a key that includes everything the result depends on,
  including tenant and locale, an eviction rule for every write path, and a
  time limit. A cache with no eviction is a stale-data bug waiting to happen.
- **Events** published inside a transaction run before commit unless the
  listener is bound to the commit phase. Use that phase for anything that
  leaves the process, such as sending a message or email.

## Calling other systems

Set connect and read timeouts on every client; the defaults often wait
forever. Retry only idempotent calls, with backoff and a limit, and add a
circuit breaker where a failing dependency could exhaust threads. Keep the
call outside the database transaction. Scheduled jobs and message handlers
must be safe to run twice, and scheduled jobs need a lock when the service
runs more than one instance.

## Security

- Declare the filter chain explicitly and deny by default; list the public
  paths rather than the protected ones.
- Authorize at the method or service as well as the URL, and check ownership
  of the resource, not only the role.
- CSRF protection stays on for browser sessions with cookies. A stateless API
  that authenticates with a bearer token in a header may turn it off.
- Configure CORS once in the security configuration, with named origins.
- Use the framework's password encoder and token validation; do not write
  either by hand.
- Trust forwarded headers such as `X-Forwarded-For` only behind a proxy that
  overwrites them and with the framework's forwarded-header handling enabled.
  Otherwise use the connection's remote address for rate limiting and audit.
- Lock down management endpoints: expose only the ones needed, and require
  authentication for anything beyond basic health.
- Validate uploads by size, type, and name, and store them outside any served
  directory.

Use `security-review` for a full review.

## Tests

| What is under test | Scope to use |
| --- | --- |
| Service or domain logic | Plain unit test, no Spring context |
| Controller mapping, validation, error shape, security rules | Web slice with the service replaced |
| Repository queries and mappings | Data slice against a real database in a container |
| Wiring across layers | Full application context, used sparingly |

Each distinct combination of configuration and replaced beans builds a new
context, so vary them as little as possible. Point the context at containers
through dynamic properties instead of fixed ports. Include tests for the
unauthenticated and forbidden cases of a protected endpoint.

## Operations

Emit structured logs with a request or trace identifier, metrics through the
framework's metrics facade, and separate liveness from readiness so a slow
dependency does not restart the service. `production-readiness` owns the
launch review.
