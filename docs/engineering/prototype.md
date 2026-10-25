# Prototype

Use `prototype` when a design or feasibility question needs a runnable observation. It is model-invoked and produces one small experiment.

The result includes the question, method, runnable artifact, observations, limitations, and the decision supported by the result. The experiment has an effort bound and a discriminating check before construction begins.

## Choosing the experiment

UI questions need the relevant states rendered and inspected. State or performance questions need representative inputs and decisive boundary cases. Synthetic data or stubs are useful only where they do not predetermine the answer.

The artifact remains available for inspection, and task-owned background processes are terminated. “Throwaway” describes the investment level; it does not imply deletion or production readiness.

## Example

“Prototype whether a cancelled queued export can restart without reusing a stale result. Use synthetic data and leave production code unchanged.”

An observable state experiment should settle the restart behavior and identify concurrency or persistence assumptions that remain untested.

## Composition and design basis

An existing failure routes to `diagnosing-bugs`. A product preference remains a human decision. Already-authorized production work resumes through `implement` using the observation as evidence.

The [preferred-source research](../research/preferred-skill-repositories-workflow-gap-research.md) records all six sources. Matt Pocock and pstack contribute the empirical detour; Ponytail informs the smallest sufficient experiment. The skill avoids automatic branches or artifact deletion.
