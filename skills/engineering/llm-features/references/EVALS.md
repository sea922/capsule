# Evals

Load this when writing, running, or repairing evals for a feature that calls a model.

## What a case holds

- **Input:** taken from real traffic or real documents where possible, with private data removed. Synthetic cases fill gaps; they do not replace real ones.
- **Expected behaviour:** an exact answer, a set of acceptable answers, properties the output must have, or a rubric.
- **Grader:** how the case is judged.
- **Tags:** the input class and difficulty, so results can be read per class rather than as one average.

Cover the common case, each known input class, boundaries (empty, very long, wrong language, malformed), hostile input (instructions hidden in data), and every bug already fixed. A few dozen well-chosen cases beat hundreds of near-duplicates.

## Choosing a grader

| Grader | Use when | Watch for |
| --- | --- | --- |
| Code: exact or normalized match, schema validation, a test suite, a build | The answer can be checked mechanically | Over-strict matching that fails correct answers in a different form |
| Model with a rubric | Quality is a judgment: tone, faithfulness to a source, completeness | The judge's own noise and bias; a judge that shares the generator's blind spots |
| Person | Risk is high or the rubric is not yet understood | Cost; drift between reviewers |

Prefer code. When a model judges:

- give it a written rubric with pass and fail examples, and ask for a verdict with a short reason, not a bare score;
- judge one property per call;
- check the judge against a sample labelled by a person before trusting it, and recheck when the judge model or rubric changes;
- hide which variant produced an output when comparing two.

Do not let the only check on a security-sensitive or irreversible action be a model's opinion.

## Trials and thresholds

Model output varies between runs, so run each case more than once and decide in advance how to read the results:

- **At least one of k passes** measures whether the feature can do the task. It suits jobs where a retry is cheap and failure is detected.
- **All of k pass** measures whether it does so reliably. It suits anything a user or a downstream system depends on.

Set the thresholds before running: typically a high bar on the reliability measure for regression cases and an agreed bar on the capability set. Pick numbers the project can defend; no figure is universal. Report the number of trials beside every rate, and treat a difference smaller than the spread between identical runs as no difference.

## Running them

- Pin what can be pinned: model identifier, prompt version, tool definitions, retrieval snapshot, and sampling settings. Record them with each run.
- Keep the suite fast enough to run on every change to a prompt, model, tool, or retrieval step. Run a larger set before release.
- Hold out a portion that is never used for tuning, and check it before claiming an improvement.
- Read failures, not only the pass rate. Group them by cause; one cause often explains many cases.
- When a production failure appears, add it as a case first, watch it fail, then fix it.
- A change in the provider's model behind a stable name can move results. Rerun the suite when the model changes, and on a schedule if the name is an alias.

## Reporting

State the pass rate per set and per input class, the trial count, the graders used, cost and latency for the run, what changed since the last run, and the cases that still fail with their cause. Mark any figure that was estimated instead of measured.
