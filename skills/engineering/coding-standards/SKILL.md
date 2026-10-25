---
name: coding-standards
description: Supplies coding conventions for shared code, backend services, and frontend interfaces. Use when applying project coding standards during implementation, assessing convention violations in review, or defining standards for a project. Implementation stays with implement; review orchestration stays with code-review; consequential architecture decisions belong to codebase-design.
---

# Coding standards

Apply standards to the requested change using the project's contracts and tools.
This skill supplies criteria; the calling workflow retains scope and execution.

## 1. Establish the local standard

Read applicable repository instructions, documented conventions, formatter/linter
and compiler configuration, and representative code near the change. Identify
the language, existing libraries, and framework version where applicable from
project files.

Follow explicit user direction and applicable repository rules. Where they are
silent, use the shared baseline below. Treat nearby code as evidence of a
convention, not authority to repeat a defect. When a local pattern conflicts with
correctness or a trust boundary, explain the concrete consequence and propose a
scoped correction. Resolve ambiguity through repository evidence first; ask the
user when a remaining choice materially changes behavior or architecture.

For a request to define standards, derive a small proposed rule set from this
evidence. Distinguish existing conventions from new choices. Save it in the
project's established location when requested; configuring new tooling is a
separate implementation decision.

**Complete when:** the applicable standard, requested scope, and relevant stack
are identified, with assumptions distinguished from documented rules.

## 2. Select the domain

| Affected code | Read |
| --- | --- |
| Server handlers, persistence, jobs, or external service calls | [Backend standards](references/BACKEND.md) |
| UI components, forms, client state, or browser interactions | [Frontend standards](references/FRONTEND.md) |
| A change crossing both domains | Both references, including their shared interface |
| A CLI, pure library, or other code outside these domains | The shared baseline only |

Classify by responsibility: a server endpoint written inside a UI framework is
backend code. Load only relevant references. Apply stack-specific guidance only
when the project uses that stack.

**Complete when:** each affected responsibility has an applicable reference or
the shared baseline; unrelated domains stay unloaded.

## Shared baseline

- **Contracts:** preserve established input, output, error, and side-effect
  behavior outside the requested change. Use names from the domain and explicit
  representations for meaningful variants. In typed code, validate external
  values before narrowing; assertions must have a demonstrated invariant.
- **Types:** in typed code, make illegal states unrepresentable. Model variants
  as a tagged union rather than a record of optional fields or co-dependent
  booleans, and handle every variant with an explicit exhaustiveness check (such
  as a `never` assertion in TypeScript, or the compiler's exhaustive-match
  check) so a new variant fails to compile at each unhandled site. Brand identifiers and units that share a primitive
  type when mixing them up would be a defect. Derive types from the one schema
  or source that owns the shape rather than maintaining parallel declarations.
- **Boundaries:** validate untrusted input where it enters. Pass validated domain
  values internally. Keep failure distinguishable from an empty or successful
  result, and preserve useful error context without exposing sensitive data.
- **State:** make ownership and mutation visible. Update shared or observable
  state through its established owner. Local mutation during construction is
  acceptable when it cannot alter another caller's state.
- **Simplicity:** reuse the existing owner or suitable native facility. Time
  abstractions by `codebase-design`'s KISS -> YAGNI -> DRY sequence; line counts
  alone do not justify splitting a function or adding layers.
- **Asynchrony:** await dependent work; bound independent concurrency. Define who
  owns cancellation, cleanup, and failure. Preserve required ordering and release
  resources on both success and failure.
- **Consistency:** use the project's formatter, linter, compiler, and naming
  conventions. Explain decisions that code and types cannot express. Keep
  unrelated style changes out of the patch.
- **Performance:** identify the relevant workload and measure the suspected
  bottleneck before adding caches, memoization, or special-purpose machinery.

## 3. Apply and check

During implementation, apply relevant rules inside the authorized change and
use existing checks. Add behavioral verification for changed contracts and
meaningful failure paths through the calling workflow. Keep checks enabled;
report a failing check and its cause rather than weakening it to obtain a pass.

During review, remain read-only. For each actionable finding, identify the code
location, governing rule or broken invariant, observable consequence, and scoped
remedy. Label stylistic alternatives as suggestions. A review with no actionable
findings is valid; do not manufacture changes to demonstrate skill use.

If a decision requires redesigning ownership, use `codebase-design` for that
decision. Requested cleanup can use `simplify`. These are conditional routes,
not additional phases required by loading standards.

**Complete when:** applicable rules have been checked against the scoped result,
and verification performed, unavailable checks, and material exceptions are
distinguished. Return this evidence to the calling workflow; standalone work
reports the requested result and the same evidence briefly.
