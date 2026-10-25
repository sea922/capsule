---
name: code-review
description: Review code changes read-only at quick, standard, or deep depth, with a bounded single-reviewer default and evidence-backed findings. Use when the user asks to review a branch, pull request, commit, working-tree changes, staged changes, a diff, or code before merge; asks for a quick or deep review; or wants to know whether a change matches its specification and repository rules. Route whole-codebase audits, product acceptance, dedicated security audits, and implementation-only requests to their own workflows.
---

# Code Review

Report only change-caused problems with concrete impact and a practical author action. Review the change, not the author's general taste or the whole repository.

## Operating boundary

The review phase is read-only. Inspect files, history, metadata, and tests only to the depth selected below. Do not edit code, post comments, approve, merge, commit, or push during review. If the user explicitly asks to review and fix, finish the review first, then run `implement` with the findings as evidence.

For a dedicated security audit or threat model, use `security-review`. Security defects introduced by the reviewed change remain within ordinary code review's finding gate.

Accept three inputs when present:

- **Target:** working tree, staged changes, commit, branch, tag, pull request, or explicit diff.
- **Level:** `quick`, `standard`, or `deep`.
- **Intent:** issue, acceptance criteria, design note, user statement, or focused risk to check.

Use `standard` when no level is named. Treat “fast,” “light,” or “sanity check” as `quick`; treat “thorough,” “exhaustive,” or “adversarial” as `deep`. Do not silently promote a review to `deep`.

## 1. Resolve the review boundary

Prefer, in order:

1. the pull request, diff, commit range, or base named by the user;
2. staged and unstaged changes, including untracked files, when the working tree is dirty;
3. the current branch against the branch it will merge into — the configured integration branch, otherwise the repository's default branch — when the tree is clean.

For branch and pull-request reviews, review what would actually merge. Resolve the base to its remote-tracking ref when the local copy is behind, take the merge base with the reviewed head, and review the changes introduced since that commit. Record the base commit. Never use the reviewed branch's own upstream as the base; that hides every change already pushed. Do not compare only the two branch tips when their histories have diverged.

Confirm that the base resolves and that the resulting range is non-empty before gathering further evidence. An unresolvable ref or an empty range is a scope problem to report, not a review to perform.

Read every changed hunk in scope. A working-tree review must also read each untracked file as added content, because ordinary diffs omit it; list them with `git ls-files --others --exclude-standard` so ignored paths stay out of scope. If the target or base still has multiple plausible meanings after repository inspection, ask one concise question rather than reviewing an invented boundary.

A very large change can exceed what the selected level covers honestly. Never sample silently. Say that the change is too large for the level, review the highest-risk changed files in full, name the smallest coherent stage the change could land as, and list every unreviewed file under residual risks. Absent a repository policy, treat roughly 800 changed lines — or 500 for dense logic — as the point where a single pass stops being trustworthy.

Also locate the instructions that govern the changed files, such as `AGENTS.md`, `CLAUDE.md`, contributor guidance, and nested directory rules. More specific rules take precedence.

**Complete when:** the target, the resolved base, the changed files, the untracked files, and the applicable repository instructions are explicit, and any coverage limit imposed by change size has been stated.

## 2. Select the evidence budget

Every level applies the same finding gate and the same coverage rule from step 1. The level controls the amount of context discovery and independent validation, never how much of the diff is read or how honestly coverage is reported.

### `quick`

Use for a fast preflight or a small, low-risk change.

- Read the complete diff and applicable repository instructions.
- Use only the intent already supplied by the user or attached to the target.
- Open surrounding code only when a changed hunk cannot be understood locally.
- Report obvious, concrete regressions; do not search history, fan out through distant callers, run tests, or delegate.

### `standard` — default

Use one reviewer and keep the work bounded.

- Read the complete merge-base diff, applicable instructions, and enough surrounding code to understand changed behavior.
- Find readily available intent: a supplied issue or document, pull-request description, commit message, or a directly referenced local spec. Do not conduct an open-ended issue search.
- Check the nearest callers, contracts, and existing tests when they can confirm or reject a candidate finding.
- Run only the smallest targeted check when it is the cheapest reliable way to settle a material candidate. Do not run broad suites, inspect history by default, audit unrelated code, or delegate.
- If the change touches authorization, money, destructive data operations, migrations, concurrency, cross-process retries, public compatibility, or another high-consequence boundary, complete the standard review and recommend `deep` for the residual risk.

### `deep`

Use when the user explicitly requests it or accepts the recommendation. Read and follow [references/DEEP-REVIEW.md](references/DEEP-REVIEW.md). That reference adds independent review axes, candidate validation, selective history, and risk-based checks.

