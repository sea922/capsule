# Verification Before Completion

`verification-before-completion` is the shared evidence gate used before an agent says work is done, fixed, passing, ready, deployed, or compliant. It is also directly callable for requests to verify, prove, double-check, or show that an outcome works.

- **Invocation:** model-invoked before positive completion claims and for explicit verification requests.
- **Default:** source- and external-state-read-only checks against the final artifact, revision, environment, and inputs.
- **Posture:** falsifiable claims, fresh direct evidence, explicit provenance, and honest terminal states.
- **Output:** a claim matrix and evidence receipt with one bounded verdict.

## Claim and evidence model

The skill first replaces vague completion language with exact claims. Each claim names the evidence capable of disproving it, the required scope, and the risk if it is missed. Negative and preservation claims matter too: no duplicate retry, no unrelated file change, no broken document render.

Evidence must be:

- **fresh:** gathered after the last relevant edit;
- **direct:** capable of falsifying the actual claim rather than a proxy;
- **scope-matched:** tied to the named artifact, revision, environment, inputs, and risk;
- **attributable:** independently observed or clearly labeled reported-green.

An exit code is insufficient when a command can skip the decisive test, omit ignored fixtures, validate only syntax, use stale cache, or produce an artifact that still needs inspection.

Data-shaped changes such as filtering, ordering, pagination, and aggregation get claims for each dimension alone and in combination.

## Evidence integrity

- **Hollow green:** the underlying checker's own status and output decide, not a wrapper's exit code. Checks are reported as pass, fail, skipped, or errored; partial coverage never yields a composite "all clean", and trends are compared only across identical check sets.
- **Side-blind fix evidence:** a fix is supported by a check that fails before the patch and passes after it, cannot tell which revision it runs against, and proves the relevant code path was reached.
- **Weakened checks:** before any verdict on code work, the diff is scanned for lowered thresholds, deleted or skipped tests, new suppressions, loosened assertions, and stubs posing as implementations. An unexplained flag makes the affected claim NOT VERIFIED.

## Evidence by artifact

| Claim | Strong evidence |
| --- | --- |
| Code behavior or fixed bug | Focused regression or acceptance test, then proportionate nearby checks |
| Build, package, generated output | Fresh build or generation plus artifact inspection |
| Documentation | Parser, renderer, link or literal checks, and visual inspection when layout matters |
| Configuration or migration | Validation or faithful dry run plus effective-state or behavior evidence |
| External or deployed state | Authorized read-back from the actual target system |
| Visual interface | Real rendering in the relevant application, state, and viewport |
| Performance | Representative measurement against a comparable baseline |

The smallest evidence set should cover every material claim. A broad suite is not run by ritual, and one focused unit test cannot support an integration or deployment claim.

For user paths without a repeatable harness, the conditional project-verification reference identifies environment, launch, interaction, observation, and teardown. Missing harness implementation returns to `implement` when authorized; verification alone reports the gap. Recurring verification instructions must be exercised before they count as evidence.

## Verdicts

- **VERIFIED:** every material claim has fresh, direct, scope-matched evidence.
- **NOT VERIFIED:** fresh evidence contradicts at least one material claim.
- **PARTIALLY VERIFIED:** separable claims are verified and others remain unchecked, with no named constraint preventing the next check.
- **INCONCLUSIVE:** evidence is ambiguous, inconsistent, flaky, stale, or too indirect.
- **BLOCKED:** access, authority, environment, dependency, cost, or safety prevents any material required claim, even if other claims are verified.

Reported-green is evidence provenance, not a verdict. Product acceptance remains a stakeholder decision. Deployment is verified only against the target environment after authorized deployment.

Verdict precedence is: contradictory evidence, then a prevented material check, then ambiguous executed evidence, then incomplete separable coverage, and finally complete verification. This resolves mixed cases such as locally valid configuration whose paid cloud and unavailable visual checks remain blocked.

## Authority and composition

Verification does not silently implement, commit, push, approve, merge, deploy, accept, or publish. Destructive, paid, rate-limited, externally visible, credentialed, or privacy-sensitive checks pause for authorization.

`implement` owns edits and calls this after the final relevant change. `tdd` supplies phase evidence but not broader completion. `diagnosing-bugs` supplies the cause and original symptom. `code-review` remains an independent review.

## Evidence receipt

The final report names verdict and scope, fresh commands or inspections and decisive results, independently verified versus reported-green provenance, gaps and skips, and the smallest next action when the verdict is not VERIFIED. Positive completion language is limited to the exact verified scope.

## Attribution and design basis

The original local protocol was informed by freshness and delegated-report skepticism from Obra's MIT-licensed [`verification-before-completion`](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion), focused/final check separation from Matt Pocock's MIT-licensed [`implement`](https://github.com/mattpocock/skills/tree/main/skills/engineering/implement), artifact and shipping distinctions from Addy Osmani's MIT-licensed [`code-review-and-quality`](https://github.com/addyosmani/agent-skills/tree/main/skills/code-review-and-quality) and [`shipping-and-launch`](https://github.com/addyosmani/agent-skills/tree/main/skills/shipping-and-launch), and claim/evidence receipts from Cursor's MIT-licensed `cursor-team-kit` and pstack subtrees. No upstream instructions or templates are vendored. See the pinned [research record](../research/verification-before-completion-skill-research.md).

The evidence-integrity rules were added from the [2026-09 source sweep](../research/2026-09-27-source-repos-sweep.md): checker integrity from gstack's health-check rewrite, weakened-check detection from Addy Osmani's `constraint-driven-development`, side-blind validation from Trail of Bits' `post-patch-validation`, and combined data-dimension checks from `agent-dispatcher`.

The measured-claims reference for performance and eval numbers (named limiter, tuning parity, physical limits, errors, interleaved repeats, end-to-end relevance, and proof the work ran) comes from Cursor pstack's `principle-explain-the-number` and `benchmark-checklist` in the [2026-10 source sweep](../research/2026-10-06-source-repos-sweep.md).
