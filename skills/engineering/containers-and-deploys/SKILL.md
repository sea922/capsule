---
name: containers-and-deploys
description: Build the delivery path of a service, from container image and pipeline to rollout strategy and infrastructure definitions, and prove it by building and running it. Use when writing or fixing a Dockerfile or Compose file, setting up CI/CD, choosing rolling, blue-green, or canary rollout, adding health checks, writing Kubernetes manifests or Terraform, or debugging a container, pod, or plan that will not start. Judging launch readiness belongs to production-readiness; delivering one change to ship-it; the security audit to security-review.
---

# Containers and deploys

A delivery path is finished when a clean checkout becomes a running, health-checked service by a route someone else can repeat, and when the way back has been tried. Write the definitions, then build and run them: a Dockerfile, pipeline, or manifest that has never executed is a draft.

This skill builds the container, pipeline, and infrastructure definitions. `production-readiness` reviews whether a system is ready to launch and stays read-only. `ship-it` delivers a specific change through the path that exists. `security-review` owns the security audit; the hardening defaults here do not replace it.

## 1. Read what exists

Find the runtime and its version, the build and start commands, the ports, and the processes that must run (web, workers, schedulers, one-off migrations). Read any existing Dockerfile, Compose file, pipeline definition, manifests, infrastructure code, and deploy scripts, and identify the forge and the deployment target from them. Extend the conventions already there instead of introducing a second way to deploy.

List every piece of configuration the service reads and where each value comes from today. Ask for what the repository cannot tell you: the target platform, the environments, acceptable downtime, and who may deploy.

**Complete when:** the processes, their configuration, the target, and the existing delivery pieces are written down, with the unknowns named.

## 2. Containerize

Build a small, reproducible image. Read [DOCKER.md](references/DOCKER.md) for the decisions and traps.

- Use a multi-stage build so compilers, dev dependencies, and source history stay out of the runtime image.
- Pin the base image to a specific version, and to a digest where reproducibility or supply chain matters. Install dependencies from the lockfile.
- Copy dependency manifests and install before copying source, so a code change does not rebuild the dependency layer. Keep the build context small with an ignore file.
- Run as a non-root user, one main process per container, with logs on standard output.
- Handle the termination signal: stop accepting work, finish what is in flight, and exit within the platform's grace period.
- Keep secrets out of image layers and build arguments; they arrive at run time.
- Give the service a health check that reports whether it can do its job, kept cheap enough to call every few seconds.

For local development, one Compose file should bring up the service and its dependencies with a single command, using the same image definition as production with a development target.

**Complete when:** the image builds from a clean checkout, starts as a non-root user, and answers its health check.

## 3. Define the pipeline

Order the stages so cheap failures come first: lint and type checks, unit tests, build, integration tests against real dependencies, image build and scan, then deploy. Read [DEPLOYMENT.md](references/PIPELINES.md) for stage design.

- Build the artifact once, tag it with the commit, and promote that same artifact through every environment. Rebuilding per environment tests one thing and ships another.
- Run verification on every proposed change; deploy only from the protected branch or a release tag.
- Give each job the least credential it needs, prefer short-lived identity federation over stored keys, and keep deploy credentials out of jobs that run code from forks.
- Cache dependencies by lockfile hash, and cancel superseded runs.
- Make a failing stage block the next one. Do not make a stage pass by disabling its check.

**Complete when:** a change runs through the stages in the pipeline's own environment and the artifact is traceable to its commit.

## 4. Choose the rollout and rehearse the rollback

Pick the strategy from what the service can tolerate, and say why:

| Strategy | Fits | Cost |
| --- | --- | --- |
| Rolling | Most services, when old and new versions can run side by side | Both versions serve at once |
| Blue-green | A cutover that must be instant in both directions | Double capacity during the release |
| Canary | High traffic or risky changes, where real traffic should judge | Needs traffic splitting and metrics that decide promotion |
| Recreate | Versions that cannot coexist, where downtime is accepted | An outage for the length of the restart |

Any strategy that runs two versions at once requires backward-compatible schema and API changes; sequence those with `database-migrations`. Separate deploy from release with a feature flag when exposure should be decided apart from the rollout.

Write the rollback as commands, with the signal that triggers it and what it does to data written since. Then run it in a non-production environment: an untried rollback is a hope. A rollback that leaves a newer schema under older code is not a rollback unless the old code tolerates that schema.

**Complete when:** the strategy and its reason are stated, and the rollback has been executed once somewhere safe, with its duration recorded.

## 5. Handle configuration and secrets

Read configuration from the environment, validate it at startup, and fail with the name of the missing value instead of starting half-configured. Document every variable in a committed example file with placeholder values. Environments differ by values, never by code branches or separately built images.

Secrets live in the platform's secret store and are injected at run time. Keep them out of the repository, image layers, build logs, pipeline definitions, and infrastructure state where the tooling allows. If you find a committed secret, tell the user it needs rotating; removing the line does not revoke it.

**Complete when:** every variable is documented and validated, and no secret is in a tracked file, an image layer, or a log.

## 6. Define the infrastructure

Describe what runs the service as code, sized to the request. Read [KUBERNETES.md](references/KUBERNETES.md) for manifests and [TERRAFORM.md](references/TERRAFORM.md) for infrastructure code.

Set resource requests and limits, a health-gated rollout, and at least two replicas for anything that should survive a node or instance loss. Keep state per environment and per blast radius, with locking. Produce a plan or dry run and read it; unexpected deletions or replacements of stateful resources stop the work.

**Complete when:** the definitions validate, and a plan or dry run shows only the changes intended.

## 7. Build it, run it, and stop at the boundary

Prove the path on your side of the boundary:

1. Build the image from a clean checkout and record its size.
2. Run it with production-like configuration, as the non-root user, and call the health check.
3. Stop it with the termination signal and confirm a clean exit.
4. Bring the Compose stack up from nothing.
5. Validate the pipeline definition, manifests, and infrastructure code with their own tools, and render the plan or dry run.

Use `verification-before-completion` for the claims you make from these. Report anything you could not run, such as a cluster you cannot reach, as unverified.

Stop before anything that changes shared or production infrastructure: applying manifests or plans, pushing images to a shared registry, changing pipeline secrets or protection rules, or triggering a deploy. Present the exact commands and the reviewed plan, and wait for the user's go-ahead. Once a deploy is authorized, `ship-it` runs it and checks the released service.

**Complete when:** each definition has been built or validated with its output shown, unverified parts are named, and nothing shared was changed without explicit approval.

## Report

State what was built, the evidence for each piece (build output, health-check response, plan summary), the rollout strategy and its rehearsed rollback, the configuration the operator must supply, and the commands awaiting approval.
