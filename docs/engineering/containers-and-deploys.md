# Containers and deploys

Use `containers-and-deploys` to build the path that takes a service from a clean checkout to a running, health-checked deployment.

Examples:

- “Dockerize this API and give me a Compose file for local development.”
- “Set up CI/CD for this service.”
- “Should this be a rolling, blue-green, or canary rollout?”
- “Write the Kubernetes manifests for this worker.”
- “Move this resource into a Terraform module without destroying it.”

The skill reads the runtime, processes, configuration, and any delivery pieces that already exist, then builds on them. It writes a small, reproducible image that runs as a non-root user and answers a health check. It orders pipeline stages so cheap failures come first and one commit-tagged artifact is promoted through every environment. It picks a rollout strategy from what the service can tolerate, and writes the rollback as commands that have been rehearsed outside production. Configuration is read from the environment and validated at startup, and secrets stay out of the repository, image layers, and logs.

It then proves the work by building and running it: the image built from a clean checkout, the health check called, the stack brought up, and manifests and infrastructure code validated with a plan or dry run. Anything it could not run is reported as unverified. It stops before applying anything to shared or production infrastructure and presents the exact commands for approval.

References for Docker and Compose, pipelines and rollouts, Kubernetes, and Terraform load only when the task needs them.

## Workflow fit

`production-readiness` judges whether a system is ready to launch, `ship-it` delivers a specific change through the path this skill builds, `security-review` owns the security audit, and `database-migrations` sequences schema changes that must survive two versions running at once.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/containers-and-deploys/SKILL.md).
