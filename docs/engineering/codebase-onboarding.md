# Codebase onboarding

Use `codebase-onboarding` to get an accurate map of an unfamiliar repository.

Examples:

- “I just joined; give me an overview of this repo.”
- “How does this service work?”
- “Where do I start if I need to change billing?”
- “Write an onboarding guide for this project.”

The skill fixes who the map is for and what they need to do next, then surveys manifests, docs, the directory tree, entry points, CI, and tests before reading deeply. It describes the architecture as the code shows it and traces one real request, job, or command end to end with file and line references. It reports the conventions the code already follows, each with an example file, and names inconsistencies. It lists the commands to run, test, and build, marked as run or untested, and the first files to read for the reader's task.

It checks existing documentation against the code and reports where they disagree. It is read-only unless asked to save the guide, and never overwrites existing docs. On large repositories it can hand areas to the `orchestrate-explorer` agent.

## Workflow fit

`codebase-design` owns design changes, `research` external questions, and `writing-for-agents` any agent instruction file.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-adoption-research.md), and the [skill instructions](../../skills/engineering/codebase-onboarding/SKILL.md).
