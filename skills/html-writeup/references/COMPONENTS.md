# Write-up components

The parts a document-shaped deliverable actually needs. Each is plain HTML plus a few lines of CSS, styled from the shell's tokens (`--surface`, `--border`, `--muted`, `--accent`, the `--text-*` ramp and the `--space-*` scale). Add only the ones the write-up uses. For contents, rails, or tabs, read [NAVIGATION.md](NAVIGATION.md).

## Callout

For the caveat that would derail a paragraph. Three intents — note, warning, danger — separated by a left border and a label, never by color alone.

```html
<aside class="callout warn">
  <p class="callout-label">Caveat</p>
  <p>Numbers come from a single run; treat the ordering as indicative.</p>
</aside>
```

```css
.callout {
  border-left: 3px solid var(--accent);
  background: var(--surface);
  border-radius: 0 var(--radius) var(--radius) 0;
  padding: var(--space-sm) var(--space-md);
  display: grid; gap: var(--space-2xs);
}
.callout-label {
  font-size: var(--text-xs); font-weight: 650;
  text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted);
}
.callout.warn   { border-left-color: light-dark(#b45309, #f59e0b); }
.callout.danger { border-left-color: light-dark(#b91c1c, #f87171); }
```

## Table

The right form whenever things are compared on shared axes. Wrap it so a wide table scrolls inside itself rather than pushing the page sideways.

```html
<div class="wide">
  <div class="table-wrap" tabindex="0" role="region" aria-label="Option comparison">
    <table>
      <caption>Options weighed against the constraints that matter</caption>
      <thead>
        <tr><th scope="col">Option</th><th scope="col">Effort</th><th scope="col">Risk</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">Keep as-is</th><td>None</td><td>Grows</td></tr>
      </tbody>
    </table>
  </div>
</div>
```

```css
.table-wrap { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: var(--text-sm); }
caption { text-align: left; color: var(--muted); font-size: var(--text-sm); margin-bottom: var(--space-xs); }
th, td { text-align: left; padding: var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--border); }
thead th { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
tbody th { font-weight: 600; }
td.num { font-variant-numeric: tabular-nums; text-align: right; }
```

`scope` on every header cell is what makes the table navigable to a screen reader. `tabindex="0"` on the scroll container lets keyboard users reach a table that overflows.

## Stat row

For the handful of numbers that carry the finding. The number leads; the label explains it.

```html
<div class="stats">
  <div class="stat"><span class="stat-value">14</span><span class="stat-label">modules touched</span></div>
  <div class="stat"><span class="stat-value">2.4s</span><span class="stat-label">p95 latency</span></div>
</div>
```

```css
.stats { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
.stat {
  flex: 1 1 8rem; background: var(--surface);
  border: 1px solid var(--border); border-radius: var(--radius);
  padding: var(--space-sm);
  display: grid; gap: var(--space-2xs);
}
.stat-value { font-size: var(--text-xl); font-weight: 650; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.stat-label { font-size: var(--text-xs); color: var(--muted); }
```

Keep it to 2–5. A stat row with eight entries is a table wearing a costume.

## Code block

Escape `<`, `>`, and `&` in the source, or the browser parses your code as markup.

```html
<figure class="code">
  <figcaption>src/orders/intake.ts:42</figcaption>
  <pre><code>const total = items.reduce((n, i) =&gt; n + i.price, 0);</code></pre>
</figure>
```

```css
figure.code { margin: 0; }
figure.code pre {
  overflow-x: auto; margin: 0;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: var(--space-sm);
}
code, pre, kbd { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; font-size: 0.88em; }
:not(pre) > code { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 0.1em 0.35em; }
```

Skip syntax highlighting — it costs a second dependency and buys little at write-up length. Point at the line that matters with a `figcaption` instead.

## Verdict badge

For a recommendation whose strength varies. The word carries the meaning; the color only reinforces it.

```html
<span class="badge strong">Strong</span>
```

```css
.badge {
  display: inline-block; font-size: var(--text-xs); font-weight: 650;
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 0.15em 0.55em; border-radius: 999px;
  border: 1px solid currentColor;
}
.badge.strong      { color: light-dark(#0f766e, #2dd4bf); }
.badge.worth       { color: light-dark(#b45309, #f59e0b); }
.badge.speculative { color: var(--muted); }
```

## Collapsible detail

For evidence that supports the finding but would bury it — full logs, long output, the exhaustive list.

```html
<details>
  <summary>All 34 affected call sites</summary>
  <pre><code>…</code></pre>
</details>
```

```css
details { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-sm); }
summary { cursor: pointer; font-weight: 600; }
details[open] summary { margin-bottom: var(--space-xs); }
```

Native `<details>` is keyboard accessible and searchable-when-open. Don't rebuild it with JavaScript.

## Footnote

For the aside a reader can skip. Bidirectional links keep them navigable.

```html
<p>The p95 improved by a third.<sup><a id="ref-1" href="#fn-1" aria-describedby="footnotes">1</a></sup></p>

<h2 id="footnotes">Notes</h2>
<ol class="footnotes">
  <li id="fn-1">Measured over 500 requests on a warm cache. <a href="#ref-1" aria-label="Back to reference 1">↩</a></li>
</ol>
```

```css
.footnotes { color: var(--muted); font-size: var(--text-sm); }
```
