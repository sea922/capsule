# Navigation: matching the page to its length

A write-up that fits on two screens needs no navigation; one that runs to twelve is unusable without it. Measure the page, then add the lightest affordance that fits — navigation is a cost paid in chrome, so it has to be earned.

## Choose by length and by shape

Measure the built page in **screens** (`document.body.scrollHeight / window.innerHeight`) at a 1200×900 viewport:

| Screens | Affordance |
| --- | --- |
| ≤ 2 | None. Headings alone carry it. |
| 2–6 | A **contents** list under the lede. |
| > 6 | A **sticky contents** rail that tracks the reader's position. |

Then override on shape, because length isn't the only question:

- **Sections you read in order** — a narrative building to a conclusion — stay one continuous document at any length. Hiding half an argument behind a control makes it worse.
- **Sections you read *instead of* each other** — one per service, per option, per environment, per package — are **tabs**. The reader wants one of them, and stacking all five vertically just makes them scroll past four.

That distinction is the whole rule: tabs are for **alternatives**, never for a sequence.

## Contents list

For a medium continuous document, keep navigation inline and visible:

```html
<nav class="toc" aria-label="Contents">
  <ol>
    <li><a href="#findings">Findings</a></li>
    <li><a href="#evidence">Evidence</a></li>
  </ol>
</nav>
```

```css
.toc ol { margin: 0; padding-left: 1.2rem; color: var(--muted); }
.toc a { text-decoration: none; }
.toc a:hover { text-decoration: underline; }
```

## What tabs cost

Hiding content has real costs. Take them knowingly:

- **Find-in-page misses hidden panels.** `Ctrl+F` won't reach text in an inactive tab. For a document whose value is being searchable, that alone can rule tabs out.
- **Printing must be handled**, or the printout silently loses every inactive panel.
- **Deep links must open their tab**, or a link into a hidden section lands on a blank-looking page.

The pattern below handles the last two. The first is inherent — which is why tabs need alternatives, not a sequence.

## Sticky contents

For long, continuous documents. The rail sits beside the prose on wide screens and collapses to a plain list on narrow ones, so nothing is hidden.

```html
<nav class="rail" aria-label="Contents">
  <ol>
    <li><a href="#findings">Findings</a></li>
    <li><a href="#evidence">Evidence</a></li>
  </ol>
</nav>
```

```css
.rail ol { margin: 0; padding-left: 1.1rem; display: grid; gap: var(--space-2xs); }
.rail a { color: var(--muted); text-decoration: none; font-size: var(--text-sm); }
.rail a:hover, .rail a[aria-current="true"] { color: var(--ink); }

/* Beside the prose only when there's genuinely room for it. */
@media (min-width: 1100px) {
  .rail {
    position: sticky; top: var(--space-lg);
    grid-column: 1; justify-self: end;
    width: 12rem; margin-right: var(--space-xl);
    align-self: start;
  }
}
```

Mark the current section with `aria-current` from an `IntersectionObserver` — it states position for assistive tech, not just visually:

```js
const links = new Map([...document.querySelectorAll('.rail a')].map(a => [a.hash.slice(1), a]));
const sections = [...links.keys()].map(id => document.getElementById(id)).filter(Boolean);

const mark = () => {
  const line = window.innerHeight * 0.25;      // a quarter down the viewport
  let current = sections[0];
  for (const s of sections) {
    if (s.getBoundingClientRect().top <= line) current = s;   // last one past the line
  }
  links.forEach(a => a.removeAttribute('aria-current'));
  links.get(current.id)?.setAttribute('aria-current', 'true');
};

addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
addEventListener('resize', mark);
mark();
```

**Why position and not `IntersectionObserver`.** An observer looks like the modern answer, but "which section am I reading" is a question about *position*, not visibility, and the two diverge exactly at the boundaries: sections taller than the band never enter it, edge-touching sections report inconsistently, and the callback's `entries` are not in document order — so the marker lands on a section you've already scrolled past. The rule above ("the last section whose top has crossed the line") is the definition of scrollspy, reads as such, and is cheap behind `requestAnimationFrame`.

## Tabs

Author the panels as **plain sections first**. A script upgrades them into tabs after the page settles, so the page degrades to a complete document when scripting is off — and, critically, so diagrams measure themselves while still visible.

```html
<div class="tabs wide" data-tabs data-tabs-label="Results by service">
  <section id="checkout" data-tab="Checkout">
    <h3>Checkout</h3>
    …
  </section>
  <section id="invoicing" data-tab="Invoicing">
    <h3>Invoicing</h3>
    …
  </section>
</div>
```

```css
.tablist { display: flex; flex-wrap: wrap; gap: var(--space-2xs); border-bottom: 1px solid var(--border); margin-bottom: var(--space-md); }
.tablist button {
  font: inherit; font-size: var(--text-sm); color: var(--muted);
  background: none; border: 0; border-bottom: 2px solid transparent;
  padding: var(--space-xs) var(--space-sm); cursor: pointer; margin-bottom: -1px;
}
.tablist button[aria-selected="true"] { color: var(--ink); border-bottom-color: var(--accent); font-weight: 600; }
.tablist button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
[role="tabpanel"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }

/* Every panel prints, whichever tab happened to be open. */
@media print {
  .tablist { display: none; }
  [role="tabpanel"][hidden] { display: block !important; }
}
```

```js
function initTabs(root) {
  const panels = [...root.querySelectorAll('[data-tab]')];
  if (panels.length < 2) return;
  const list = document.createElement('div');
  list.className = 'tablist';
  list.role = 'tablist';
  list.setAttribute('aria-label', root.dataset.tabsLabel || 'Sections');

  const tabs = panels.map((panel, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.role = 'tab';
    tab.id = `tab-${panel.id}`;
    tab.textContent = panel.dataset.tab;
    tab.setAttribute('aria-controls', panel.id);
    panel.role = 'tabpanel';
    panel.tabIndex = 0;
    panel.setAttribute('aria-labelledby', tab.id);
    list.append(tab);
    return tab;
  });

  const select = (i, focus = true) => {
    tabs.forEach((tab, j) => {
      const on = i === j;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;          // roving tabindex: one stop for the whole widget
      panels[j].hidden = !on;
    });
    if (focus) tabs[i].focus();
  };

  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const go = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (go === undefined) return;
    e.preventDefault();
    select((go + tabs.length) % tabs.length);
  });
  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));

  root.prepend(list);

  // A link into a hidden panel opens its tab instead of landing on nothing.
  let target = -1;
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el) target = panels.findIndex(p => p === el || p.contains(el));
  }
  select(target > 0 ? target : 0, false);
}
```

### Upgrade only after the diagrams have measured themselves

Mermaid sizes a diagram by measuring the rendered SVG. Inside a `display: none` panel every measurement comes back zero, and the diagram collapses to a 16×16 stub — permanently, because the bad size is baked into the SVG.

So render first, hide second:

```js
import mermaid from "mermaid";
mermaid.initialize({ startOnLoad: false, /* …as in SHELL.md */ });
await mermaid.run();                                   // every panel still visible here
document.querySelectorAll('[data-tabs]').forEach(initTabs);   // now it's safe to hide
```

`startOnLoad: false` plus an awaited `mermaid.run()` is what makes the ordering explicit. With `startOnLoad: true` the render races the upgrade, and the diagram in tab two is a coin flip.

## Verify the navigation

Beyond the checks in SKILL.md:

- **Keyboard** — `Tab` reaches the tablist once, then `←`/`→` move between tabs and `Home`/`End` jump to the ends. Tabbing again leaves the widget.
- **Diagram width** — a diagram in a non-default panel is its real size, not 16px wide.
- **Print** — in print emulation, every panel is visible.
- **Deep link** — loading with `#some-id` inside a panel opens that panel.
