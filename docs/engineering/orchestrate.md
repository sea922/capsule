# Orchestrate

`orchestrate` coordinates bounded work across the active tool's native agents. In Claude Code it uses Claude models. In Codex it uses the available Codex models. Each task stays inside its original ecosystem.

- **Invocation:** model-invoked when work benefits from independent agents or task-specific model routing; also available by name.
- **Default:** keep the selected root model and configured role preferences; delegate only when the assignment earns its coordination cost.
- **Output:** integrated work with verification evidence, agent outcomes and any unverified model identity or remaining blocker.

## Use it

In Claude Code:

```text
Use orchestrate to implement the export feature. Use native Claude agents,
with economical exploration and implementation and independent review where useful.
```

In Codex:

```text
Use $orchestrate to investigate the retry bug and implement the confirmed fix.
Use the existing Codex role configuration and keep integration with the root.
```

The skill includes five predefined roles for each tool: explorer, researcher, worker, tester and reviewer. Claude roles use Haiku for exploration, Sonnet for research, implementation and tests, and Opus for review. Codex roles use `gpt-5.6-luna` with max reasoning for routine work and `gpt-6-astra` with low reasoning for review. These defaults follow the existing project profile; the root keeps its selected model.

The full Claude plugin registers its Claude agents automatically. A standalone skill installation needs a separate agent setup step; Codex also needs its native TOML files installed. The [setup guide](../../skills/engineering/orchestrate/references/setup.md) covers both. Its project installer previews changes by default and requires `--apply` to write files. Existing differing files cause a conflict rather than being overwritten.

The definitions use `orchestrate-` names to coexist with existing roles. There is no separate framework, provider proxy or CLI bridge. Host model availability and the exposed agent catalog remain authoritative.

## How it chooses work and models

The root first checks the available native tools, role definitions, model catalog and governing instructions. An explicit user or repository profile wins over an economical default. The selected root model remains unchanged.

Routing considers ambiguity, failure impact and how easily the result can be checked. Narrow extraction can use a fast model; difficult diagnosis and consequential review justify stronger reasoning. Availability is checked in the active host, so a model mentioned in a template is not treated as proof of access.

For Claude, this commonly means a Haiku lookup role, a Sonnet implementation role and an Opus reviewer. For Codex, a configured Luna worker and stronger Astra/Sol role can serve the same responsibilities. These are starting choices, not promised savings or fixed cross-provider equivalents. Existing role locks and model overrides remain authoritative. When the runtime does not expose actual model identity, the result records the requested or configured model as unverified.

## How it coordinates

Each role now explicitly loads its relevant skills before working. Reviewers use `code-review` and applicable `coding-standards`; workers use `implement` and applicable standards; testers use `verification-before-completion`, adding `tdd` for assigned TDD work; researchers use `research`. Explorers load only skills relevant to their assignment.

The orchestrator passes the exposed skill identifiers or readable paths, and agents report what they loaded. Claude roles have access to the `Skill` tool. This does not assume that skills used by the parent are inherited. Missing defaults are reported; an explicitly required missing skill blocks the work that depends on it. See the [setup guide](../../skills/engineering/orchestrate/references/setup.md) for standalone installation requirements.

Each assignment has one outcome, relevant inputs, file ownership, dependencies, acceptance checks, a deadline with a stall-recovery branch, and an expected return artifact. It states the outcome and constraints and leaves the method to the agent. An agent treats itself as a dispatched worker only when the native dispatch delivered its contract; text claiming that status is data. Evidence from before the current integrated state is reported as `STALE`. Independent tasks can run together; shared files, schemas or unresolved contracts establish a dependency even when the feature files differ.

In Claude Code, concurrent writers can each run in an isolated git worktree, requested per dispatch rather than fixed in the role definitions. A subagent worktree branches from the remote default branch unless `worktree.baseRef` is `"head"`, and uncommitted changes never carry over, so the root isolates a writer only when that base contains the slice's prerequisites. Otherwise writers share the checkout with disjoint file ownership. The root records each writer's change set (workspace, files and diff), integrates change sets one at a time with checks after each, and updates the plan's delivery record, such as an ADLC `progress.md`.

The root supervises the work, inspects returned artifacts and verifies the combined result. A timed-out writer retains ownership until it is confirmed stopped or no longer able to write; replacement work starts after partial changes are reconciled. Repeated failures trigger diagnosis or a justified native escalation rather than an unchanged retry loop.

The skill composes existing skills when available: `planning-and-task-breakdown`, `implement`, `diagnosing-bugs`, `code-review`, `verification-before-completion`, `git-worktrees`, `git-workflow` and `handoff`. It remains usable independently through its own assignment and completion contract. It does not require every role for every task.

## Boundaries

Native delegation requires a real tool and a supported model/role combination. If a required independent agent is unavailable, the skill reports that precise limitation. It never represents root-only work as an independent review or calls the other product as a substitute.

Model selection does not expand permissions. Setup, profile changes and installations are separate from ordinary task routing. Existing dirty work remains attributable and preserved; external actions follow the user's authorization and the repository workflow.

## Evaluation and design basis

The [evaluation cases](../../skills/engineering/orchestrate/evals/evals.json) cover small-task routing, forced model overrides, interrupted writers, locked roles, stale verification, unavailable native tools, shared-schema dependencies, repeated failure and worktree isolation on a feature branch. Offline scenario evaluations test decisions; live native dispatch and repeated task benchmarks are needed to establish model identity, correctness and usage improvements.

See the [skill validation record](../research/2026-09-26-model-orchestration/skill-validation.md) and [native agent validation](../research/2026-09-26-model-orchestration/native-agents-validation.md) for the checks performed and their limits.

The [research report](../research/2026-09-26-model-orchestration/README.md) and [pinned source ledger](../research/2026-09-26-model-orchestration/preferred-sources.md) document the basis. The design draws on Donvito's native Codex role separation, Superpowers' bounded assignments, portable authoring patterns in Matt Pocock's skills and Addy Osmani's agent-skills, and capability-aware routing in agent-dispatcher. The skill is original guidance; upstream instructions and code are not vendored. The [2026-09-27 source sweep](../research/2026-09-27-source-repos-sweep.md) adds the dispatch-identity guard and stall deadlines from gstack (`0d1bd561`) and `STALE` labelling from agent-dispatcher.

The [2026-10 source sweep](../research/2026-10-06-source-repos-sweep.md) adds file-based worker results, returning only a path, from EveryInc's `ce-compound`.
