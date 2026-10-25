# Simplify

Use `simplify` to make working code easier to understand and maintain without changing what it does.

Examples:

- “Simplify the changes we just made, preserving behavior.”
- “Simplify this module; retain its public API and error behavior.”
- “Suggest simplifications here without editing anything.”

The default scope is the named area or identifiable current-task changes, not every dirty file. The skill pins the relevant contract, makes small improvements, and checks the final result. Characterization tests can start green: their purpose is to hold existing behavior steady.

Useful adapters, security guards, and explanatory helpers stay when they reduce total complexity. A smaller line count is not the objective, and no change is a valid outcome.

## Workflow fit

`simplify` owns the cleanup pass. `codebase-design` owns consequential architecture decisions; `diagnosing-bugs` owns unknown failures. During delivery, `implement` retains overall coordination and final verification. A standalone cleanup finishes through `verification-before-completion`.

It is available for normal skill discovery as well as explicit invocation. It does not add an automatic cleanup phase to every task or authorize commits, publication, or dependency installation.

See the [workflow map](../workflow.md), [source comparison and validation](../research/simplify-skill-research.md), and [skill instructions](../../skills/engineering/simplify/SKILL.md).
