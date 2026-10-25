# Grilling

`grilling` stress-tests a consequential or ambiguous plan, decision, or idea through a live interview. It is a general reasoning primitive that domain-specific skills can invoke before they create an artifact or take action.

- **Invocation:** model-invoked when the user asks to be grilled or challenged, or when material choices remain silently assumed.
- **Default:** interactive, read-only, and non-executing.
- **Output:** a user-confirmed shared-understanding summary for the calling workflow.

## Decision tree and frontier rounds

The skill maps the root decision and its dependencies. It asks only the current frontier: unresolved questions whose prerequisites are settled. Independent frontier questions are asked together by default, each with its downstream consequence, useful options, and a recommendation with the main trade-off. A question is deferred whenever its wording, options, or recommendation could change after another question in the same round. A user may request one question at a time.

Answers reshape the tree. Contradictions, vague outcomes, hidden assumptions, unsupported urgency, and accidental scope are challenged before the next frontier is asked.

## Facts, decisions, and confirmation

Accessible facts are investigated rather than delegated to the user. Judgement, preference, authority, and intent remain human decisions. Empirical uncertainty becomes a proposed measurement or prototype for a later workflow, not an invented answer.

The caller can use [research](../engineering/research.md) for external evidence or [prototype](../engineering/prototype.md) for an experiment, then return the observation to the interview. Grilling itself remains the interview owner.

When the tree is resolved, the skill summarizes the outcome, decisions, assumptions, constraints, non-goals, rejected alternatives, and owned unknowns. The user must explicitly confirm that summary. Without a live decision-maker, the skill stops with unresolved branches and owners; it never self-answers and calls the result confirmed.

## Composition and boundaries

`grilling` does not write documents, update trackers, create plans, implement, commit, or publish. The calling workflow owns the durable artifact and all execution. For example, [`adlc-intent`](../adlc/adlc-intent.md) invokes grilling when value, premise, or scope is contested, then resumes its own intent drafting only after confirmation.

## Attribution and design basis

This original local skill generalizes the design-tree, frontier-round, fact-versus-decision, and confirmation model in Matt Pocock's MIT-licensed [`grilling`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling). It also draws on source-backed questioning, option, trade-off, and composition practices from the repository's preferred skill sources. No upstream skill instructions are vendored. See the pinned [research record](../research/grilling-skill-research.md).
