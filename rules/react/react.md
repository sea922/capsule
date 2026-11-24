---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---
# React

Defaults for where the project is silent. Its framework, component library, and
existing patterns come first.

## Components

- Write function components. Keep each one focused, and lift a piece out when
  it has its own state or is reused.
- Reuse the project's design-system components before writing new markup.
- Give list items a stable `key` from the data, never the array index when the
  list can reorder or change.
- Derive values during render instead of storing them in state. State holds
  only what cannot be computed from props and other state.

## Hooks

- Call hooks at the top level of a component or a custom hook, never inside a
  condition or loop.
- List every value an effect, memo, or callback reads in its dependency array.
  Do not silence the exhaustive-deps lint rule; restructure instead.
- Use an effect only to synchronize with something outside React. Do not use
  one to transform data for rendering or to respond to a user event: compute
  during render, or do the work in the event handler.
- Every effect that subscribes, starts a timer, or fetches returns a cleanup,
  and ignores or aborts a stale response.
- Use the updater form (`setCount(c => c + 1)`) when new state depends on old.
- Add `useMemo`, `useCallback`, or `memo` only for a measured problem or a
  dependency that must stay stable.

## State and data

- Keep state as close to where it is used as possible. Reach for context or a
  store only when distant components truly share it.
- Fetch through the project's data layer, and handle loading, empty, and error
  states for every request.
- In frameworks with server components, keep components on the server by
  default and mark only interactive ones as client components.

## Accessibility

- Use native elements: `button` for actions, `a` for navigation, `label` tied
  to every input. A clickable `div` is a defect.
- Every interactive element is reachable and usable by keyboard, with a visible
  focus indicator. Dialogs move focus in, keep it inside, and return it on close.
- Images have `alt` text, or an empty `alt` when decorative.

## Tests

- Test what a user sees and does, querying by role and label, not by class
  name or component internals.

## Security

- Never pass unsanitized content to `dangerouslySetInnerHTML`.
- Validate URLs before using them in `href` or `src`; reject `javascript:` URLs.
