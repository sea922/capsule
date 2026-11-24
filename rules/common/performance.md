# Model and Context Performance

## Model Selection Strategy

Match the model to the work, and prefer the project's or user's configured
choice over these defaults:

- **Smallest capable model:** lightweight, frequent, well-bounded tasks, such as
  searching code or running one check, and worker agents in multi-agent runs
- **Main coding model:** everyday development, multi-file changes, and
  orchestrating other agents
- **Deepest-reasoning model:** architectural decisions, hard diagnosis, and
  independent review

The `orchestrate` skill routes delegated work to models. A configured model is
a preference, not proof of which model ran: record what was observed.

## Context Window Management

Avoid last 20% of context window for:
- Large-scale refactoring
- Feature implementation spanning multiple files
- Debugging complex interactions

Lower context sensitivity tasks:
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple bug fixes

## Reasoning Effort and Plan Mode

Claude Code lets the model choose how much to think for each task. Raise the
effort for work that needs deep reasoning, with `/effort` in a session or
`--effort <level>` at launch; available levels depend on the model. See
[Claude Code model configuration](https://code.claude.com/docs/en/model-config#adjust-effort-level).

For complex tasks requiring deep reasoning:
1. Choose a higher supported effort level
2. Enable **Plan Mode** for a structured approach
3. Use the `grilling` skill to stress-test the plan before building
4. Use `code-review` deep mode for independent perspectives

## Build Troubleshooting

If build fails:
1. Read the first error, not the last: later errors often follow from it
2. Use the `diagnosing-bugs` skill when the cause is not clear
3. Fix incrementally
4. Verify after each fix

To make software itself faster, use the `performance` and `benchmark` skills.
