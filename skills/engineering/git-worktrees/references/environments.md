# Worktree environments

Read when preparing a checkout for builds/tests or running concurrent tasks.
Use the project's existing setup scripts and lockfiles as the source of truth.

| Resource | Preparation and verification |
| --- | --- |
| Dependencies/build output | Install with the repository's supported locked workflow. Keep writable outputs separate; share caches only where the tool supports concurrency. Avoid symlinking mutable dependency directories merely to save space. |
| Environment/secrets | Identify required ignored configuration; provision through the approved local mechanism. Copy only needed values/files and preserve access controls. Keep secrets out of logs, commits, and PR bodies. |
| Ports and processes | Assign available ports and record task-owned processes and their checkout. Stop only processes whose ownership is established. |
| Databases, queues, buckets, fixtures | Use separate test instances/namespaces or a documented concurrency-safe fixture. Confirm connection targets before destructive setup or migrations. |
| Git configuration/hooks | Inspect effective configuration and its origin. Shared repository configuration can affect every worktree. Use supported worktree-specific configuration when needed; avoid changing global settings for a single task. |
| Submodules | Inspect recursive submodule state and required pinned revisions. Check host/Git support before move or removal; linked worktrees with submodules have lifecycle limitations. A `.git` file is not proof of a linked worktree. |
| LFS and generated assets | Verify required content is materialized, not just pointers or missing generated files. Follow repository setup rather than treating checkout success as readiness. |

Record the chosen checkout, relevant resource assignments, and baseline result in
the existing task record. Classify failures as missing setup, pre-existing
behavior, or introduced regression before expanding checks. Lifecycle and
preservation decisions stay with the [main skill](../SKILL.md).

**Complete when:** the decisive build/test can run in the intended checkout with
known resource ownership, or a concrete unavailable dependency is reported.
