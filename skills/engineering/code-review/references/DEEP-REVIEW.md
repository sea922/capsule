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

Apply the instructions governing each changed file, the repository's established local contracts, and the architecture lenses in `SKILL.md` (ownership, invariants, dependency direction vs runtime flow, caller knowledge, boundary failure semantics, and seam-aligned tests). Check only for concrete regressions — never report abstraction shape, SOLID labels, or smells by themselves.

### Specialist passes

When the change touches their area and capsule's agents are available, add these read-only passes with the same packet: `code-review-silent-failures` for error handling, fallbacks, retries, and async work; `code-review-type-design` for types, schemas, and serialized shapes; `code-review-comments` for comments and docs beside changed code; `code-review-tests` for the tests offered as evidence; `java-reviewer` for Java changes, including Spring Boot and Quarkus; `code-review-stack` for Python, Go, TypeScript, React, and C# changes; `code-review-security` when the change touches input handling, authentication, authorization, secrets, file or network access, deserialization, or dependencies; `database-migrations-reviewer` for migrations, schema, and queries; `benchmark-auditor` when the change claims a measured speedup; `performance-reviewer` for hot paths, data volume, and bundle weight; `accessibility-reviewer` for user-interface changes. Their candidates join the pool and face the same validation; none is a finding until validated.

Choose specialists from the packet's risk notes, not from file types alone: run a pass only when you can name what in this change it would examine. Default to at most four specialist passes, and prefer `code-review-security` and the matching stack or database pass when their triggers apply. When a stack pass runs beside the error-handling, type, query, or security pass, tell it so, so it leaves that analysis to the other pass. Name the passes run and the ones skipped, with the reason, under Review scope.

Without subagents, cover the selected specialists' areas in the defects pass, reading the agent file under `assets/claude-agents/` for its checklist when it is present.

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

Combine the independent candidate lists, deduplicate them, then challenge every item against the finding gate in `SKILL.md`: re-read the cited lines and surrounding code, search for guards, callers, contracts, tests, or history that could invalidate it, and verify the changed cause, trigger, impact, and severity.

When a command can settle a candidate, such as a failing test or a short reproduction, prefer that proof: rerun it and keep the candidate only when the output shows the failure. Give validation the candidate and the code, not the pass's reasoning, so the framing that produced it cannot carry over.

Validation confirms or drops. A candidate that survived a review pass but that validation cannot confirm does not become a hedged finding; drop it, and carry it into residual risks only when the unresolved uncertainty is itself material. Agreement between passes is not confirmation — the same missing context can mislead every reviewer.

Conflicting candidates require another evidence pass, not a compromise finding. A minority reviewer may be correct; evidence decides.

## 5. Finish at the standard output gate

Return to `SKILL.md` for the findings-first format. The deep review is complete only when all three axes have completed, the candidate pool has been independently validated, the specialist passes run and skipped are named in Review scope, the load-bearing fact carries its proof rung, checks and intent sources are named, and residual uncertainty is explicit.
