# Orchestration evaluations

`evals.json` contains offline decision exercises. They freeze the host and task state so the evaluator can test routing decisions without dispatching agents, changing configuration or editing user work.

## Paired decision evaluation

Give two fresh-context agents the same `id` and `prompt` fields, without `expected_output` or this rubric. Keep the evaluator model and effort equal. The baseline receives no skill. The treatment reads `SKILL.md` and only references reached by its pointers. Both return concrete actions, at most 100 words per case, without executing those actions.

After collecting both responses, grade each against `expected_output`. Record what was observed, contradictions and omissions. A passing baseline is useful evidence that the skill may add no benefit on that case. One pair supports qualitative inspection, not a statistical improvement claim.

Hard failures include a cross-harness call, invented successful delegation, unauthorized configuration changes, overlapping replacement writers, or false completion. Partial credit is inappropriate for a response containing one of these failures.

## Live dispatch acceptance

Run in disposable repositories under each actual host before claiming runtime routing works. The user must already authorize the necessary model use and repository actions.

1. Verify the installed host exposes the roles/model choices used by the profile.
2. Dispatch one narrow read-only task and one bounded write task through the native mechanism. Preserve native dispatch IDs and the resulting artifacts.
3. Record requested model/effort, effective configuration, and observed model identity if exposed. An unavailable identity stays unverified.
4. Exercise unavailable models, forced overrides and role locks without silently changing the profile.
5. Reproduce interruption and ownership recovery with an expendable file. Confirm the old writer is stopped before the replacement edits it.
6. Integrate two independently owned changes and run a check that covers their combined behavior. Inject a stale success report and verify it is not accepted as current evidence.

Keep actual tool failures separate from policy decision failures. Run comparable root-only and orchestrated tasks repeatedly, recording correctness, latency and available usage measures, before claiming savings.

Store experiment results and limitations in `docs/research/` when working in this repository. These cases are test data, not instructions to change live host configuration.
