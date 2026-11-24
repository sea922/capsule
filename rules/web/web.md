---
paths:
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.sass"
  - "**/*.less"
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.astro"
---
# Web: HTML and CSS

Defaults for where the project is silent. Its design system, CSS approach, and
existing markup come first.

## HTML

- Use the element that matches the meaning: `button`, `a`, `nav`, `main`,
  `header`, `footer`, `ul`, `table` for tabular data, and headings in order
  with one `h1` per page.
- Every form control has a visible `label`. Group related controls with
  `fieldset` and `legend`. Tie error messages to their field.
- Set `lang` on `html`, a meaningful `title`, and the viewport meta tag.
- Use ARIA only where no native element fits, and never to override one.

## CSS

- Use the project's tokens for color, spacing, type, and radius. Do not
  introduce a hard-coded value where a token exists.
- Lay out with flexbox and grid. Avoid fixed heights on text containers and
  absolute positioning for layout.
- Write mobile-first, with relative units, and check the layout at narrow
  widths and at 200% zoom. Nothing may require horizontal scrolling.
- Prefer logical properties (`margin-inline`, `padding-block`) so layouts work
  in right-to-left languages.
- Keep specificity low: no `!important` to win a fight, no ID selectors for
  styling, no deep descendant chains.
- Never remove a focus outline without a visible replacement.
- Respect `prefers-reduced-motion` for animation, and support the color scheme
  the project supports.

## Accessibility

- Text contrast is at least 4.5:1, and 3:1 for large text and interface
  controls. Never use color as the only signal.
- Interactive targets are at least 24 by 24 CSS pixels.
- Everything that works with a pointer works with a keyboard.

## Performance

- Give images `width` and `height`, modern formats, responsive `srcset`, and
  `loading="lazy"` below the fold.
- Load scripts with `defer` or as modules. Avoid render-blocking resources and
  layout shift from late-loading content or fonts.

## Security

- Never insert untrusted text as HTML. Escape it or set it as text.
- Add `rel="noopener"` to links that open a new tab. Use Subresource Integrity
  for third-party scripts, and do not weaken the Content Security Policy.
