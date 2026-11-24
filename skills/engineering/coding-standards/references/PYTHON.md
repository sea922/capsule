# Python standards

The project's own configuration, layout, and existing code win over anything
here. This reference goes deeper than a Python rule set: it covers the decisions
and traps a style guide leaves open. Read the sections the change touches; the
framework sections apply only when the project uses that framework.

## Language traps

- **Mutable defaults.** A default `[]` or `{}` is created once and shared by
  every call. Default to `None` and build the value inside the function. The
  same applies to dataclass fields: use `field(default_factory=list)`.
- **Late-binding closures.** A lambda or nested function created in a loop sees
  the loop variable's final value. Bind it as a default argument or use
  `functools.partial`.
- **Identity and type checks.** Compare to `None` with `is`. Use `isinstance`,
  which respects subclasses, rather than comparing `type()`.
- **Truthiness.** `if not value` treats `0`, `""`, and an empty collection the
  same as `None`. When zero or empty is a valid value, test `is None`.
- **Exception scope.** Catch the narrowest exception that the code can act on.
  `except Exception` belongs only at a boundary that logs and re-raises or
  converts. A bare `except:` also catches `KeyboardInterrupt` and `SystemExit`.
- **Chaining.** When converting an exception, write `raise NewError(...) from
  err` so the original traceback survives. Use `from None` only to hide an
  internal detail deliberately.
- **Asking forgiveness.** Trying an operation and handling the failure avoids
  the race in check-then-act, but keep the `try` body to the one statement that
  can fail so an unrelated error is not caught with it.
- **Iterating while mutating.** Changing a list or dict during iteration skips
  items or raises. Iterate over a copy or build a new collection.
- **Wildcard imports and import side effects.** `from x import *` hides where a
  name came from. A module that does work at import time makes tests and tools
  slow and order-dependent; put the work behind a function.

## Types

Annotate public signatures and let the checker the project already runs (mypy,
pyright, or another) decide strictness. Points a rule set does not settle:

- Accept the widest type that works (`Iterable`, `Mapping`, `Sequence`) and
  return the narrowest concrete one. Callers can then pass any container.
- Prefer a `Protocol` to an abstract base class when the caller only needs a
  shape. Reserve an ABC for shared implementation.
- Model closed sets with `Enum` or `Literal`, and optional values as `X | None`
  that callers must narrow, rather than sentinel strings or `-1`.
- A `# type: ignore` names the error code and says why. `Any` at a boundary is
  narrowed once, at that boundary, by validation (pydantic, attrs, a
  `TypedDict` plus checks), not passed inward.
- Choose data containers by need: a frozen dataclass for a value with behaviour,
  `NamedTuple` when tuple unpacking matters, `TypedDict` for JSON-shaped data
  you do not own, a validating model where untrusted input enters.

## Structure

- Use the layout the repository has. For a new package, a `src/` layout keeps
  tests from importing the working directory by accident.
- Keep I/O at the edges. Functions that compute take values and return values;
  functions that read files, call services, or query the database are separate
  and thin. This is what makes the core testable without patching.
- Export a deliberate public surface from `__init__.py`; do not re-export
  everything. Absolute imports are easier to move than deep relative ones.
- Read configuration once at start-up into a typed settings object and fail
  there when a required value is missing. Do not scatter `os.environ` reads.
- Module-level mutable state is shared across threads and requests. Pass state
  in, or own it in an object with a clear lifecycle.

## Resources and concurrency

- Anything opened is closed by a `with` block, including locks, sessions,
  temporary directories, and HTTP clients. Write a `contextmanager` when setup
  and teardown must stay paired.
- Pick the concurrency model by the work: `asyncio` for many waiting network
  calls, threads for blocking I/O in libraries without async support, processes
  for CPU-bound work. Threads do not speed up pure-Python CPU work on the
  standard interpreter.
- In async code, one blocking call (a sync HTTP client, a sync database driver,
  `time.sleep`, heavy CPU) stalls every request on the loop. Move it to a
  thread or process executor.
