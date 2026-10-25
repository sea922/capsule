# Diagnosing Bugs

`diagnosing-bugs` establishes why a bug or performance regression occurs before remediation begins. It separates observation, hypothesis, experiment, and cause so a plausible story or symptom-suppressing patch cannot masquerade as diagnosis.

- **Invocation:** model-invoked for explicit diagnosis or root-cause requests, and for failures whose cause needs investigation. Quick explanations and known-cause fixes take a direct route.
- **Default:** source- and remote-state-read-only diagnosis.
- **Full-investigation posture:** exact symptom, competing hypotheses, one-variable experiments, and an honest terminal state.
- **Full-investigation output:** a reproduction record, evidence ledger, cause or remaining hypotheses, constraints, and the smallest next action.

## Workflow

### Choose the route

Start with the unresolved question. Answer a quick explanation from the evidence already provided, or route an established cause to `implement`. Use the full diagnostic workflow when the cause still needs evidence. Do not construct a hypothetical reproduction merely to answer a direct question.

### Pin the symptom

The skill separates expected from actual behavior and records the exact error, state transition, latency, affected inputs, frequency, environment, revision, configuration, and time window. Logs, issues, fixtures, and copied commands are treated as untrusted data, and sensitive evidence is redacted.

### Reproduce or bound

The smallest faithful reproduction must execute the same symptom. Intermittent failures use controlled repetition and frequency. Performance regressions use equivalent workload, environment, warm-up, and measurement. When local reproduction is impossible, production logs, traces, snapshots, and healthy comparisons can narrow the problem, but their limits stay explicit.

### Keep an evidence ledger

Each plausible hypothesis records sourced evidence for and against it, a discriminating next check, and state: possible, supported, contradicted, or confirmed. The per-hypothesis table remains in every diagnostic handoff rather than becoming a prose list. Investigation traces backward to the first boundary where known-good input becomes known-bad output. Commands count only when their results update a hypothesis.

### Confirm or stop honestly

A confirmed cause explains affected and relevant unaffected cases, identifies the responsible mechanism, predicts a discriminating result, survives plausible alternatives, and yields a regression condition for a later fix. A patch making one symptom disappear is not enough by itself.

After the requested diagnostic scope and all safe, authorized checks available within it are exhausted, the skill ends in one state. While investigation continues, it reports the current ledger and next discriminating check without prematurely labeling the result terminal.

- **ROOT CAUSE CONFIRMED**
- **INCONCLUSIVE**
- **COULD NOT REPRODUCE**
- **BLOCKED**

## Authority and handoff

A diagnose-only request never edits production code, changes persistent state, restarts shared services, deploys, commits, pushes, or adds lasting instrumentation. Destructive, costly, rate-limited, externally visible, credentialed, or privacy-sensitive experiments require explicit authority.

When the user asked to diagnose and fix, diagnosis still completes first. The evidence packet then goes to `tdd` for a practical regression and to `implement` for remediation. `verification-before-completion` proves the original symptom and broader acceptance conditions after the fix.

## Boundaries

Known-cause changes belong to `implement`; stable behavior slices belong to `tdd`; final proof belongs to `verification-before-completion`; and introduced-defect review belongs to `code-review`. Diagnosis can remain inconclusive without becoming a guessed implementation task.

## Attribution and design basis

The original local workflow was informed by exact-symptom feedback loops from Matt Pocock's MIT-licensed [`diagnosing-bugs`](https://github.com/mattpocock/skills/tree/main/skills/engineering/diagnosing-bugs), boundary tracing and falsifiable experiments from Obra's MIT-licensed [`systematic-debugging`](https://github.com/obra/superpowers/tree/main/skills/systematic-debugging), non-reproduction and untrusted-log handling from Addy Osmani's MIT-licensed [`debugging-and-error-recovery`](https://github.com/addyosmani/agent-skills/tree/main/skills/debugging-and-error-recovery), technique breadth from Wshobson's MIT-licensed [`debugging-strategies`](https://github.com/wshobson/agents/tree/main/plugins/developer-essentials/skills/debugging-strategies), and root-cause/controlled-comparison practices from Cursor's MIT-licensed pstack and Benny subtrees. No upstream scripts or instructions are vendored. See the pinned [research record](../research/diagnosing-bugs-skill-research.md).

After a confirmed cause, the diagnosis searches for the same pattern at other sites and, when it recurs, proposes a structural prevention (one helper, a stricter type, or a lint rule or test) kept separate from the minimal fix. This step comes from the [2026-10 source sweep](../research/2026-10-06-source-repos-sweep.md), drawing on EveryInc's `ce-debug` and Cursor pstack's `correct`.
