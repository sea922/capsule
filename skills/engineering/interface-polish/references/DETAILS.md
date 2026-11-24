# Polish details

Checks for step 4 of `interface-polish`. Each is a default that yields to the project's design system and to a designer's stated intent. The numbers are starting points; the product's own tokens win when they exist.

## Shape and alignment

- **Nested radius.** When a rounded element sits inside another with little padding, the outer radius should be about the inner radius plus the padding between them. The same radius on both makes the gap look pinched at the corners. With generous padding the two read as separate surfaces and the arithmetic no longer matters.
- **Optical alignment.** Geometric centering is not always visual centering. Play triangles, arrows, chevrons, and other asymmetric glyphs usually need a small offset inside their button; text next to an icon may need a pixel of adjustment to sit on the same line by eye. Fix the asset's own box when you can, and adjust padding otherwise.
- **Consistent icon sizing.** Icons in one row share a size and stroke weight, and are sized from a small set of steps.

## Borders, shadows, and images

- **Borders separate, shadows lift.** Use a border to divide regions or outline a control. Use a shadow when a surface sits above another: menus, popovers, dialogs, raised cards. A surface rarely needs a heavy version of both.
- **Layered, low-opacity shadows.** One hard, dark shadow looks pasted on. Two or three soft layers of transparent shadow read as depth and hold up on different backgrounds. Check them in dark themes, where shadows nearly vanish and a lighter surface or subtle border carries elevation instead.
- **Image edges.** An image whose edge color matches the surface bleeds into it. A one-pixel inset outline in neutral, low-alpha black (or white in dark themes) holds the edge. Keep it neutral; do not tint it with the brand color.

## Text

- **Wrapping.** Balance the lines of headings and short titles so a single word is not stranded (`text-wrap: balance`). Avoid orphans in short descriptions and captions (`text-wrap: pretty`). Leave long prose, code, and preformatted text alone.
- **Numerals.** Counters, timers, prices, and table columns that update or align use tabular figures (`font-variant-numeric: tabular-nums`) so digits do not shift width.
- **Truncation.** Text that can overflow has a decided behavior: wrap, clamp to a set number of lines, or truncate with the full value reachable.
- **Font rendering.** If the project sets font smoothing, it is set once at the root. Adding it is a visible, product-wide change; raise it instead of slipping it in.

## Motion

- **Transitions for state, keyframes for sequences.** Hover, press, open, and close use transitions, which can reverse cleanly when the user changes their mind partway. Keep keyframe animation for staged entrances and loading loops.
- **Short and asymmetric.** Interface state changes sit around 100–250ms. Exits are shorter and quieter than entrances. Anything a user triggers repeatedly should feel instant.
- **Small movements.** An entrance combines opacity with a few pixels of travel. A press may scale a button down slightly. Movement large enough to notice as movement is usually too large.
- **Named properties only.** List the properties that change instead of `transition: all`, which animates things you did not intend, such as layout or color on theme switch. Use `will-change` only on a property that visibly stutters on its first frame, and never as a blanket.
- **Reduced motion.** With the reduced-motion preference set, travel and scale are removed or replaced with a fade. The requirement itself belongs to `accessibility`.
- **No motion without a reason.** Each animation either shows where something came from, confirms an action, or holds attention during a wait. Scroll-triggered effects on ordinary content rarely qualify.

## States and targets

- **Every interactive element has its states.** Hover, pressed, focus-visible, disabled, and, where relevant, selected and loading. A missing pressed state is the most common reason a control feels dead.
- **Every view has its states.** Loading, empty, error, and partial content each have a designed appearance; a blank area or a layout jump is a finding.
- **Hit areas.** A control's clickable area is at least about 40 by 40 CSS pixels, and 44 where the layout allows, even when the visible glyph is smaller. Extend it with padding or a pseudo-element, and make sure neighbouring areas do not overlap.
- **Stable layout.** Content that loads or changes state does not move what the user is about to click: reserve space for images, badges, and async text.
- **Cursor and selection.** Clickable things signal it; decorative text on controls is not accidentally selectable while dragging.

## Report rows

| Principle | Location | Before | After |
| --- | --- | --- | --- |
| Nested radius | `Card.css:12` | Card and inner image both 12px with 8px padding | Card 20px, image 12px |
| Numerals | `Timer.tsx:30` | Countdown shifts as digits change | Tabular figures |
| Transition scope | `button.css:4` | `transition: all 0.3s` | `background-color, transform` at 150ms |
