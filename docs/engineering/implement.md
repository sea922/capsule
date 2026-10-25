# Implement

`implement` owns the execution seam between selected work and independently reviewed results. It accepts a direct request, issue, specification, or plan and turns it into the smallest coherent repository change that can be supported by fresh evidence.

- **Invocation:** model-invoked for requests to implement, build, add, change, refactor, or fix known-cause behavior.
- **Default:** one implementation owner working sequentially in the current checkout.
- **Posture:** preserve repository state and user authority; no automatic isolation, staging, commits, pushes, tracker updates, releases, or deployments.
- **Output:** an intentional change set plus outcome, scope, evidence, decisions, and residuals.

## Workflow

### Frame

The skill reads repository instructions, supplied intent, relevant source and tests, and the complete checkout state. It records the branch, HEAD, staged and unstaged paths, and untracked files before editing. Direct work requests authorize necessary repository edits, but not unrelated cleanup or external actions.

Missing detail blocks only when it would materially change product behavior, architecture, external state, cost, or risk. Reversible local details can be resolved from repository evidence and recorded in the handoff.

### Route

The coordinator selects the discipline that owns the unresolved work:

| Evidence state | Workflow |
| --- | --- |
| A failure's cause is unknown | `diagnosing-bugs` |
| One observable behavior can be exercised | `tdd` |
| A consequential module seam is unresolved | `codebase-design` |
| A large clear outcome lacks slices or dependency order | `planning-and-task-breakdown` |
| An external or version-specific contract is uncertain | `research` |
| A design choice needs an experiment | `prototype` |
| Security or privacy risk requires an independent gate | `security-review` plus required repository checks |
| The final outcome needs proof | `verification-before-completion` |

Review-only requests go directly to `code-review`. A requested review-and-fix completes the read-only review before returning to implementation.

### Execute

Work proceeds in coherent vertical or risk-first slices. Each slice inspects the responsible seam, makes one minimum complete change, updates all artifacts that share that contract, runs the narrowest useful check, and re-reads the diff before another slice starts.

Parallel implementation is not the default. It requires authorization, genuinely independent paths and contracts, and one integration owner. A worktree must have the correct base and every ignored fixture, database, credential, or generated asset required by the decisive verification. Major work in a dirty primary checkout pauses before isolation.

### Prove and hand off

After the final relevant edit, `verification-before-completion` maps acceptance claims to fresh evidence. The handoff distinguishes task-owned files from preserved dirty state and does not say done, fixed, passing, or ready beyond the verified scope.

Long-running work updates an existing issue, plan, cycle record, or repository artifact with its base commit, decisions, slices, and evidence. A private task ledger is a fallback, not a new project-management system.

Use `handoff` at a pause, pickup, or transfer boundary. Delegated units remain pending until their owner returns an inspected artifact and evidence. If a review concern survives two correction attempts, implementation switches to diagnosis and continues from new evidence rather than repeating an unchanged loop.

## Boundaries

`implement` does not require a plan, invent a shadow tracker, diagnose by editing, force TDD onto non-behavioral work, run broad checks by ritual, or infer publication authority. A plan or requested approach that conflicts with repository evidence is surfaced as a decision gate.

## Attribution and design basis

The original local workflow was informed by the implementation router in Matt Pocock's MIT-licensed [`implement`](https://github.com/mattpocock/skills/tree/main/skills/engineering/implement), plan and handoff discipline from Obra's MIT-licensed [`executing-plans`](https://github.com/obra/superpowers/tree/main/skills/executing-plans) and [`subagent-driven-development`](https://github.com/obra/superpowers/tree/main/skills/subagent-driven-development), vertical slices from Addy Osmani's MIT-licensed [`incremental-implementation`](https://github.com/addyosmani/agent-skills/tree/main/skills/incremental-implementation), resumable context from Wshobson's MIT-licensed [Conductor](https://github.com/wshobson/agents/tree/main/plugins/conductor), and outcome/verifiable-unit principles from Cursor's MIT-licensed pstack subtree. No upstream instructions are vendored. See the pinned [research record](../research/implement-skill-research.md).

Unrequested mechanisms (guards, fallbacks, options, abstractions) are built only when a contract requires them, leaving them out lets harm land unnoticed, or adding them later would be expensive; requested behavior is never narrowed to fit a safeguard, and replaced in-repo interfaces are removed rather than wrapped. After two failed corrections, the shared assumption is named before diagnosis. These rules come from the [2026-10 source sweep](../research/2026-10-06-source-repos-sweep.md), drawing on EveryInc's `ce-work` and `ce-plan`.
