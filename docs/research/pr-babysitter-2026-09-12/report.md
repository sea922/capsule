# PR babysitter: completion workflow options

Researched 2026-09-12. Requested community window: 2026-08-13 through 2026-09-12. Scope: research and discussion before authoring a skill for an existing pull request. GitHub is the researched first implementation; other forges are an open product choice.

## Recommendation

Build `babysit-pr` as a focused completion owner with a small deterministic watcher and resumable state. Reuse the library's diagnosis, implementation, review and verification methods. The new responsibility is carrying work between those methods, handling arriving feedback, and verifying the selected endpoint.

For the user's completion emphasis, a push, one green snapshot, auto-merge enablement, and queue admission are progress events. They are not proof that the PR merged. Support two explicit endpoints: `ready` and `merged`. A request to land or merge selects the latter and supplies merge authority; a plain babysit request should preserve any standing authority and state its endpoint. Independent work continues while one item awaits a human decision. A blocked or interrupted run reports incomplete work honestly and preserves a precise resume record.

Start with one PR and GitHub. Keep stacked PRs, all-authored-PR sweeps and a dedicated background service out of the first version unless the user selects them. These are proposed design choices, not features already implemented.

## Closest inspected implementations

### OpenAI: strongest persistence contract

[Pinned babysit-pr](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/.codex/skills/babysit-pr/SKILL.md) treats green, mergeable and review-clean as an optional handoff milestone while continuing to watch an open PR. It explicitly rearms after a fix/push and handles review feedback before wasting retries on an old commit. A bundled Python watcher supplies structured snapshots and per-head retry state.

