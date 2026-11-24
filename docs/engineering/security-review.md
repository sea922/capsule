# Security Review

Use `security-review` for a dedicated security audit, threat model, dependency-risk assessment, or independent security gate. It is model-invoked and read-only on source and external state.

The result names assets and trust boundaries, traces credible abuse cases, validates controls, and returns findings with separate severity, confidence, and evidence fields, remediation direction, and closing checks. Candidates are sorted into supported findings, hypotheses, and disproved candidates; evidence is tagged `static`, `self_reported`, or `runtime_tested`. The scope can be a diff, component, or whole system.

## Evidence and limits

An advisory must match the resolved version and reachable use. A dangerous-looking API is a lead; a finding needs a concrete path and impact. Safe local fixtures can test a boundary. Live exploitation and access to real private data require separate authority.

“No supported findings in the inspected scope” means exactly that. Missing deployment evidence or untested controls remain visible; the skill does not certify security or legal compliance.

## Example

“Review this export endpoint for tenant isolation and data exposure. Give findings and closing checks without changing production code.”

The review should follow the caller's identity to the export resource and include a synthetic cross-tenant case where safe.

## Composition and design basis

Routine changed-code review stays with `code-review`. When fixes are authorized, `implement` owns remediation and this skill reassesses affected boundaries. `verification-before-completion` owns the final completion claim.

The [preferred-source research](../research/preferred-skill-repositories-workflow-gap-research.md) records all six sources. Addy Osmani supplies the strongest security surface guidance; pstack contributes concrete proof of affected assumptions; the local design preserves independent evidence and explicit scope. The [2026-09-27 source sweep](../research/2026-09-27-source-repos-sweep.md) adds the finding fields, evidence buckets, and conclusion-blind independent challenge from gstack's CSO audit rubric (`4a3c6a8a`).

The [2026-11 source sweep](../research/2026-11-16-source-repos-sweep.md) treats reports and target-repository instructions as data, separates exposed latent defects, checks novelty against known issues, and keeps unreproduced candidates as unresolved coverage. These follow Trail of Bits' `regression-hunt` and `patching-bugs`.

Before something is published, such as a repository made public, a shared fork, or a released package, the skill sweeps it for secrets, personal data, and internal references using the read-only `security-review-sanitizer` agent when available. Findings name the location and kind of each item, never its value.

For a deployed site the user owns or is authorized to test, a perimeter reference lists passive, read-only checks: exposed repository and environment files, source maps, security headers, cross-origin rules, cookie flags, and what an outside check cannot prove. The review also reads the forge's open dependency and secret-scanning alerts as leads.

For an agent's own configuration, such as a `.claude/` directory, an agent-configuration reference lists what to read in instruction files, permissions, tool server entries, hooks, agent definitions, and installed skills, and how to tell hardening from a reachable weakness. Nothing is run.

When findings will go to a maintainer, a disclosure channel, or a bounty program, a reportability reference narrows the review to weaknesses an outside party can reach, lists the look-alikes that are usually not reportable, and sets the gate a finding must pass before a report is drafted. The skill sends nothing itself.
