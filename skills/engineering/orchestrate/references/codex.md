# Codex native routing

Read this reference only when Codex is the active harness. Use Codex's native subagent mechanism and models available to the current Codex host. Do not call Claude Code, a CLI bridge, a provider proxy, or another harness.

## Role and model resolution

Custom Codex agents may be defined in `.codex/agents/` or `~/.codex/agents/`. Native role configuration can include a name, description, developer instructions, model, reasoning effort, and sandbox settings. The active tool schema, role inheritance, defaults, locks, concurrency controls, and model catalog determine what a dispatch can actually request. Use per-call model/effort fields only when the native schema accepts them and the selected role permits overrides; otherwise use the configured role as-is. Do not assume that every generic call can override a configured role.

Prefer an already configured named role whose permissions and model fit the contract. For a profile that already assigns Luna to routine roles, use that configured role; resolve its exact model and effort from the host rather than hardcoding a model or version. Otherwise use the least expensive configured model likely to meet the acceptance checks, and a stronger configured role for ambiguity, high-impact changes, or independent review. Preserve the root's selected model and explicit effort/profile settings. A locked role's model and effort win over a rejected per-call override.

## Bundled roles

Five native TOML definitions live in `assets/codex-agents/`, named `orchestrate-explorer`, `orchestrate-researcher`, `orchestrate-worker`, `orchestrate-tester`, and `orchestrate-reviewer`. Their defaults follow this repository's Luna/Astra profile; installed definitions and the live catalog remain authoritative. Prefer them when exposed and compatible with the contract, while preserving explicit project role preferences.

When setup is requested, follow [setup.md](setup.md) to install project-local definitions. Do not install or change models merely to make an ordinary dispatch succeed.

Installing or linking this skill does not register a Codex role. If the requested model, effort, or role is unavailable or rejected, preserve the error and report it. An authorized supported fallback may satisfy a qualitative request, but record requested, configured, and observed identities separately. Never silently substitute another provider or pretend that a failed native spawn succeeded.
