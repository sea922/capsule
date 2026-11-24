# React and Next.js performance

Candidate causes and fixes for a React or Next.js application, highest usual
impact first. Use this after the limiter is confirmed by measurement: it says
where to look and what to try, not what is slow in this application. The
project's framework version and conventions decide the exact API; check the
docs for the installed version before applying a framework-specific item.

Work down the list. A re-render fix will not rescue a page that waits on five
sequential requests or ships a megabyte of JavaScript.

| Order | Area | Suspect it when |
| --- | --- | --- |
| 1 | Request waterfalls | An `await` is followed by another that does not depend on it; slow time to first byte or largest paint |
| 2 | Bundle size | Large first-load JavaScript, long blocking time, slow start on a mid-range phone |
| 3 | Server work | Slow server render, repeated queries in one request, large serialized payloads |
| 4 | Client data fetching | Duplicate requests for the same data, scroll or storage work on the main thread |
| 5 | Re-renders | Slow typing, slow interaction, a profiler showing wide commits for a small change |
| 6 | Rendering and hydration | Long lists, animation jank, flicker or layout shift on load |
| 7 | JavaScript hot paths | A profile that names a loop or a repeated computation |

Which metric points where: largest contentful paint to areas 1, 2, and resource
hints; interaction to next paint to areas 5, 6, and 7; layout shift to
Suspense placement and unsized media in area 6; blocking time to area 2 and
third-party scripts.

## 1. Request waterfalls

- **Run independent requests together.** Sequential awaits for data that does
  not depend on each other each add a full round trip. Start them together and
  await the group.
- **Start early, await late.** When only part of the work depends on an
  earlier result, start every promise as soon as its inputs exist and await
  each one where its value is first used.
- **Check cheap conditions first.** Test props, flags, and anything
  synchronous before awaiting remote data the branch may not need, and move an
  await into the branch that uses it.
- **Parallelize per item.** Enriching a list with one awaited call per element
  in a loop is a waterfall of N; map to promises and await them together, with
  a concurrency bound for large lists, or better, fetch the related data in
  one query.
- **Let sibling server components fetch on their own.** Awaits in one parent
  run in sequence; the same fetches placed in sibling components run in
  parallel.
- **Stream with Suspense.** Put boundaries near the slow data so the rest of
  the page paints first. Reserve the fallback's space, or the gain in paint
  time is paid back as layout shift.

## 2. Bundle size

- **Import directly, not through barrels.** A barrel makes the bundler walk
  everything it re-exports, and tree-shaking does not always remove it. Some
  frameworks offer a setting that rewrites imports for listed packages; other
  packages still need direct paths.
- **Keep dynamic import paths statically analyzable.** A fully computed path
  cannot be split or traced and can pull in a whole directory.
- **Load heavy, rarely used components on demand:** charts, editors, maps,
  admin panels, anything behind a click or a role. Give each a fallback with
  the right size.
- **Defer third-party scripts** such as analytics, chat, and tag managers
  until after the page is interactive, using the framework's script component
  or `defer`/`async`.
- **Preload on intent.** Start the import or the preload on hover or focus so
  the code has arrived by the click.
- Measure with the bundle analyzer for the installed framework before and
  after. Bundle size is a budget; `benchmark` can hold it.

## 3. Server work

- **Deduplicate within a request.** When several components need the same
  record, wrap the loader in the framework's per-request cache so one render
  makes one query.
- **Cache across requests only what does not vary per user**, such as
  configuration and lookup tables, with a bounded cache and a stated lifetime.
  Name the cache key and the staleness window as new invariants.
- **Never keep mutable per-user state at module scope.** Module state on the
  server is shared by every request. It is a correctness and privacy defect
  before it is a performance one.
- **Read static files once.** Fonts, templates, and other fixed assets read
  inside a handler are re-read on every request; load them at module scope.
- **Send less across the server-client boundary.** Props to client components
  are serialized into the response. Select columns in the query, strip unused
  fields, and paginate.
