# Handoff

Use `handoff` when a task pauses, resumes, or moves between sessions, harnesses, directories, or people. It is model-invoked because other workflows need this boundary.

The result is a compact continuation record with authoritative pointers, inspected state, completed work and evidence, material decisions, remaining dependencies, the next check, and granted scope. It identifies active processes or delegated work and their coordination owner.

## Pause and pickup

On pause, the skill preserves resumable state and stops. On pickup, it checks the saved record against the current environment, resolves stale pointers or conflicting state, and continues work that is already authorized.

Existing task artifacts retain ownership of status. A portable record links them rather than establishing a second tracker. Secrets are excluded; inaccessible evidence and unknown ownership are labeled.

## Example

“Prepare a portable handoff so another session can continue this task, preserving the current evidence, dirty work, and next check.”

The next agent should know what to inspect first without assuming that old test results or another agent's promise prove completion.

When a session is running low on context, a compaction reference says when to compact, what survives, and what to write down first.

## Design basis

The [preferred-source research](../research/preferred-skill-repositories-workflow-gap-research.md) records all six sources. Matt Pocock contributes the portability boundary, pstack contributes pause/pickup and decision receipts, and Addy Osmani contributes selective context retention. Ordinary final summaries stay with the active workflow.

The [2026-11 source sweep](../research/2026-11-16-source-repos-sweep.md) marks decisions made on the user's behalf with their cost if wrong (Superpowers' "Rulings I made") and gives a person recipient pending decisions they can make from the handoff alone (Cursor pstack's `ketchup`).
