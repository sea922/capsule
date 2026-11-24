# Terraform and OpenTofu

Read when writing or reviewing infrastructure code, setting up state, or
refactoring resources. The same guidance applies to OpenTofu. Follow the
repository's existing layout and module conventions before these defaults.

## Layout

```text
modules/            reusable, single-purpose modules
  network/
  service/
envs/
  dev/              thin root: backend, providers, module calls, tfvars
  prod/
```

- Environments are thin roots that call shared modules and differ by inputs,
  not by copied resources.
- Keep one state per environment and per blast-radius boundary (network, data,
  applications). One large state makes every plan slow and every mistake wide.
- Workspaces do not replace separate state and separate credentials for
  production and non-production.

## Versions

- Constrain the tool version and each provider version in `required_providers`.
- Commit the dependency lock file so every run installs identical providers. Do
  not commit the `.terraform/` directory or any state file.
- Upgrade on purpose: `init -upgrade`, read the lock file diff, then plan.

## State

- Use a remote backend with encryption at rest and locking. Local state is for
  experiments only.
- Turn on versioning for the state store so a bad write can be recovered, block
  public access, and restrict who can read it: state holds sensitive values in plain text.
- Backend blocks cannot use variables. Supply per-environment values with
  `-backend-config` or a partial configuration file.
- A lock error means another run holds it or one crashed. Confirm nothing is
  running, then release that specific lock. Never bypass with `-lock=false`.
- Do not edit state by hand. Use `moved`, `import`, and the `state` subcommands,
  with a backup first.

## Variables and outputs

- Give every variable a `type` and `description`, and a `validation` block where
  a wrong value is plausible.
- Provide a `default` only when it is safe everywhere; a required input makes
  the caller decide.
- Output only what another configuration consumes. `sensitive = true` hides a
  value from terminal output; it is still stored in state.

## Secrets

- Keep secret values out of `.tf` files and committed `.tfvars`. Supply them at
  run time through `TF_VAR_*` variables or the pipeline's secret store.
- Prefer a data source that reads an existing secret over creating the value in code.
- Where the tool and provider versions support ephemeral values or write-only
  attributes, use them so the value never reaches state.
- Authenticate with short-lived credentials (identity federation from the
  pipeline, assumed roles) instead of long-lived keys, and never put credentials
  in a `provider` block.

## Resources

Use `for_each` with stable keys for sets of named things. `count` over a list
identifies resources by position, so removing one item shifts and replaces the rest:

```hcl
resource "aws_iam_user" "this" {
  for_each = toset(var.user_names)
  name     = each.key
}
```

- Put `prevent_destroy` on stateful resources such as databases, buckets, and
  encryption keys, so an accidental destroy becomes a plan error. It only
  protects a block that still exists: to stop managing a resource without
  destroying it, use a `removed` block with `destroy = false`, not deletion of the block.
- `create_before_destroy` avoids a gap when a replacement is unavoidable.
- `ignore_changes` hides drift. Scope it to one attribute and say why in a comment.
- Apply common tags or labels once at the provider level.
- Choose secure settings explicitly: encryption on, public access off, least-privilege policies.

## Modules

- Keep a module to one purpose with a small, typed interface. A module that
  wraps one resource and forwards its arguments adds nothing.
- Pin registry modules with `version` and git modules with a tag or commit
  reference. Never follow a moving branch.
- Declare `required_providers` in child modules and configure providers only in the root.
- Compose: pass identifiers in as inputs instead of having a module create everything.

## Refactoring without destroying

```hcl
moved {
  from = aws_s3_bucket.logs
  to   = aws_s3_bucket.audit_logs
}

import {
  to = aws_s3_bucket.legacy
  id = "legacy-bucket-name"
}
```

A rename or a move into a module needs a `moved` block, or the plan destroys and
recreates the object. Adopt resources created outside the tool with an `import`
block, then plan until it shows no changes.

## Workflow

```sh
terraform fmt -check -recursive
terraform validate
terraform plan -input=false -out=tfplan
terraform show tfplan
terraform apply tfplan
```

Stop after `show`. `apply` changes real infrastructure: present the plan, get
the user's explicit approval, and apply that saved plan, never a fresh one.

Reading a plan:

- any `-` (destroy) or `-/+` (replace) on a stateful resource stops the work until explained
- changes you did not make mean drift or a provider upgrade; `plan -refresh-only` shows drift
- check the summary counts against what you expected

In a pipeline, plan on proposed changes and post the result for review; apply
only from the protected branch, after approval, using the saved plan. Use
`-input=false` so a missing variable fails instead of hanging, give the plan job
read-only credentials where the provider allows, and keep the apply role
separate. A static-analysis step for misconfiguration before apply is cheap.

## Troubleshooting

| Symptom | Likely cause | Do |
| --- | --- | --- |
| State lock error | A live or crashed run holds the lock | Confirm no run is active, then force-unlock that lock ID |
| Plan shows changes nobody made | Drift, a provider upgrade, or a changed default | `plan -refresh-only`; read the lock file diff |
| Destroy and recreate after a rename | No `moved` block | Add it and re-plan |
| Resource already exists | Created outside the tool | Add an `import` block |
| `for_each` depends on unknown values | Keys come from attributes known only after apply | Key by static values |
| Cycle error | Two resources reference each other | Split the reference through a separate resource |
| Inconsistent result from provider | Provider bug or version mismatch | Pin, upgrade deliberately, check the provider's issues |

## Traps

- Applying without a saved plan applies something other than what was reviewed.
- `-auto-approve` belongs only in a pipeline applying an already approved plan.
- `-target` as routine practice skips dependencies and leaves state inconsistent.
- Printing outputs as JSON in shared pipeline logs leaks sensitive values.
