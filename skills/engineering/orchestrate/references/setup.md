# Set up native agents

Read this reference when the user requests agent installation or configuration. Ordinary task routing uses the roles already exposed by the host.

## Choose the installation

The full Claude plugin manifest registers the five Markdown definitions in `assets/claude-agents/`. A skill-only install or development skill link does not register them. For that case, use the project installer with `--host claude`. For Codex, use `--host codex` to copy the five TOML definitions from `assets/codex-agents/`.

Run with Node.js 20+ from this repository root, replacing the target with an existing project directory:

```sh
node skills/engineering/orchestrate/scripts/install-agents.mjs --host codex --target "/path/to/your-project"
node skills/engineering/orchestrate/scripts/install-agents.mjs --host codex --target "/path/to/your-project" --apply
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

These are bundled profile defaults (Codex model and reasoning-effort IDs vary by signed-in account and can be rejected pre-egress if unadvertised). Verify model and effort availability against the active host catalog and preserve explicit user/project preferences before dispatch. A configured model is not evidence of the model that actually executed a task.

All Claude roles allow Skill to load relevant instructions. Explorer and reviewer otherwise allow only Read, Glob and Grep; researcher additionally allows WebSearch and WebFetch. Worker and tester additionally allow Edit, Write and Bash. Supply the reviewer with the latest diff inline or as a readable file. None exposes Agent for recursive delegation.

Codex explorer, researcher and reviewer request `read-only`; worker and tester request `workspace-write`. Filesystem sandbox modes do not establish blanket restrictions on external services. Worker file ownership and tester-only test edits are assignment rules, not per-file operating-system restrictions. The root must inspect the returned diff.

## Verify discovery

### Skill availability

The agent installer copies role files only; standalone users must install the applicable skills named in `../SKILL.md` Step 3 separately (the full plugin includes them). Roles load skills at runtime by exposed catalog identifier or parent-provided `SKILL.md` path and report missing skills without gaining extra tools or ownership.

### Host registration

Reopen or refresh the host after setup and inspect its exposed native agent catalog. Claude plugin agents may be namespaced: use the identifier the host actually exposes. Project files use the `orchestrate-` prefix and can coexist with existing unprefixed roles. Confirm model, effort and tool access against the current host before use.

Setup is complete when the requested files are present and the host exposes the expected roles. If only file/schema checks were possible, report registration and live dispatch as unverified. Never claim that installing the skill alone selected a model or launched an agent.
