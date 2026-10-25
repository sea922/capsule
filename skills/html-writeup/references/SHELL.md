# The document shell

One `.html` file. CSS, JavaScript, data, and images stay inline, so it opens offline from a double-click and travels as a single attachment. No build step, permanent server, or webfont is required.

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ what this write-up answers }}</title>
    <style>
      :root {
        color-scheme: light dark;

        --bg:      light-dark(#fafaf9, #0c0a09);
        --surface: light-dark(#ffffff, #1c1917);
        --ink:     light-dark(#1c1917, #f5f5f4);
        --muted:   light-dark(#57534e, #a8a29e);
        --border:  light-dark(#e7e5e4, #292524);
        --accent:  light-dark(#0f766e, #2dd4bf);
        --mark:    light-dark(#fef3c7, #422006);

        /* Role-based type ramp. Major heading steps carry size contrast;
           metadata and captions also use weight, case, and spacing. */
        --text-xs:   0.75rem;    /* eyebrows, captions, table headers */
        --text-sm:   0.875rem;   /* secondary, footnotes */
        --text-base: clamp(1rem, 0.96rem + 0.2vw, 1.0625rem);
        --text-lg:   1.35rem;    /* h3, lede */
        --text-xl:   1.75rem;    /* h2 */
        --text-2xl:  clamp(2.1rem, 1.6rem + 2vw, 2.8rem); /* h1 */

        /* Spacing — 4pt base. Named by role, so rhythm is a choice, not arithmetic. */
        --space-2xs: 0.25rem;
        --space-xs:  0.5rem;
        --space-sm:  0.75rem;
        --space-md:  1rem;
        --space-lg:  1.5rem;
        --space-xl:  2.5rem;
        --space-2xl: clamp(3rem, 6vw, 4.5rem);  /* between sections */

        --measure: 68ch;
        --wide: 900px;
        --radius: 10px;
      }
      * { box-sizing: border-box; }
      html { -webkit-text-size-adjust: 100%; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
          Helvetica, Arial, sans-serif;
        font-size: var(--text-base);
        line-height: 1.65;
        -webkit-font-smoothing: antialiased;
      }

      /* Profiles tune reading posture without inventing a second design system. */
      body[data-profile="analytical"] {
        --measure: 74ch;
        --wide: 1080px;
        --space-2xl: clamp(2.25rem, 4vw, 3.25rem);
      }
      body[data-profile="operational"] {
        --measure: 72ch;
        --wide: 1020px;
        --space-2xl: clamp(2.5rem, 4.5vw, 3.75rem);
      }
      body[data-profile="showcase"] {
        --measure: 62ch;
        --wide: 1120px;
        --space-2xl: clamp(4rem, 8vw, 7rem);
      }

      /* Prose holds a readable measure; .wide breaks out for tables and diagrams. */
      main {
        display: grid;
        grid-template-columns: 1fr min(var(--measure), calc(100% - 3rem)) 1fr;
        padding: clamp(2rem, 5vw, 4rem) 0 6rem;
        row-gap: var(--space-md);   /* tight *within* a section… */
      }
      main > * { grid-column: 2; }
      main > .wide {
        grid-column: 1 / -1;
        width: min(100% - 3rem, var(--wide));
        margin-inline: auto;
      }

      h1, h2, h3 { line-height: 1.15; text-wrap: balance; margin: 0; }
      h1 { font-size: var(--text-2xl); letter-spacing: -0.02em; }
      h2 {
        font-size: var(--text-xl); letter-spacing: -0.015em;
        margin-top: var(--space-2xl);  /* …generous *between* them. */
      }
      h3 { font-size: var(--text-lg); margin-top: var(--space-lg); }
      p, li { text-wrap: pretty; }
      p { margin: 0; }
      a { color: var(--accent); text-underline-offset: 2px; }
      strong { font-weight: 650; }
      mark { background: var(--mark); color: inherit; padding: 0 0.15em; }

      .lede { font-size: var(--text-lg); color: var(--muted); text-wrap: pretty; line-height: 1.45; }
      .meta {
        font-size: var(--text-xs); color: var(--muted);
        text-transform: uppercase; letter-spacing: 0.08em;
      }
      /* header is one tight group: eyebrow, title, lede belong together */
      header { display: grid; gap: var(--space-xs); }

      :where(a, summary, [tabindex]):focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 3px;
        border-radius: 3px;
      }
      /* anchor links from the contents list don't hide headings under the top edge */
      [id] { scroll-margin-top: 2rem; }

      @media (prefers-reduced-motion: no-preference) {
        html { scroll-behavior: smooth; }
      }

      @media print {
        :root { color-scheme: light; }
        body { font-size: 10.5pt; }
        main { display: block; padding: 0; max-width: none; }
        main > .wide { width: auto; }
        h2 { break-after: avoid; }
        figure, table, .callout, .stats { break-inside: avoid; }
        a::after { content: " (" attr(href) ")"; font-size: 0.85em; color: #555; }
        a[href^="#"]::after { content: ""; }
        @page { margin: 18mm; }
      }
    </style>
  </head>
  <body data-profile="editorial">
    <main>
      <header>
        <p class="meta">{{ context — repo, date, scope }}</p>
        <h1>{{ the question this answers }}</h1>
        <p class="lede">{{ the answer, in one or two sentences }}</p>
      </header>

      <h2 id="section-one">{{ section }}</h2>
      <p>{{ prose at a readable measure }}</p>

    </main>
  </body>
</html>
```

## Why each piece is there

- **`color-scheme: light dark` + `light-dark()`** — one declaration per token instead of a duplicated `prefers-color-scheme` block, and it also themes native UI such as scrollbars and controls.
- **The three-column grid** — prose sits in a `68ch` centre column, near the 45–75 character measure that long-form reading wants. Anything tagged `.wide` escapes to `--wide`, so a table or diagram is never squeezed into the prose column. Keep `--wide` a clear step up from the measure rather than near-full-bleed: once a wide block reaches the window edges, its captions hang far to the left of the headings above them and the page reads as broken alignment instead of deliberate emphasis.
- **The profile attribute** — the selected profile changes measure, breakout width, and section rhythm while keeping one component and token system. Read [PROFILES.md](PROFILES.md) before choosing it; the attribute is a structural control, not a theme picker.
- **`clamp()` type** — scales between phone and desktop without breakpoint jumps.
- **`text-wrap: balance` on headings, `pretty` on body** — evens out heading line lengths and stops single-word orphans, the tell that separates a typeset document from a dumped one.
- **Print rules** — `@page` margins, `break-inside: avoid` on the things that look broken when split, and link URLs printed inline so a paper copy keeps its references.

## Accessibility constraints

- Re-check WCAG AA contrast after changing any color; muted text on a surface is the pair most likely to slip.
- Pair color-coded meaning with a label, icon, line style, or shape.

Hierarchy, rhythm, restraint, and writing live in [CRAFT.md](CRAFT.md). This file owns the structural shell.
