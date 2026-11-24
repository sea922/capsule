# Agent Orchestration

## Available Agents

capsule's agents are read-only helpers that its skills hand work to. With the
plugin installed they are named `capsule:<name>`; copied into a project's
`.claude/agents/` they use the bare name. They are invoked through the Agent
tool with that `subagent_type`:

```text
Agent(subagent_type: "capsule:code-review-tests", prompt: "...")
```

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| orchestrate-explorer | Locate code and trace execution paths | Unfamiliar code, onboarding, diagnosis |
| orchestrate-researcher | Verify technical facts against sources | Library, API, or version questions |
| orchestrate-worker | Implement one owned change | A bounded slice of a larger task |
| orchestrate-tester | Run checks and edit assigned tests | Verifying a slice |
| orchestrate-reviewer | Independent review of a change | Before merge |
| code-review-silent-failures | Errors a change swallows or hides | Deep review of error handling |
| code-review-type-design | Types that no longer enforce their rules | Deep review of types and schemas |
| code-review-comments | Comments and docs that contradict the code | Deep review |
| code-review-tests | Tests that would not catch a regression | Deep review |
| java-reviewer | Defects in Java, Spring Boot, and Quarkus changes | Java changes |
| database-migrations-reviewer | Unsafe schema, migration, and query changes | Database changes |
| performance-reviewer | Performance risk, as potential impact | Hot paths and large data |
| benchmark-auditor | Whether a measurement supports its claim | Reported speedups or regressions |
| accessibility-reviewer | Likely WCAG barriers in UI code | UI changes |
| production-readiness-auditor | Evidence for a launch decision | Before release |
| security-review-sanitizer | Secrets and private data before publishing | Making code or docs public |
| adlc-spec-miner | Current behavior of existing code | Specifying changes to unspecced code |

The skill that owns each agent says when to use it. Use the `orchestrate` skill
to plan any delegation larger than a single hand-off.

## Immediate Agent Usage

Without waiting to be asked:
1. Multi-step feature request - plan with the `planning-and-task-breakdown` skill
2. Code just written or modified - review with the `code-review` skill
3. Bug fix or new behavior - drive it with the `tdd` skill
4. Architectural decision - use the `codebase-design` skill

## Parallel Task Execution

Run independent operations as parallel tasks; keep dependent ones in order:

```markdown
# GOOD: Parallel execution
Launch 3 agents in parallel:
1. Agent 1: Security analysis of auth module
2. Agent 2: Performance review of cache system
3. Agent 3: Type checking of utilities

# BAD: Sequential when unnecessary
First agent 1, then agent 2, then agent 3
```

## Delegation Completion Contract

Applies to every agent at every depth (parent, child, grandchild):

1. **Your final message IS the deliverable.** Never end your turn with "waiting for background agents" — a spawned task is not a completed task. Ending your turn while children are running orphans their results (completed children cannot notify a parent whose turn has ended).
2. **If you delegate, you own collection.** Wait for results, integrate them, then return. Fire-and-forget delegation is forbidden.
3. **Decompose only when the work cannot fit in one context.** Do not re-delegate a task already sized for a single agent — depth is an outcome, not a plan.

> Rationale: observed failure mode — research agents followed "Parallel Task Execution" above, spawned children, and returned "waiting" as their final answer. All children completed successfully but their results were orphaned. The parallel rule without a completion contract produces zombie tasks.

## Multi-Perspective Analysis

For complex problems, use split role sub-agents:
- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker
