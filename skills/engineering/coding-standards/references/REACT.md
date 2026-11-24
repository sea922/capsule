# React standards

The project's component library, router, data layer, and lint configuration
decide; what follows are defaults for where they are silent. This is the layer
under the React rules and the [frontend standards](FRONTEND.md): it assumes the
rules of hooks, the state-location ladder, and the query-priority order, and
covers the judgement calls and traps beneath them. Skip the framework sections
that do not apply. Measured rendering problems belong to `performance`, which
has its own [React reference](../../performance/references/REACT.md).

## Component contracts

- **Props describe what live callers pass.** A prop made optional for a story,
  a test, or a demo adds a state the application never enters and a fallback
  branch nobody exercises. Find the real call sites first; make stories and
  tests supply the real contract.
- **Model variants as a union, not as flags.** `variant: 'link' | 'button'`
  with the props each needs beats `href?`, `onClick?`, and a runtime check for
  the combination nobody intended.
- **Never define a component inside another component.** Each render creates a
  new component type, so React unmounts and remounts the subtree and its state
  is lost. Move it to module scope and pass what it needs.
- **Reset with `key`.** When a component should start fresh for a different
  entity, give it `key={entity.id}`. An effect that copies props into state to
  "reset" it renders stale data once first.
- **Controlled or uncontrolled, not both.** A component that accepts `value`
  must not also keep its own copy. If it supports both modes, follow the
  platform's naming (`value` with `onChange`, or `defaultValue`).
- **Prefer `children` and slots to configuration props.** A component growing
  `renderHeader`, `headerClassName`, and `showHeaderIcon` wants a slot.
- Spreading unknown props onto a DOM element forwards whatever the caller
  passes, including event handlers and attributes that were never intended.
  Pick the props a wrapper forwards.

## State and effects

- **Move state down before lifting it up.** State that lives higher than its
  consumers re-renders everything between. Lift only when two branches need it.
- **Split context by rate of change.** One context holding theme, user, and
  notifications re-renders every consumer for every notification. Separate
  what rarely changes from what often does, and memoize a provider's value
  object so it is not a new identity on each render.
- **Context is transport, not a store.** For frequently changing shared state,
  use the project's store with selectors, or `useSyncExternalStore`.
- **An effect that only sets state from props or state is a derived value.**
  Compute it during render. An effect that runs in response to a user action
  belongs in the event handler, where it runs once and has the event's data.
- **Every async effect needs an answer for "what if this is no longer
  current?"** Cancel with an `AbortController` or ignore the stale result, and
  test responses arriving out of order.
- **Debounce the value that feeds the request, not the input.** The field
  stays responsive, the query key takes the debounced value, and the query is
  disabled while the value is empty.
- **Optimistic updates need a rollback path.** Show the pending item
  distinctly, restore the previous state on failure, and tell the user. When
  the framework provides an optimistic-state hook, use it over hand-rolled
  bookkeeping.
- **Development double-invocation is a test.** Strict mode mounts, unmounts,
  and remounts in development. An effect that misbehaves the second time is
  missing cleanup; do not silence it with a "has run" ref.

## Rendering judgement

- `React.memo` earns its place only when a component re-renders often, with
  props that are usually equal, and its render is measurably expensive. When
  props differ on most renders, the comparison is pure cost.
- A default written inline (`items ?? []`, `style={{}}`, an inline callback)
  is a new identity every render and defeats a memoized child. Hoist constant
  defaults to module scope.
- `{count && <Badge />}` renders `0` when the count is zero. Use a ternary or
  a boolean expression for anything that is not already boolean.
- Virtualize a long list when profiling shows the list is the cost, using the
  project's virtualization library. Virtualization changes keyboard, find-in-
  page, and screen-reader behaviour; check them after.
- With the React Compiler enabled, manual `useMemo` and `useCallback` are
  mostly noise. Check the project's configuration before adding or removing
  them.

## Server and client components

- **Module scope on the server is shared across requests.** A mutable
  module-level variable is a data leak between users. Use request-scoped
  storage.
- **Props crossing to a client component are serialized and shipped.** Pass
  the fields the client renders, not the record. Functions, class instances,
  and anything secret do not cross.
- **A server action is a public endpoint.** Authenticate, authorize the
  specific record, and validate the input inside it, however the calling
  component is gated.
- **Push `"use client"` down the tree.** Marking a layout as a client
  component pulls everything it imports into the bundle. Pass server-rendered
  content through `children` instead.
- **Place Suspense near the data and reserve the space.** A boundary at the
  route root blocks the whole page on its slowest part; a fallback without a
  matching size shifts the layout when content arrives.

## Errors

- Error boundaries catch errors thrown while rendering. They do not catch
  errors in event handlers, in asynchronous code after the render, or in the
  boundary itself. Handle those where they happen, or route them to the
  boundary through the data library or the framework's mechanism.
