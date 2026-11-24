# Frontend standards

Apply the sections touched by the change. Reuse the project's components,
design tokens, routing, and data libraries.

## Components and interaction

Keep each component's responsibility and public inputs clear. Put feature logic
with its owning feature; extract shared components when callers share a stable
contract. Follow the existing design system for presentation.

Use semantic controls with accessible names, keyboard operation, visible
focus, and WCAG 2.2 AA touch targets (at least 24×24 CSS px where applicable). Associate persistent visible `<label>` elements (not placeholder-only text) and validation feedback with form fields. Preserve
focus through dialogs and dynamic updates using the framework or component
library's established behavior. Check the changed interaction with a keyboard. A full audit against WCAG belongs to `accessibility`.

For each async interaction, represent the relevant loading, empty, error, and
success states. Keep user input recoverable after failure and make repeated
submission behavior explicit. A disabled appearance must match actual behavior.

## State and data

Keep one owner for each fact. Derive values from existing state when possible;
introduce shared state when multiple consumers need the same authoritative fact.
Separate server data lifecycle from temporary UI state using existing facilities.

Ensure an older request cannot overwrite the current query's result. Reuse the
project's installed data/query library before creating another fetching
abstraction, or use an explicit cancellation/stale-result guard and test out-of-order responses. Handle
errors and cleanup, and bind loading state to the active operation rather than
whichever request finishes first.

## Rendering and framework behavior

For React, keep render pure, follow hook rules, and update state through its
owner. Use a functional state update when the next value depends on prior state.
Use effects for synchronization with external systems; derive renderable data
during rendering when no synchronization is needed.

Before adding memoization, identify the expensive computation or unstable
identity that matters and check compiler support. In a React Compiler project,
account for automatic memoization. Add manual memoization for demonstrated need,
not as a requirement on every component or callback.

When browser and server rendering coexist, keep secrets and privileged access
on the server, and follow the framework's serialization and hydration rules.
Client-side checks improve interaction but cannot establish authorization.

React idioms, testing setup, and Next.js and Vite traps are in the
[React standards](REACT.md).

## Failure, load, and motion

Contain failures. Put an error boundary, or the framework's equivalent, around
each independently useful region so one broken widget does not blank the page.
Give it a way to retry and report what it caught. Boundaries catch rendering
errors; handle event-handler and asynchronous failures where they occur.

Load heavy, rarely used UI on demand, such as charts, editors, and admin
screens, with a fallback sized like the content. Render long lists
incrementally, with pagination or the project's virtualization library, once
profiling shows the list is the cost, and re-check keyboard and screen-reader
behavior afterwards.

Rate-limit work driven by typing, scrolling, or resizing: debounce or throttle
the value that triggers the request or the computation, not the input itself.

Use the project's animation library and tokens. Animate transform and opacity,
keep exit animations from blocking the next interaction, and honor
`prefers-reduced-motion`.

## Evidence

Use existing component and integration checks for the changed behavior. Exercise
relevant keyboard paths, async ordering, errors, and narrow viewport behavior.
For visual changes, inspect the rendered result. Profile before accepting a
performance claim. Report unavailable browser or assistive-technology checks
without equating static inspection with an exercised interaction.
