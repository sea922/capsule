---
name: accessibility
description: Audit and fix user interfaces against WCAG 2.2 AA with evidence from the running app, not from reading markup. Use when asked to audit a page, screen, or component for accessibility, check keyboard, screen-reader, contrast, zoom, or focus behavior, fix accessibility violations, or answer whether UI is accessible or WCAG-compliant. Accessibility rules applied while writing code belong to coding-standards.
---

# Accessibility

Show that people using a keyboard, a screen reader, zoom, or high contrast can complete the task, on a scope you name. Scanners find a minority of barriers, and accessible-looking markup is unverified until it has been used the way those people use it.

## 1. Fix the scope

Write down what is covered: routes or screens, states (empty, loading, error, signed in), viewports, and browsers or platforms. The target is WCAG 2.2 AA unless the user or project names another. Everything outside the scope stays explicitly unverified.

An audit or a question is read-only. A request to fix authorizes local edits, not commits, publication, or new dependencies. Publishing an accessibility statement, filling in a conformance report such as a VPAT, or answering a customer questionnaire is a formal claim about the product: supply the evidence, and leave the claim to the user.

**Complete when:** the scope, standard, states, and edit authority are written down.

## 2. Review the code

Read the components in scope with the read-only `accessibility-reviewer` agent when available, or the same checklist directly. Code review finds likely barriers fast: clickable elements that are not buttons, inputs without labels, removed focus outlines, color as the only signal, and dialogs that do not manage focus. Treat its results as candidates for the later steps to confirm.

**Complete when:** each candidate has a location and the check that will confirm it.

## 3. Scan the running app

Render the real app at each route in scope, from a current build. Run the scanner the project already uses, such as an axe-based checker, the browser's accessibility audit, or a CI accessibility step, and record the tool, version, URL, and the exact failing rules. Do not install a new tool without asking. A clean scan is a floor, not a pass.

**Complete when:** each route has a recorded scan result, or the report states why no scan could run.

## 4. Test it by hand

Do every pass the scope allows, on the running app:

- **Keyboard**, with the pointer unused: tab order matches the visual order; every control is reachable and works with Enter, Space, and arrow keys; Escape closes overlays; nothing traps focus; focus returns after a dialog closes; the focus indicator is visible and not hidden behind sticky headers.
- **Screen reader**, on a named pairing such as VoiceOver with Safari or NVDA with Firefox: complete the task using only what is announced. Every control announces a name, role, and state; headings and landmarks describe the page; errors and status changes are announced when they happen.
- **Zoom and reflow**: 200% zoom and a 320 px wide viewport with no horizontal scrolling or lost content; the WCAG text-spacing settings with nothing clipped.
- **Contrast** on rendered pixels in every state: default, hover, focus, selected, disabled-but-informative, error, and text over images. Text needs 4.5:1, large text and interface components 3:1.
- **Other states**: submit the form empty, trigger errors, load empty lists, and check `prefers-reduced-motion` and forced-colors mode where the product supports them.

When a pass cannot be done, for example with no screen reader available, say so and narrow the claim. The accessibility tree shows what is exposed, not what is announced, so it does not replace a screen-reader pass. When the scan is clean but a manual pass fails, the manual result wins.

**Complete when:** each pass in scope has an observed result, quoted where it is an announcement, or is reported as not done.

## 5. Fix by root cause

Fix the cause before adding attributes: a native `<button>`, `<label>`, heading, or landmark first, and ARIA only where native elements cannot express the pattern. Wrong ARIA is worse than none. Fix shared components once rather than each use. After fixing, repeat step 3 and the affected passes from step 4, because accessibility fixes often break focus handling.

**Complete when:** each fixed barrier has been re-checked the same way it was found.

## 6. Report

Lead with the verdict for the stated scope. List findings most severe first, each with location, the WCAG success criterion, who it blocks, the evidence, and the fix:

| Severity | Meaning |
| --- | --- |
| Critical | Blocks a core task, such as a keyboard trap, an unlabeled required field, or an unannounced error |
| High | Makes content very hard to reach or understand, such as failing contrast or missing alternative text on informative images |
| Medium | Adds confusion or effort, such as skipped heading levels or vague link text |
| Low | A gap with small impact |

Then list what was not checked. Never conclude more than the evidence shows: zero scanner violations is not "accessible", a keyboard pass is not a screen-reader pass, and one verified route is not the product.

**Complete when:** the reader can tell what was verified, what failed, and what remains unverified.