- Give a boundary a way to recover: a retry that resets it, and a reset when
  the route or the entity changes. A boundary that shows a dead end until
  reload is half finished.
- Report the error to the project's logging from the boundary. A fallback
  that hides the failure from the team is a silent failure.

## Testing

- **Fail on unmocked requests.** Configure the network mock so an unhandled
  request fails the test, and reset its handlers after each test so an
  override cannot leak.
- **Fresh providers per test.** Build a new query client for each render with
  retries off. A shared cache passes state between tests; retries turn a
  failing-response test into a timeout.
- **One render helper.** Wrap the router, theme, store, and data providers in
  a single project helper so no test assembles them by hand.
- **Testing a boundary.** Render a child that throws, assert the fallback, and
  silence the expected console error with a spy that is restored in `finally`,
  so it cannot hide real errors in later tests.
- **Testing Suspense.** Assert the fallback first, then `await` the content
  with an async query. Do not assert on timing.
- **Timers.** With fake timers, configure the interaction library to advance
  them, or interactions hang. Prefer real timers and async queries unless the
  delay itself is under test.
- **An `act()` warning is a defect.** It marks a state update the test did not
  wait for, often an update after unmount.
- **Check that the test can fail.** Break the behaviour and watch the test go
  red. A test that stays green proves nothing.
- Mock a child component only when it has heavy side effects. A parent tested
  against mocked children verifies wiring that the type-checker already checks.
- Test order: the simplest rendered case, then interaction, then loading,
  empty, and error states. `tdd` owns the test-first cycle.

## Next.js

Next.js changes its conventions between major versions. Read the installed
version and its docs before applying or flagging any of the following.

- **Caching defaults move.** Whether a fetch, a route handler, or a page is
  cached by default has changed more than once. State the intended caching or
  revalidation explicitly instead of relying on the default, and confirm the
  behaviour in a production build; development mode does not cache the same
  way.
- **File conventions are versioned.** The request-interception file was
  renamed in a recent major (`middleware` to `proxy`). Do not "fix" a filename
  from memory; check the docs for the installed version.
- **The bundler is versioned.** Recent releases use Turbopack for development
  by default and offer it for builds. If a webpack-only plugin or a custom
  webpack config is in play, confirm which bundler runs before debugging a
  build difference. The flag to opt out depends on the version.
- **Slow development server.** Confirm the default bundler is active and that
  nothing clears the on-disk cache between runs before blaming the code.
- **Bundle size.** Use the framework's bundle analysis for the installed
  version. Barrel imports from large packages are the usual finding; the
  package-import optimization setting covers listed packages only.
- **Route-level `loading` and `error` files** are Suspense and error
  boundaries. The same placement rules apply.
- **Environment variables** with the public prefix are inlined into the client
  bundle at build time. Changing one needs a rebuild, and none may hold a
  secret.

## Vite

- **`vite build` does not type-check.** It transpiles. Confirm CI runs the
  type-checker separately, or that a checker plugin is installed.
- **Development and production use different pipelines.** Development serves
  unbundled modules; the build bundles them. CommonJS dependencies are where
  the two differ. Verify with a build and `vite preview` before release.
  `vite preview` is a smoke test, not a production server.
- **The client prefix is not a security boundary.** Every prefixed variable is
  inlined into the bundle. Setting `envPrefix` to an empty string, or calling
  `loadEnv` with an empty prefix and passing the result to `define`, exposes
  server secrets.
- **Production source maps publish the source.** Leave them off, or use hidden
  maps uploaded to the error tracker and removed from the deployed output.
- **Stale pre-bundle cache.** After patching a dependency or switching
  branches, phantom errors often come from `node_modules/.vite`. Clear it
  before debugging further.
- **Stale chunks after a deploy.** Open sessions request old hashed files that
  no longer exist. Keep previous assets available for a while, or catch the
  failed dynamic import and reload.
- **Containers and proxies.** The dev server binds to localhost by default;
  set `server.host` in a container, and the HMR client port when behind a
  proxy.
- **Monorepos.** File serving is restricted to the project root; allow the
  workspace root explicitly when importing sibling packages.
- **Aliases.** Reuse `tsconfig` paths through a plugin instead of repeating
  them in `resolve.alias`.
- **Slow dev server.** Barrel files and extensionless imports cost the most.
  Profile with the CLI's profiling option before changing configuration, and
  suspect community plugins' startup hooks.
- **Library mode.** Declarations are not emitted without a plugin or a
  separate `tsc` step, and every peer dependency must be externalized or
  consumers get two copies of it.
- **SSR failures on a dependency** are usually fixed in `ssr.noExternal` or
  `ssr.external`, not in application code.
- **Legacy-browser plugin.** It adds a large second bundle. Add it for a
  measured audience, not by default.
- Option names and the underlying bundler have changed across Vite majors
  (for example the name of the bundler-options key). Check the docs for the
  installed version before editing `vite.config`.
