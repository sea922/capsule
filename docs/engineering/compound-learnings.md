# Compound Learnings

Use `compound-learnings` to record an engineering lesson that would otherwise be rediscovered the hard way, or to audit the lessons a project has already recorded. It is model-invoked and has two branches: capture and refresh.

The store is the project's existing lesson directory when one exists, such as `docs/solutions/` or `docs/learnings/`. Otherwise it is `docs/lessons/`, created on the first capture. The skill states which location it used.

## Capture

A lesson is written only when it passes a counterfactual bar: if the lesson were lost, would someone reading the final code, tests, commit messages, and existing docs still be likely to repeat the mistake or redo the investigation? Routine fixes whose code or commit message already explains them are rejected, and the rejection names that artifact. A request to document something does not lower the bar.

When a test, lint rule, or code comment would stop the recurrence, the skill prefers that mechanism and records only what it cannot carry. Each capture writes one lesson with its symptom, cause, failed approaches, fix, and a retirement condition that says when the lesson becomes obsolete. An inaccurate existing lesson on the same problem is updated rather than duplicated.

## Refresh

A refresh checks every lesson in scope against the current code and against the other lessons, then gives each one outcome: Keep, Update, Consolidate, Replace, or Delete. Contradictions outrank plain staleness. Age alone is not staleness, and a claim the repository cannot confirm is not treated as false. When the implementation moved but the problem remains, the lesson is replaced rather than deleted.

A refresh can also remove accurate lessons that the code now explains, but only with the recovering test, comment, or document quoted as evidence. Those removals are applied when the user asks to clean up or prune the store; an ordinary drift audit lists them as recommendations. Inbound links to deleted lessons are cleaned up in the same pass.

Both branches finish with a report and a check that the project's instruction file points agents at the store. Editing that file requires consent. Changes stay uncommitted unless a commit was requested.

## Example

"The nightly import failed because the vendor switches CSV delimiters for EU accounts, which their docs never mention. It's fixed and tested. Write it up so nobody loses two days on it again."

The result should be one lesson in the store that records the undocumented vendor behaviour, the delimiter-sniffing approach that failed, and the vendor change that would retire the lesson.

## Composition and design basis

A fix that is not yet verified returns to `diagnosing-bugs` or `implement` before capture. Cited investigation reports belong to `research`, resumable session state to `handoff`, and edits to `AGENTS.md` or `CLAUDE.md` to `writing-for-agents`. Commits follow `git-workflow`.

The [source-repository sweep](../research/2026-09-27-source-repos-sweep.md) identified the gap. EveryInc's `ce-compound` and `ce-compound-refresh` supply the core loop: the counterfactual durable bar, one lesson per capture, retirement conditions, the five refresh outcomes, the delete checks, the recoverability test for accurate lessons, and the discoverability check. Their commit `415181d3`, which culled dozens of their own lessons after the bar was tightened, is why refresh ships with capture. The skill omits their subagent research phase, session-history mining, vocabulary file, packs, fixed schema, and automatic commits. From the other preferred sources, pstack's `principle-encode-lessons-in-structure` informs the preference for a mechanism over prose. Matt Pocock's `retro` improves the agent environment rather than recording project lessons, so it remains a separate concern, as do pstack's `continual-learning` and gstack's `learn`, which maintain `AGENTS.md` or a tool-specific store. Superpowers, Addy Osmani's skills, Ponytail, last30days, Anthropic's skills, and Trail of Bits have no lesson-capture skill that applies here. Other listed sources were not examined for this skill.

Mechanisms are ranked from the [2026-10 source sweep](../research/2026-10-06-source-repos-sweep.md): a design that removes the wrong way, then a type, a lint or check whose error names the fix, a behavior test, and prose last, with each mechanism shown to fail on the original mistake. A repeat despite a written rule calls for a mechanism. This follows Cursor pstack's `correct`.

See the [skill instructions](../../skills/engineering/compound-learnings/SKILL.md).