- A coroutine that is never awaited does nothing. Keep a reference to tasks
  created with `create_task`, or use a task group, so failures surface and the
  task is not garbage-collected.
- Let cancellation propagate. Catching `CancelledError` without re-raising
  leaves shutdown hanging. Give every outbound call a timeout.
- Prefer generators for large or unbounded data, and `"".join(parts)` to
  repeated string concatenation. Reach for `__slots__` only after measuring a
  memory problem with many instances.

## Testing with pytest

The `tdd` skill owns the red-green cycle. These are the pytest-specific choices:

- **Fixtures.** Default to function scope. Widen scope only for expensive,
  read-only resources, because a wider scope shares state between tests. Use
  `yield` so teardown runs on failure. Keep `autouse` for true cross-cutting
  setup; an autouse fixture that a reader cannot see is hard to debug.
- **`conftest.py`** holds fixtures shared by a directory. A fixture used by one
  module lives in that module.
- **Parametrize** the same behaviour over inputs and give cases `ids` so a
  failure names the case. Different behaviours get different tests.
- **Patch where the name is looked up**, not where it is defined: patch
  `orders.service.send_email`, not `mailer.send_email`. Use `autospec=True` (or
  `create_autospec`) so a mock rejects calls the real object would reject.
- **Mock at the system edge** (network, clock, randomness, third-party
  services). A test that mocks the code under test proves only the mock.
- **Filesystem and environment.** Use `tmp_path` and `monkeypatch`; they undo
  themselves. Do not write to the repository or mutate `os.environ` directly.
- **Exceptions.** `pytest.raises(SomeError, match=...)` on the single
  statement expected to fail, then assert on the exception's attributes.
- **Async tests** need the project's async plugin and its mode configured;
  check how existing tests are marked before adding one.
- **Markers** are registered in the pytest configuration, and strict markers
  turn a misspelled one into an error instead of a silently unselected test.

## Verification commands

