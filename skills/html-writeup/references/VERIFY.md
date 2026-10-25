# Verification

Verification separates three questions: is the file structurally sound, does it behave in a browser, and does it look composed? Run them in that order so visual judgement is not wasted on a broken artifact.

## 1. Static check

Resolve the loaded skill directory, then run:

```bash
python <skill-dir>/scripts/check_html.py <artifact.html>
```

Use `--json` when another tool will consume the result. Errors block delivery; warnings require a deliberate judgement and should be fixed when the document's content makes them applicable.

The checker covers document metadata, semantic landmarks, heading order, duplicate IDs, internal links, accessible images and diagrams, table headers, placeholders, theme and print support, motion fallbacks, and external requests. It cannot see layout.

## 2. Browser check

Open the file directly. If the host blocks `file://`, serve only its directory with a temporary local server and close the server after verification.

Inspect at approximately 1440 x 900 and 390 x 844. Capture console errors, then evaluate:

```js
(() => {
  const root = document.documentElement;
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const rawMermaid = [...document.querySelectorAll('pre.mermaid')].filter(visible).length;
  const brokenImages = [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).length;
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  const levels = headings.map((h) => Number(h.tagName[1]));
  const headingSkips = levels.slice(1).filter((level, i) => level > levels[i] + 1).length;
  return {
    viewport: [innerWidth, innerHeight],
    horizontalOverflow: root.scrollWidth > root.clientWidth + 1,
    pageScreens: Number((document.body.scrollHeight / innerHeight).toFixed(1)),
    h1Count: document.querySelectorAll('h1').length,
    headingSkips,
    rawMermaid,
    errorCards: document.querySelectorAll('.error, .error-card, [data-error]').length,
    brokenImages,
    visibleDialogs: [...document.querySelectorAll('[role="dialog"]')].filter(visible).length,
  };
})()
```

Healthy output has no horizontal overflow, one `h1`, no heading skips, no raw Mermaid source after rendering, no error cards, and no broken images. `pageScreens` chooses navigation through NAVIGATION.md; it is not a pass/fail score.

Exercise every control with keyboard input. For tabs, verify arrow keys, deep links, and inactive-panel diagrams. For disclosure, verify summaries describe the hidden content. Emulate print and confirm all tabs, diagrams, tables, URLs, and evidence remain present.

## 3. Visual check

Take desktop and mobile screenshots in the same pass. Apply every rendered-page test in [CRAFT.md](CRAFT.md). For diagrams, also apply [DIAGRAMS.md](DIAGRAMS.md)'s edge-integrity test and compare the visible source, action, destination, and order with the accessible description.

Capture a full-page overview at one viewport when the browser tool supports it, plus a bounded viewport when detail would otherwise be illegible. If full-page capture fails, keep the useful viewport evidence and disclose the limitation; do not hold delivery open on screenshot tooling alone.

## Bounded repair

Collect every defect from the static, browser, and visual checks before editing. Fix the batch once, then repeat only the checks that failed. If the confirmation pass still exposes a defect that prevents reading, accessibility, or truthful rendering, fix that blocker and report the unresolved non-blocking issue rather than entering an open-ended polish loop.

## Network truth

A file with remote scripts, styles, fonts, images, or module imports is single-file but not fully offline. Prefer inline CSS, JavaScript, SVG, and data. When a diagram needs the pinned Mermaid runtime from SHELL.md, either disclose that one dependency or replace the rendered diagram with inline SVG before calling the artifact offline.
