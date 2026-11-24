# Coding Style

These are defaults. The project's linter, formatter, and existing code decide
where they differ; see [precedence.md](./precedence.md).

## Immutability

Prefer creating new objects over mutating existing ones, especially arguments
and shared state. Follow the language's idiom where in-place mutation is the
norm and stays local:

```
// Pseudocode
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns new copy with change
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

## Core Principles

### KISS (Keep It Simple)

- Prefer the simplest solution that actually works
- Avoid premature optimization
- Optimize for clarity over cleverness

### DRY (Don't Repeat Yourself)

- Extract repeated logic into shared functions or utilities
- Avoid copy-paste implementation drift
- Introduce abstractions when repetition is real, not speculative

### YAGNI (You Aren't Gonna Need It)

- Do not build features or abstractions before they are needed
- Avoid speculative generality
- Start simple, then refactor when the pressure is real
- No speculative abstraction before the second caller: no interface extracted
  from a single implementation, no factory for one product, no config option
  for a value that never varies. A deliberate boundary is not speculative: a
  repository interface that isolates business logic from storage (see
  `patterns.md`) earns its place at the first implementation

## File Organization

Prefer many small files to a few large ones:
- High cohesion, low coupling
- 200-400 lines typical, with 800 lines as a soft maintainability ceiling for source files
- Test, generated, and vendored files may exceed the ceiling when their size is justified by their role
- Extract utilities from large modules
- Organize by feature/domain, not by type

## Error Handling

Handle errors comprehensively:
- Handle errors explicitly at every level
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

## Input Validation

Validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

## Naming Conventions

> **Language note**: This rule may be overridden by language-specific rules for
> languages where a pattern is not idiomatic. Casing and framework-specific
> prefixes belong to the applicable language or package rule.

Language-independent:

- Descriptive names: the name says what the thing holds or does, without a comment.
- Boolean names read clearly as claims under the applicable language or package
  convention.
- Where the language draws the distinction, constants and types are visually
  distinct from ordinary values in the form its language or package rule defines.

## Code Smells to Avoid

### Deep Nesting

Prefer early returns over nested conditionals once the logic starts stacking.

### Magic Numbers

Use named constants for meaningful thresholds, delays, and limits.

### Long Functions

Split large functions into focused pieces with clear responsibilities.

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (about 50 lines is a signal to look)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation of arguments or shared state without a reason

Use the `coding-standards` skill to apply or define a project's conventions,
and `simplify` for cleanup that preserves behavior.
