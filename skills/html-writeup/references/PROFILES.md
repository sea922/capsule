# Presentation profiles

A profile sets the page's reading posture. It is a starting coordinate, not a theme name and not output the reader needs to see. Infer it from the document's job, then let explicit user or brand direction override it.

## The three dials

- **Variance** controls how asymmetric or unconventional the composition becomes. It changes layout, not factual order.
- **Motion** controls how much state change helps the reader. A document starts nearly static because motion spends attention.
- **Density** controls how much evidence appears per viewport. It changes grouping and whitespace, not how much evidence exists.

Use integers from 1 to 10 internally. Keep the selected values consistent across the page.

| Profile | Reading job | Variance | Motion | Density | Character |
| --- | --- | ---: | ---: | ---: | --- |
| Editorial | Understand an argument or narrative | 5 | 1 | 3 | Long measure, strong headings, generous rhythm |
| Analytical | Compare evidence and inspect detail | 4 | 1 | 7 | Compact tables, restrained chrome, visible provenance |
| Operational | Decide what happens next | 5 | 2 | 6 | Status, ownership, sequence, risk, and action lead |
| Showcase | Experience a visual explanation | 8 | 4 | 3 | One memorable composition with supporting evidence |

## Infer before styling

Read these signals in order:

1. **Reader action:** understand, compare, decide, or experience.
2. **Evidence shape:** narrative, shared axes, sequence, graph, or visual artefact.
3. **Trust posture:** exploratory, internal decision, public record, regulated, or executive.
4. **Incumbent truth:** supplied template, brand tokens, screenshots, or neighbouring documents.

Choose the profile from the reader action. Adjust one dial only when another signal clearly calls for it. A regulated analytical report may lower variance to 2; a launch retrospective may raise editorial variance to 6. Avoid turning every adjective into a dial change.

## How the dials affect the page

### Variance

- 1-3: one alignment axis, conventional section flow, minimal breakout.
- 4-6: controlled wide blocks, varied section silhouettes, one offset composition.
- 7-10: asymmetric grids or art-directed pacing, with an explicit single-column mobile collapse.

### Motion

- 1-2: native disclosure and focus states only.
- 3-5: one purposeful reveal, filter, or state transition with a no-motion equivalent.
- 6-10: appropriate only when the user asked for an interactive visual experience; keep reading and printing complete without it.

### Density

- 1-3: one idea per viewport, wide breathing room, short evidence excerpts.
- 4-6: normal report density, mixed prose and structured evidence.
- 7-10: compact tables and metadata, tighter type and spacing, stronger grouping instead of more cards.

## Profile discipline

- Preserve one radius rule, one accent role, one spacing scale, and one typographic hierarchy.
- Let the subject determine palette and material. The base shell is a neutral fallback, not a house aesthetic.
- Apply [CRAFT.md](CRAFT.md)'s "Spend boldness in one place" rule after the profile sets the reading posture.
- Above variance 6, define the single-column mobile collapse before adding asymmetry.
- Preserve the document's full reading order in print when screen presentation uses tabs or disclosure.
