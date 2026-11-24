# Java standards: Quarkus

The project's own conventions win. Read this with [JAVA.md](JAVA.md) when the
build uses Quarkus. Extension and property names change between releases;
confirm them against the platform version in the build file.

## What differs from other frameworks

Quarkus does at build time much of what others do at startup. Three
consequences shape the code:

- **Reflection is not free.** Code that relies on runtime reflection, dynamic
  proxies, or classpath scanning may work on the JVM and fail in a native
  image. Classes serialized reflectively need registering, and resources need
  including explicitly.
- **Some configuration is fixed at build time.** Changing it at deploy has no
  effect. Check which kind a property is before promising it can vary by
  environment.
- **Bean discovery is build-time CDI.** A bean nothing injects may be removed;
  mark it as unremovable or reference it if it is looked up dynamically.

## Beans and scopes

- `@ApplicationScoped` is the default for services: created lazily behind a
  client proxy, so interceptors work. `@Singleton` has no proxy; choose it
  deliberately, not as a synonym.
- Interceptors, including `@Transactional`, do not apply to a call from one
  method to another in the same bean, or to private methods.
- Constructor injection as elsewhere; avoid private injected fields, which
  need reflection.

## REST stack and threads

- Use one REST stack. Mixing the classic and reactive REST extensions in one
  application fails in confusing ways.
- Know which thread a method runs on. Blocking work, such as JDBC or a
  blocking client, on an event-loop thread stalls every request. Return a
  reactive type from end to end, or mark the method as blocking.
- Do not mix blocking and reactive data access in one use case.
- Map exceptions to responses in one mapper per failure family, returning the
  project's error shape and logging the cause once.
- Validate request bodies and bound parameters with Bean Validation at the
  resource.

## Data access with Panache

Pick the active-record style or the repository style for a bounded context and
keep to it. Bind query parameters; never build a query string from input.
Transactions belong on the service method. The entity and persistence advice
in [JAVA.md](JAVA.md) applies unchanged.

## Messaging and async

- Do not publish a message or start async work from inside a database
  transaction and assume both succeed. Publish after commit, or use the
  project's outbox.
- Message handlers must be safe to run twice. Decide retry, backoff, and
  dead-letter behavior per route or channel, and test the failure route.
- Request-scoped state and logging context do not follow to another thread
  automatically. Pass what the async work needs, or use the framework's
  context propagation.
- Give every `CompletableFuture` chain an exception stage, and do not block an
  event-loop thread waiting on one.
- With Camel, keep a route to routing and transformation, and put business
  rules in a bean the route calls so they can be unit tested.

## Security

- Authenticate with the framework's JWT or OIDC support and verify issuer,
  audience, and expiry through configuration, not hand-written parsing.
- Deny by default. Use role annotations for coarse rules, and check resource
  ownership in the service through the security identity.
- Keep secrets out of the configuration file committed to the repository;
  supply them from the environment or a secret store.
- Configure CORS with named origins. Do not take the client address from
  `X-Forwarded-For` unless a trusted proxy sets it and proxy handling is on.

Use `security-review` for a full review.

## Tests

| What is under test | Scope to use |
| --- | --- |
| Service or domain logic | Plain unit test with mocks, no Quarkus runtime |
| Resource mapping, validation, security | Quarkus test with HTTP assertions and the service mocked |
| Data access and wiring | Quarkus test with the dev-services database |
| Routes and message flow | The route test kit, with endpoints replaced by mocks |
| Native behavior | The same integration tests run against the native executable |

Prefer the framework's automatically provisioned dev services to hand-written
container setup when they cover the dependency. Use test profiles sparingly;
each one restarts the application.

## Verifying a change

Follow the order in [JAVA.md](JAVA.md), then add what the project ships:

- If it ships a native image, build it and run the integration tests against
  it. Failures there are usually unregistered reflection or missing resources.
- Check the health and readiness endpoints on the built artifact.
- If it publishes an API description, regenerate it and compare with the
  committed copy.

State startup or memory figures only when a run produced them.
