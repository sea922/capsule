---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python

Defaults for where the project is silent. Its `pyproject.toml`, linter and
formatter settings, and existing code come first.

## Style

- Follow PEP 8 through the project's formatter and linter; do not hand-format
  against them.
- Add type hints to function signatures and public attributes, and keep the
  project's type checker passing. Avoid `Any`; use protocols, generics, or
  unions.
- Use `pathlib` for paths, f-strings for formatting, and comprehensions where
  they stay readable.
- Never use a mutable default argument. Default to `None` and create the value
  inside the function.
- Prefer dataclasses, typed dicts, or the project's model library to loose
  dictionaries for structured data, and enums to bare string constants.

## Errors and resources

- Catch the specific exception you can handle. Never a bare `except:`, and
  never `except Exception: pass`. Keep the cause with `raise ... from err`.
- Open files, locks, connections, and sessions with `with`, so they close on
  every path.
- Log with the `logging` module and lazy arguments, not `print`, and never log
  secrets or personal data.

## Async

- Do not call blocking I/O inside `async` functions; use the async client or
  run it in an executor. Await every coroutine, and gather independent ones.

## Tests and tooling

- Use the project's test runner, normally `pytest`, with fixtures and
  parametrized cases. Test behavior, not private helpers.
- Use the project's environment and dependency tool, and add dependencies
  through it, never with a bare `pip install`.
- Before saying work is done, run the project's lint, type-check, and tests.

## Security

- Use parameterized queries; never build SQL with f-strings or concatenation.
- Never call `eval`, `exec`, `pickle.loads`, or `yaml.load` without a safe
  loader on untrusted input.
- Pass subprocess arguments as a list, without `shell=True`.
- Use `secrets`, not `random`, for tokens. Read secrets from the environment
  or the project's secret store, and validate external input at the boundary.
