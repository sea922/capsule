# pr-description: adopting Matt Pocock's `pr` skill

Date: 2026-10-09

Source: [`mattpocock/skills` `skills/engineering/pr/SKILL.md`](https://github.com/mattpocock/skills/blob/main/skills/engineering/pr/SKILL.md)
at commit `e484a80` (2026-09-24), with its `CREDITS.md`. MIT licensed. Its
Summary visuals come from Dex Horthy's
[`show-me`](https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md)
(HumanLayer, MIT).

## Scope

The owner asked to update `pr-description` from this one skill. `mattpocock/skills`
is first in [`docs/source-repos.md`](../source-repos.md). No other preferred
repository was re-consulted; their influence on PR writing is unchanged from the
[git-workflow preferred-source audit](2026-09-26-git-workflow-preferred-sources.md).
The [2026-09 source sweep](2026-09-27-source-repos-sweep.md) had already taken
the merge-danger door and blast radius from an earlier read of this skill.

## Adopted

| Pocock `pr` | `pr-description` |
| --- | --- |
| Summary leads with a diagram, diff sketch, or tree | Summary: one or two sentences, then the smallest visual when the change has a shape prose would blur. The visual menu and examples live in `references/visuals.md`, read only when choosing one |
| Pseudocode, call tree, component tree, file tree, Mermaid, `diff` sketches matched to the topic, whole block when context matters | Adapted into `references/visuals.md` with attribution to Pocock and Horthy |
| "Pick the smallest view"; place each visual next to its text; one is usual, never all | Kept in `visuals.md` |
| Evidence as before/after; screenshots strongest for visual changes; execution evidence otherwise, showing the exact test that fails then passes | Evidence part of step 2 |
| Merge Danger as a section with Door and Blast Radius fields | Merge danger is now a section with two fields; templates and examples updated |
| Skip preambles, keep prose brief, use domain language from `GLOSSARY.md` | Added, generalized to "the project's glossary when one exists" |

## Not adopted

- **A fixed template.** Pocock's template replaces the body. Repository PR
  templates stay authoritative here; the parts map into a template's fields, and
  the bundled assets apply only when no template exists.
- **One-word blast radius.** It drops who is affected. The field keeps "what
  breaks, and for whom".
- **The narrow description** ("Use when writing a PR body"). PR #43 found that
  everyday phrasing such as "create a PR" did not load the skill, so the broad
  trigger list stays.
- **The S-tier/A-tier labels.** The ranking is kept as plain instructions
  (screenshots first for visual changes, then execution evidence).

## Verification

`npm run check`, `claude plugin validate .`, and a link check through repository
validation. One new blind eval covers a visual UI change with screenshots; the
blind evals were not run.
