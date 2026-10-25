---
name: implement
description: Execute authorized software changes from direct requests, issues, specifications, or plans. Use when asked to build, change, refactor, or fix known-cause behavior. Diagnosis, explicit test-first work, review-only work, planning-only work, and research have dedicated workflows.
---

# Implement

Turn an authorized change into the smallest coherent, verified repository update. A plan can help, but it is not an entry requirement.

## Operating contract

Accept a direct request, issue, specification, or implementation plan. Treat the user's latest instruction and applicable repository rules as authoritative; use linked artifacts to resolve detail, not to expand scope silently.

An instruction such as "implement," "build," "change," "fix it," or "do it" authorizes the repository edits needed for that request. It does not automatically authorize commits, pushes, releases, issue updates, deployments, destructive data operations, or unrelated cleanup.

If the user asks only how to implement, requests an approach comparison, or says not to change anything yet, stay read-only. Use `codebase-design` when the requested comparison is a consequential architecture or seam decision; otherwise provide the bounded analysis directly.

Preserve work already present. Never discard, overwrite, reset, clean, or hide a dirty worktree to simplify implementation. Keep task-owned changes distinguishable from pre-existing changes. For major work in a dirty primary checkout, show the exact state and ask before creating or switching to an isolated worktree.

## 1. Frame the change

Read the repository instructions, relevant source, nearby tests, and supplied intent. State the observable outcome, acceptance conditions, explicit exclusions, and any constraint that changes the implementation approach.

Inspect the current branch, HEAD, staged and unstaged changes, and untracked files before editing. Ask only when a missing decision would materially change behavior, architecture, external state, cost, or risk. Otherwise make the smallest reasonable assumption and record it.

**Complete when:** the intended outcome, working-tree baseline, governing rules, and material decision gates are known.

## 2. Choose the execution route

Use the narrowest workflow that fits the evidence:

| Situation | Route |
| --- | --- |
| Cause of a reported failure is unknown | Run `diagnosing-bugs`, then resume with its confirmed cause or honest uncertainty |
| Observable behavior is changing and an executable harness is practical | Run `tdd` for each coherent behavior slice |
| Working code needs a requested behavior-preserving cleanup | Use `simplify` for the scoped pass, then resume final verification |
| Documentation, metadata, generated output, or a mechanical change has no useful behavioral test | Edit directly and define artifact-specific checks |
| The same mechanical change repeats across many sites | Write a codemod or script, apply it, and keep it in the diff so a reviewer can rerun it; the rerunnable script is the evidence |
| A module boundary or ownership decision blocks safe progress | Use `codebase-design` for that decision, then resume |
| A large clear outcome lacks verifiable slices or a dependency order | Use `planning-and-task-breakdown`, then execute its ready frontier within the existing authorization |
| An external API or version-dependent claim is uncertain | Use `research` for the needed evidence, then resume |
| A design choice needs an observable experiment | Use `prototype` for the question when building the experiment is within scope, then resume |
| Security or privacy risk requires a dedicated audit or repository gate | Use `security-review` alongside any required repository checks and preserve its independent evidence |
| User requested review without changes | Stop and use `code-review` |

Parallel work is an explicit optimization, not the default. Use it only for genuinely independent seams, when agent delegation is available and authorized, and when integration ownership is clear. Do not place parallel workers on overlapping files, shared schemas, or an unresolved design decision.

Give each delegated unit one accountable owner, acceptance checks, and a required return artifact. Await and inspect that artifact before marking the unit complete; a status promise or re-delegation is pending work. Integrate compact evidence receipts instead of entire worker transcripts.

Use a worktree only when isolation is useful and the user or repository workflow permits it. Before work begins, verify its base commit and whether ignored fixtures, local databases, credentials, generated assets, or other local-only material are required. A worktree that cannot run the decisive check is not a valid execution environment.

**Complete when:** the implementation method and its verification path fit this change rather than a generic ceremony.

## 3. Implement in coherent slices

For each slice:

1. Inspect the current owner, callers, contracts, and tests at the affected seam.
2. Make the minimum complete change that delivers one observable outcome.
3. Update tests, documentation, configuration, migrations, and generated artifacts that are part of the same contract.
4. Run the smallest useful check while the slice is still easy to reason about.
5. Re-read the diff for accidental scope growth before starting another slice.

**Build what was asked.** Add a mechanism nobody requested, such as a guard, retry, fallback, validation layer, option, mode, or abstraction, only when an existing contract requires it, when leaving it out lets harm land before anything notices, or when adding it later would be expensive because it concerns stored data, a public or shared interface, money, or security. When you cannot tell, build it. Name what you considered and did not build in the handoff. Never narrow requested behavior to fit a safeguard by gating, capping, delaying, or skipping part of it; a safeguard that truly conflicts with the request is a decision gate. When a change replaces a function, type, or module whose callers are all in this repository, move those callers and delete the old version in the same change rather than leaving a wrapper or alias an agent would copy.

Do not mix opportunistic cleanup into the change. If new evidence invalidates the requested approach, reaches outside the authorized scope, or exposes a consequential product or architecture decision, stop at that gate and present the evidence and options.

When a check exposes an unrelated pre-existing failure, separate it from change-caused failures. Do not repair it unless the user expands scope.

**Complete when:** every accepted behavior is represented by a coherent change and no known task-owned inconsistency remains between code, tests, docs, and configuration.

## 4. Reconcile the repository state

Inspect the complete task diff, including new files. Confirm that:

- pre-existing work remains intact;
- every changed path belongs to the requested outcome;
- temporary instrumentation and scratch artifacts are gone;
- generated files correspond to their source inputs;
- delegated work, if any, was reviewed and integrated against the actual current branch.

Do not stage or commit unless requested. A clean targeted check does not make unrelated dirty paths part of the task.

**Complete when:** the final change set is intentional, integrated, and attributable.

## 5. Verify before claiming completion

Run `verification-before-completion` against the acceptance conditions after the final relevant edit. Fresh evidence must cover the actual changed behavior and required artifacts. A previously green command, an implementer's report, or an exit code without evidence that the intended test ran is not enough.

If verification fails, return to the smallest responsible slice. If verification is unavailable, partial, destructive, costly, or needs new authority, preserve that boundary and report the corresponding honest terminal state instead of saying the work is done.

When review finds a defect within the authorized scope, fix it and rerun the affected checks. If the same concern survives two correction attempts, name the assumption both attempts relied on and switch to diagnosis with it and the failed attempts as evidence. Continue when new evidence changes the approach; report the concrete blocker when the remaining step needs unavailable input or authority. Do not rerun an unchanged review loop or end authorized work merely because the retry bound was reached.

For long or resumable work, update the existing issue, plan, cycle record, or repository artifact with the base commit, pre-existing dirty paths, completed slices, evidence, and material decisions. Use a task-scoped scratch ledger only when no canonical artifact exists, and do not publish it without authorization.

At a pause, pickup, or transfer to another session, harness, directory, or person, use `handoff` for the continuation record. Ordinary final delivery uses the summary below.

## Handoff

Report:

1. **Outcome:** what observable behavior or artifact changed.
2. **Scope:** task-owned files changed, plus any pre-existing dirty state left untouched.
3. **Evidence:** fresh commands or inspections and their results.
4. **Decisions:** assumptions made, mechanisms considered and not built, and human decisions still required.
5. **Residuals:** unverified behavior, known failures, or explicitly deferred work.

Do not claim "done," "fixed," "passing," or "ready" unless the verification verdict supports that exact claim.
