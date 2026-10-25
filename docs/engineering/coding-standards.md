# Coding standards

Use `coding-standards` to apply project conventions while writing code, assess
violations during review, or define a project's standards.

Examples:

- “Apply coding standards to this endpoint.”
- “Review this form against our frontend conventions.”
- “Define coding standards based on this repository.”

One skill holds the shared baseline. Backend changes load guidance on requests,
authorization, persistence, retries, jobs, and dependency failure. Frontend
changes load guidance on components, accessibility, state, async interactions,
and rendering. Full-stack changes use both; a pure library or CLI uses the
shared baseline when neither domain applies.

Existing repository rules and tools come first. The skill does not impose React,
Node, a formatter, or a new architecture. Framework-specific guidance applies
only to projects using that framework.

## Workflow fit

`implement` retains delivery coordination and `code-review` retains review
orchestration. This skill supplies criteria to either workflow. It can also be
invoked directly. Architecture decisions belong to `codebase-design`; requested
cleanup belongs to `simplify`.

The split is inspired by ECC's shared, backend, and frontend skills, with
project-first rules and conditional references to reduce duplication. The
instructions here are original; no upstream skill is copied.

See the [skill instructions](../../skills/engineering/coding-standards/SKILL.md),
[research](../research/coding-standards-skill-research.md), and
[evaluation record](../research/coding-standards-skill-validation.md).
