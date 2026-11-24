---
name: implement
description: Execute authorized software changes from direct requests, issues, specifications, or plans. Use when asked to build, change, or fix known-cause behavior. Route unknown-cause diagnosis to diagnosing-bugs, explicit test-first work to tdd, behavior-preserving cleanup to simplify, architecture refactoring to codebase-design, review-only work to code-review, planning-only work to planning-and-task-breakdown, and external investigation to research.
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

When the user passes an issue or ticket reference, fetch it and state its title as the tracker gives it before starting. If the reference could name more than one item, ask which.

Before building something new, look for what already exists: a function or module in this repository, a dependency already installed, or a maintained library or tool that fits. Reuse or extend it when it meets the need; build when nothing fits or the fit would cost more than the code. Adding a dependency needs the user's agreement.

Inspect the current branch, HEAD, staged and unstaged changes, and untracked files before editing. Ask only when a missing decision would materially change behavior, architecture, external state, cost, or risk. Otherwise make the smallest reasonable assumption and record it.

**Complete when:** the intended outcome, working-tree baseline, governing rules, and material decision gates are known.

## 2. Choose the execution route

Use the narrowest workflow that fits the evidence:

| Situation | Route |
| --- | --- |
| Cause of a reported failure is unknown | Run `diagnosing-bugs`, then resume with its confirmed cause or honest uncertainty |
| Observable behavior is changing and an executable harness is practical | Run `tdd` for each coherent behavior slice |
| Working code needs a requested behavior-preserving cleanup | Use `simplify` for the scoped pass, then resume final verification |
| Conventions or domain standards govern the touched code | Apply `coding-standards` for the affected backend/frontend/shared domain |
| Documentation, metadata, generated output, or a mechanical change has no useful behavioral test | Edit directly and define artifact-specific checks |
| The same mechanical change repeats across many sites | Write a codemod or script and apply it; commit it only when reviewers or the repo expect a rerunnable migration script, otherwise record the command in the handoff and remove temporary scratch files |
| A module boundary or ownership decision blocks safe progress | Use `codebase-design` for that decision, then resume |
| A large clear outcome lacks verifiable slices or a dependency order | Use `planning-and-task-breakdown`, then execute its ready frontier within the existing authorization |
| Independent parallel slices or specialist subagents materially help | Use `orchestrate` for bounded native delegation while retaining root integration ownership |
| Isolation from a dirty checkout or concurrent branch is needed | Use `git-worktrees` to select, verify, and prepare an isolated checkout |
| An external API or version-dependent claim is uncertain | Use `research` for the needed evidence, then resume |
| A design choice needs an observable experiment | Use `prototype` for the question when building the experiment is within scope, then resume |
| Security or privacy risk requires a dedicated audit or repository gate | Use `security-review` alongside any required repository checks and preserve its independent evidence |
| User requested review without changes | Stop and use `code-review` |

**Complete when:** the implementation method and its verification path fit this change rather than a generic ceremony.

## 3. Implement in coherent slices

For each slice:

1. Inspect the current owner, callers, contracts, and tests at the affected seam.
2. Make the minimum complete change that delivers one observable outcome.
3. Update tests, documentation, configuration, migrations, and generated artifacts that are part of the same contract.
4. Run the smallest useful check while the slice is still easy to reason about.
5. Re-read the diff for accidental scope growth before starting another slice.

**Build what was asked:**

- Add an unrequested mechanism (guard, retry, fallback, validation layer, option, mode, or abstraction) only when an existing contract requires it, leaving it out lets silent harm land, or adding it later is costly because it governs stored data, money, security, or a public/shared interface. When uncertain and consequence is high (data, money, security, public contract), build or ask; otherwise omit it and name what you considered and did not build in the handoff.
- Never narrow requested behavior to fit a safeguard by gating, capping, delaying, or skipping part of it; a safeguard that truly conflicts with the request is a decision gate.
- When replacing an in-repo function, type, or module whose callers are all in this repository — and no persisted data, queued messages, or rolling deploy still reads the old shape — move all callers and delete the old version in the same change rather than leaving a wrapper or alias. When fixing a root-cause mistake, check for sibling sites repeating that same mistake and include them in the minimal fix (leaving divergent or user-dirty sites untouched and reported as residuals).

Do not mix opportunistic cleanup into the change. If new evidence invalidates the requested approach, reaches outside the authorized scope, or exposes a consequential product or architecture decision, stop at that gate and present the evidence and options.

When a check exposes an unrelated pre-existing failure, separate it from change-caused failures and do not repair it unless the user expands scope. A failure is pre-existing only when it was already failing before your first edit (verified on the baseline before editing or confirmed on an untouched copy/commit). If you first run a check *after* editing and it fails, never assume it is pre-existing without baseline verification; a changed file breaking a test you did not touch is your defect.

Keep going until every in-scope slice is done. A progress update does not end the run; stop earlier only at a named blocker or decision gate.

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

When verification or review finds a defect within the authorized scope, fix it and rerun the affected checks. If the same concern survives two correction attempts, name the assumption both attempts relied on and switch to `diagnosing-bugs` with that assumption and the failed attempts as evidence. Continue when new evidence changes the approach; report the concrete blocker when the remaining step needs unavailable input or authority. Do not rerun an unchanged loop or end authorized work merely because the retry bound was reached. To repair a broken build or failing type check, follow the build-errors reference of the `diagnosing-bugs` skill: one error at a time, smallest diff, rerun after each fix.

When you notice yourself repeating a command, an edit, or a line of reasoning without a new result, stop and treat it as a loop. Write down what was tried and what was actually observed each time, then name the assumption every attempt shared: the cause, the file or branch being edited, the environment, or the goal itself. Check the real state instead of memory (working directory, branch, file contents, running process), shrink the problem to one failing command or test, and change one thing. After two attempts with no new evidence, stop and report the attempts, the observations, and the blocker instead of trying variations.

For long or resumable work, update the existing issue, plan, cycle record, or repository artifact with the base commit, pre-existing dirty paths, completed slices, evidence, and material decisions. Use a task-scoped scratch ledger only when no canonical artifact exists, and do not publish it without authorization.

At a pause, pickup, or transfer to another session, harness, directory, or person, use `handoff` for the continuation record. Ordinary final delivery uses the summary below.

**Complete when:** `verification-before-completion` has produced an honest verdict against the final diff and every acceptance condition is either verified or explicitly reported with its exact gap or blocker.

## Handoff

Report:

1. **Outcome:** what observable behavior or artifact changed.
2. **Scope:** task-owned files changed, plus any pre-existing dirty state left untouched.
3. **Evidence:** fresh commands or inspections and their results.
4. **Decisions:** assumptions made, mechanisms considered and not built, and human decisions still required.
5. **Residuals:** unverified behavior, known failures, or explicitly deferred work.

Do not claim "done," "fixed," "passing," or "ready" unless the verification verdict supports that exact claim.
