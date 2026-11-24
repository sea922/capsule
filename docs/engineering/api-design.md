# API design

Use `api-design` to design or change an HTTP API contract.

Examples:

- “Add an endpoint to list a customer's invoices.”
- “Should this list use cursor or offset pagination?”
- “Is renaming this response field a breaking change?”
- “Design a payment endpoint that is safe to retry.”

The skill reads the neighbouring endpoints first, because the project's existing conventions win over any default. It then models resources and operations, lists the success and error statuses for each endpoint in one error shape, bounds every collection with a pagination style chosen from how the list is used, and defines what happens when a write is retried. Limits and access are stated per endpoint.

Each change is classified as additive or breaking, and a breaking change gets a deprecation path instead of an in-place edit. The contract is recorded where the project keeps it, normally an OpenAPI description that is generated from or checked against the handlers. The skill finishes by writing out one real consumer sequence with concrete requests and responses, and asks before a breaking change reaches callers.

## Workflow fit

`codebase-design` owns interfaces inside one codebase, `security-review` the depth of authentication and authorization, `database-migrations` the storage change underneath, `tdd` the contract tests, and `decision-records` a scheme the whole API must follow.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/api-design/SKILL.md).
