# Frontend standards

Apply the sections touched by the change. Reuse the project's components,
design tokens, routing, and data libraries.

## Components and interaction

Keep each component's responsibility and public inputs clear. Put feature logic
with its owning feature; extract shared components when callers share a stable
contract. Follow the existing design system for presentation.

Use semantic controls with accessible names, keyboard operation, and visible
focus. Associate labels and validation feedback with form fields. Preserve
focus through dialogs and dynamic updates using the framework or component
library's established behavior. Check the changed interaction with a keyboard.

For each async interaction, represent the relevant loading, empty, error, and
success states. Keep user input recoverable after failure and make repeated
submission behavior explicit. A disabled appearance must match actual behavior.

## State and data

Keep one owner for each fact. Derive values from existing state when possible;
introduce shared state when multiple consumers need the same authoritative fact.
Separate server data lifecycle from temporary UI state using existing facilities.

Ensure an older request cannot overwrite the current query's result. Use the
project's data library or an explicit cancellation/stale-result guard. Handle
errors and cleanup, and bind loading state to the active operation rather than
whichever request finishes first.

Example: a search for `cat` followed by `car` must retain `car` results even if
the `cat` request finishes last. Test that ordering, not just one successful
response. Reuse an installed query library before creating another fetching
abstraction.

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

## Evidence

Use existing component and integration checks for the changed behavior. Exercise
relevant keyboard paths, async ordering, errors, and narrow viewport behavior.
For visual changes, inspect the rendered result. Profile before accepting a
performance claim. Report unavailable browser or assistive-technology checks
without equating static inspection with an exercised interaction.
