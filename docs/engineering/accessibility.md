# Accessibility

Use `accessibility` to audit and fix user interfaces against WCAG 2.2 AA with evidence from the running app.

Examples:

- “Audit the checkout page for accessibility.”
- “Can a keyboard user complete signup?”
- “Fix the accessibility issues in our modal.”
- “Is this form WCAG AA compliant?”

The skill writes down the scope first: routes, states, viewports, and browsers. It reviews the code for likely barriers, runs the project's existing scanner on the running app, and then tests by hand. The manual passes cover keyboard only, a named screen reader and browser pairing, 200% zoom and narrow reflow, contrast on rendered pixels in every state, and error and empty states. Fixes start with native elements, use ARIA only where nothing native fits, and are re-checked the same way the barrier was found.

The report names what was verified, what failed with its WCAG success criterion and severity, and what stayed unverified. It never treats a clean scan as conformance. Publishing an accessibility statement or conformance report stays with the user.

The read-only `accessibility-reviewer` agent does the code review, and `code-review` deep mode reuses it for user-interface changes.

## Workflow fit

`coding-standards` holds the accessibility rules applied while writing code; `accessibility` owns audits and fixes. `pr-images` can attach before and after screenshots of visual fixes.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-performance-accessibility-research.md), and the [skill instructions](../../skills/engineering/accessibility/SKILL.md).
