# Design direction

Read this when the scope is a new screen or a redesign, before any styling is written. An existing screen that only needs tightening skips this and goes through the audit in `interface-polish`. The project's design system, brand, and a designer's stated intent win over everything here; where they already answer a question below, record their answer instead of inventing one.

## 1. Write the direction down first

Five short answers, agreed with the user before coding:

- **Purpose.** The job the screen does, as one sentence with a verb. "Lets a support agent find and refund an order" is a purpose; "an orders dashboard" is not.
- **Audience.** Who uses it, how often, and what they need to see first. A screen used forty times a day is scanned, not read.
- **Tone.** One or two explicit words: utilitarian, editorial, playful, technical, dense, calm, refined. Pick from what the product already is, not from what is fashionable.
- **One memorable detail.** A single deliberate idea that makes the screen feel made for this product: a distinctive data display, a considered empty state, an unusually clear primary action. One is enough; five compete.
- **Constraints.** The framework and component library, the existing tokens, the target viewports, the themes, and the accessibility and speed requirements the result must meet.

Match the direction to the domain. A tool people work in all day is usually dense, quiet, and stable. A launch page, portfolio, or game can be expressive. Forcing a marketing layout onto a daily tool is the most common mismatch.

Record what each important choice rests on: a screen of the same product, a named reference the user supplied, or a stated assumption. A palette on its own is not a direction.

## 2. Design the content states

A screen is more than its full, successful state. For each state that applies, write three things: what triggers it, what the user sees, and the safe next action.

| State | What it needs |
| --- | --- |
| Loading | A stable structure that does not jump when content arrives, and a way to cancel where the operation supports it |
| Empty | Why there is nothing here, and one useful action to change that |
| Error | What failed in the user's terms, and how to recover |
| Partial | The data that did arrive, with the missing part clearly marked rather than silently absent |
| Success | Confirmation that the action completed, and the next step or an undo where one exists |
| Permission | Where the access boundary is, and how to request access or get back |

When a state does not apply, write the reason. "Could not test it" is an untested state, not an inapplicable one. How these states should look in detail is covered by the states checks in [DETAILS.md](DETAILS.md).

## 3. Build from what exists

- Make the working screen the first thing built, with real or realistic content. Placeholder text hides overflow, wrapping, and hierarchy problems.
- Use the project's components, tokens, icons, and routing before adding anything. A new visual system beside an existing one is drift on day one.
- Where the screen depends on images, charts, or media, use real or representative assets; filler imagery says nothing about the layout.
- Fix the dimensions that must not move: toolbars, grid tracks, tiles, counters, and controls keep their size when labels change or a hover state appears.
- Size type and spacing for the container and the content, not for impact.
- Add a dependency for a visual flourish only when it clearly pays for itself.

## 4. Patterns that read as generated

Avoid these unless the direction in step 1 calls for one by name:

- a gradient, decorative blobs, or heavy rounding applied because nothing else was chosen;
- a palette built from a single hue family, so nothing stands out;
- cards nested inside cards;
- an oversized hero and vague headline on a screen whose job is a task;
- the primary object or workflow pushed below sections that describe it;
- text in the interface explaining features the controls already make clear;
- the same decorative treatment on every element, which removes hierarchy.

## 5. Rendered finish gate

Source inspection cannot pass this gate. Open the screen and check:

- every target viewport from the constraints, narrow and wide, with long labels and long content;
- every theme the product ships;
- each content state from step 2, including partial data;
- that the first view shows the product, object, or workflow, not a description of it;
- that hierarchy supports scanning: one primary action, a clear order of emphasis;
- keyboard reach, visible focus, and target sizes, handing anything deeper to `accessibility`;
- that motion clarifies a change and does not cover for slowness; measured speed belongs to `performance`.

Keep a screenshot for each viewport and state checked, and say what each shows. Report states and viewports you could not exercise as untested. Then run the audit steps of `interface-polish` on the result, because a new screen drifts from the tokens as easily as an old one.
