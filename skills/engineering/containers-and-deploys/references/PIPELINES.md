# Pipelines, rollouts, and rollback

Read when designing a pipeline, choosing how a new version reaches users, or
writing the way back. The checks after a deploy has run belong to `ship-it`
(its deployment reference); the launch decision belongs to `production-readiness`.

## Pipeline stages

Put the cheapest and most likely failures first, and run independent checks in parallel.

| Stage | Proves | Runs on |
| --- | --- | --- |
| Lint, format, type check | The change is well-formed | Every proposed change |
| Unit tests | Logic works in isolation | Every proposed change |
| Build | The artifact can be produced | Every proposed change |
| Integration tests | It works against real dependencies, started as pipeline services | Every proposed change |
| Image build and scan | The image builds and carries no known critical vulnerability | Every proposed change, or the protected branch |
| Deploy to a pre-production environment | The artifact starts with real configuration | The protected branch |
| Smoke test | The critical paths answer | After each deploy |
| Deploy to production | — | The protected branch or a release tag, behind the approval the team uses |

Design rules:

- **Build once, promote.** Tag the artifact with the commit identifier and move
  that same artifact through each environment. Environment differences are
  configuration.
- **Gates block.** A failed stage stops the next one. Fix the cause; do not
  disable the rule, skip the test, or mark the job as allowed to fail to get through.
- **Least credential per job.** Verification jobs get read access. Deploy jobs
  get a deploy identity, preferably short-lived through the forge's identity
  federation, scoped to one environment.
- **Untrusted code gets no secrets.** Jobs triggered by forks or external
  contributors must not receive deploy credentials or write tokens.
- **Pin what the pipeline runs.** Third-party pipeline actions and images are
  pinned to a version or digest, for the same reason dependencies are.
- **Keep it fast.** Cache dependencies by lockfile hash, cache image layers,
  cancel superseded runs on the same branch, and split slow suites. A slow
  pipeline gets bypassed.
- **Serialize deploys.** One deploy to an environment at a time; a second run
  queues or cancels.
- **Make failures readable.** The failing command and its output should be the
  first thing a person or an agent sees, so the fix starts from evidence.

## Choosing a rollout

| Question | Points to |
| --- | --- |
| Can old and new versions serve side by side? | Yes: rolling or canary. No: blue-green with a cutover, or recreate with accepted downtime |
| Must the way back be instant? | Blue-green: the previous environment stays warm until the release is trusted |
| Is there enough traffic and monitoring to judge a small share? | Canary, promoted on error rate and latency against the stable version |
| Is the risk in exposure rather than in the code path running? | Feature flag: deploy dark, release by enabling |

Details that decide whether a strategy works:

- **Rolling.** Set how many instances may be unavailable and how many extra may
  start. New instances take traffic only after readiness passes. Both versions
  serve during the rollout, so every schema, API, queue-message, and cache-format
  change must be readable by both.
- **Blue-green.** Needs double capacity for the release. Decide in advance how
  long the old environment stays, and what happens to data written to the new
  one if you switch back. Shared databases still need compatible changes.
- **Canary.** Define the steps (for example 5%, 25%, 100%), how long each holds,
  and the thresholds that promote or abort, before starting. Low-traffic services
  cannot produce a signal from 5%; use time or synthetic checks instead, or choose
  another strategy.
- **Feature flags.** Give every flag an owner and a removal date. A flag is also
  the fastest rollback for the behavior it guards.

Preview environments per proposed change catch integration problems before
merge when the platform makes them cheap.

## Health checks

Separate two questions, because conflating them causes outages:

- **Liveness:** is the process stuck? Answer from the process alone. Do not check
  dependencies here: a database blip would restart every instance at once.
- **Readiness:** can this instance serve now? Check the dependencies a request
  needs, with short timeouts. Failing readiness removes the instance from
  traffic without killing it.

Keep both cheap and unauthenticated, expose no internal detail in the body, and
return a non-success status when not ready. Slow-starting services need a
startup allowance so they are not killed while warming. On shutdown, fail
readiness first, finish in-flight requests, then exit inside the platform's
grace period.

## Rollback

Decide these before the release, and write them down as commands:

- **What goes back:** the previous artifact, still in the registry under its
  commit tag. Redeploying it must not require a rebuild.
- **The trigger:** a named signal, such as error rate or latency over a threshold
  for a set time, or a failed smoke test. Automate it where the platform can.
- **What happens to data:** rows written by the new version, messages already
  queued, and migrations already applied. A rollback that leaves a newer schema
  under older code only works if the change was additive; sequence anything else
  with `database-migrations`.
- **How long it takes,** measured by doing it in a non-production environment.
- **When to roll forward instead:** when the new version has written data the
  old one cannot read, a fix is safer than a retreat.

Configuration changes need the same treatment as code: versioned, reviewed, and
reversible.

## Environments and configuration

- Read configuration from the environment, parse and validate it once at
  startup, and stop with the name of the bad or missing variable.
- Keep pre-production close to production in shape: the same image, the same
  topology in miniature, the same migration path.
- Never branch application logic on the environment's name; branch on explicit
  configuration values.
- Production data does not belong in lower environments without masking.

## Traps

| Symptom | Likely cause |
| --- | --- |
| Deploy job is green, old version still serving | The rollout stalled on readiness, or the tag did not change so nothing was pulled |
| Passes in pre-production, fails in production | Configuration or data shape differs; the artifact was rebuilt per environment |
| Canary never promotes | Too little traffic for the threshold, or the metric query matches nothing |
| Brief errors on every deploy | Instances killed before draining, or traffic sent before readiness |
| Rollback fails | The previous artifact was garbage-collected, or the schema moved past it |
| Layer cache missed on every run | Source copied before the dependency install, or no cache backend configured in the pipeline |
