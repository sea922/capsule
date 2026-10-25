---
name: compound-learnings
description: Capture and maintain durable engineering lessons - knowledge a future agent or engineer would otherwise rediscover the hard way or repeat. Use when a solved problem, incident, or surprising investigation may deserve a written lesson, when asked to document a learning or "remember this for next time", or when auditing, pruning, de-duplicating, or checking an existing lessons store for drift. Cited investigation reports belong to research; resumable session state belongs to handoff; edits to AGENTS.md or CLAUDE.md belong to writing-for-agents.
---

# Compound learnings

A lesson store compounds only while every entry is true, distinct, and worth reading. Write fewer lessons than feel tempting, and remove them as readily as you add them.

## 1. Locate the store and pick the branch

Use the project's existing lesson convention when one exists: a directory such as `docs/solutions/`, `docs/learnings/`, or `docs/lessons/`, or a location named in the repository instructions. Otherwise the store is `docs/lessons/`, created on the first capture. ADRs, research reports, and changelogs are neighbours to read, not the store. State which location you used and why.

- **Capture** - one candidate lesson from work that is finished and verified. An unverified or still-failing fix is not ready; return it to `diagnosing-bugs` or `implement`.
- **Refresh** - an audit of the existing store, or a scoped part of it.

A request to capture authorizes writing inside the store. A request to refresh, clean up, prune, or cull authorizes edits and deletions inside the store. Neither authorizes product-code changes, instruction-file edits, or commits.

**Complete when:** the store path, its source (existing convention or default), and the branch are stated.

## 2. Capture: apply the durable bar

Name the candidate in one sentence: what a future reader would get wrong without it. Then apply the **counterfactual**: if this lesson were lost, would someone reading the final code, tests, types, comments, commit messages, and existing docs still be likely to repeat the mistake or redo substantial investigation?

Reject the candidate when any of these already carries the reasoning; quote the artifact that does. Effort spent, diff size, and the user's request to document it do not lower the bar. Lessons that typically pass: a cause invisible from the fix, an approach that looked right and failed, a cross-file invariant no single file shows, an external system's undocumented behaviour, a measured threshold.

Prefer a mechanism to prose, at the highest level that works: a design that removes the wrong way (one owner, one supported path, unreachable internals), then a type that cannot hold the bad state, then a lint or check whose error names the fix, then a behavior test, and a code comment or prose last, since nothing fails when a reader skips them. Recommend that mechanism or, within existing edit authority, add it and show it fails on the original mistake; the lesson then records only what the mechanism cannot. A lesson about a mistake that has already recurred despite an existing written rule is evidence the rule needs a mechanism, not a second lesson.

Search the store for an existing lesson on the same problem. A lesson that is now inaccurate or incomplete gets updated in place; a second lesson on the same problem is a duplicate.

**Complete when:** the candidate is rejected with the quoted artifact that already explains it, routed to a mechanism, matched to an existing lesson to update, or confirmed as new and non-recoverable.

## 3. Capture: write one lesson

Write exactly one lesson per capture using [references/LESSON-FORMAT.md](references/LESSON-FORMAT.md). Several lessons from one session are separate captures, each passing the bar on its own.

Ground every path, symbol, command, and version the lesson names against the current tree. Write for a reader arriving cold months later: the symptom they would search for, the cause, what did not work, the fix, and the **retirement condition** that would make the lesson obsolete.

**Complete when:** the lesson file exists at a stated path, every named reference resolves in the current tree, and it carries a checkable retirement condition.

## 4. Refresh: investigate each lesson

Scope to the requested subset or the whole store. A scope hint that matches nothing ends the run with that finding rather than widening it.

For each lesson, check its claims against current code, tests, and docs, then check the set for overlap and contradiction. Rules that are easy to get wrong:

- A contradiction between two lessons, or between a lesson and code, outranks plain staleness; it actively misleads.
- Age is a reason to look harder, never evidence of staleness.
- A claim the repository cannot corroborate - an operational practice, an external service's behaviour - is unverifiable, not false. Keep it and note the gap.
- Missing files prove the implementation moved, not that the problem disappeared. If the project still faces the problem, the lesson is replaced, not deleted.
- A met retirement condition is evidence; verify it against the tree before acting on it.
- **Recoverable** means a named artifact states the same reasoning in its own text: a test assertion or comment, a code comment, the instruction file, a skill, or another lesson. Topical overlap is not recoverability; quote the sentence.

**Complete when:** every in-scope lesson has evidence for its accuracy, overlap, and recoverability, including unverifiable claims marked as such.

## 5. Refresh: classify and apply

Give every in-scope lesson exactly one outcome:

| Outcome | When | Action |
| --- | --- | --- |
| Keep | Accurate, distinct, not recoverable | No edit |
| Update | Guidance holds; paths, names, links, or details drifted, or part of it is now recoverable | Fix in place; cut recoverable parts with a one-line pointer to the artifact |
| Consolidate | Two or more lessons cover the same problem | Merge unique content into one canonical lesson, delete the rest |
| Replace | The recommendation no longer governs, and evidence supports a successor | Write the successor, delete the original |
| Delete | Problem gone, or every claim recoverable from quoted artifacts | Delete; git history is the archive |

Two lessons about different sub-problems stay separate even when they cite the same file. Without evidence for a successor, mark the lesson stale in place and recommend a fresh capture next time the area is touched. Never edit for wording alone.

Before any Delete, search the repository's Markdown for inbound links. Remove decorative links in the same pass; a document that relies on the deleted content turns the Delete into Replace or Keep.

Apply accuracy-driven outcomes directly. Apply a Delete or Update based only on recoverability when the user asked to clean up, prune, or cull; otherwise list it as recommended with its quoted artifacts. Ask before a Replace whose successor you cannot fully ground.

**Complete when:** every in-scope lesson has one outcome with evidence, each applied change is on disk, and no inbound link points at a deleted file.

## 6. Check discoverability and report

Read the project's root instruction file (`AGENTS.md`, `CLAUDE.md`, or equivalent). When it would not lead an agent to the store before working in a documented area, propose one informational line naming the store path and what it holds. Editing that file needs the user's consent and follows `writing-for-agents`.

Report the store path, then per branch:

- **Capture** - the lesson path and one-line summary, or the rejection with its quoted evidence, or the recommended mechanism.
- **Refresh** - per lesson: path, outcome, evidence; then applied changes, recommended changes, and unverifiable claims.

Leave changes uncommitted unless the user asked for a commit; commits follow `git-workflow`.

**Complete when:** the report lets the user see every write, deletion, rejection, and recommendation with its evidence, and the discoverability finding is stated.
