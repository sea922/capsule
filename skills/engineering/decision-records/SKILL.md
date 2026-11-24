---
name: decision-records
description: Record a significant technical decision as an architecture decision record (ADR), or answer why a past decision was made from the existing records. Use when the user says to record or document a decision, write an ADR, chooses between significant alternatives such as a framework, database, or API style, asks "why did we choose X", or supersedes an earlier decision. Working out the design itself belongs to codebase-design, api-design, or database-design; lessons from incidents to compound-learnings.
---

# Decision records

Capture a decision that would be expensive to reverse, so a later reader who was not in the room understands what was chosen, what was rejected, and what it costs. Record decisions that have been made or are being made now, not ones that might arise.

## 1. Decide whether it deserves a record

Write a record when the choice is hard to reverse or shapes work beyond the current task: a framework or major dependency, a data model, an authentication approach, an API style, a hosting or build platform, a boundary between services. A reversible local choice, a restatement of what the code plainly shows, or a decision nobody has to make yet does not get one. When the user asks for a record of a decision that is not yet needed, say what would make it worth writing, then follow their call.

When the question is "why did we choose X?", read the existing records and answer from them, quoting the relevant passage. If none covers it, say so; do not reconstruct a rationale as though it were recorded.

**Complete when:** the decision is named, and it is clear whether this is a new record, an update, or a question answered from existing ones.

## 2. Follow the project's convention

Look for existing records and their tooling before writing: a directory such as `docs/adr/` or `docs/decisions/`, a numbering and file-naming pattern, a heading set, a status vocabulary, and an index. Match all of them: continue the sequence, keep the markup, and reuse the headings. When sources conflict, show the conflict and ask.

Only when the project has no convention, use `docs/adr/NNNN-short-title.md` with the headings in step 4 and an index in `docs/adr/README.md`.

**Complete when:** the location, number, file name, and format are settled from the project's own practice or the default.

## 3. Gather the evidence

Collect what the decision rests on: the problem and its constraints, the options that were really considered, and the facts behind each tradeoff. Read the relevant code and the conversation. Use `research` for claims about external tools or versions. Mark each supporting fact by where it comes from: this codebase, a cited external source, or the user's statement. When a tradeoff has no evidence behind it, label it as a judgement.

Ask the user for anything only they know, especially why rejected options were rejected. Do not invent alternatives that were never considered to make the record look thorough.

**Complete when:** the context, the options, and the reasons are backed by a source or labelled as judgement.

## 4. Write the record

Keep it to one decision and one page where possible, with these parts:

- **Title:** the decision as a short statement, with its number.
- **Status:** `proposed`, `accepted`, `deprecated`, or `superseded by NNNN`, and the date.
- **Context:** the situation, constraints, and forces that made a decision necessary.
- **Decision:** what was chosen, stated plainly.
- **Options considered:** each real alternative and why it was not chosen.
- **Consequences:** what becomes easier, what becomes harder, what must now be maintained, and what would cause this to be revisited.

A new decision is `proposed` until the user or the team confirms it. Write for a capable reader who lacks today's context: define project terms and state costs honestly, including the downsides of the chosen option.

**Complete when:** a reader who was not present could explain the choice, its rejected alternatives, and its costs.

## 5. Link it in

Add the record to the index. Never rewrite the decision in an accepted record: to change course, write a new record and mark the old one `superseded by` it, with a link in both directions. Point to the record from the code or docs it governs where the project does that. Do not commit unless the user asks.

**Complete when:** the index lists the record, superseded records link forward, and the user has the path.