- **Avoid serializing the same data twice.** Passing one large object to
  several client components can serialize it once per consumer; restructure
  so one component receives it, or pass server-rendered children.
- **Move non-blocking work after the response.** Logging, analytics, and cache
  warming can run in the framework's after-response hook where one exists.
- A server action or route handler that skips authentication is not an
  optimization. Keep the checks; `security-review` owns them.

## 4. Client data fetching

- **Share requests through the project's data library.** Components asking
  for the same resource should hit one cache entry. A hand-written
  effect-and-fetch per component duplicates requests and has no stale-result
  guard.
- **Share global listeners.** One subscription for scroll, resize, or
  visibility serving many components beats one listener per component.
- **Mark scroll and touch listeners passive** when they never call
  `preventDefault`, so they cannot block scrolling.
- **Treat `localStorage` as slow.** It is synchronous. Read once and keep the
  value in memory, store small payloads, and version the stored shape so an
  old value is migrated or discarded instead of crashing.

## 5. Re-renders

Confirm with the React profiler that re-rendering is the cost. If the React
Compiler is enabled, most manual memoization below is done for you; check the
project's configuration first.

- **Derive during render.** State set from other state in an effect costs an
  extra render and can show a stale frame.
- **Subscribe narrowly.** Select the derived value a component needs (a
  boolean, a count), not the whole object. Do not subscribe to state that is
  only read inside a callback; read it when the callback runs.
- **Keep identities stable where a memoized child depends on them.** Hoist
  constant default arrays and objects to module scope, and use functional
  state updates so a callback does not depend on the current value.
- **Use primitives in dependency arrays.** An object literal is new every
  render and re-runs the effect each time.
- **Isolate expensive subtrees.** Extract the costly part into its own
  memoized component so unrelated parent state does not re-render it.
- **Mark non-urgent updates as transitions** so typing and clicking stay
  responsive while a large list filters, or defer the value that drives the
  expensive render.
- **Use a ref for values that change often and do not affect output**, such as
  timestamps, scroll positions, and accumulators.
- **Initialize expensive state lazily** by passing a function to `useState`.
- **Do not define components inside components**, and do not memoize trivial
  expressions; both make things slower.
- **Split a hook that combines unrelated inputs** so a change to one does not
  recompute the other.

## 6. Rendering and hydration

- **Skip offscreen work.** `content-visibility: auto` with an intrinsic size
  lets the browser skip rendering rows outside the viewport. Virtualize when
  the node count itself is the problem.
- **Animate compositor-friendly properties**, and animate a wrapper element
  rather than an SVG's own geometry.
- **Avoid hydration flicker.** For values needed before React mounts, such as
  theme or locale, set them from a small inline script, and keep server and
  client markup identical.
- **Suppress hydration warnings only on a known-divergent leaf**, such as a
  formatted local time. Never on an element with children.
- **Hide instead of unmounting** where the framework version offers a
  primitive for it, for tabs and panels whose state is expensive to rebuild.
- **Hint critical resources.** Preconnect to required origins and preload the
  resources the first paint needs, and no others; every hint competes for
  bandwidth.
- **Reduce SVG payload** by trimming coordinate precision and hoisting static
  markup out of components that re-render.

## 7. JavaScript hot paths

Only where a profile names the code.

- Build a `Map` or `Set` once for repeated lookups and membership tests
  instead of scanning an array each time.
- Combine chained passes over a large array into one, and find a minimum or
  maximum with a loop instead of sorting.
- Hoist regular expressions and other constant construction out of loops.
- Batch DOM reads and writes; interleaving them forces repeated layout.
- Schedule non-critical work for idle time.

## Before keeping a change

Each item above changes behaviour somewhere: parallel requests change failure
handling, caches add staleness, lazy loading adds a loading state, transitions
reorder updates. Name the new invariant, keep the checks green, and re-measure
with the same baseline procedure. Revert a change that does not move the
metric.
