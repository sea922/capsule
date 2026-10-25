---
name: planning-and-task-breakdown
description: Plan technical work when clear requirements span dependent changes, multiple sessions, or an uncertain implementation order. Use for implementation plans, vertical slices, and task dependencies. A small clear change can go directly to implement.
---

# Planning and Task Breakdown

Turn an agreed outcome into independently verifiable slices and a ready frontier: the unfinished slices whose prerequisites are satisfied.

## 1. Establish the contract

Read the requested outcome, repository instructions, existing plan or tracker, relevant code, and available checks. Separate confirmed behavior from assumptions. Resolve discoverable facts directly; use `research` for external facts and `codebase-design` for a consequential module decision.

Ask about an unresolved choice only when it changes acceptance, scope, architecture, or risk. Use `grilling` for an interview when several material choices depend on each other. Continue planning independent parts while a decision is pending.

**Complete when:** the outcome, exclusions, acceptance conditions, existing state, and unresolved decision owners are explicit.

## 2. Slice by observable outcomes

Create the smallest useful end-to-end slices, each leaving a working, checkable result. Put uncertainty and irreversible dependencies early enough to test the approach. A preparatory slice is justified when it removes a named blocker and has its own observable result.

For each slice record:

- stable ID and outcome;
- affected owners, contracts, or likely files supported by inspection;
- **Interfaces:** what the slice consumes from other slices and produces for them, with exact names, signatures, or types wherever a contract crosses a slice boundary;
- acceptance conditions and the check that could falsify each one;
- blocking slice IDs or external decisions;
- status and, where relevant, migration, rollback, or external-action gates.

Keep estimates conditional on evidence. Use code examples only when they settle an important contract; leave implementation details to the executing agent. A supplied plan that already satisfies these requirements can be reused.

**Complete when:** every required outcome belongs to a verifiable slice, and every dependency resolves to a slice, existing capability, or named external gate.

## 3. Check the graph and frontier

Walk dependencies for missing IDs, cycles, and work falsely marked independent. Shared schemas, files, mutable environments, and unresolved contracts can serialize otherwise separate tasks. Name an integration owner if parallel execution is proposed; execution and delegation remain within the caller's authority.

Write a **review focus**: the input classes and failure modes the requirements imply but no slice's check exercises, ranked by likelihood, each assigned to the slice whose check should cover it. Reviewers look hardest there.

List the ready frontier and why each other slice is blocked. The final integration check must cover the combined user outcome, even when every slice has passed its own check.

Ready means ready to start: required inputs and permissions are present. Distinguish entry prerequisites from decisions or evidence a slice is meant to produce. A discovery slice can be ready while implementation remains blocked; name that distinction explicitly.

**Complete when:** the graph has no unexplained cycle or dependency, every cross-slice contract appears in both slices' interfaces, the review focus is written, the ready frontier is accurate, and combined acceptance has a verification path.

## 4. Save and return the plan

Use the canonical plan or tracker already designated for this work. A planning request authorizes a local plan artifact unless the user requests chat-only or no file changes. Follow repository conventions; otherwise use a unique `docs/plans/<task>.md`. Preserve another task's unfinished plan. For an external tracker, prepare local content unless writing there is already authorized; use links instead of maintaining duplicate status lists.

Before saving, check **proportion**: the plan's length tracks the problem's size. Trim narrative, restated requirements, and implementation steps until what remains is decisions, slices, interfaces, and checks.

Record the inspected revision or snapshot, material decisions, evidence pointers, frontier, and next action. Refresh these at slice boundaries. Keep active constraints and failing evidence available; leave old exploration behind pointers. Use `handoff` when work must move to another session, harness, directory, or person.

**Complete when:** the plan is saved or delivered in the requested form and another agent can identify its next executable slice. If implementation is already authorized, return to `implement` and continue from that frontier; a request for planning alone ends with the plan.
