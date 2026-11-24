# Decision records

Use `decision-records` to capture a significant technical decision as an architecture decision record (ADR), or to answer why an earlier decision was made.

Examples:

- “Record that we chose Postgres over MongoDB.”
- “Write an ADR for the new auth approach.”
- “Why did we pick REST for the public API?”
- “We're replacing ADR 4; update the records.”

The skill first checks the decision is worth recording: hard to reverse, or shaping work beyond the current task. It follows the project's existing location, numbering, headings, and index, and only falls back to `docs/adr/` when there is no convention. It gathers the context, the options that were really considered, and the reasons, and labels anything unsupported as a judgement. The record states the decision, the rejected options, and the consequences, including the costs of the chosen option.

Accepted records are never rewritten: a change of course gets a new record, with the old one marked superseded and linked both ways. A question about a past decision is answered from the records, or the skill says none exists.

## Workflow fit

`codebase-design` works out the design; `compound-learnings` keeps lessons from incidents; `research` supplies external evidence.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-adoption-research.md), and the [skill instructions](../../skills/engineering/decision-records/SKILL.md).
