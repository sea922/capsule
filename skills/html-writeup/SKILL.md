---
name: html-writeup
description: Create and verify one standalone HTML report for a decision, comparison, audit, architecture explanation, plan, incident review, or research brief. Use when the deliverable needs document hierarchy plus tables, diagrams, evidence, or light navigation. Route production websites and application interfaces to a frontend skill; answer Markdown or plain-text requests directly.
---

# HTML Write-up

Deliver one considered `.html` document that opens from a double-click, travels as one file, and leads with its conclusion. Structure serves comprehension; interaction earns its place by reducing reading work.

## 1. Frame the document

Define the reader's question or decision and answer it in one sentence. Choose the presentation profile from the reader's job, then outline the shortest spine that carries the answer.

- **Profiles:** read [references/PROFILES.md](references/PROFILES.md) to choose editorial, analytical, operational, or showcase direction.
- **Recipes:** read [references/RECIPES.md](references/RECIPES.md) when the request matches a comparison, audit, research brief, architecture decision, plan, status report, or incident review.

For every section, choose its form before writing it: prose for judgement, a table for shared axes, a diagram for relationships, a stat row for decisive numbers, code for source truth, and a callout for a caveat that would derail the paragraph. The user's pinned style, supplied template, brand system, and factual content override profile defaults.

**Complete when:** the outline records the title, its one-sentence answer, each section's job and form, and the single visual anchor.

## 2. Build from the system

Read [references/SHELL.md](references/SHELL.md) for the base document and [references/CRAFT.md](references/CRAFT.md) for hierarchy, rhythm, and writing. Load each remaining reference only when its branch fires:

- **Components:** [references/COMPONENTS.md](references/COMPONENTS.md) for tables, stats, code, callouts, evidence, or footnotes.
- **Diagrams:** [references/DIAGRAMS.md](references/DIAGRAMS.md) for graph-shaped content.
- **Navigation:** [references/NAVIGATION.md](references/NAVIGATION.md) when the rendered page exceeds two screens or the reader chooses among alternative sections.

Start from the shell and adapt its tokens to the subject and selected profile. Use real content immediately because wrapping, density, and overflow only become visible with real sentences and values.

Save to the OS temp directory unless the user names a path: `%TEMP%` on Windows, `$TMPDIR` with `/tmp` fallback elsewhere. Use `<slug>-<timestamp>.html` so the repo stays clean and each run produces a fresh artifact.

**Complete when:** the page contains the full requested content, has no unresolved placeholders, and records every external resource for the handoff.

## 3. Prove the artifact

Read [references/VERIFY.md](references/VERIFY.md), run its static, browser, print, and visual checks, and follow its bounded repair loop.

**Complete when:** the checker has no errors, browser diagnostics pass at both viewports, the console is clean, print retains the content, and the screenshot has one obvious focal point with a readable argument.

## 4. Hand off one file

Return the absolute path and a one-sentence description of the artifact. State any remaining network dependency, such as a pinned Mermaid runtime. Keep the artifact local unless the user separately requested publishing, committing, uploading, or hosting.

**Complete when:** the response names one verified HTML file by absolute path, describes it in one sentence, discloses every network dependency, and reports no unrequested side effect.
