# Deep Review

Load this reference only for an explicitly requested `deep` review. Preserve the read-only boundary and the finding gate in `SKILL.md`.

## 1. Build one review packet

Establish a shared packet before independent passes begin:

- target, merge base, head, commit list, and complete changed-file list;
- the full diff plus untracked files treated as additions;
- applicable repository instructions;
- supplied or directly discoverable issue, pull-request, acceptance, and design intent;
- generated files and checks already reported by the author or CI;
- risk notes for authorization, money, destructive operations, migrations, concurrency, boundaries, compatibility, and failure recovery.

Do not treat author-reported checks as independently verified evidence.

## 2. Run independent passes

When subagents are available, give the same review packet and fixed point to three parallel reviewers. Otherwise perform three isolated passes sequentially. Keep their candidate lists independent until validation. Every reviewer stays read-only and returns candidates; no reviewer delegates a further review.

### Defects pass

Trace changed behavior through inputs, callers, state transitions, error paths, cleanup, retries, concurrency, persistence, and external effects. Check security and performance where the change creates a concrete exposure. Follow important call paths beyond the diff when necessary.

### Specification pass

Compare the implementation with every available source of intent. Quote the exact acceptance statement, contract, or decision behind a candidate. Check for missing behavior, incorrect behavior, scope creep, and incompatible changes. Mark this pass `intent unavailable` when no authoritative source exists.

### Standards and architecture pass

Apply the instructions governing each changed file and the repository's established local contracts. Inspect architecture only where it creates a concrete regression:

- responsibility, invariant, policy, and state ownership;
- static dependency direction versus runtime control and data flow;
- public interface behavior, effects, errors, time, and compatibility;
- boundary failure, retries, idempotency, duplicates, ordering, and consistency;
- caller knowledge, cycles, hidden coupling, and bypassable seams;
- tests located at the seam where the changed assumption crosses.

Use KISS, YAGNI, DRY, SOLID, and smell names to investigate evidence, never as self-sufficient findings.

### Optional second opinion

When a reviewer on a different model or harness is available, such as another vendor's CLI, and sending the code to that provider is permitted, give it the same packet as one extra read-only pass. It is optional: when it is unavailable, fails, or times out, continue and note its absence in the review scope. Its candidates join the pool and face the same validation as every other pass.

## 3. Deepen only where evidence points

- Inspect history or blame when intent is ambiguous, a suspicious line predates the change, or compatibility depends on an earlier decision.
- Read distant callers and implementations when the changed contract can fan out beyond nearby code.
- Map the blast radius of a changed assumption: name affected consumers and the control or invariant that keeps each safe. Push the load-bearing fact to *ran* or higher on the proof ladder with a focused test or safe reproduction; when that proof is unavailable, report the fact as `unproven` and the missing proof as a coverage gap.
- Run the smallest relevant tests, static checks, reproductions, or focused experiments that can prove or disprove material candidates.
- Expand to broader checks only when narrow evidence cannot cover the risk and the user has not imposed a tighter boundary.

Record commands and outcomes that materially affect the findings. Do not turn deep review into an unbounded whole-repository audit.

## 4. Validate the candidate pool

Combine the independent candidate lists, deduplicate them, then challenge every item:

1. Identify the exact changed cause and concrete trigger.
2. Re-read the cited lines and enough surrounding code to test the claim.
3. Search for guards, callers, contracts, tests, or history that could invalidate it.
4. Confirm that impact and severity match the scenario.
5. Reject pre-existing, intentional, speculative, style-only, tool-owned, or non-actionable items.

Validation confirms or drops. A candidate that survived a review pass but that validation cannot confirm does not become a hedged finding; drop it, and carry it into residual risks only when the unresolved uncertainty is itself material. Agreement between passes is not confirmation — the same missing context can mislead every reviewer.

Conflicting candidates require another evidence pass, not a compromise finding. A minority reviewer may be correct; evidence decides.

## 5. Finish at the standard output gate

Return to `SKILL.md` for the findings-first format. The deep review is complete only when all three axes have completed, the candidate pool has been independently validated, the load-bearing fact carries its proof rung, checks and intent sources are named, and residual uncertainty is explicit.
