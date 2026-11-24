# Interface polish

Use `interface-polish` to audit and tighten the visual consistency and finish of an interface, or to set the visual direction for a new or redesigned screen.

Examples:

- “This page feels off. Find out why.”
- “Extract design tokens from our CSS.”
- “Audit the styling before we start the redesign.”
- “Polish this dropdown.”
- “Set the visual direction for the new settings screen.”

The skill finds where visual values are meant to live and the conventions around them, then inventories what the code really uses: colors, type, spacing, radius, shadows, and motion, with counts and whether each value is a token or a literal. It reports drift with file and line, such as near-duplicate greys, off-scale spacing, similar components that differ, and incomplete themes. On request it proposes the smallest token set that covers real usage, in the project's existing format.

It then walks a list of concrete details: nested radius, optical alignment, borders and shadows, text wrapping and tabular numerals, image edges, motion timing and transition scope, interaction and view states, and hit areas. Findings are confirmed in the running interface across themes, viewports, and states. Fixes go in small changes at the source of each value, with call sites listed before a shared token or component changes, and the report gives before and after rows.

When tightening an existing screen, the skill keeps the product's visual direction. A new or redesigned screen sets its direction first, from a reference that covers purpose, audience, tone, content states, and a rendered finish check. A second reference covers motion: tokens, reduced motion, and the common patterns.

## Workflow fit

`accessibility` owns WCAG conformance, `performance` owns animation cost and layout shift as measured outcomes, `coding-standards` owns component structure, and `prototype` owns comparing several directions as a throwaway experiment.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/interface-polish/SKILL.md).