**Complete when:** the requested level has been applied without borrowing expensive steps from a deeper level, and any uncovered high-risk area is named as residual risk.

## 3. Review through three axes

Track these axes even when one reviewer performs them together:

1. **Defects:** correctness, security, data loss, reliability, compatibility, and material performance regressions.
2. **Specification:** missing, partial, extra, or contradictory behavior relative to available intent. If no intent source exists, say so; do not invent one.
3. **Standards:** violations of applicable repository instructions or established local contracts. Do not repackage formatter or linter output as review insight. A compiler or test failure may still be evidence for an introduced defect.

Use architecture only to explain a concrete changed risk. Examine ownership, invariants, dependency direction, caller knowledge, failure semantics, and seam-aligned tests. Apply `codebase-design`'s **KISS -> YAGNI -> DRY** evidence sequence; similar syntax is not necessarily duplicated knowledge. Treat SOLID principles and code smells as diagnostic questions, not automatic findings.

At `standard` and `deep`, identify the change's **load-bearing fact**: the one condition its safety depends on, such as "every caller already holds the lock" or "the removed column has no remaining readers." Record how far up the **proof ladder** that fact got: *asserted* -> *cited line* -> *walked through* -> *ran a script or test* -> *reproduced live*. A fact that stops below *ran* is **unproven**. Climb as far as the level's budget allows, then label the rung honestly.

## 4. Admit only proven findings

A finding must satisfy every item:

- The reviewed change introduces it or makes an existing problem materially worse.
- It has a concrete trigger, call path, input, state, or operational scenario.
- It affects behavior, security, data, reliability, compatibility, meaningful performance, or a documented rule.
- It is discrete and actionable; the author can address it without guessing what “cleaner” means.
- The cited location overlaps the change or is the changed cause of the problem.
- Surrounding code, tests, contracts, or history were checked and support it. When the claim is that the change breaks something elsewhere, name the code that is provably affected; a ripple you cannot point at is not a finding.
- The fix it implies matches the rigor the surrounding codebase already holds itself to.
- It is not merely speculative, pre-existing, intentional behavior, personal style, or duplicated formatter or linter output.

Two common candidates need the same concrete-impact test:

- **Missing error handling** at an I/O boundary is a finding only when the failure it allows costs something where this code runs: a crashed or wedged process, a caller acting on a wrong or missing result, or work left half-done that rerunning does not repair. Judge how the code runs from the diff, description, and nearby docs, not from an assumed production service.
- **A test offered as evidence** for changed behavior is a finding when it would still pass with that behavior removed, or when it adds a production seam (export, flag, hook) only the test uses. A merely redundant test is not a finding.

For specification and standards findings, name the source file and the smallest quoted rule or line range that supports the claim. For architecture findings, show the concrete failure or change cost rather than reporting abstraction shape by itself. Verify uncertain candidates or leave them out and record the uncertainty under residual risks.

Assign the lowest severity that accurately represents impact:

- **P0:** broad, immediate release blocker with catastrophic impact such as certain data loss or a critical exploit.
- **P1:** high-impact failure in a normal or important path that should block merging.
- **P2:** ordinary, actionable defect that should be fixed but is not an emergency.
- **P3:** lower-impact concrete defect worth fixing; never use it for nits or optional polish.

## 5. Report findings first

Order findings by severity, then by the order a reader encounters them. Use one compact entry per problem:

```text
[P1][Defect] Imperative title — path/to/file.ts:42
In the concrete scenario ..., the changed code ... . This causes ... because ... .
```

Use `[Defect]`, `[Spec]`, or `[Standards]` as the axis label. Keep line ranges tight. Include a fix direction only when it helps make the problem actionable; do not turn the review into an implementation plan.

If nothing passes the gate, write `No findings.` Do not manufacture reassurance, praise, or low-value comments to fill the response.

After the findings, include only:

- **Review scope:** target, base, level, and what was inspected.
- **Blast radius** (`standard` and `deep`): the load-bearing fact, its rung on the proof ladder with the cited line or command, and the label `unproven` when it stopped below *ran*.
- **Residual risks:** unavailable specification, checks not run, unverified generated output, or areas for which a deeper review is warranted. Write `None identified` when appropriate.

## Completion gate

The review is complete only when:

- the target and fixed point are named;
- every changed hunk and untracked file in scope was read, or the uncovered files were named as residual risk;
- applicable repository instructions were applied;
- each reported item passes the finding gate and cites a precise changed cause;
- uncertain or duplicate candidates were verified, removed, or disclosed as residual risk;
- at `standard` and `deep`, the load-bearing fact is named with its proof rung, labelled `unproven` below *ran*;
- the final response leads with findings and names the review level and evidence limits;
- the review itself changed no repository or remote state.
