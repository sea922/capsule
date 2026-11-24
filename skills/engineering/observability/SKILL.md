---
name: observability
description: Instrument a service so its behaviour can be seen and acted on, with structured logs, metrics, traces, objectives, symptom-based alerts, and dashboards built from an operator's questions. Use when adding logging, metrics, tracing, alerts, or a dashboard, before a service or critical path carries real traffic, or after an incident the data could not explain. Launch readiness belongs to production-readiness; speeding up a measured path to performance; finding a failure's cause to diagnosing-bugs.
---

# Observability

Telemetry is written before the incident and read during it. Start from the questions someone will ask when the service misbehaves, emit only the signals that answer them, and do not call a path observable until a real event has been found in the data.

## 1. Write the questions

Before adding a signal, write two to six questions an operator will ask about this service or feature: is it up, is it returning wrong results, is it slow, which dependency, which release, which tenant or route. Add the ones specific to the work, such as how many payments succeed only after a retry, or how old the oldest queued job is.

Read what already exists: the logging library and its format, the metrics and tracing libraries, where telemetry is sent, existing dashboards and alert rules, and the fields other services use. Extend the established names and tools before introducing new ones.

**Complete when:** the questions are written down, and the existing libraries, field names, and destinations are identified.

## 2. Choose a signal for each question

- **Metrics** answer how often and how fast in aggregate, cheaply, and show that something is wrong.
- **Traces** answer where the time went across services for one request.
- **Logs** answer what happened in one specific case, and why.

Map each question to the signal that answers it. A question with no signal is a gap to fill; a signal with no question is cost and noise, so leave it out. Details for each signal are in [references/SIGNALS.md](references/SIGNALS.md).

**Complete when:** every question has a named signal, and no planned signal lacks a question.

## 3. Emit structured events with a correlation id

Log events, not sentences: a stable event name and machine-readable fields, through the project's logger. Carry service, version, environment, route or job name, outcome, duration, and error class. Use levels consistently, so an error means someone may need to act and handled degradation is a warning.

Generate or accept one correlation id at the system boundary and attach it to every log line, span, outbound call, and emitted message, including the background job that consumes the message. When several entry points write to one log, such as a scheduler, an endpoint, and a manual run, record which one started the work.

Decide per field what is kept, hashed, truncated, or dropped, before anything leaves the process. Drop secrets, tokens, authorization headers, cookies, payment data, and whole request bodies; keep personal data out unless the project has decided to hold it. Sending telemetry to a new third-party backend is a data-export decision to raise with the user, not a default to switch on.

**Complete when:** events are structured with stable names, one correlation id crosses process and queue boundaries, and redaction is decided per field.

## 4. Measure every path and every dependency

For each route, job, and consumer, record request rate, error rate, a duration distribution, and the saturation of whichever resource is constrained: connections, workers, memory, or queue depth. A global error rate hides one broken endpoint. Record durations as histograms and read percentiles, since an average hides the slow tail and percentiles cannot be recovered from it afterwards.

Measure the boundaries the service does not control, such as the database, cache, queues, and third-party APIs, separately from the caller's total: attempt, outcome, duration, and retry count. Count the failures that are otherwise silent: retries, timeouts, queue age as well as depth, dead letters, dropped messages, circuit-breaker state, and job lag.

Keep metric labels to small fixed sets, such as route template, status class, and dependency name. User ids, emails, request ids, raw URLs, and error text belong in logs and traces; an unbounded label is the usual cause of a telemetry bill or a failing metrics backend. Write down the allowed values of each label.

**Complete when:** each path and dependency has rate, errors, duration distribution, and saturation, silent failures are counted, and every label's values are bounded.

## 5. Trace across boundaries

Use the tracing library the project already has. Where it has none, OpenTelemetry is the vendor-neutral default, and its automatic instrumentation covers common HTTP, RPC, and database clients; read its current documentation for setup instead of recalling an API. Add manual spans only around meaningful units of work, with the attributes an operator will filter by.

Propagate context across every asynchronous boundary: HTTP headers, message metadata, thread and task hand-offs. A trace that stops halfway invites a confident wrong conclusion. Sample at a rate the backend and budget can hold, and keep errors and slow requests where the backend supports it.

**Complete when:** one request can be followed across every service and queue it touches, or the boundary where the trace ends is named.

## 6. Set objectives and alerts

Follow [references/ALERTS.md](references/ALERTS.md). Define what good service means as a ratio users would recognise, such as successful requests or requests answered within a threshold, and set a target from measured history and what the product needs, not from a round number.

Alert on symptoms users feel: error rate, latency against the objective, queue age. Causes such as processor load or a restarted instance go on a dashboard. Every alert is actionable, has a threshold and duration justified by the objective or by history, and links to a runbook that says what it means, what to check first, and who to escalate to. Keep two severities: act now, and act this week.

Creating or changing alert rules, dashboards, retention, or sampling alters shared configuration and often costs money. Write the rule and its query, then ask before creating anything in a shared or production account.

**Complete when:** each objective has a measured basis, each alert has a symptom, threshold, duration, and runbook, and nothing shared was created without the user's go-ahead.

## 7. Build the dashboard from the questions

Read an existing dashboard on the platform first for its structure, query language, variables, and conventions. Lay the board out in the order an operator asks: health at the top, then latency, throughput, saturation, and anything specific to the service. Every panel has a title that states its question, a unit, and thresholds that mean something; add variables for the common filters and mark deploys so "what changed" is visible.

Remove any panel that answers no written question. Separate liveness, readiness, and dependency health, so a process that is alive but cannot reach its database is not shown as healthy.

**Complete when:** every panel maps to a question from step 1, has a title and unit, and no panel is there only because the metric exists.

## 8. Verify with a real event

Instrumentation is code and can be wrong. In a non-production environment, send a normal request, force an error, force a dependency timeout, and make one request slow. Then answer the step 1 questions using only the telemetry: find the request by its correlation id, confirm fields are structured, confirm the metric series appear with the expected labels and plausible values, and follow the trace across services. With approval, fire each new alert once and confirm it reaches the right place with a working runbook link.

Each question that cannot be answered is a gap to fix now. Where no telemetry backend is reachable, verify against local structured output with the same field names and say that this is not evidence about production.

**Complete when:** each question is marked answered or not answered from data actually read back, and every unverified signal is labelled as such.

## Report

Separate what was instrumented (code that emits a signal), what was observed (an event or query result read back), and what remains unverified. Quote one emitted event with its real field names and the query that returns it. List the questions with answered or not answered beside each, alerts and dashboards proposed apart from any created, and any data-export or cost decision left with the user.

## Boundaries

`production-readiness` decides whether the observability is enough to launch. `performance` uses measurements to make a path faster, and its latency reference covers tail latency and freshness. `diagnosing-bugs` uses telemetry to prove a cause. `security-review` owns a full review of what telemetry exposes. `containers-and-deploys` owns health checks in the delivery path, and `llm-features` owns evaluating model output.
