# Deployment endpoint

Read when shipping includes a release or deployment. `ship-it` coordinates the
transition; the project's release runbook and native deployment tools own its
mechanics.

## 1. Prepare the transition

Resolve the target environment, intended revision or artifact, release procedure,
required gates, rollout observations and rollback path from repository evidence.
Retain existing authorization. When the target or authority is missing, prepare
the concrete release and ask for that missing decision before deployment.

Capture the relevant pre-deploy health baseline when available. Use the project's
expected error rate, latency and critical user journeys to select checks. Missing
baseline data limits regression claims; record the gap.

**Complete when:** the authorized target, artifact, runbook and health checks are
known, or the exact missing decision is ready for the user.

## 2. Execute and observe

Run the authorized release procedure and observe its actual outcome. Use
`verification-before-completion` to confirm the intended revision is serving,
the required instances moved, and the changed behavior and critical smoke paths
work in the target environment. Compare health to the baseline when captured.

For a web release, check what a job status cannot show: the critical pages load
without new console or network errors, static assets and streaming or socket
endpoints respond, key forms and sign-in complete with a safe test account, and
load-time measures have not regressed against the baseline. Use a browser tool
only against the released URL the user named, and keep watching through the
window the runbook sets, since some failures appear only under real traffic.

A green deployment job proves the job finished. If the old revision is serving
or rollout health is unresolved, continue investigating and withhold a healthy
release claim. Perform rollback only within established authority and the runbook;
verify the resulting serving revision and health after rollback too.

**Complete when:** target observations establish the requested deployed outcome,
or a failed/blocked rollout is reported with the serving revision, evidence,
recovery state and next owner.
