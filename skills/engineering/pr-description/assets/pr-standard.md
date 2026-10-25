<!-- Starting point only: preserve the target repository's required sections.
Replace placeholders, remove instructions, and omit optional sections that add
no review context. The title should describe the final outcome. -->

## Summary

<One or two sentences: the resulting change and why it matters.>

<Optional: the smallest visual that makes the key point clear - pseudocode, a
call, component, or file tree, a Mermaid diagram, or a diff sketch.>

## Evidence

- **Before:** <Screenshot, output, or the exact failing test or command.>
  **After:** <The same check, now passing.>
- <Material checks not run, and why.>

## Review notes

<Optional: consequential design choice, compatibility concern, or useful review
starting point. Explain what the diff cannot establish on its own.>

## Related work

<Optional: verified issue links, parent PR, or known follow-on work. Use a
closing keyword (`Fixes #N`) only when this PR delivers the whole issue and that
was verified; otherwise link it (`Refs #N`) and name what remains.>

## Merge danger

**Door:** <Two-way, or one-way with its recovery limit.>

**Blast radius:** <What breaks, and for whom, if this is wrong.>
