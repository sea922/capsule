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

A request to capture authorizes writing inside the store. A request to refresh, clean up, prune, or cull authorizes edits and deletions inside the store plus removing or retargeting decorative inbound Markdown links to removed/consolidated lessons elsewhere in the repository (never editing `AGENTS.md`/`CLAUDE.md` without consent). Neither authorizes product-code changes or commits.

**Complete when:** the store path, its source (existing convention or default), and the branch are stated.

## 2. Capture: apply the durable bar

Name the candidate in one sentence: what a future reader would get wrong without it. A candidate usually comes from verified work that corrected a wrong belief: an approach that failed, a defect a review caught, an assumption or document that turned out wrong. Work that went as first planned rarely holds one. Then apply the **counterfactual**: if this lesson were lost, would someone reading the final code, tests, types, comments, commit messages, and existing docs still be likely to repeat the mistake or redo substantial investigation?

Reject the candidate when any of these already carries the reasoning; quote the artifact that does. Effort spent, diff size, and the user's request to document it do not lower the bar. Lessons that typically pass: a cause invisible from the fix, an approach that looked right and failed, a cross-file invariant no single file shows, an external system's undocumented behaviour, a measured threshold.

Prefer a mechanism to prose, at the highest level that works: a design that removes the wrong way (one owner, one supported path, unreachable internals), then a type that cannot hold the bad state, then a lint or check whose error names the fix, then a behavior test, and a code comment or prose last, since nothing fails when a reader skips them. Recommend that mechanism — or, only if product-code/check edits were separately authorized in this session, add it and show it fails on the original mistake (and break each guard alone when the property rests on several); the lesson then records only what the mechanism cannot. A lesson about a mistake that has already recurred despite an existing written rule is evidence the rule needs a mechanism, not a second lesson.

Search the store for an existing lesson on the same problem. A lesson that is now inaccurate or incomplete gets updated in place; a second lesson on the same problem is a duplicate.

**Complete when:** the candidate is rejected with the quoted artifact that already explains it, routed to a mechanism, matched to an existing lesson to update, or confirmed as new and non-recoverable.

## 3. Capture: write one lesson

Write exactly one lesson per capture using [references/LESSON-FORMAT.md](references/LESSON-FORMAT.md). Several lessons from one session are separate captures, each passing the bar on its own.

Ground every path, symbol, command, and version against the tree the lesson will merge with (normally the current branch, or the merge-target ref via `git show <ref>:<path>` when the working tree holds unrelated unmerged branches). Cite code by file and defining symbol (function, class, or config key); add a line number only when no name identifies the spot, because line numbers drift when code above moves. Write for a reader arriving cold months later: the symptom they would search for, the cause, what did not work, the fix, and the **retirement condition** that would make the lesson obsolete.

**Complete when:** the lesson file exists at a stated path, every named reference resolves in the current tree, and it carries a checkable retirement condition.

## 4. Refresh: investigate each lesson

Scope to the requested subset or the whole store. A scope hint that matches nothing ends the run with that finding rather than widening it.

For each lesson, check its claims against current code, tests, and docs, then check the set for overlap and contradiction. Rules that are easy to get wrong:

- A contradiction between two lessons, or between a lesson and code, outranks plain staleness; it actively misleads.
- Age is a reason to look harder, never evidence of staleness.
- A claim the repository cannot corroborate - an operational practice, an external service's behaviour - is unverifiable, not false. Keep it and note the gap.
- Missing files prove the implementation moved, not that the problem disappeared. If the project still faces the problem, the lesson is replaced, not deleted.
- A met retirement condition is evidence; verify it against the tree before acting on it.
- Decide whether code moved after a lesson from version control against the repository's default branch, not from how confident the lesson sounds. Check `git rev-parse --is-shallow-repository` and `git merge-base --is-ancestor <verified_at-or-last-substantive-commit> <last-code-commit>` — if the lesson's verified commit is an ancestor of the code's latest commit, the code changed after it. History that cannot be ordered (shallow clone, divergent branches, missing commit) means "can't tell", never "current". Also flag any cited line number past the end of its file and replace stale line numbers with symbol names.
- **Recoverable** means a named artifact states the same reasoning in its own text: a test assertion or comment, a code comment, the instruction file, a skill, or another lesson. Topical overlap is not recoverability; quote the sentence.

**Complete when:** every in-scope lesson has evidence for its accuracy, overlap, and recoverability, including unverifiable claims marked as such.

## 5. Refresh: classify and apply

Give every in-scope lesson exactly one outcome:

| Outcome | When | Action |
| --- | --- | --- |
| Keep | Accurate, distinct, not recoverable | No edit — except clearing an earlier `status: stale` mark (`status`, `stale_reason`, `stale_date`) and updating `verified_at` when claims were freshly re-checked |
| Update | Guidance holds; paths, names, links, or details drifted, or part of it is now recoverable | Fix in place (preferring file + symbol citations over line numbers), update `verified_at`, clear any stale mark, and cut recoverable parts with a one-line pointer |
| Consolidate | Two or more lessons cover the same problem | Merge unique content into one canonical lesson (without copying stale marks), delete the rest |
| Replace | The recommendation no longer governs, and evidence supports a successor | Write the successor (grounded against the default branch, symbol-cited), delete the original |
| Delete | Problem gone, or every claim recoverable from quoted artifacts | Delete; git history is the archive |

Two lessons about different sub-problems stay separate even when they cite the same file. When a refresh cannot confirm a lesson still holds and lacks evidence for a successor, mark it in frontmatter with `status: stale`, `stale_reason`, and `stale_date` (all three together) so future readers do not treat it as current guidance, and recommend a fresh capture next time the area is touched. Never edit for wording alone.

Before removing any lesson file (`Delete`, `Consolidate`, or `Replace`), search the repository's Markdown for inbound links. For `Delete`, remove decorative links in the same pass (a document that relies on the deleted content turns `Delete` into `Replace` or `Keep`). For `Consolidate` or `Replace`, retarget inbound links to the canonical or successor lesson in the same pass.

Apply accuracy-driven outcomes directly. Apply a Delete or Update based only on recoverability when the user asked to clean up, prune, or cull; otherwise list it as recommended with its quoted artifacts. Ask before a Replace whose successor you cannot fully ground.

**Complete when:** every in-scope lesson has one outcome with evidence, each applied change is on disk, and no inbound link points at a deleted file.

## 6. Check discoverability and report

Read the project's root instruction file (`AGENTS.md`, `CLAUDE.md`, or equivalent). When it would not lead an agent to the store before working in a documented area, propose one informational line naming the store path and what it holds. Editing that file needs the user's consent and follows `writing-for-agents`.

Report the store path, then per branch:

- **Capture** - the lesson path and one-line summary, or the rejection with its quoted evidence, or the recommended mechanism.
- **Refresh** - per lesson: path, outcome, evidence; then applied changes, recommended changes, and unverifiable claims.

Leave changes uncommitted unless the user asked for a commit; commits follow `git-workflow`.

**Complete when:** the report lets the user see every write, deletion, rejection, and recommendation with its evidence, and the discoverability finding is stated.
