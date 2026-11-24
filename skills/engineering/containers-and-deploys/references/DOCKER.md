# Docker and Compose

Read when writing or fixing a Dockerfile, a Compose file, or a container that
misbehaves. These are defaults; an existing project convention wins.

## Image decisions

| Decision | Default | Why |
| --- | --- | --- |
| Base image | An official or verified image, the slim variant of the runtime's current supported release | Fewer packages means fewer vulnerabilities and smaller pulls |
| Tag | An exact version; add the digest when builds must be reproducible | A moving tag changes the image without a commit |
| Stages | Dependencies, build, runtime | Compilers and dev dependencies never reach the runtime image |
| Final stage for compiled binaries | Distroless or a minimal base | Nothing to exploit but the binary |
| User | A dedicated non-root user, switched to last | Root work first, then drop privilege |
| Process | One main process, started in exec form | The process receives signals directly and exits cleanly |
| Health check | A cheap call to the service's own health endpoint | The platform can tell a running process from a working one |

Minimal-base traps: Alpine uses musl, which breaks some native modules and
prebuilt wheels; a distroless image has no shell, so debugging needs a debug
variant or an ephemeral container.

## Layer order

Order instructions from least to most frequently changed. The shape that keeps
the dependency layer cached:

```dockerfile
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node dist/healthcheck.js
CMD ["node", "dist/server.js"]
```

- Install from the lockfile (`npm ci`, `pip install --require-hashes`,
  `go mod download`), never a floating resolve.
- Run a package index update and the install in the same `RUN`, and clear the
  package cache in that layer; a cleanup in a later layer does not shrink the image.
- Use a cache mount for package-manager caches when the builder supports it.
- A health check may only use tools present in the final image. A slim image may
  have neither `curl` nor `wget`; use the runtime itself.
- Prefer `COPY` to `ADD`.

## Build context and secrets

Keep an ignore file that excludes version-control data, dependency directories,
build output, local environment files, and test artifacts. Without one, the
whole directory, secrets included, is sent to the builder and can land in a layer.

- A value passed as a build argument or set with `ENV` is readable in the image
  history. For a credential needed only during the build, use a build secret mount.
- Deleting a secret in a later layer leaves it in the earlier one.
- Runtime secrets come from the environment or mounted files, supplied by the platform.

## Compose for local development

One command should bring up the service and what it depends on.

- Build the same Dockerfile with a development target (`build.target`) that adds
  hot reload, so development and production do not drift into two definitions.
- Bind-mount source for reload, and protect the container's dependency directory
  with an anonymous volume so host files do not shadow it.
- Use named volumes for database data. Removing volumes on teardown deletes that
  data; say so before running it.
- Give each dependency a health check and make the service wait on
  `condition: service_healthy`. Start order alone does not mean ready.
- Services reach each other by service name on the Compose network. `localhost`
  inside a container is that container.
- Publish only the ports a developer needs, and bind databases to `127.0.0.1`
  so they are not exposed to the local network.
- Put local-only settings in the override file, and keep environment values in a
  git-ignored env file with a committed example.

## Runtime hardening defaults

Apply where the workload allows, in Compose or the orchestrator:

- drop all Linux capabilities and add back only what is needed
- forbid privilege escalation (`no-new-privileges`)
- read-only root filesystem, with a temporary filesystem for the paths that must be writable
- memory, CPU, and process-count limits
- separate networks so only the service that needs the database can reach it
- never mount the container runtime socket into an application container

When a container runs untrusted or third-party code, such as an installer under
test, go further: no network unless the test needs it, the project mounted
read-only and copied to a scratch workspace, a numeric non-root user, and no
host credentials passed in.

## Platform limits

Containers share the host's kernel. Linux images cover Linux distributions only;
macOS and Windows behaviour needs native runners in the pipeline. Build for the
architecture the target runs, and build multi-architecture images when
developers and servers differ.

## When it will not start

| Symptom | Look at |
| --- | --- |
| Exits immediately | Container logs; then run the image with a shell entrypoint and start the process by hand |
| Works locally, fails in the pipeline | Files excluded by the ignore file, architecture, or an unpinned base that moved |
| Cannot reach another service | Name resolution from inside the container, shared network membership, and whether the target listens on `0.0.0.0` rather than loopback |
| Permission denied on a mounted path | Ownership of the host path against the container's user ID |
| Rebuilds everything on each change | A `COPY . .` placed before the dependency install |
| Slow shutdown, then killed | Shell-form `CMD` swallowing the signal, or no signal handler |

## Traps

- Compose on a single host is not production orchestration; it has no rescheduling
  when the host fails.
- Data written inside a container without a volume is lost when it is replaced.
- Several services in one container cannot be scaled, restarted, or health-checked apart.
- An image tagged only `latest` cannot be rolled back to.
