# Objectives, alerts, and runbooks

Read when defining a service-level objective, writing an alert rule, or writing its runbook. Query syntax and rule formats belong to the monitoring system in use; read its current documentation.

## Objectives

- An indicator is a ratio of good events to all events, measured as close to the user as possible: requests that succeeded, requests answered within a threshold, writes that were durable, jobs that finished within their deadline.
- Decide what counts. Client errors caused by bad input usually do not count against the service; errors the service returns because it is overloaded do.
- Set the target over a rolling window, commonly about four weeks, from measured history and what users need. A target the service has never met is a wish, and each extra nine costs far more than the last.
- The error budget is what the target allows to fail in the window. Agree beforehand what happens when it is spent, such as pausing risky releases; a budget with no consequence changes nothing.
- An objective stricter than a dependency's own is not achievable without redundancy around that dependency.

## Alerts

| Page someone | Show on a dashboard |
| --- | --- |
| Error ratio above the objective for a sustained period | Processor or memory use |
| Latency against the objective | One instance restarted |
| Age of the oldest queued item beyond its deadline | Disk at a moderate level |
| The error budget burning fast enough to be spent early | A dependency's internal metrics |

- A cause can still warrant an alert when it predicts an outage with certainty and time to act, such as a disk that will fill or a certificate about to expire. Send it as a ticket unless the deadline is hours away.
- Every alert has a threshold and a duration. A duration filters a brief spike; too long a duration delays a real page.
- Burn-rate alerting pairs a short and a long window: a fast burn pages, a slow burn opens a ticket. Take the multipliers from the monitoring system's guidance for the chosen target and window instead of copying them from memory.
- Alert on missing data for signals that should always be present. A service that stopped reporting looks the same as one with no errors.
- Two severities are enough: act now, and act this week. An alert that fires and is acknowledged without action should be fixed or deleted, because a noisy pager teaches people to ignore it.
- Route each alert to an owner who can act on it, and say in the alert which service, environment, and objective it concerns.

## Runbooks

Keep one per alert, where the project keeps operational documents, named after the alert and linked from it. Three parts are the minimum:

1. **What it means** for users, and the most likely causes.
2. **What to check first**: the query or dashboard that separates those causes, and the safe mitigation for each, such as rolling back the last deploy.
3. **Who to escalate to** when that does not resolve it.

Add steps only when the first check cannot decide. Update the runbook when an incident shows a step was wrong or missing; a stale runbook builds false confidence.

## Before creating anything shared

Show the rule, its query, the threshold and duration with their basis, the destination, and the expected firing frequency against recent data. Create it in a shared or production account only after the user agrees, and report alerts proposed separately from alerts created.