Borrow the persistence and structured observation. Adapt its source-specific policies: its review-author filter is too narrow for a general skill. [Issue 19148](https://github.com/openai/codex/issues/19148), opened April 23 and outside this research window, reports missed Copilot feedback. The inspected watcher still requires the bot login suffix and keyword filtering in `is_actionable_review_bot_login`. The issue is evidence for a regression scenario, not a newly reported September incident. Ingest all relevant review surfaces, then assess relevance and trust separately. Do not equate an unrecognized author with absent feedback.

### pstack: clear ownership and merge boundary

[Pinned babysit playbook](https://github.com/cursor/plugins/blob/889ec4b68fa5aab0e867dad71ec3fdf386ae48f3/pstack/skills/poteto-mode/playbooks/babysit.md) distinguishes drive, background, threads-only and check modes, insists on one babysitter per stack, and separates merge readiness from shipping. It batches fixes before pushing and asks the forge for mergeability instead of trusting a list of green checks. Its separate shipping playbook watches actual merge completion.

Borrow one writer, batching and explicit endpoints. Do not import its full stack frontier and Cursor-specific verification machinery into a single-PR version. Its blanket conflict handback is a deliberate boundary, not proof that mechanical conflict repair cannot be automated. Its claim that an untouched-code failure means stale base is too strong to adopt: unrelated failures still need diagnosis.

### Compound Engineering: richest recovery model

[Pinned ce-babysit-pr](https://github.com/EveryInc/compound-engineering-plugin/blob/5c32ef92339b95348d6a12000e814d4877902557/skills/ce-babysit-pr/SKILL.md) combines review feedback, CI and branch currency. Its watcher detects changes, while the agent reasons on wakeup. It distinguishes target, stack-ready and stack-land postures; target stops at a settled readiness judgment. References cover claims before mutations, interrupted-operation reconciliation, stale-head cancellation, delayed review evidence and non-converging repair loops.

Borrow those failure cases and the separation of observation from judgment. Do not copy the whole managed-stack subsystem or its rigid rule that only a helper-emitted item can authorize branch updates. Our skill must honor current user instructions and the active harness's authority rules. Some source policies authorize replies and thread resolution by invocation; that cannot override a host requiring explicit messaging authorization.

### Smaller alternatives

[vaibhavmalik/babysit-pr](https://github.com/vaibhavmalik/babysit-pr/blob/7f4e76f9099220d539dabf962e7ccc355c5c48a6/skills/babysit-pr/SKILL.md) provides a compact review-fix-push loop and merged-PR follow-up mode. Its automatic stash and hard reset of the old branch are unsuitable defaults here. Retain the clear feedback disposition idea; post-merge follow-up work should be separately scoped.

`venables/skills` was discovered through search and the research engine, but direct GitHub tree retrieval was rate-limited. A subsequent README attempt without a resolved revision returned 404. Its implementation was not verified and does not determine the recommendation.

## Implementation options

| Option | Benefit | Cost or limitation | Fit |
| --- | --- | --- | --- |
| Instructions only, using existing CLI tools | Smallest artifact; easy to adapt to a second forge | Agent repeatedly reconstructs state, deduplication and waits; interrupted actions are harder to reconcile | Good prototype or occasional short runs |
| Skill plus a small snapshot/watcher helper | Testable state handling, cheap quiet waits, restart recovery and consistent endpoint evidence | Own a modest helper and its behavioral tests | Recommended first published version |
| Skill plus durable scheduling | Can resume across sessions and long approval delays | Must persist authority and decisions, prevent duplicate writers, and integrate with each harness's supported scheduler | Add when overnight operation is required |

A durable scheduler is an execution choice layered on the same skill, not a replacement for its repair loop. A detached poller is not proof that an agent will wake and act. No automation was created during this research.

## Proposed completion contract

1. Resolve repository host, PR, head/base branches and current SHAs, checkout ownership, required gates, selected endpoint and existing action authority.
2. Read inline threads, submitted review bodies, top-level comments, checks and mergeability. Track edited as well as new feedback. Unknown or incomplete API state prevents readiness claims.
3. Classify feedback against code. Fix valid in-scope findings; preserve evidence for rejected or deferred findings. Posting replies and resolving threads must follow the user's established scope and the host's messaging rules.
4. Diagnose branch failures, infra failures and plausible flakes separately. Bound retries for the same failure and keep a run-level limit so new commits cannot renew the allowance indefinitely. Continue independent repairs while a decision is pending.
5. Batch compatible fixes, verify, commit/push when authorized, then immediately rearm on the new head. Cancel decisions based on a stale head. Reconcile uncertain writes before attempting them again.
6. Update the base only when required by policy, a conflict, or the user. Do not chase every main-branch commit and restart green CI unnecessarily. Mechanical conflicts can be repaired within scope; semantic conflicts need a decision with concrete alternatives.
7. Recheck required gates and pending review activity. A quiet interval is supporting evidence, not a substitute for required reviews. For `ready`, report the observed revision and remaining external gate. For `merged`, continue through auto-merge or queue admission and verify the remote merged state.
8. Persist endpoint, target, latest SHAs, processed feedback revisions, outstanding dispositions, retries, pending mutations and resume instructions. A stopped watcher must never be described as still monitoring.

[GitHub auto-merge](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request) waits for required reviews and checks, and can be disabled by certain later changes. [Merge queues](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) validate combined changes and can remove a PR on failure. Required GitHub Actions checks need the `merge_group` trigger. Therefore queue entry and PR-head CI green do not establish merge completion.

## Local fit and evaluation

The existing `implement`, `diagnosing-bugs`, `code-review`, `verification-before-completion` and `handoff` skills already own the constituent activities. `babysit-pr` should own continuity and external PR state, without reproducing full debugging or review guides. It begins after a PR exists; creating the initial PR and deploying after merge remain separate workflows unless requested.

Evaluate transitions, not whether a report repeats the instructions. Representative scenarios:

- A late bot review arrives after green CI; monitoring resumes and handles it.
- A push races with CI inspection; old-head results cannot trigger a repair or completion claim.
- A Copilot-style author, edited top-level comment or paginated thread is not silently missed.
- A likely flake repeats; retries stop without disguising failure as success.
- A fix resolves A but brings A back after repairing B; the agent identifies oscillation rather than continuing to churn.
- A push succeeds but its response is lost; re-entry observes it instead of duplicating the mutation.
- Auto-merge is armed, then disabled, or a queue rejects the PR; the run remains incomplete.
- One finding needs human judgment while an independent CI repair remains actionable.
- A dirty checkout or competing watcher cannot cause user work to be discarded.
- An interruption preserves authority and endpoint; a closed-unmerged PR is not reported as merged.

Use fixture-driven helper tests plus end-to-end agent scenarios with a withheld baseline, following the useful evaluation mechanics in Anthropic's skill creator. No upstream workflows or proposed babysitter were executed against a real PR.

## Recent evidence and limitations

Two last30days runs are preserved. The first query's `PR` abbreviation attracted public-relations stories, so the second used `pull request babysitter`. The refined run retrieved 30 items across Reddit, Hacker News and GitHub, but its visible clusters remained mainly adjacent review tooling rather than strong evidence about sustained babysitting. Reddit was partial after HTTP 429; X and YouTube were unavailable and TikTok/Instagram were inactive. Do not infer silence on those platforms.

The engine normalized the first how-to plan to `evergreen_ok` despite the supplied strict mode. The refined concept plan retained the requested recent setting. Upstream source reads are current snapshots; the watcher issue from April is deliberately labeled historical. Search crawl dates are not publication dates. There is insufficient relevant community evidence to claim a consensus or compare real-world success rates.

Engine footer metrics are retrieval metadata, not adoption metrics: its GitHub comment aggregate is drawn from repository open-issue counts and its stars are repository-wide. They do not measure use or effectiveness of the babysitter skill. No subagents were spawned; the footer's agent wording is engine-generated.

## Decisions for discussion

Recommended starting shape: GitHub, one PR, helper-backed continuous watch, resumable state, standing authority reused throughout, and an explicit `ready` or `merged` endpoint. The highest-value choice is whether your usual invocation should finish at your merge decision or carry authorized merges all the way to confirmed completion. Next choose whether overnight cross-session operation is essential and whether Azure DevOps must be supported from the start.

Research only: no skill, publication entry, manifest or version was changed. All research artifacts are in this directory.

## Preferred-source consultation in owner order

Every preferred repository was consulted. Revisions and inspected source bodies are retained in `repository-trees.json` and `source-snapshots.json`. These are research inputs, not installed dependencies.

| Repository and pinned source | Revision | Influence or scope limit |
| --- | --- | --- |
| [mattpocock/skills](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/code-review/SKILL.md) | `3cca18b368ae95cdbdebbff572ccafa662551015` | Review and merge-conflict skills: assess feedback against spec and standards; preserve both change intents. Do not copy blanket staging or always-resolve policies. |
| [obra/superpowers](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/receiving-code-review/SKILL.md) | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | Receiving review and finishing a branch: verify suggestions before changing code and distinguish integration outcomes. Its repeated menu is unsuitable once completion authority is already established. |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/blob/be4e44a9fbc5e8df0beaefadbb28bd22ee61cc39/skills/shipping-and-launch/SKILL.md) | `be4e44a9fbc5e8df0beaefadbb28bd22ee61cc39` | Shipping and launch: evidence before declaring success. Deployment, rollout and production monitoring are beyond this PR-only scope. |
| [cursor/plugins](https://github.com/cursor/plugins/blob/889ec4b68fa5aab0e867dad71ec3fdf386ae48f3/pstack/skills/poteto-mode/playbooks/babysit.md) | `889ec4b68fa5aab0e867dad71ec3fdf386ae48f3` | Direct influence: one writer, forge readiness, batching and separate shipping. Avoid importing stack and Cursor dependencies. |
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail/blob/356918eba965ee1eac64bd3a7f0dd02108350de5/README.md) | `356918eba965ee1eac64bd3a7f0dd02108350de5` | README consultation: simplicity and resistance to unnecessary complexity inform a small helper over a new orchestration framework. Marketing performance figures were not evaluated. |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill/blob/ca9d415e66073b17702f385d6886934097aec0e7/README.md) | `ca9d415e66073b17702f385d6886934097aec0e7` | Current README plus installed v3.21.1 engine: recent discovery and raw evidence preservation. Coverage limits and noisy retrieval constrain community claims. |
| [anthropics/skills](https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/skill-creator/SKILL.md) | `34040c9c568585f6929bedeaad110ad08f079624` | Skill-creator: scenario evaluations, baseline comparison and human inspection. Inform the future validation plan; no evaluation run claimed. |
| [trailofbits/skills](https://github.com/trailofbits/skills/blob/321ccfe628eca0d314b0ee4eaffcdd8a05639aaf/plugins/differential-review/skills/differential-review/SKILL.md) | `321ccfe628eca0d314b0ee4eaffcdd8a05639aaf` | Differential review: evidence-backed findings and explicit coverage limits. Specialist security audit is a conditional handoff, not a per-poll requirement. |
| [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin/blob/5c32ef92339b95348d6a12000e814d4877902557/skills/ce-babysit-pr/SKILL.md) | `5c32ef92339b95348d6a12000e814d4877902557` | Direct influence: deterministic wakeups, stale-head handling, interrupted writes, settle evidence and non-convergence. Selected references also inspected. |
