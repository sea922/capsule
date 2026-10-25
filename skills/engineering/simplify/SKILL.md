---
name: simplify
description: Simplify working code for clarity and maintainability while preserving observable behavior. Use for requested cleanup of recent changes or a named area, reducing unnecessary nesting, duplication, or indirection. Architecture decisions belong to codebase-design; unknown failures belong to diagnosing-bugs.
---

# Simplify

Reduce the effort needed to understand and change code without moving complexity into its callers or changing its contract. An unchanged result is valid when the existing design earns its place.

## 1. Bound the pass

Use the requested files or diff. Otherwise, focus on identifiable changes from the current task; unrelated dirty files are not an invitation to refactor. If no task scope can be identified, ask which area to simplify.

Read repository instructions and inspect staged, unstaged, and untracked state. Preserve the existing work, including edits inside the selected files. A request for suggestions or an audit stays read-only; a request to simplify authorizes local edits, not commits, publication, dependency installation, or changes to external data.

When called during `implement`, inherit its scope and baseline and return the cleanup result to that caller. This is a selected pass, not a mandatory phase after every change. If a consequential interface, ownership, or module decision emerges, use `codebase-design` for that decision before resuming within the authorized scope.

**Complete when:** the selected area, edit authority, existing changes, and exclusions are explicit.

## 2. Pin the contract

Read the selected code, its callers, relevant tests, and the reason for any proposed removal. Include registrations, configuration, public consumers, and side-effect imports where applicable; a text search with no callers is not proof of dead code.

Identify the observables the cleanup could affect: results and types, errors, side effects and their order, mutation or identity, resource lifetime, and relevant performance constraints. Preserve security checks, accessibility behavior, and failure-handling obligations.

Run the relevant existing checks before editing. Where coverage misses a risky contract, add focused characterization tests or an equivalence check against the current implementation. These checks should pass before and after a behavior-preserving refactor; a new failing behavior test is not a prerequisite. Type checking and lint alone do not establish runtime equivalence.

Separate baseline failures from cleanup regressions. Investigate an unknown failure through `diagnosing-bugs` when needed to establish the contract; keep an unrelated defect outside the cleanup. If the decisive behavior cannot be checked, restrict edits to what the evidence supports and report the gap.

**Complete when:** each candidate has an understood contract and proportionate before/after evidence, or is excluded because that evidence is unavailable.

## 3. Simplify one coherent piece

For each candidate, name the reader or maintenance burden it removes. First consider leaving it alone or reusing an existing cohesive owner. Then consider language, standard-library, or native facilities and already-installed dependencies, checking semantic compatibility rather than assuming it. Introduce a new helper or abstraction only when it lowers the total burden.

Prefer explicit control flow, meaningful names, and consolidation of the same domain knowledge. Matching syntax alone does not justify shared ownership. Preserve helpers and thin adapters that name a concept, isolate a real dependency, or protect a trust, failure, or migration boundary—even with one implementation.

Make a small change and rerun its contract checks. Review semantic edges specific to that transformation: for example, truthiness versus null checks, object versus map results, synchronous throws versus rejected promises, and awaiting work before a `finally` cleanup. Compact syntax is not evidence of equivalence.

Keep existing behavioral assertions. Tests coupled to internal structure may be adapted when that structure changes, but preserve or replace their observable coverage. If a candidate changes the contract, discard that candidate or separate the behavior change for the user's direction. Undo only this pass's edits when a candidate fails to earn its complexity cost.

**Complete when:** each retained change has a concrete clarity benefit and passing relevant checks; unsupported or counterproductive candidates are left unchanged.

## 4. Verify and return

Inspect the complete task diff, including new tests. Confirm that preserved boundaries still hold, callers have not inherited hidden work, and pre-existing changes remain intact. Run fresh checks against the final state.

For a standalone pass, use `verification-before-completion` to qualify completion claims. During an existing delivery workflow, return the changed paths, preserved contract, executed commands and results, and residual gaps to its final verification stage.

Report the complexity removed, useful structures deliberately retained, and evidence of preserved behavior. Distinguish observed equivalence within the checks from untested cases; fewer lines or green lint alone does not prove success.

**Complete when:** every claimed simplification is attributable and supported by current evidence, with any verification limits stated.
