# Research

Use `research` for a technical question, repository comparison, or decision that depends on external evidence. It is model-invoked.

The result is a cited answer, normally saved under `docs/research/`, with scope, date, inspected versions or revisions, evidence gaps, and the decision the evidence supports. A freshness fingerprint at the top records source revisions and monitored paths or URLs, so a later staleness check is a diff. It follows the repository's preferred-source policy when one exists.

## Choosing sources

Local source and resolved dependencies establish installed behavior. Official documentation, specifications, release notes, and upstream code establish external contracts. Recent community reports can reveal adoption or friction; the optional `last30days` branch preserves its own source-health limitations.

The skill distinguishes facts, first-party claims, user reports, and inference. It investigates contradictions and does not treat popularity as proof of suitability.

## Example

“Research whether the dependency version used here supports streaming exports and save a cited report.”

The answer should resolve the installed version, inspect the matching contract, and distinguish supported behavior from a feature available only in a newer release.

## Composition and design basis

Research alone produces evidence and an artifact. Already-authorized implementation resumes through `implement`; a material human decision can return to `grilling`.

The [preferred-source research](../research/preferred-skill-repositories-workflow-gap-research.md) records all six sources. Matt Pocock contributes primary-source investigation; Addy Osmani contributes version-aware contracts; last30days contributes recency, coverage, and raw-evidence handling. No upstream engine or skill is vendored. The [2026-09-27 source sweep](../research/2026-09-27-source-repos-sweep.md) adds the freshness fingerprint from wshobson/agents' `grounded-vault`.
