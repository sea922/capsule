# Design It Twice

The first plausible interface anchors later reasoning. Produce materially different designs before committing, then compare them on one scorecard.

## Frame one brief

Give every alternative the same evidence:

```text
Decision to make:
Current modules and pain:
Capability and invariant owners:
Clients and use cases:
Dependency profiles:
Process, transaction, trust, and compatibility constraints:
Likely changes and their evidence:
Duplicated knowledge versus merely similar code:
Current requirement or pressure paying for new machinery:
Required migration or backward compatibility:
Out of scope:
```

**Complete when:** the brief contains enough context that two designers can disagree about the interface rather than invent different problems.

## Force material variation

Generate at least two designs that vary one or more of:

- responsibility allocation;
- client-facing interface;
- invariant or state ownership;
- static dependency direction;
- local versus remote placement;
- direct call versus queued command or event;
- centralized orchestration versus choreography;
- shared deep module versus vertical slices;
- explicit port versus direct dependency.

Useful constraints include:

- **Minimal:** one to three client concepts, optimized for depth.
- **Common caller:** make the dominant use case trivial and safe.
- **Policy-owned ports:** details depend on explicit capability contracts.
- **Slice-local:** optimize independent use-case change and accept deliberate duplication.
- **Local-first:** keep one process and model distribution only as a future seam.
- **Operational:** optimize failure visibility, recovery, and compatibility.

Renaming the same classes or moving the same graph into different folders is one design.

## Proposal format

Present each alternative separately before comparing it:

```text
Name and one-sentence thesis
Owned responsibility and invariants
Client interfaces and example use
Hidden knowledge
Modules and source dependency direction
Relationship edge cards
Failure, time, and consistency model
Tests and production evidence
Migration and enforcement
Costs and failure modes
```

Use enough pseudocode or diagrams to make client knowledge and ownership concrete. Avoid implementation detail that does not distinguish the designs.

## Shared scorecard

Score with evidence rather than numeric theater:

| Dimension            | Question                                                                  |
| -------------------- | ------------------------------------------------------------------------- |
| Cohesion             | Do responsibilities share invariant, owner, capability, and lifecycle?    |
| Information hiding   | Which difficult or volatile decisions and duplicated knowledge disappear from clients? |
| Depth                | How much cohesive capability does each client concept unlock?             |
| Coupling             | What must change, deploy, be available, or agree together?                |
| Dependency direction | Do source dependencies protect policy, and are cycles visible?            |
| Contract             | Are effects, errors, time, consistency, and compatibility explicit?       |
| Reliability          | Are partial failure, retries, duplicates, ordering, and recovery bounded? |
| Security             | Are trust, authorization, validation, tenancy, and data exposure clear?   |
| Testability          | Can risks be proven at stable seams with faithful substitutes?            |
| Observability        | Can operators reconstruct outcomes across every important edge?           |
| Migration            | Is there an incremental path, compatibility period, and rollback?         |
| Cost                 | What total cognitive, implementation, navigation, and operational machinery is added, and which current evidence pays for it? |
| Reversibility        | Which choice preserves optionality when variation assumptions fail?        |

## Recommend

Choose the simplest design that protects current invariants and satisfies evidenced change or failure pressure. State:

- why it wins now;
- which knowledge is consolidated and which duplication remains deliberate;
- which cost is consciously accepted;
- why the alternative loses now;
- the trigger that would reverse the decision;
- the first reversible implementation step.

**Complete when:** the recommendation is opinionated, the loser is represented fairly, and future reversal has a concrete evidence trigger.

## Source

- [Ousterhout, A Philosophy of Software Design](https://web.stanford.edu/~ouster/cgi-bin/book.php)
