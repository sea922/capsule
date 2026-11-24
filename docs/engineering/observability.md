# Observability

Use `observability` to instrument a service so its behaviour can be seen and acted on.

Examples:

- “Add logging and metrics to this worker before it goes live.”
- “We couldn't tell what happened during last night's incident.”
- “Our pager is noisy; fix the alerts.”
- “Build a dashboard for the API service.”
- “Set up tracing across these two services.”

The skill starts from the questions an operator will ask and maps each to a signal: metrics for how often and how fast, traces for where the time went, logs for what happened in one case. It emits structured events with one correlation id that crosses process and queue boundaries, records rate, errors, a duration distribution, and saturation for every path and dependency, keeps metric labels bounded, and keeps secrets and personal data out of telemetry.

Objectives are set from measured history. Alerts fire on symptoms users feel, each with a threshold, a duration, and a runbook, and dashboards hold only panels that answer a written question. Alert rules, dashboards, and data export to a new backend are proposed first and created in a shared account only with the user's go-ahead. The work is verified by forcing a real request, error, and timeout and finding them in the telemetry; anything not read back is reported as unverified.

## Workflow fit

`production-readiness` decides whether the observability is enough to launch. `performance` uses measurements to speed up a path, and `diagnosing-bugs` uses telemetry to prove a cause. `containers-and-deploys` owns health checks in the delivery path.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/observability/SKILL.md).
