# Compacting a long session

Read this when a session is running low on context, or before choosing to compact, clear, or continue. Compaction replaces the conversation with a summary. Choosing when it happens keeps the work; letting it happen at an arbitrary point can drop the one fact the next step depends on.

## When to compact

Compact at a boundary between phases, where what came before can be summarized without loss:

- after exploration or research, once the plan is written down;
- after a milestone is finished and verified;
- after a debugging detour is resolved and its cause recorded;
- before switching to a different part of the task.

Do not compact in the middle of a change that spans several files, while a failure is still being diagnosed, or while a job or delegate is running whose handle exists only in the conversation. Finish the unit, or write its state down first.

Size is the real signal, not the number of steps: a few large file reads or tool results can fill the window quickly, and many small calls may not. When the host reports how full the context is, use that. Suggest compaction to the user at a boundary; do not treat a suggestion as an instruction to stop mid-task.

## What survives and what does not

| Survives | Lost or reduced to a summary |
| --- | --- |
| Files on disk and the repository's state | The contents of files read earlier |
| Project instruction files the host reloads | Intermediate reasoning and rejected approaches |
| Memory or notes the host stores outside the conversation | Preferences and constraints the user stated only in conversation |
| Anything written into the task's canonical artifact | Handles of running jobs, exact error text, and command output |

A task list kept by the host may or may not survive, depending on the host and its settings. Do not rely on it as the durable record.

## Before compacting

1. Write the continuation contract from step 2 of the skill into the canonical task artifact or a task-scoped file: the plan, decisions with their reasons, the ready frontier, and the exact next check.
2. Record anything that lives only in the conversation: constraints the user stated, error text still being worked on, and handles of running work.
3. When the host accepts a focus hint with the compaction request, give one that names the next step and what must be kept.

## After compacting

Treat the summary as a handoff from an earlier session: reread the artifact, check the repository state against it, and confirm the next step before acting. Reread a file before editing it; the summary of a file is not the file.
