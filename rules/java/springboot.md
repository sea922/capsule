---
paths:
  - "**/*Controller.java"
  - "**/*Service.java"
  - "**/*Repository.java"
  - "**/*Configuration.java"
  - "**/*Config.java"
  - "**/*Application.java"
  - "**/application*.yml"
  - "**/application*.yaml"
---
# Spring Boot Rules

Apply only when the build file declares Spring Boot.

Use these rules for Spring Boot projects alongside the general Java rules. The
project's own conventions win, and annotation and property names change between
major versions: confirm them against the version in the build file.

## Structure

- Keep controllers thin: bind, validate, call one service method, map the result to a status and body.
- Put business rules in services and queries in repositories.
- Use request and response DTOs (records fit well); do not return or accept entities at the API.
- Use constructor injection with `final` fields. Avoid field injection.
- Bind configuration to typed, validated `@ConfigurationProperties` classes instead of scattered `@Value`.

```java
@RestController
@RequestMapping("/api/orders")
class OrderController {
    private final OrderService orders;

    OrderController(OrderService orders) {
        this.orders = orders;
    }

    @PostMapping
    ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orders.create(request));
    }
}
```

## Validation and Errors

- Put `@Valid` on request bodies and Bean Validation constraints on the DTO.
- Handle failures in one `@RestControllerAdvice` that returns the project's error shape.
- Return the status that matches the outcome: `201` on creation, `404` for a missing resource, never `200` with an empty body.
- Do not send stack traces, SQL, or internal class names to the client.

## Transactions and Proxies

- Put `@Transactional` on service methods, not on controllers or repositories. Mark read-only work `readOnly = true`.
- A call to another method of the same bean skips the proxy, so its `@Transactional`, `@Async`, `@Cacheable`, or security annotation does nothing. Move the method to another bean.
- Transactions roll back on unchecked exceptions by default. Name the rollback rule when a checked exception must roll back too.
- Do not call another service over the network while a database transaction is open.
- Publish side effects that leave the process (messages, email) after commit, with `@TransactionalEventListener`.

## Data Access

- Bind every query parameter. Never concatenate input into JPQL, native SQL, or `JdbcTemplate` strings.
- Make collection endpoints pageable; do not return an unbounded `List`.
- Keep associations lazy and fetch what a use case needs with a fetch join or entity graph.
- A `@Query` that changes data needs `@Modifying` and a transaction.
- Change the schema with the project's migration tool, not `ddl-auto`, outside local development.

## Async, Scheduling, and Outbound Calls

- Give `@Async` a bounded executor and a place where failures are reported.
- Set connect and read timeouts on every HTTP client. Retry only idempotent calls, with backoff and a limit.
- Make scheduled jobs and message handlers safe to run twice, and lock a scheduled job when more than one instance runs.
- Keep singleton beans free of mutable instance state.

## Security

- Declare the `SecurityFilterChain` explicitly and deny by default; list the public paths.
- Authorize at the method or service as well as the URL, and check ownership of the resource, not only the role.
- Keep CSRF protection on for cookie sessions. A stateless API that authenticates with a bearer token in a header may turn it off.
- Configure CORS once with named origins. Do not combine wildcard origins with credentials.
- Use the framework's `PasswordEncoder` and token validation; do not write either by hand.
- Read secrets from the environment or a secrets manager, never from committed configuration.
- Expose only the actuator endpoints that are needed, and require authentication beyond basic health.
- Keep passwords, tokens, and personal data out of logs.

## Testing

- Test service and domain logic with plain JUnit and Mockito, without a Spring context.
- Use `@WebMvcTest` for controller mapping, validation, error shape, and security rules. The slice does not load every configuration class, so import the security configuration the test depends on.
- Use `@DataJpaTest` for repository queries, against a real database in a container. By default the slice may replace the datasource with an embedded database; configure it to keep the container's, as the installed version documents.
- Keep `@SpringBootTest` for wiring across layers, and keep its configurations few so the context is reused.
- Cover the unauthenticated and forbidden cases of a protected endpoint.
- Wait for asynchronous results with a polling assertion, not `Thread.sleep`.

## Related capsule Skills

Use the `coding-standards` skill to apply the project's own conventions; its
Java and Spring Boot references go deeper than these rules. Use `api-design`
for the HTTP contract, `database-design` and `database-migrations` for schema
work, and `security-review` for a full security review. The `java-reviewer`
agent reviews Java changes read-only.
