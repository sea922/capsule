# HTML Write-up

`html-writeup` v2 turns findings, comparisons, audits, research, architecture, plans, and status reports into one verified `.html` document. It is for document-shaped work, not shipped application or marketing UI.

- **Invocation:** model-invoked. It fires for a standalone HTML report, visual write-up, shareable page, or document that materially benefits from tables, diagrams, evidence disclosure, or light interaction.
- **Output:** one local HTML file with an absolute handoff path. Publishing is a separate explicit action.

## What v2 adds

### Presentation profiles

The skill first identifies the reader's job, then selects one profile:

| Profile | Reader job | Default posture |
| --- | --- | --- |
| Editorial | Understand an argument | Spacious, narrative, heading-led |
| Analytical | Compare evidence | Dense, tabular, provenance-forward |
| Operational | Decide and act | Status, risk, sequence, ownership |
| Showcase | Experience an explanation | Art-directed with one memorable visual |

Each profile tunes layout variance, motion, and density without replacing the document's factual structure or the user's supplied design direction.

### Document recipes

Six recipes provide proven information topologies for comparisons, audits, research briefs, architecture decisions, implementation plans, and status or incident reports. A recipe defines the argument's spine, useful forms, central visual anchor, and completion gate. It is a starting structure rather than a visual template.

### Deterministic verification

The bundled `scripts/check_html.py` catches structural problems before browser review:

- missing metadata or semantic landmarks;
- heading skips, duplicate IDs, and broken internal links;
- inaccessible images, diagrams, and tables;
- unresolved placeholders;
- motion without reduced-motion handling;
- missing theme or print support;
- remote fonts and undisclosed network dependencies.

The browser pass then checks desktop and mobile overflow, console errors, diagram rendering, keyboard interaction, print completeness, and screenshot hierarchy. Diagram review also reads every arrow as source-action-destination so visual shortcuts cannot misstate ownership. Repairs are bounded to one complete fix batch plus one confirmation pass.

## Core workflow

1. Frame the one question and map each section to prose, table, diagram, stats, code, or callout.
2. Choose the profile and nearest recipe.
3. Build from the shared shell, component vocabulary, diagram rules, craft guidance, and navigation patterns.
4. Run the static checker and rendered browser checks.
5. Hand off one verified local file and disclose any remaining network dependency.

## Reliability boundaries

- The default artifact is local and has no publishing side effect.
- Inline CSS, JavaScript, data, and SVG make a truly offline page.
- A pinned Mermaid CDN keeps the file single-file but network-dependent; the handoff must disclose it, or the diagram must be frozen to inline SVG before the file is called offline.
- Visual design guidance lives here only to serve comprehension. Product UI belongs to a frontend-design skill.

## Resources

- `skills/html-writeup/references/PROFILES.md` - presentation profiles and the variance, motion, and density controls.
- `skills/html-writeup/references/RECIPES.md` - document topologies by task.
- `skills/html-writeup/references/SHELL.md` - offline document shell, tokens, layout, theming, and print.
- `skills/html-writeup/references/COMPONENTS.md` - tables, stats, code, callouts, badges, disclosure, and footnotes.
- `skills/html-writeup/references/DIAGRAMS.md` - graph selection, Mermaid syntax, SVG alternatives, and accessibility.
- `skills/html-writeup/references/MERMAID.md` - optional pinned Mermaid runtime, integrity, offline freezing, and disclosure.
- `skills/html-writeup/references/CRAFT.md` - hierarchy, rhythm, restraint, writing, and screenshot checks.
- `skills/html-writeup/references/NAVIGATION.md` - contents, sticky rail, tabs, deep links, and print behaviour.
- `skills/html-writeup/references/VERIFY.md` - static, browser, print, and visual verification.
- `skills/html-writeup/scripts/check_html.py` - dependency-free static checker.
