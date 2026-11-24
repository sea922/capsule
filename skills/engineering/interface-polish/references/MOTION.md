# Motion

The project's own conventions and existing motion tokens win. Read this when the work in scope adds, changes, or audits animation beyond the motion checks in [DETAILS.md](DETAILS.md), which cover transition scope, timing, and travel for ordinary state changes. Every number here is a starting point for a product that has none of its own.

## When motion earns its place

An animation stays only if it does one of three jobs: it guides attention to what changed, it communicates state (pressed, loading, saved, failed), or it keeps spatial continuity so the user sees where something came from or went. An animation that does none of these is decoration, and decoration is the first thing to remove.

Responsiveness outranks smoothness. A transition that delays the next click, blocks input until it finishes, or cannot be interrupted is a defect however smooth it looks. Check each animation by using the control quickly and repeatedly, not by watching it once.

## Tokens

Motion values belong with the other design tokens, in the same file and naming style. An inline duration or spring setting in a component is drift, reported like a hardcoded color. A small set covers most products:

| Token kind | Typical steps | Notes |
| --- | --- | --- |
| Duration | instant (under 100ms), fast (150–200ms), normal (250–350ms), slow (around 500ms) | Tooltips and focus rings take the shortest; press and toggle feedback is fast; dialogs and panels are normal; slow is for a rare large entrance |
| Easing | a decelerating curve for entrances, a standard in-out for moves, linear | Linear only for constant motion such as a spinner or shimmer |
| Distance | a few steps from about 4px to 24px | Travel grows with the size of the element, not with its importance |
| Scale | a subtle press (about 0.97–0.98) and a small pop | A press that shrinks further than that reads as a toy |
| Spring presets | a quick one for controls, a softer one for surfaces landing, one for drag release | Name them by use, and keep the stiffness and damping numbers in one place |

Choose a spring when the motion follows the user's hand or can be interrupted partway, because a spring continues from the current velocity. Choose a duration and curve for discrete state changes whose length should be predictable. A bouncy spring suits a playful moment and wears badly on a control used fifty times a day.

When the project has no motion tokens, propose the set from the values already in use (step 2 of the skill) instead of introducing a new scale.

## Reduced motion

The user's reduced-motion preference outranks every design preference. With it set:

- Remove travel, scale, rotation, parallax, and autoplaying loops.
- Keep state legible: a short opacity fade (about 200ms or less) or an instant change replaces the movement. Motion must not vanish in a way that makes an element pop in from nowhere or causes a layout jump.
- Keep essential progress feedback such as a spinner or progress bar, simplified where possible.

Apply the preference in one shared place (a media query at the token level, or one hook or wrapper) so a new component cannot forget it. Check it by turning the setting on in the operating system or the browser's rendering tools and walking the screens. The conformance requirement itself belongs to `accessibility`.

Treat constrained devices as a second, lower-priority signal: where the project detects them, drop non-essential animation there first. Do not invent device detection for this purpose alone.

## Cost

- Animate `transform` and `opacity`. Animating width, height, top, left, margin, or padding forces layout on every frame; express the same change as a translate or scale, or let a layout-animation feature do the measuring.
- Do not read layout (sizes, offsets, scroll position) and write styles in the same frame loop.
- Blur, large shadows, and filters are expensive to animate; fade a pre-rendered layer instead.
- An infinite animation pauses when it is off screen or the tab is hidden. A background tab running a shimmer is wasted battery.
- Derive continuously changing values (pointer position, scroll progress) outside the component render cycle, so each frame does not re-render the tree.
- Verify on a throttled CPU profile and a real mid-range phone. Measured frame cost and layout shift belong to `performance`.

## Server rendering and hydration

The first client render must match what the server sent. An element the server rendered visible, whose animation starts from hidden, flashes or raises a hydration warning. Choose one per case:

- Content present in the server HTML starts in its final state and does not animate on first load.
- An entrance that matters runs only after mount, or is done in CSS so no script state is involved.
- Nothing reads `window`, `navigator`, or a media query at module scope; guard those reads or do them after mount.

## Patterns: decisions and traps

**Press and hover feedback.** Fast, small, and interruptible: a slight scale or background change. Use the quickest token; a control that lags behind the finger feels broken. Hover effects do not exist on touch, so nothing may depend on them.

**Dialogs, sheets, and popovers.** Fade the backdrop; the surface adds a small rise or scale from where it was triggered. The exit is shorter than the entrance. Animation never replaces the behavior: focus moves in and is trapped, Escape closes, the page behind does not scroll, and the dialog role is set. Prefer a component that already provides these and animate that.

**Toasts.** Enter from the edge they are anchored to and leave the same way. When one leaves, the rest slide to close the gap instead of jumping. Auto-dismiss pauses on hover and focus.

