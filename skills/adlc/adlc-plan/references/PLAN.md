# Plan artifact

`planning-and-task-breakdown` owns the slice list, dependencies, and ready frontier. This file adds the ADLC frame around them. Adapt headings to an existing project convention.

```markdown
---
adlc: plan
slug: <slug>
status: draft
source: <spec path>@<content hash>
---

# <Title> plan

> Drafted by an agent from the approved spec.

## Slices

<slices with interfaces, dependencies, and ready frontier from planning-and-task-breakdown; no status in slice headings>

## Review focus

<ranked failure modes no slice check exercises yet, each with its owning slice>

## Decisions

| ID | Decision | Settles | Evidence |
| --- | --- | --- | --- |
| D1 | <stack, hosting, threshold, sequencing, ...> | <spec condition, open question, area of concern, or —> | <research, measurement, or reason> |

## Carried items

- C1: <spec item still undecided> — source: <artifact hash and condition ID> — owner: <who decides> — decide by: <before S2 starts or end of discovery slice S1>

## Coverage

| Acceptance criterion | Slices | Check |
| --- | --- | --- |
| AC-001 | S1, S2 | <test or check that proves it> |

Combined acceptance: <check of the integrated user outcome, environment, and owner>.

## Assignment

| Slice | Implementer | Verifier |
| --- | --- | --- |
| S1 | <human, agent role, or orchestrate> | <someone other than the implementer> |

## Risks and rollback

- <risk> — mitigation: <...>; stop/rollback trigger: <observable condition>; rollback or recovery: <how, who, and any irreversible effects>

## Handoff

<implement | orchestrate within existing delegation authority>, starting from the initial ready frontier. Pass the approved plan hash, slice/AC IDs, conditions, code revision, and progress path. Current state and frontier are updated only in `progress.md`; a human sign-off the plan or a carried item requires goes through `/adlc-gate slice <id>`.

- Delivery endpoint: <local verification | PR ready | merged | deployed to named environment>.
- Action authority: <existing human instruction and its scope; unresolved external action if any>.
- Delivery owner: <existing engineering workflow; ship-it for remote delivery>.
- Outcome observation: <intent success signal, owner, method, and observation point; pending if not yet observable>.

## Approvals
```
