# Set up native agents

Read this reference when the user requests agent installation or configuration. Ordinary task routing uses the roles already exposed by the host.

## Choose the installation

The full Claude plugin manifest registers the five Markdown definitions in `assets/claude-agents/`. A skill-only install or development skill link does not register them. For that case, use the project installer with `--host claude`. For Codex, use `--host codex` to copy the five TOML definitions from `assets/codex-agents/`.

Run with Node.js 24 from this repository root, replacing the target with an existing project directory:

```sh
node skills/engineering/orchestrate/scripts/install-agents.mjs --host codex --target "D:/Source/my-project"
node skills/engineering/orchestrate/scripts/install-agents.mjs --host codex --target "D:/Source/my-project" --apply
```

For Claude Code, replace `codex` with `claude`. From a standalone skill directory, use `node scripts/install-agents.mjs` with the same arguments. Preview the proposed destinations before applying. The installer writes only project-local `.claude/agents/` or `.codex/agents/` definitions; it leaves global configuration and the root model alone. Identical files are unchanged. Any conflicting file blocks the batch before writes; resolve conflicts explicitly rather than deleting existing agents automatically.

## Role defaults

| Name | Claude model | Codex model / effort | Responsibility |
| --- | --- | --- | --- |
| orchestrate-explorer | haiku | gpt-5.6-luna / max | Locate code and execution paths |
| orchestrate-researcher | sonnet | gpt-5.6-luna / max | Verify technical facts and sources |
| orchestrate-worker | sonnet | gpt-5.6-luna / max | Implement an owned change |
| orchestrate-tester | sonnet | gpt-5.6-luna / max | Run checks and edit assigned tests |
| orchestrate-reviewer | opus | gpt-6-astra / low | Independently review the current change |

These are the bundled defaults, based on the existing repository profile. Preserve explicit user/project preferences and check account availability before dispatch. A configured model is not evidence of the model that actually executed a task.

All Claude roles allow Skill to load relevant instructions. Explorer and reviewer otherwise allow only Read, Glob and Grep; researcher additionally allows WebSearch and WebFetch. Worker and tester additionally allow Edit, Write and Bash. Supply the reviewer with the latest diff inline or as a readable file. None exposes Agent for recursive delegation.

Codex explorer, researcher and reviewer request `read-only`; worker and tester request `workspace-write`. Filesystem sandbox modes do not establish blanket restrictions on external services. Worker file ownership and tester-only test edits are assignment rules, not per-file operating-system restrictions. The root must inspect the returned diff.

## Verify discovery

### Explicit skill loading

| Role | Skills loaded before work |
| --- | --- |
| Reviewer | `code-review`; `coding-standards` for convention checks |
| Worker | `implement`; applicable `coding-standards` |
| Tester | `verification-before-completion`; `tdd` for assigned TDD work |
| Researcher | `research` |
| Explorer | Only task-relevant skills named in its assignment |

Install the applicable skills as well as the agent definitions. The agent installer copies role files only. The full plugin includes these skills; standalone users must make the required skills available separately. Roles explicitly load skills at runtime using the host's exposed identifier or a parent-provided readable `SKILL.md` path. This supports plugin namespaces and standalone installations without assuming that a bare preload name resolves in both.

Each role reports which skills it loaded and any missing ones. Missing defaults are disclosed with a bounded fallback; a skill explicitly required by the assignment, user or repository blocks dependent work if unavailable. Loading instructions grants no additional tools or ownership. For example, a Claude reviewer returns a needed shell check to the root, and a tester cannot use TDD guidance to take ownership of production code.

### Host registration

Reopen or refresh the host after setup and inspect its exposed native agent catalog. Claude plugin agents may be namespaced: use the identifier the host actually exposes. Project files use the `orchestrate-` prefix and can coexist with existing unprefixed roles. Confirm model, effort and tool access against the current host before use.

Setup is complete when the requested files are present and the host exposes the expected roles. If only file/schema checks were possible, report registration and live dispatch as unverified. Never claim that installing the skill alone selected a model or launched an agent.
