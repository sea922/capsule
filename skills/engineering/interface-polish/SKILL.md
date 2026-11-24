---
name: interface-polish
description: Audit and tighten the visual consistency and finish of an existing interface by extracting its design tokens, finding drift from them, and applying concrete, checkable details such as radius, alignment, shadows, motion, states, and hit areas. Use when a UI feels off, flat, generic, cramped, or unfinished, when auditing styling before a redesign, when asked to extract or document design tokens, when polishing a component or screen, or when setting the visual direction for a new or redesigned screen. WCAG conformance belongs to accessibility, speed to performance, and component structure to coding-standards.
---

# Interface polish

An interface feels finished when its values agree with each other and its small details are deliberate. Most "it looks off" complaints trace to drift (a fifth grey, a one-off radius, a spacing value nobody chose) or to a missing detail (no pressed state, a counter that jitters, an icon centered by geometry instead of by eye). Find these in the code and confirm them on the screen. Keep the product's visual direction; this skill tightens what exists and does not restyle it.

## 1. Find the system and the scope

Locate where visual values are meant to live: a theme file, CSS custom properties, a Tailwind or similar config, a token file, a component library, or a design document. Read two or three real usage sites to learn the conventions you did not set: token naming, whether tokens are raw or semantic, how variants and dark mode resolve. When the system is a third-party library, read its current documentation instead of recalling its API.

Agree the scope: which screens or components, which themes, which viewports. When the scope is a new screen or a redesign rather than an existing one, set the direction with [DIRECTION.md](references/DIRECTION.md) before any styling is written. If no system exists at all, say so before continuing; the audit then reports the values in use and proposes a token set from them (step 2), and nothing is invented mid-task.

**Complete when:** the token source, the component directory, the conventions, and the screens, themes, and viewports in scope are written down.

## 2. Inventory the values in use

Search the styling in scope and count distinct values for each category:

- **Color:** every literal and token, grouped by role (text, surface, border, accent, status).
- **Type:** families, sizes, weights, line heights.
- **Spacing:** padding, margin, and gap values.
- **Radius, border, and shadow:** each distinct value and where it appears.
- **Motion:** durations, easings, and which properties animate.
- **Breakpoints and z-index.**

For each category, list the values, how often each occurs, and whether it comes from a token or is hardcoded. The counts are the evidence: nine greys used once each read differently from two greys used everywhere.

When the user asked for tokens to be extracted or documented, write the smallest set that covers the values the product really uses: fold near-duplicates into the dominant value, name by role where the project names by role, and note every value you merged and why. Write it in the format the project already uses, and do not add a second token pipeline beside an existing one.

**Complete when:** each category has its values, counts, and token-or-literal status, and any proposed token set maps back to them.

## 3. Find the drift

Compare the inventory with the system and report each mismatch with its file and line:

- a literal value where a token covers it;
- near-duplicates, such as two greys a shade apart or 14px and 15px text;
- values off the spacing or type scale;
- similar components that look different (two card paddings, three button heights);
- a theme that is incomplete, such as a surface with no dark value;
- type hierarchy that does not descend clearly from heading to caption;
- defaults applied without a reason: a gradient, heavy rounding, or generous padding on everything, which flattens hierarchy and reads as generic.

A value with no covering token is a gap in the system. Report it and use the nearest token; do not add a private token beside the system.

**Complete when:** every drift finding names the file, the value found, and the value the system expects.

## 4. Check the details

Walk the checks in [DETAILS.md](references/DETAILS.md) against the components in scope: nested radius, optical alignment, borders and shadows, text wrapping and numerals, image edges, motion, transition scope, interaction states, and hit areas. Each check states what to look for and what the fix looks like. Record only what fails. When the scope adds or audits animation beyond simple state transitions (entrances and exits, staggers, page transitions, scroll effects, layout animation, drag), also read [MOTION.md](references/MOTION.md).

**Complete when:** each check has been applied to the scope or marked not applicable.

## 5. Look at the running interface

Styling findings are claims until rendered. Open the interface in a browser, or use the project's component preview, and look at each finding where it lives: every theme the product ships, a small and a large viewport, and each interaction state (hover, pressed, focus, disabled, loading, empty, error). Capture before screenshots of what you intend to change. Token and variant changes are invisible in a diff and appear only on screen.

If the interface cannot be run, say that the audit is from source only and which findings remain unconfirmed.

**Complete when:** each finding is confirmed on screen, withdrawn, or labelled unconfirmed.

## 6. Fix in order, in small changes

An audit-only request stops at the report (step 7). Otherwise fix in this order, because later fixes depend on earlier ones: tokens and theme gaps, then literals replaced by tokens, then component consistency, then details.

Before changing a shared token or component, list its call sites: a changed default is a change to every screen that uses it. Ask before altering one whose consumers are outside the agreed scope. Change the value at its source instead of overriding it locally. Follow the project's conventions even where you would choose differently, and say the disagreement once in the report.

**Complete when:** each fix is a small, reviewable change tied to a finding, and shared-surface changes were agreed first.

## 7. Verify and report

Re-render what changed in every theme and at both viewports, and compare with the before screenshots. Run the project's lint, type, and visual or snapshot tests. Check that no fix reduced contrast, removed a focus indicator, or shrank a target; hand anything deeper to `accessibility`.

Report findings and changes as rows of principle, location, before, and after. Omit checks that passed. List separately the token gaps, the unconfirmed findings, and the judgement calls that need a designer's decision, such as a brand color that fails on a dark surface.

**Complete when:** the changes are confirmed on screen, the checks have run, and the report separates fixed, open, and needs-a-decision.

## Boundaries

- `accessibility` owns WCAG conformance, keyboard and screen-reader behavior, and contrast as a requirement. This skill raises those issues when it meets them and does not certify them.
- `performance` owns animation cost, layout shift, and render speed as measured outcomes.
- `coding-standards` owns component structure and state. `prototype` owns comparing several visual directions as a throwaway experiment; setting the one direction for a new or redesigned screen uses [DIRECTION.md](references/DIRECTION.md).
- `code-review` owns reviewing a change. This skill can supply the visual findings for one.
