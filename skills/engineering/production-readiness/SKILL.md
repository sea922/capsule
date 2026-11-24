---
name: production-readiness
description: Decide whether a system or release is ready for real users, read-only, with a ship, ship-with-caveats, or block verdict. Use for launch reviews, go/no-go calls, pre-release or pre-launch audits, "what will break in production?" questions, and reviewing a rollout or rollback plan. Building one belongs to containers-and-deploys; delivering the change to ship-it; a dedicated security audit to security-review. Adding the logs, metrics, traces, and alerts a launch needs belongs to observability.
---

# Production readiness

Judge readiness from evidence in the repository and the environment the user grants, not from confidence. The review is read-only: it reports blockers and risks and leaves the fixes and the launch decision to the user.

## 1. Fix the release surface

State what is being judged: the revision or release, the environments, the users and data it will touch, and what changed since the last release. Read recent history and the diff against the released revision. Use local evidence and access the user has granted. Do not send repository contents to an outside service, run unpinned remote code, or act on a deployed system with real credentials unless the user approves that specific step.

**Complete when:** the revision, scope, environments, and unavailable evidence are named.

## 2. Collect the evidence

Read what exists rather than assuming it does: CI results for this revision, tests for the paths users depend on, migrations and their rollback, environment variable documentation and startup validation, health checks, logging and error reporting, deploy and rollback scripts, feature flags, and runbooks. Use the read-only `production-readiness-auditor` agent when available to sweep the repository, or the same checklist directly. Record a missing item as missing, not as a pass.

**Complete when:** each area in step 3 has evidence, or is marked as having none.

## 3. Assess each risk area

- **Security and access:** authentication and authorization enforced on the server; public, user, and admin routes separated; secrets absent from client bundles, logs, and committed files; rate limits, CORS, CSRF, and upload validation where the product needs them. Use `security-review` when this needs depth; its perimeter reference covers passive checks of what the deployed site's public edge exposes.
- **Data integrity:** migrations run forward and have a stated recovery path; destructive changes and backfills are staged; retries are idempotent for writes, jobs, and webhooks; tenant boundaries match the data model. Use `database-migrations` for the migrations themselves.
- **Payments and external callbacks:** webhook signatures verified before trusting a payload; duplicate, replayed, and out-of-order deliveries handled; test and live credentials separate.
- **Operations:** the service starts from a clean checkout with documented steps; required configuration fails fast when missing; a health check proves dependencies are reachable; alerts exist for errors and latency; someone owns the first hours after release.
- **Rollout and rollback:** a staged path such as internal users, a small share, then everyone; thresholds that mean hold or roll back; a rollback that has been tried, with its time and what it does to data written since.
- **User experience:** launch-critical flows work on the supported devices; loading, empty, error, and permission-denied states explain themselves; there is a recovery or support path when a critical action fails. Use `accessibility` and `performance` when those need their own review.

**Complete when:** each area lists its evidence, its gaps, and its risks with the path that reaches each one.

## 4. Decide

Give one verdict:

| Verdict | When |
| --- | --- |
| **Block** | Any hard stop below is present |
| **Ship with caveats** | No hard stop, but named risks that an owner must accept, or a rollout limited to reduce them |
| **Ship** | No blockers found in the available evidence |

Hard stops: authentication or authorization missing on sensitive data; payment or fulfilment callbacks that are not idempotent; a required migration that cannot run safely; secrets exposed in client code, logs, or the repository; no rollback path for a high-impact release. A failing CI run or an untested launch-critical path caps the verdict at ship with caveats.

A verdict covers only what was examined. Say "no blockers found in the evidence reviewed", never "safe".

**Complete when:** the verdict follows from the listed evidence and every hard stop is checked.

## 5. Report

Lead with the verdict and the one or two facts that decide it. Then list blockers with the fix each needs, risks with their owner and mitigation, the rollout and rollback plan with its thresholds, and what was not examined. Keep it short enough to act on.

**Complete when:** the reader knows whether to ship, what to fix first, and what the review could not see.
