---
paths:
  - "**/*.css"
  - "**/*.scss"
  - "**/*.sass"
  - "**/*.less"
  - "**/*.html"
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.vue"
  - "**/*.svelte"
---
> This file extends [common/hooks.md](../common/hooks.md) with web-specific hook recommendations.

# Web Hooks

capsule does not ship these. They are examples a project can adopt in its
`.claude/settings.json`, adjusted to its own package manager and scripts.

A hook command receives the tool call as JSON on standard input; the edited
file's path is at `tool_input.file_path`. The examples read it with `jq`.
Hook configuration changes between Claude Code versions, so confirm the shape
against the current hooks documentation.

## Recommended PostToolUse Hooks

Prefer project-local tooling. Do not wire hooks to remote one-off package execution.

### Format on Save

Use the project's existing formatter entrypoint after edits:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path | select(test(\"\\\\.(css|scss|html|jsx?|tsx?|vue|svelte)$\"))' | xargs -I{} pnpm prettier --write {}"
          }
        ]
      }
    ]
  }
}
```

Equivalent local commands via `yarn prettier` or `npm exec prettier --` are fine when they use repo-owned dependencies.

### Lint Check

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path | select(test(\"\\\\.(jsx?|tsx?|vue|svelte)$\"))' | xargs -I{} pnpm eslint --fix {}"
          }
        ]
      }
    ]
  }
}
```

### Type Check

Use `--incremental` so re-runs reuse the previous `.tsbuildinfo` instead of checking the whole program each time. Wrap in `timeout` so a stuck `tsc` is stopped instead of piling up when edits arrive faster than it finishes.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "timeout 60 pnpm tsc --noEmit --pretty false --incremental --tsBuildInfoFile node_modules/.cache/tsc-hook.tsbuildinfo"
          }
        ]
      }
    ]
  }
}
```

**Why the flags matter:**
- Without `--incremental`, every edit re-checks the entire program, and slow runs overlap.
- Without `timeout`, a `tsc` that hangs never exits.
- `--tsBuildInfoFile` names where the incremental state is kept, since `--noEmit` writes no other output.

On Windows without GNU coreutils, replace `timeout 60` with a PowerShell wrapper.

### CSS Lint

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path | select(test(\"\\\\.(css|scss|sass|less)$\"))' | xargs -I{} pnpm stylelint --fix {}"
          }
        ]
      }
    ]
  }
}
```

## PreToolUse Hooks

### Guard File Size

Block oversized writes from the tool input's content, not from a file that may not exist yet. Exit code 2 blocks the call and shows the message to the agent. The limit is an example; use the project's own.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('Blocked: file would be '+lines+' lines; split it into smaller modules');process.exit(2)}})\""
          }
        ]
      }
    ]
  }
}
```

## Stop Hooks

### Final Build Verification

A Stop hook takes no matcher:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "pnpm build" }
        ]
      }
    ]
  }
}
```

## Ordering

Recommended order:
1. format
2. lint
3. type check
4. build verification