Run what the project defines first (a `Makefile`, `tox`, `nox`, `just`, or
scripts in `pyproject.toml`), through the project's environment manager (`uv
run`, `poetry run`, or the active virtual environment). Where it defines
nothing, the usual sequence is: formatter check, linter, type checker, tests
with coverage, then a dependency audit (`pip-audit` or the equivalent). Report
each command and its result; `verification-before-completion` owns the claim.

## Security

- Never build SQL, shell commands, or file paths from input by string
  formatting. Use driver parameters, argument lists with `shell=False`, and a
  resolved path checked against its allowed root.
- `pickle`, `yaml.load` without a safe loader, and `eval`/`exec` on untrusted
  data execute code. Use JSON, a safe loader, or a real parser.
- Compare secrets with `hmac.compare_digest`. Generate tokens with `secrets`,
  not `random`.
- Outbound HTTP calls set a timeout and keep certificate verification on.

## FastAPI

- Build the app in a factory and manage start-up and shutdown resources (pools,
  clients) in the lifespan handler, not at import time.
- Declare dependencies once as annotated aliases and reuse them, so a test
  overrides one object. Split authentication (who is calling, 401) from
  authorization (may they do this, 403) into separate dependencies.
- The service layer owns the transaction. A route maps a domain error to an
  HTTP status; it does not commit, hash passwords, or run queries.
- Offset pagination needs a deterministic order, usually ending in the primary
  key, or rows repeat and vanish between pages.
- A plain `def` route runs in a thread pool; an `async def` route runs on the
  loop. Choose by the libraries the route calls, and never mix a sync driver
  into an async route.
- Validate token claims defensively: types in a decoded payload are not
  guaranteed to match what your code issued.
- Test through an async client against the app with dependencies overridden,
  using a real database where practical and a transaction rolled back per test.

## Django

**Models and queries**

- Start a project with a custom user model; swapping it later is a data
  migration across every foreign key.
- Querysets are lazy and re-evaluate. Use `select_related` for forward foreign
  keys and `prefetch_related` for reverse and many-to-many relations whenever a
  loop touches related objects. Assert query counts in tests for list views.
- Put reusable filters on a custom queryset or manager rather than repeating
  them in views. Put multi-model workflows in a service function, not in a
  view, serializer, or `save()` override.
- `bulk_create`, `bulk_update`, and `queryset.update()` skip `save()` and
  signals. That is the point, and also the trap when logic lives there.
- Signals hide control flow. Prefer an explicit call; keep signals for
  decoupling from code you do not own.
- Express integrity in the database with constraints and indexes on the model's
  `Meta`, and update counters with `F()` expressions to avoid lost updates.
- Wrap multi-write operations in `transaction.atomic()` and lock rows with
  `select_for_update()` when a read decides a write.

**REST framework**

- Use separate serializers for input and output when their fields differ, and
  list fields explicitly; `fields = "__all__"` exposes whatever is added later.
- Override `get_queryset` to scope results to the caller. Object-level
  permissions do not filter list endpoints.
- Set default permission, pagination, and throttle classes globally so a new
  view is closed by default.

**Security**

- Run `manage.py check --deploy` against production settings. Debug off, an
  explicit allowed-hosts list, secure and HTTP-only cookies, HTTPS redirect,
  and HSTS are the baseline; the secret key comes from the environment.
- Template auto-escaping is the XSS defence. `mark_safe` and the `safe` filter
  turn it off; never apply them to user-influenced strings.
- `raw()`, `extra()`, and cursor queries take parameters, never formatted
  strings. Exempting a view from CSRF needs another authentication mechanism
  that is not cookie-based.
- For uploads, validate size and real content type, generate the stored name,
  and serve from storage that cannot execute the file.

**Tests**

- Use the project's runner (pytest-django or the built-in one). Build objects
  with factories rather than fixtures files, creating only what the test reads.
- Test views and APIs through the test client so URL routing, permissions, and
  serialization are exercised. Cover the unauthenticated and wrong-owner cases.
- Test settings swap slow or external pieces: a fast password hasher, an
  in-memory email backend, a local cache. Mock third-party services at the
  client boundary.

**Verification**

Beyond lint, types, and tests: `makemigrations --check --dry-run` shows model
changes without a migration; `migrate --plan` shows what will run;
`check --deploy` reviews settings; `collectstatic --noinput` proves static
assets build. Read each new migration, and use the `database-migrations` skill
when one rewrites a table, drops anything, or moves data.

## Celery

- **Arguments are identifiers, not objects.** Pass a primary key and reload
  inside the task; a pickled or stale instance overwrites newer data.
- **Publish after commit.** A task queued inside a transaction can run before
  the row is visible, or run for a transaction that rolled back. Queue it from
  `transaction.on_commit`.
- **Assume more than one delivery.** Make each task idempotent: a guarded
  state transition (`filter(status=...).update(...)`), a unique constraint, or
  an idempotency key passed to the external service. Late acknowledgement and
  redelivery on worker loss are safe only after that holds, and a task that
  crashes its worker needs a retry cap so it cannot loop forever.
- **Retry only transient failures**, with a bounded count, exponential backoff,
  and jitter. A validation error will fail the same way every time.
- **Bound run time** with soft and hard limits, and keep tasks short; split
  long work into resumable batches.
- **Scheduling.** Run exactly one beat process. Guard a periodic task with a
  lock when overlapping runs would be harmful.
- **Do not block on results** from inside a request or another task. Compose
  with chains, groups, and chords, and do not store results nobody reads.
- **Routing.** Separate queues keep slow work from starving urgent work; a low
  prefetch setting stops one worker hoarding long tasks.
- **Tests.** Call the task function directly for logic. Eager mode exercises
  the calling path but hides serialization and retry behaviour, so cover those
  with a real broker where they matter.
- **Operations.** Failed tasks reach error tracking, and queue depth and task
  age are monitored; a silent queue is the common failure.

## Neighbouring skills

Use `tdd` for test-first work, `property-based-testing` for generated cases,
`database-migrations` for schema and data changes, `security-review` for an
audit, and `performance` for measured slowdowns. Cross-language error design is
in [ERROR-HANDLING.md](ERROR-HANDLING.md); service concerns in
[BACKEND.md](BACKEND.md).
