# Claude Code native routing

Read this reference only when Claude Code is the active harness. Keep the controller in the main conversation; the controller skill is not a worker context.

Use Claude Code's native subagent mechanism and Claude models available to the current account. Do not call Codex, a CLI bridge, a provider proxy, or another harness. A successful native tool result is dispatch evidence; prose saying that an agent ran is not.

## Role and model resolution

Custom agents may be defined in `.claude/agents/` or `~/.claude/agents/`. Treat their frontmatter, the invocation parameters, the active environment, and the tool schema as runtime configuration. If the native call accepts a per-invocation model and the role is not locked, request it there; otherwise use the role's configured model. The effective model may be changed by an invocation override, the agent definition, `CLAUDE_CODE_SUBAGENT_MODEL`, or the main model according to the installed host. With `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`, the effective subagent model is `CLAUDE_CODE_SUBAGENT_MODEL`, falling back to the main model when that variable is unset; this overrides a differing invocation or frontmatter request. A requested Haiku route therefore cannot be reported as successful under a forced Opus setting; if an exact model requirement conflicts with the force setting, leave the slice blocked rather than dispatching and hoping the observed model differs. A role lock or rejected override wins; do not retry it with invented fields.

Select a configured role by acceptance need. When the active account and configuration expose these aliases, use Haiku for narrow, highly verifiable lookup or mechanical checks, Sonnet for bounded implementation, and Opus for ambiguity, high-impact changes, or independent review. These are conditional routing choices, not universal defaults: preserve a user's explicit model choice, use the configured equivalent when an alias is absent, and report an unavailable exact request.

## Bundled roles

The full Claude plugin registers five native definitions from `assets/claude-agents/`: `orchestrate-explorer`, `orchestrate-researcher`, `orchestrate-worker`, `orchestrate-tester`, and `orchestrate-reviewer`. Use their actual exposed, potentially plugin-namespaced identifiers. Preserve explicit project role preferences.

Installing or linking only the skill does not register these definitions. When setup is requested, follow [setup.md](setup.md). A reviewer has Skill and repository read tools: include the current diff in its assignment or provide a readable diff artifact. Tool access and model availability must be checked in the active session.

When a requested Claude model or role cannot be dispatched, report the exact unsupported capability. If the user authorizes a qualitative fallback, use a supported configured Claude role and label it as the fallback; otherwise keep the dependent slice blocked. Never route the slice to Codex or claim that an unobserved model was used.

## Worktree isolation for writers

Claude Code can give a dispatched subagent its own temporary git worktree and branch: the `isolation: worktree` dispatch parameter or agent frontmatter. Isolation removes shared-file collisions between concurrent writers, but the worktree's **base** decides whether the writer sees its prerequisites. By default it branches from the remote default branch; with the `worktree.baseRef: "head"` setting it branches from the local `HEAD`. Uncommitted changes never carry over, and gitignored files arrive only through `.worktreeinclude`.

Request isolation per dispatch, keyed to the base:

- **Concurrent writers, prerequisites contained in the base**: dispatch each writer with worktree isolation. Confirm the base first: the default branch for work that starts there, or `baseRef: "head"` with every prerequisite committed on the current branch.
- **The base lacks a prerequisite** (a feature branch under the default base, or an uncommitted dependency): keep the writer in the shared checkout under the one-writer-per-file rule. When `baseRef` is already `"head"`, committing the prerequisite within authorization before dispatch also works. Changing `worktree.baseRef` is a configuration edit the user must authorize.
- **A single writer, or read-only roles**: the shared checkout suffices.

The bundled roles set no `isolation` in their frontmatter because the right base differs per run.

Record each isolated writer's change set from the dispatch result: the worktree path, its branch, the files touched, and the diff against the base. A worktree with changes stays on disk until it is integrated or removed. Point a tester that verifies an isolated slice at that worktree's path, or run the test after integration. Integrate change sets into the root checkout one at a time, starting with the one that touches shared hotspot files (routes, configs, registries, schemas), and rerun checks after each merge. A clean merge does not show that the slices agree at runtime; the integrated checks do. Remove an integrated worktree and its branch only within the user's git authorization.
