# Skill mechanics

The skill-specific branch of [`writing-for-agents`](../SKILL.md): what changes
when the document is a skill. Frontmatter, the description, the invocation
choice, layout, and router skills. Everything else about writing it is the
universal model in `SKILL.md`.

## Frontmatter

Two fields are required, and the whole frontmatter block stays under 1024
characters.

```yaml
---
name: writing-for-agents
description: <identity, then trigger branches, then boundary>
---
```

- **`name`** uses lowercase letters, numbers, and hyphens only. No parentheses,
  no spaces, no special characters. It must match the skill's directory name, or
  the skill will not load.
- **`description`** is the skill's top-level context pointer, and every pointer
  rule in `SKILL.md` applies to it in full.

Optional fields exist per the [Agent Skills
specification](https://agentskills.io/specification); reach for them only when
you need one.

## Writing the description

Three widely used sources give conflicting advice here, so the resolution
matters more than any single rule.

- Superpowers says the description must carry triggering conditions only, and
  never summarize the skill's process. The evidence is concrete: a description
  reading "code review between tasks" caused agents to perform one review when
  the skill body specified two. The description became a shortcut and the body
  became optional.
- Anthropic's skill-creator says to include what the skill does alongside when to
  use it, and to lean pushy, because agents undertrigger skills more often than
  they overtrigger them.
- Matt Pocock's rule says to cut identity the body already carries.

These reconcile once you separate **identity** from **workflow**. The shortcut
failure comes from summarizing *how the skill works*, not from naming *what it
is*. So:

1. **Open with identity, bounded by disambiguation.** Say what the skill is only
   as far as needed to separate it from its neighbours. If two skills in the
   library could plausibly claim a request, the description is where you settle
   it.
2. **Then list the trigger branches, and be pushy about them.** One trigger per
   distinct branch, phrased as the situations and symptoms a user actually
   presents with. This is where undertriggering is fixed.
3. **Never summarize the process.** No step counts, no phase names, no "then
   dispatches a subagent". Anything that reads as a compressed workflow gives the
   agent something to follow instead of the body.
4. **Close with the boundary when a sibling skill owns adjacent ground.** Name
   the sibling.

Write in third person. It is injected into a system prompt, not spoken to the
user.

```yaml
# Summarizes workflow - the agent follows this instead of reading the skill
description: Use when executing plans - dispatches a subagent per task with code review between tasks

# No identity, so it cannot be told apart from three neighbouring skills
description: For async testing

# Identity, then trigger branches, then boundary. No workflow.
description: Write and revise documents that agents consume - skills, AGENTS.md, CLAUDE.md. Use when creating, editing, or splitting a skill, when a skill triggers unreliably, or when instructions are followed inconsistently. Do not use for human-facing prose, which belongs to writing-for-humans.
```

Cover the words someone would actually search: error messages, symptoms
("flaky", "hanging", "ignored"), and tool or file names. Describe the *problem*
rather than a language-specific symptom, unless the skill really is specific to
that technology, in which case make the technology an explicit trigger.

## Naming

Name by what the skill does or by its core insight, verb-first. Gerunds work
well for processes.

- `writing-for-agents`, not `agent-doc-guidelines`
- `condition-based-waiting`, not `async-test-helpers`
- `root-cause-tracing`, not `debugging-techniques`

## Invocation

Two choices, trading the two loads against each other.

A **model-invoked** skill keeps its `description`, so the agent can fire it
autonomously and other skills can reach it. Typing its name still works:
model-invocation includes user reach rather than replacing it. The cost is
permanent context load, since the description stays loaded every turn. A
model-invoked skill whose content is all reference is also the natural home for
reference several skills share, because they can all reach it. Mechanics: omit
`disable-model-invocation` and write a model-facing description.

A **user-invoked** skill strips the description from the agent's reach. Only a
human typing its name can invoke it, and no other skill can. Zero context load,
paid for in cognitive load: you become the index that has to remember it exists.
Mechanics: set `disable-model-invocation: true`, and let the `description` become
a human-facing one-line summary with the trigger list stripped.

Choose model-invocation only when the agent must reach the skill on its own, or
another skill must. A skill that only ever fires by hand should be user-invoked
and pay no context load.

Shared reference that two user-invoked skills both need can live in neither:
with no descriptions, neither can fire the other. Push it to a plain file outside
the skill system, which any document can point at.

## Splitting

`SKILL.md` covers the sequence cut. The invocation cut is skill-specific: split
off a model-invoked skill when you have a distinct leading word that should
trigger it on its own, or when another skill must reach it. You pay context load
for a new always-loaded description, so that independent reach has to earn it.

## Router skills

When user-invoked skills multiply past what a human can remember, that piled-up
cognitive load is cured by a **router skill**: one user-invoked skill naming the
others and when to reach for each, so the human remembers one name instead of
many. A router can only hint, never fire: user-invoked skills have no
description, so nothing but the human can reach them.

## Layout

```
skill-name/
  SKILL.md          # required; name must match this directory
  references/       # docs loaded on demand behind a pointer
  scripts/          # executable code for deterministic, repetitive work
  assets/           # files used in output: templates, icons, fonts
  evals/            # test prompts, see TESTING-SKILLS.md
```

Loading happens in three levels, which is the information hierarchy in its
concrete form:

1. `name` plus `description`, always in context, roughly 100 words per skill.
2. The `SKILL.md` body, in context whenever the skill fires. Keep it under about
   500 lines.
3. Bundled resources, loaded only when reached. Scripts can execute without being
   loaded into context at all.

When you approach the body limit, add a layer of hierarchy rather than trimming
prose evenly: push a branch into `references/` and point at it. Give any
reference file over about 300 lines a table of contents.

Keep inline: principles, concepts, and code patterns under roughly 50 lines.
Push out: heavy reference over roughly 100 lines, and any reusable tool.

When a skill supports several variants of one workflow, organize the references
by variant so only the relevant one loads.

```
cloud-deploy/
  SKILL.md          # workflow plus the selection step
  references/
    aws.md
    gcp.md
    azure.md
```

## Referencing other skills

Name the skill and mark whether it is required.

- `**REQUIRED BACKGROUND:** you must understand superpowers:test-driven-development`
- `See writing-for-humans for the prose layer` for an optional pointer.

Avoid `@`-prefixed paths to other skills. That syntax force-loads the file
immediately, spending context before you know you need it.

## Anti-patterns

- **Narrative.** "In session 2026-08-19 we found that an empty projectDir
  caused..." A skill is a reusable reference, not the story of one debugging
  session.
- **Multi-language dilution.** `example-js.js`, `example-py.py`, `example-go.go`.
  One excellent, complete, well-commented example beats five mediocre ones, and
  porting is cheap.
- **Fill-in-the-blank templates** where a real worked example would do.
- **Code inside flowcharts.** It cannot be copied and is hard to read. Reserve
  diagrams for non-obvious decision points, and use tables and lists for
  reference.
- **Mechanical constraints written as prose.** If a rule is enforceable by a
  linter, a schema, or a regex, automate it and spend the document's budget on
  judgement calls instead.
