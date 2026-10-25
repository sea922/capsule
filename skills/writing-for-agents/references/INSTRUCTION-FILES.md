# Instruction files

The `AGENTS.md` and `CLAUDE.md` branch of [`writing-for-agents`](../SKILL.md).
These files are pure context load: every line is present on every turn, in every
session, whether or not it is relevant. They carry the highest cost per word of
anything you will write, so the pruning rules in `SKILL.md` bite hardest here.

## What belongs here

An instruction file answers one question: what does an agent need to know about
*this repository* that it cannot discover by looking?

Belongs in the file:

- Conventions no config file states, such as where a new module goes and why.
- The reason behind a choice that otherwise looks arbitrary.
- Gotchas the environment does not confess, such as a test suite that must run
  serially or a generated directory that must never be edited by hand.
- Pointers to the documents that hold the detail, with the branch that should
  trigger reaching each one.

Does not belong:

- Anything the agent can read directly. Available scripts live in
  `package.json`, flags live in `--help`, structure lives in the directory tree.
  Restating them creates a **cache** that goes stale silently.
- General engineering advice the model already follows. "Write clear code" and
  "handle errors appropriately" are no-ops paying rent every turn.
- Task-specific procedure. A multi-step workflow with branches is a skill, and
  putting it here forces every session to carry it.

The test for any candidate line: does an agent behave differently because this
line is present? If not, delete the whole line.

## Which file, and the two-file problem

`AGENTS.md` is the cross-tool convention. It is stewarded by the Agentic AI
Foundation at the Linux Foundation, sits in tens of thousands of repositories,
and is read natively by a wide range of agents including Codex, Cursor, Copilot,
Gemini CLI, Aider, Windsurf, and Zed.

Claude Code is the notable exception: as of August 2026 it loads `CLAUDE.md`.
The long-running request to support `AGENTS.md` natively
([anthropics/claude-code#6235](https://github.com/anthropics/claude-code/issues/6235))
was closed as completed in August 2026, but verify the behaviour of the version
you are actually running before depending on it.

**Do not rely on an undocumented fallback.** The claim that Claude Code reads
`AGENTS.md` automatically when no `CLAUDE.md` exists circulates widely in
third-party guides and is not in the official documentation. Wire the connection
explicitly instead of trusting it.

## Keep one source of truth

Two files with the same content is duplication in the exact place duplication
hurts most: always loaded, twice the tokens, and one copy silently drifts.

Write `AGENTS.md` as the canonical file, then connect `CLAUDE.md` to it by one of
these, in order of preference:

1. **A pointer line.** `CLAUDE.md` contains a single instruction to read
   `AGENTS.md`. Explicit, visible in the diff, works everywhere, and costs one
   line of context.
2. **A symlink.** `CLAUDE.md` links to `AGENTS.md`. Zero drift and zero extra
   tokens, but it is invisible in some tooling and Windows checkouts do not
   always preserve it.
3. **Generation.** A script writes `CLAUDE.md` from `AGENTS.md`. Only worth it
   when the two genuinely need different content, and it needs a check that the
   generated file is current.

Whichever you pick, say so in the repository so the next person does not edit the
copy.

## Nesting

An instruction file at the repository root is the common case, but a focused file
in an important subdirectory often does more. It acts as a table of contents for
that area and it loads in the context where it applies, rather than paying for
itself across every session.

Split a subdirectory file out when that area has conventions the root file would
have to caveat, and when those conventions matter to a distinct branch of work.
Keep the root file as the index that names them.

Agent support for nested files varies, and coverage is less reliable than for the
root file. Treat a nested file as an improvement where it is read, not as the
only place a critical rule appears.

## Pointer lines

Most of an instruction file's value is its pointers. Each one is a context
pointer in the sense `SKILL.md` defines, and it gets the same treatment:
front-load the leading word, carry one trigger per branch, and cut identity the
target document already holds.

Write every pointer in this shape:

```
<what the agent is doing when this applies>: read <path>.
```

The left side names an action, change, or task the agent might be undertaking.
Naming the document's subject instead is the common near-miss: it looks like a
rewrite, but it leaves the agent with no condition, so it fires no more reliably
than the bare `See docs/architecture.md` it replaced. The test is whether the
left side could complete the sentence "I am currently...".

```markdown
# Bare file name. No condition at all.
- See docs/architecture.md for architecture.

# Subject label. Reads like a fix and is not one - "I am currently
# architecture and system structure" is not a thing an agent is doing.
- Architecture and system structure: see docs/architecture.md.

# Names what the agent is doing when it should reach the document.
- Adding or moving a module, or changing what a package may import:
  read docs/architecture.md.
```

## Reviewing an existing file

Instruction files accumulate **sediment**, because adding feels safe and removing
feels risky. Review with a bias toward deletion.

1. Delete every line the environment already answers.
2. Delete every line the model obeys by default.
3. Check every remaining factual claim against the repository as it is now, not
   as it was. Commands rename, directories move, conventions get abandoned.
4. Collapse restatements into a single leading word used consistently.
5. Convert vague standing advice into a conditional on something observable.

A shorter file is not the goal on its own. A file where every line changes
behaviour is.
