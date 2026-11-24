# Java standards

The project's own conventions, build configuration, and existing code win over
everything here. Read this when a Java change needs more than the general
standards: choosing between idioms, working with JPA or MyBatis, or deciding
what to verify. It covers decisions and traps, not syntax.

Identify the framework from the build file before applying anything, then read
the matching reference as well:

| Build file names | Read |
| --- | --- |
| `spring-boot` | [JAVA-SPRING.md](JAVA-SPRING.md) |
| `quarkus` | [JAVA-QUARKUS.md](JAVA-QUARKUS.md) |
| neither | this file only |

Check the Java release the build targets before using a language feature;
records, sealed types, and pattern matching in `switch` arrived in different
releases.

## Language decisions

- **Value or entity.** A type compared by its contents is a record or an
  immutable class. A type with identity and a lifecycle is a class that guards
  its own invariants. Do not make a persistence entity a record; ORMs need a
  mutable, proxyable class.
- **Collections at boundaries.** Copy a collection on the way in and return an
  unmodifiable view or copy on the way out. Otherwise a caller holds a
  reference into the object's state.
- **`Optional` is a return type.** Use it for a lookup that may find nothing.
  As a field, parameter, or collection element it adds a second kind of
  absence; use an overload or a nullable annotation the project already has.
- **Null.** Follow the project's nullness annotations where they exist. Without
  them, reject null at public entry points and do not pass it internally.
- **Exceptions.** Unchecked for domain failures, named for the failure, with
  the identifying values in the message. Wrap a technical exception with
  context and keep the cause. Catch broadly only at one central handler.
- **Streams or loops.** A stream suits a short transformation with no side
  effects. Use a loop when the body needs early exit, checked exceptions, or
  several accumulators. A parallel stream needs a measurement to justify it.
- **Generics.** No raw types. Bound a type parameter when the method uses the
  bound; otherwise leave it open.
- **Time and money.** `java.time` types with an explicit zone or `Instant`;
  `BigDecimal` constructed from strings and compared with `compareTo`.
- **Concurrency.** Prefer immutable messages and the executor the framework
  manages. A hand-made thread pool needs an owner, a bound, and a shutdown. A
  `CompletableFuture` chain without an exception stage loses its failure.
- **Logging.** Parameterized messages through the project's logging facade,
  with the identifiers needed to trace one request. No secrets or personal
  data, and no string building for a level that is switched off.

## Dependency injection

Constructor injection in either framework, so a class can be built in a plain
unit test and its dependencies are final. A constructor with many parameters
is a design signal, not a reason to switch to field injection. Lombok is the
project's choice; do not introduce it or remove it as part of other work.

## Persistence with JPA and Hibernate

- **Fetching.** Keep associations lazy and fetch what a use case needs in its
  query, with a fetch join or entity graph. An eager collection is paid for by
  every query on the entity.
- **N+1.** Suspect it wherever code walks an association inside a loop. Confirm
  with the SQL log or a statement count in a test, never by reading alone.
- **Pagination with fetch joins.** Paging a query that fetch-joins a collection
  makes the ORM page in memory. Page the parent identifiers first, then load
  the children.
- **Read paths.** Return a projection or DTO rather than a managed entity when
  the caller only reads. It selects fewer columns and cannot be changed by
  accident.
- **Entities stay inside the transaction.** A lazy association touched after
  the transaction closes fails or, with open-session-in-view, runs unplanned
  queries during rendering. Map to DTOs inside the service.
- **`equals` and `hashCode`.** Base them on a stable business key or handle the
  unassigned generated id deliberately. Generated implementations over all
  fields break sets and trigger lazy loads.
- **Bidirectional relations.** One side owns the foreign key; keep both sides
  in step through a helper method. Cascade and orphan removal belong on a true
  parent-child relation only.
- **Transactions.** One per use case, at the service method. A read-only
  transaction states intent and may help the driver; it does not fix a slow
  query. Hold no transaction across a remote call.