**Staggered lists.** A delay of roughly 50–100ms between items; shorter looks mechanical and longer feels slow. Cap the total: stagger the first several items and bring the rest in together, so a long list does not make the user wait. Do not replay the stagger on every data refresh.

**Exit animations.** Define the exit when you define the entrance. An exit needs the element to stay mounted until it finishes, which most frameworks do only through a presence mechanism, and it needs a stable key so the framework knows which element is leaving. Check that an element removed mid-entrance leaves cleanly.

**Page transitions.** Keep them brief (the fast or normal token) and let the old view finish leaving before the new one enters, or the two overlap and reflow. A transition must never delay navigation the user can perceive as slow, and must not restart when only a query parameter changes. Scroll position and focus still reset correctly.

**Scroll-triggered entrances.** Run once; replaying each time the element re-enters the viewport distracts. Start the reveal a little before the element is fully in view, and leave above-the-fold content alone. Ordinary content rarely needs it.

**Scroll-linked values.** A progress bar or parallax tied to scroll position updates from the scroll value directly, not through state updates per scroll event. Keep the linked movement small.

**Layout animation.** Animating an element's change of size or position in place suits small, isolated shifts: an expanding card, an accordion, a reordered item. On a large or deeply nested subtree it measures too much each frame; use explicit transforms there. Text inside a resizing container should animate position only, or it distorts while it scales. A shared-element transition between two views needs both ends to use the same identifier and comparable shapes.

**Drag and gestures.**

- Decide the outcome from distance and velocity together, with explicit thresholds: a short fast flick and a long slow drag can both mean dismiss.
- Constrain the axis and the bounds, and on release hand off to a spring so the element continues from the finger's velocity.
- Test on a touch device; thresholds tuned with a mouse feel wrong under a thumb.
- Every drag action has a non-drag equivalent (a button or a keyboard command).
- A drag surface must not swallow the page's vertical scroll.

**Text and numbers.** Word or character reveals split text into pieces, which can break screen-reader output and wrapping; keep the full text available to assistive technology and limit this to short headings. A counting number uses tabular figures and lands on the exact final value.

**SVG.** Drawing a path on works by animating the stroke's visible length. Morphing between two paths interpolates only when both have the same sequence of commands; otherwise it snaps.

**Loaders.** A skeleton matches the shape of the content it stands for, so nothing moves when the content arrives. A button's loading state keeps the button's width. Spinners appear only after a short delay, so fast responses do not flash one.

**Imperative sequences.** A multi-step sequence must be safe to interrupt: starting it again, or unmounting mid-way, cancels the earlier run. Every listener, timer, or animation started in an effect is stopped in its cleanup.

## React, with the Motion library as the example

This section assumes a React or Next.js project that already uses the Motion library (published as `motion`, formerly Framer Motion). Its API and import paths have changed between major versions: read the installed version's documentation before writing code, and follow the import style the project already uses instead of mixing two.

- **Client boundary.** In a framework with server components, files that use the animation components are client components. Keep that boundary small: wrap the animated leaf, not the page.
- **Initial state and hydration.** The component's initial state is what renders on the server. Follow the rules above; where a server-rendered element should not animate on load, set its initial state to the final one or disable the initial animation.
- **Reduced motion.** The library exposes the user's preference as a hook and as a provider-level setting. Use one of them centrally and have components read tokens that already account for it.
- **Exit.** The presence component must wrap the conditional, its direct child needs a stable `key`, and the child needs an exit state. Missing any one makes the exit silently not run. Its mode decides whether the leaving and entering children overlap: wait for route and content swaps, overlap for stacked items, and the layout-popping mode for items removed from a flowing list.
- **Variants** carry a stagger from parent to children; keep the timing in the token file.
- **Layout.** The `layout` prop animates an element's own size or position change; a shared layout identifier links two elements across renders. Use the position-only variant on text.
- **Motion values.** Create them with the library's hooks inside the component, never by constructing one during render, and derive dependent values with its transform helper so updates skip React rendering.
- **Imperative animation.** The scoped animate hook needs its ref attached to a mounted element; call it from an effect or an event handler, not during render.
- **Tokens stay in one module.** Components import durations, curves, and springs from it:

```tsx
<motion.button whileTap={{ scale: tokens.scale.press }} transition={springs.control} />
```

A project that animates with CSS transitions, the View Transitions API, or another library follows the same decisions above with that tool's mechanics. Do not add a second animation library to a project that has one.

## Checking motion

Record a before and after clip or step through the animation in the browser's animation inspector at reduced speed; a diff cannot show timing. For each animation in scope confirm: it has a reason, it uses tokens, it survives rapid repeated input, its exit runs, it respects reduced motion, and nothing shifts when it ends.
