# Security Surfaces

Choose the sections matching the actual trust boundaries. These questions guide investigation; their presence is not proof of a vulnerability or a requirement to scan unrelated systems.

## Identity and data

- Trace identity, role, tenant, and resource ownership to the sensitive operation. Test a permitted actor and a synthetic actor missing the required permission; authentication alone does not establish resource authorization.
- Follow sensitive data through logs, errors, exports, caches, background jobs, and deletion/retention behavior. Keep evidence redacted. Distinguish a technical privacy exposure from a legal compliance conclusion.
- Check whether parser boundaries, encoding, query construction, redirects, and outbound destinations preserve the intended input contract. Locate the actual interpreter or sink and the control before it.

## Execution and supply chain

- Identify the authoritative dependency boundary, resolved version, lockfile, install/build hooks, and CI behavior. Separate known advisory matching from trust in package execution. Inspect scripts before executing unfamiliar packages; keep audit remediation separate from review.
- Trace who controls filenames, paths, command arguments, tool responses, and model output. Check canonical path containment, symlinks, argument handling, and effective execution privileges where these can reach a sensitive operation.
- For agents and external content, trace whether untrusted text can select tools, recipients, files, or permissions. Evaluate controls at the application or tool boundary; an instruction asking the model to ignore malicious text is not an access-control mechanism.
- For secrets, inspect how values are sourced, scoped, rotated, and exposed. Record the affected location or secret type without printing the secret.

## State and availability

- Follow retries, duplicate deliveries, concurrency, authorization changes, and partial failure through state transitions. Check atomicity and idempotency where duplicate effects or stale permissions cause harm.
- Check whether rate limits and quotas apply across the actual worker or instance topology. A process-local counter cannot establish a shared system limit.
- Bound attacker-controlled input sizes, expensive operations, retries, fan-out, and execution time at the responsible boundary. Validate the proposed abuse path safely before assigning impact.
- For destructive operations, inspect target selection and recovery constraints. Verify containment and rollback assumptions with a faithful local fixture or dry run rather than a live destructive probe.