- **Bulk writes.** Configure JDBC batching and flush and clear in chunks, or
  use a bulk statement and accept that it bypasses the persistence context and
  entity callbacks.
- **Concurrent updates.** Use a version column where two users can edit the
  same row, and decide what the caller sees on conflict.
- **Schema.** Changes go through the project's migration tool. Automatic DDL
  from the ORM is for throwaway databases; in shared environments at most
  validate. Use `database-migrations` for the change itself.
- **Pool.** Size the connection pool from the database's limit divided across
  instances, and set connection and statement timeouts.

## Persistence with MyBatis

- **Binding.** `#{}` binds a value as a parameter. `${}` pastes text into the
  SQL; allow it only for a value chosen from a closed list the application
  owns, such as a sort-column map, and prefer separate fixed statements.
- **Empty lists.** Decide in the service what an empty id list means. A guard
  that drops the `IN` predicate for an empty list widens the query to every
  row. Short-circuit to "no rows" before calling the mapper, and keep null for
  the deliberate "no filter" case.
- **Search patterns.** Build `LIKE` patterns in the service, escaping `%` and
  `_` when they are meant literally.
- **Result mapping.** `resultType` for a flat match on column labels; an
  explicit `resultMap` with an `<id>` for joins, nested objects, or
  collections. Automapping a complex join can fill the wrong field silently.
- **Nested selects.** A nested `select` runs once per parent row. Use a join,
  or load the parent page and then the children in one bounded query.
- **Dynamic SQL.** Use `<where>`, `<set>`, `<choose>`, and `<foreach>`. When a
  statement grows many branches, split it into named statements that can each
  be tested.
- **Sessions.** Let the framework manage the session and transaction. Do not
  commit, roll back, or close an injected mapper or session, and put the
  transaction on the service, not the mapper.
- **Tenant and actor.** Take them from the authenticated context, never from a
  request field, and keep the tenant predicate in the SQL as well.
- **Paging and exports.** Order by a unique tie-breaker. Prefer keyset paging
  for deep pages, cap page size on the server, and confirm that paging reaches
  the database instead of trimming a full result in memory. Stream exports in
  bounded chunks.
- **Batches.** Bounded chunks inside an explicit transaction, within the
  driver's parameter limit. Return affected-row counts so the service can
  detect a stale or missing row. Do not blindly retry a batch that partly
  committed.

For a slow statement in either library, read the query plan on a non-production
database before changing anything, and use `performance` for the method. Do
not raise a timeout or add an index without a measured plan.

## Testing choices

- Unit tests construct the class directly with fakes or mocks. Reach for the
  framework's test context only when the wiring is what is under test, because
  each distinct context costs startup time.
- Test data access against the same database family as production, usually in
  a disposable container. An in-memory substitute accepts SQL the real engine
  rejects, and the reverse.
- Mock collaborators the code owns at a boundary; avoid partial mocks and
  mocking types the code does not own.
- Assert what the caller observes. Verifying every interaction pins the
  implementation and breaks on refactoring.
- No sleeps. Wait on a condition, inject a clock, or run the executor inline.
- For a fixed N+1 or paging bug, keep a regression test that counts statements
  or asserts query shape where the harness allows it.
- Coverage is a signal for finding untested behavior. The project's threshold
  decides the gate.

Use `tdd` for the test-first loop itself.

## Verifying a change

Use the wrapper and tasks the project defines; this is the usual order:

1. Compile and build, stopping on the first failure.
2. Static analysis and formatting the project has configured, such as
   Checkstyle, PMD, SpotBugs, or a formatter check.
3. Unit tests, then integration tests, with the coverage report if the project
   gates on it.
4. Dependency vulnerability scan if configured.
5. Read the diff: leftover debug output, missing validation or transaction
   boundaries, changed configuration without documentation.

Report each step as run and passed, run and failed, or not available, as
`verification-before-completion` requires.
