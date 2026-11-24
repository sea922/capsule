# Hooks System

## Hook Types

- **PreToolUse**: Before tool execution (validation, parameter modification)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When session ends (final verification)

A hook that blocks an action is telling you something. Fix what it reports;
never work around it, and never disable it without the user's agreement.

## capsule's Hooks

The capsule plugin ships four PreToolUse guards:

- **block-no-verify**: refuses git commands that skip the repository's hooks
  (`--no-verify`, `commit -n`, `core.hooksPath` overrides, `HUSKY=0`)
- **config-protection**: refuses edits to existing lint and format
  configuration, so the code is fixed instead of the check
- **block-destructive**: refuses a short list of commands that destroy more
  than a task needs, such as deleting the home directory, force-pushing to
  `main`, dropping a database or schema, or destroying infrastructure
- **block-secret-commit**: refuses a commit whose added lines hold a private
  key or a vendor-format token

The user can turn any of them off with `CAPSULE_HOOKS_DISABLED=<id>`. Do not set it
yourself.

## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use dangerously-skip-permissions flag
- Configure `permissions.allow` rules in `~/.claude/settings.json` (or a project's `.claude/settings.json`) instead

## Task List Best Practices

Use the task list tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

A task list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements
