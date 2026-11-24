# Kubernetes

Read when writing or reviewing manifests, or when a workload will not schedule,
start, or stay up. Follow the cluster's existing tooling (plain manifests,
Kustomize, Helm, GitOps) and its conventions before these defaults.

## Workload defaults

A production Deployment normally carries all of these:

- **Image** pinned to an immutable tag or digest. A reused tag is not pulled
  again and cannot be rolled back to.
- **Replicas:** two or more, spread across nodes or zones with topology spread
  constraints or anti-affinity.
- **Rollout:** `RollingUpdate` with `maxUnavailable: 0` and a small `maxSurge`
  when capacity must never dip.
- **Probes:** startup, readiness, and liveness (below).
- **Resources:** requests and limits on every container (below).
- **Security context:** `runAsNonRoot` with an explicit user ID,
  `allowPrivilegeEscalation: false`, all capabilities dropped,
  `readOnlyRootFilesystem: true` with an `emptyDir` for writable paths, and the
  runtime-default seccomp profile.
- **Identity:** a dedicated ServiceAccount with
  `automountServiceAccountToken: false` unless the app calls the cluster API.
- **Shutdown:** a `terminationGracePeriodSeconds` longer than the slowest
  request, and a handler for the termination signal. Endpoint removal is not
  instant, so a short `preStop` delay avoids requests routed to an exiting pod.
- **Labels:** the standard `app.kubernetes.io/*` set, with the selector on
  labels that never change.

## Probes

| Probe | On failure | Use for |
| --- | --- | --- |
| `startupProbe` | Container is killed and restarted | Giving a slow start time; holds the other two off until it passes |
| `readinessProbe` | Pod is removed from Service endpoints | Temporary inability to serve, including a needed dependency being down |
| `livenessProbe` | Container is restarted | A hung process that cannot recover |

- The startup budget is `failureThreshold × periodSeconds`; size it to the
  slowest realistic start instead of padding `initialDelaySeconds`.
- Keep dependency checks out of liveness. If the database is down, restarting
  every pod makes the outage worse.
- Readiness may check dependencies, with timeouts shorter than the probe's own.

## Requests and limits

Requests decide scheduling; limits decide throttling and kills.

- Set a memory request and a memory limit, close together or equal, on every
  container. Exceeding the limit is an out-of-memory kill.
- Set a CPU request always. A CPU limit throttles; whether to set one is a
  cluster policy, so follow it.
- Requests equal to limits gives the Guaranteed class, evicted last.
- Start from measured usage (`kubectl top`, metrics history), not from a table.
  Runtimes with their own heap settings need headroom above the heap inside the limit.
- No requests means unpredictable scheduling and first eviction under pressure.

## Configuration and secrets

- Non-sensitive values go in a ConfigMap; sensitive ones in a Secret, injected
  as environment variables or mounted files.
- A Secret is base64-encoded, not encrypted. Do not commit Secret manifests with
  real values; use the cluster's mechanism (an external secrets operator, sealed
  secrets, or the cloud provider's store).
- Pods do not restart when a ConfigMap or Secret changes. Roll the workload, or
  use a content hash in the name or an annotation so a change triggers a rollout.
- Mounted files update in place; values read from the environment do not.

## Network

- Services are `ClusterIP` unless something outside the cluster must reach them.
  Expose through an Ingress or Gateway with TLS instead of one load balancer per service.
- Where the cluster enforces NetworkPolicy, start from deny-all per namespace
  and allow the flows the service needs.

## Access control

Grant the narrowest thing that works: a namespaced `Role` with named resources
and verbs, bound to the workload's own ServiceAccount. Reserve `ClusterRole`
for controllers that span namespaces, and never bind `cluster-admin` to an
application.

## Availability

- **HorizontalPodAutoscaler** needs resource requests to compute utilization.
  Set `minReplicas` to at least two, remove the fixed `replicas` field from a
  manifest the autoscaler manages, and add scale-down stabilization to avoid flapping.
- **PodDisruptionBudget** keeps voluntary disruptions (drains, upgrades) from
  taking every replica. `minAvailable` equal to the replica count blocks node
  drains; a budget that allows everything protects nothing.
- **Namespaces** with ResourceQuota and LimitRange stop one tenant starving another.

## Jobs

- `restartPolicy` is `OnFailure` or `Never`; `Always` is invalid for a Job.
- Set `backoffLimit`, `activeDeadlineSeconds`, and `ttlSecondsAfterFinished`.
- Make the work idempotent: a Job can run more than once.
- For a CronJob, set `concurrencyPolicy: Forbid` when runs must not overlap, and
  a `startingDeadlineSeconds`.
- Run schema migrations as a Job or a pipeline step, once, not in an init
  container that every replica races.

## Before applying

```sh
kubectl diff -f manifests/
kubectl apply --dry-run=server -f manifests/
kubectl rollout status deployment/<name> --timeout=120s
kubectl rollout undo deployment/<name>
```

The first two are read-only against the cluster's admission rules. Applying,
restarting, scaling, and undoing change shared state: confirm the context and
namespace, and get the user's go-ahead first.

## When it will not run

| State | Likely cause | Check |
| --- | --- | --- |
| `Pending` | No node fits the requests, selector, or taints; or an unbound volume claim | `kubectl describe pod`, events |
| `ImagePullBackOff` | Wrong tag, private registry without a pull secret, or wrong architecture | Events; pull the image by hand |
| `CrashLoopBackOff` | The process exits: bad configuration, missing secret, failed migration | `kubectl logs --previous` |
| `OOMKilled` | Memory limit below real usage, or a leak | `describe` for the last state; usage history |
| Running but never ready | Readiness probe path, port, or dependency | Probe failures in events |
| Restarting under load | Liveness timeout too tight for a busy process | Probe settings against latency |
| Service has no endpoints | Selector does not match pod labels, or no pod is ready | `kubectl get endpointslices` |
| Rollout hangs | New pods never become ready; `maxUnavailable: 0` holds the old ones | `rollout status`, new pod events |

**Pods replaced with zero restarts.** The pods are being deleted and recreated,
not crashing. Compare ReplicaSets and nodes: a new ReplicaSet whose only change
is a restart annotation means someone ran a rollout restart; the same ReplicaSet
on changing nodes means node replacement (autoscaler, spot reclaim, upgrade);
the same ReplicaSet on the same nodes means evictions, often a descheduler
enforcing a spread the scheduler cannot satisfy. The API audit log names who
issued the eviction.

## Traps

- A Deployment with a mutable tag and `imagePullPolicy: IfNotPresent` runs
  different code on different nodes.
- Limits without requests makes requests default to the limits and over-reserves the node.
- Plain credentials in a ConfigMap are readable by anyone who can read the namespace.
- A fixed `replicas` value in a manifest resets the autoscaler on every apply.
