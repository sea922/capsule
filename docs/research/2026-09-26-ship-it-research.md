# Ship it skill research

Research date: 2026-09-26. Community window: 2026-08-27 through 2026-09-26.

## Recommendation

For this repository, a small delivery coordinator is the most useful interpretation of `ship-it`: take completed work through review, repairs, verification, focused commits, PR publication, and the requested remote endpoint. Reuse `code-review`, `verification-before-completion`, `git-workflow`, and `babysit-pr`. This is a design recommendation from source inspection, not a measured community ranking.

The user invoked last30days research; no skill was authored, installed, or published. Source preferences and manifests were not changed.

## Closest implementations

| Source | What it does | Useful influence / limitation |
| --- | --- | --- |
| [Cursor review-and-ship](https://github.com/cursor/plugins/blob/main/cursor-team-kit/skills/review-and-ship/SKILL.md) | Inspect intent and diff, test, review, fix, selectively commit, push and open/update a PR | Best concise model for the pre-PR sequence. Its PR endpoint alone does not cover subsequent CI and review repair. |
| [nsollazzo/ship-kit](https://github.com/nsollazzo/ship-kit) | Simplify, verify, review, commit, publish, babysit, reflect | Closest end-to-end composition. README distinguishes approved/green/mergeable from merge; merge-and-monitor follows explicit merge mode. Adapt that endpoint distinction without copying its opinionated flags, routine reflection gate, or automatic messaging. |
| [garrytan/gstack ship](https://github.com/garrytan/gstack/blob/main/ship/SKILL.md) | Base synchronization, checks, review, version/changelog work, commits, push and PR workflow | Broad release engineering reference; substantially larger and more framework-specific than the gap here. Version bumps and release documents must follow the target repository's policy, not become universal steps. |
| [Keykor/ship-it](https://github.com/Keykor/ship-it) | Onboard, plan, implement milestones, PR, Copilot watch and repair | Good repository-derived policy and handoff model. Copilot dependency and two-round review cap make it less suitable as a generic completion loop. |
| [LunkiBR/ship-it](https://github.com/LunkiBR/ship-it) | Checks missing UX/product details by screen and flow | A separate meaning of ship-it: missing recovery, empty states, billing and similar flows. Useful conditional product review, not Git delivery; does not establish security or accessibility compliance. |

These are current source observations. Retrieval dates and search crawl dates do not prove a feature was introduced in the community window.

## Proposed contract for a future local skill

1. Resolve the actual change, owned files, repository policy, existing PR, and endpoint from session context. Preserve prior authorization and unrelated work.
2. Review intent fit and correctness. Repair supported findings, with targeted security/product checks only when relevant.
3. Verify the final changed behavior using project checks; a review repair invalidates earlier evidence where affected.
4. Delegate Git transitions and PR text to `git-workflow`; reuse an existing PR. Do not add routine version bumps or unrelated cleanup.
5. Route ongoing remote CI/review repair to `babysit-pr`, carrying PR identity, head revision, endpoint and authority. A PR URL, queued merge or green local test is not proof of the requested final state.
6. Report the observed endpoint precisely: PR open, ready, merged, or deployed and verified. Production health is a distinct check when deployment is requested.

Suggested evaluations: dirty mixed worktree; existing PR; review fix after green tests; stale approval after push; failing non-Actions check; merge queue still pending; missing messaging authority; deployment success with old revision still serving. A question about shipping should not mutate Git state. Ordinary shipping authorization should not be re-requested at each reversible step.

## Preferred repositories consulted, in preference order

Pinned tree revisions, selected paths and complete fetched content are stored in the adjacent repositories and snapshots JSON files. Every preferred repository was inspected live; upstream instructions were research material, not executed workflows.

| Preferred repository | Inspected material | Influence or non-applicability |
| --- | --- | --- |
| mattpocock/skills | engineering/code-review | Separate standards compliance from original intent/spec fit; pin the comparison base. Do not duplicate its review implementation in the coordinator. |
| obra/superpowers | finishing-a-development-branch | Verify before integration and distinguish managed/detached worktrees. Its fixed choice menu should not override an endpoint already requested. |
| addyosmani/agent-skills | shipping-and-launch | Rollout, monitoring and rollback belong to production shipping. Relevant only when deployment is in scope. |
| cursor/plugins | cursor-team-kit/review-and-ship; pstack/principle-sequence-verifiable-units | Concise review-to-PR sequence plus independently verifiable delivery units. pstack source saved separately. Do not impose unconditional rebasing over repository policy. |
| DietrichGebert/ponytail | ponytail-review | Review scoring/format is a possible review input, not a replacement for observed completion evidence. No additional delivery owner needed. |
| mvanhorn/last30days-skill | README and installed v3.25.0 engine/skill | Research retrieval, source coverage and saved evidence. Does not supply the delivery workflow. |
| anthropics/skills | skill-creator | Progressive disclosure and scenario-based skill evaluation for any future implementation; not a shipping stage itself. |
| trailofbits/skills | differential-review | Risk-sensitive review using history, affected callers and coverage. Invoke selectively for relevant changes rather than auditing every minor ship request. |
| EveryInc/compound-engineering-plugin | ce-compound | Capture only non-obvious verified lessons absent from existing artifacts. Avoid mandatory completion-note churn. |
| garrytan/gstack | ship | Broad release workflow and explicit verification gate; adapt selectively rather than import its framework and versioning conventions. |
| affaan-m/ECC | skills/verification-loop | Build, types, lint and test phases inform evidence categories. Existing local verification skill already owns this responsibility. |
| wshobson/agents | ship-mate/scan | Generates/refreshes project context; useful bootstrapping but not needed to deliver an already-understood change. Do not generate AGENTS.md during every ship run. |
| nahid-sparktales/agent-dispatcher | devops/release-verification | Confirm serving revision, all instances, real smoke paths and error/latency baseline. Distinguish a completed deploy job from a healthy release. |

## Recent community evidence and limits

The engine saved 23 items: nine Reddit threads, twelve Hacker News items and two GitHub items. Many were unrelated lexical matches (cargo shipping, device shipping) or broad AI coding discussions. They do not support a popularity ranking or consensus about a specific ship-it skill. GitHub repository snapshots establish current existence, not recent adoption or release dates. No relevant prediction-market angle was identified, so Polymarket was not searched. X, YouTube and paid social sources were unavailable in the diagnostic.

The engine reduced the supplied three-query plan to two executed queries; the UX alternative was inspected directly through its primary repository. No community quotes are used to endorse candidates: returned comments concern broader coding or adjacent products, not these candidate workflows. The aggregate raw footer includes irrelevant retrieved items and is a retrieval count, not a count of supporting evidence.

Primary-source inspection supports the proposed composition. None of these upstream skills was executed or benchmarked. This research-only change requires no manifest validation.

## WebSearch supplemental results

Three post-engine search queries covered recent ship-it skills, merge-ready delivery skills, and LunkiBR UX patterns. Pre-research searches resolved the naming ambiguity and relevant repositories/communities.

- **Cursor** (github.com) - review-and-ship provides the concise diff/review/test/commit/PR sequence; direct pinned source captured locally.
- **nsollazzo** (github.com) - ship-kit documents approved/green/mergeable as its normal endpoint and explicit merge-and-monitor support.
- **Keykor** (github.com) - ship-it reads repository policy and hands implementation into a Copilot-specific watch/fix loop.
- **Garry Tan** (github.com) - gstack supplies a broader release workflow, with checks, versioning and PR handling.
- **LunkiBR** (github.com) - ship-it audits product surface completeness; its architecture explains applicability-sensitive patterns and selective reference loading.

Search-directory entries and unrelated results were discovery leads only; technical conclusions use the primary repositories linked above.
