---
paths:
  - "**/*.java"
---
# Java

Defaults for where the project is silent. Its build file, language level,
formatter, static-analysis settings, and existing code come first.

## Style and types

- Use the language level the build declares; do not use a feature newer than
  it. Where available, use records for plain data, sealed types and pattern
  matching for closed hierarchies, and `var` only when the type is obvious.
- Make fields `private final` unless they must change. Prefer immutable
  collections (`List.of`, `Map.copyOf`) and return copies, not internal state.
- Never return `null` for a collection: return an empty one. Use `Optional`
  for a return value that may be absent, not for fields or parameters.
- Compare objects with `equals`, and override `hashCode` whenever you override
  `equals`. Use `BigDecimal` for money, never `double`.
- Follow the project's naming and package layout. One top-level class per file.

## Errors and resources

- Catch the most specific exception you can handle. Never an empty `catch`,
  and never catch `Throwable` or swallow `InterruptedException`: restore the
  interrupt flag.
- Keep the cause when wrapping an exception. Do not use exceptions for normal
  control flow.
- Open streams, connections, and locks in try-with-resources.
- Log through the project's logging facade with parameterized messages, and
  never log secrets or personal data.

## Design

- Inject dependencies through constructors, not field injection or static
  lookups. Depend on interfaces at module boundaries.
- Keep classes small and focused. Prefer composition to inheritance.
- Keep transactions short, and never make a remote call inside one.

## Concurrency

- Prefer `java.util.concurrent` (executors, concurrent collections,
  `CompletableFuture`) to raw threads and `synchronized` blocks.
- Do not share mutable state without a stated guard. Shut down every executor
  you create.

## Tests and tooling

- Use the project's test framework and assertion and mocking libraries. Test
  behavior through public methods, with one reason to fail per test.
- Build and test with the project's wrapper (`./mvnw` or `./gradlew`), and
  keep its static-analysis checks passing.

## Security

- Use `PreparedStatement` or the project's query layer with bound parameters;
  never concatenate input into SQL or JPQL.
- Validate input at the boundary with the project's validation framework.
- Never deserialize untrusted data with Java serialization. Configure XML
  parsers to refuse external entities.
- Use `SecureRandom` for tokens, and keep secrets out of source and logs.
