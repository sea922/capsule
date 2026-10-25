# Mermaid runtime

Use this branch only after DIAGRAMS.md selects Mermaid. Diagram syntax and accessibility stay authoritative in DIAGRAMS.md; this file owns runtime and delivery behavior.

## Choose the delivery mode

- **Offline:** render during creation, replace the result with accessible inline SVG, remove the runtime, and verify the frozen file again. Hand-built inline SVG is also valid.
- **Networked single-file:** keep a pinned Mermaid module, verify it from `file://`, and disclose the runtime as an external request in the handoff.

An HTML file that fetches Mermaid is portable as one file but does not work fully offline.

## Pinned runtime

Place the diagram source in one `<pre class="mermaid">` block, then load the exact module version:

```html
<script type="importmap">
  {
    "imports": {
      "mermaid": "https://cdn.jsdelivr.net/npm/mermaid@11.16.0/dist/mermaid.esm.min.mjs"
    }
  }
</script>
<script type="module">
  import mermaid from "mermaid";
  mermaid.initialize({
    startOnLoad: true,
    theme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "neutral",
    securityLevel: "loose",
    fontFamily: "inherit",
    flowchart: { useMaxWidth: true },
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => location.reload());
</script>
```

`securityLevel: "loose"` supports HTML line breaks in labels. Use it only with diagram source you control. For supplied or untrusted Mermaid text, keep strict security and plain labels.

## Integrity for retained runtimes

For a shared or long-lived networked file, compute a SHA-384 hash for the exact pinned URL and add it to the import map:

```html
<script type="importmap">
  {
    "imports": {
      "mermaid": "https://cdn.jsdelivr.net/npm/mermaid@11.16.0/dist/mermaid.esm.min.mjs"
    },
    "integrity": {
      "https://cdn.jsdelivr.net/npm/mermaid@11.16.0/dist/mermaid.esm.min.mjs": "sha384-REPLACE_WITH_CURRENT_HASH"
    }
  }
</script>
```

Compute the hash from the same URL:

```bash
curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A
```

Use integrity only with a hash computed for that exact file. A stale hash blocks the module and leaves raw diagram source visible.

**Complete when:** every Mermaid block rendered, raw source and error cards are absent, the console is clean, theme changes preserve the diagram, and the handoff truthfully states either offline inline SVG or the pinned network dependency.
