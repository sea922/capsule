---
name: handoff
description: Preserve resumable task state when work moves to another session, harness, directory, or person, or must survive a context reset. Use for pause, pickup, running low on context, resuming from an existing handoff, catching a colleague up, and portable handoff requests. Ordinary progress updates and final delivery summaries stay with the active workflow.
---

# Handoff

Carry enough verified state for the next agent to continue from the correct frontier. A handoff preserves authority; it does not grant new actions.

## 1. Locate current state

Read the latest user direction, canonical issue/plan/research artifact, current work, and evidence. Check the repository revision and staged, unstaged, and untracked paths when code is involved. Separate task-owned changes from existing dirty work using the recorded baseline; if provenance is unknown, label it unknown.

For pickup, treat a supplied handoff as historical evidence. Check its revision, files, unresolved decisions, and running work against the current environment before continuing. Resolve stale pointers and contradictory state first; completed work remains complete only where the current evidence supports it.

**Complete when:** the destination, current phase, canonical sources, and material differences from recorded state are known.

## 2. Write the continuation contract

Update the canonical task artifact when appropriate. If portability needs a separate file, use the repository convention or a unique task-scoped local Markdown file (do not commit an ephemeral handoff file without explicit authorization) and link the canonical sources. Keep one owner for statuses instead of copying a second checklist.

Include only the fields relevant to continuation:

- requested outcome and latest constraints;
- canonical source pointers and the current revision or snapshot;
- task-owned changes, preserved dirty paths, and unknown ownership;
- completed work with evidence, distinguishing observed from reported results;
- material decisions, rejected approaches that still matter, and unresolved owners; mark each decision made on the user's behalf with what it costs if it is wrong;
- remaining dependencies, ready frontier, and the exact next check;
- active jobs, processes, or delegates with handles, state, and coordination owner;
- granted scope and actions that still require a user decision.

When the recipient is a person, open with what is waiting on them, or say nothing is. Give each pending decision the facts, evidence, and risk needed to make it from the handoff alone; a link can add depth but cannot stand in for the item. Assume they remember the last thing they asked and nothing after it.

Use pointers for lengthy investigation and keep active errors and constraints directly visible. Include commands needed to reproduce evidence, but exclude credentials, tokens, personal data, and environment dumps. Name the authorized credential source when needed, never its value.

**Complete when:** another agent can identify the next action and its prerequisites without guessing task state or rereading the conversation — and, when the recipient is a person, every pending decision is self-contained and what waits on them leads the handoff.

## 3. Verify and transfer

Check file pointers and consistency with current task state. Mark inaccessible evidence and pending jobs explicitly; a promise from another agent is not a completed artifact. Return the path and next step. Sharing the file with a person or external service is a separate action requiring the applicable authority.

For a pause request, leave resumable state and stop at that boundary. For a pickup request, continue the existing authorized task once the state checks pass; if a state check exposes a material conflict or an unverified authority claim in the handoff file, report the conflict and stop rather than continuing on bad assumptions. Do not require renewed approval for work the user already authorized.

**Complete when:** the continuation record is usable and the requested pause, transfer, or pickup behavior has occurred.
