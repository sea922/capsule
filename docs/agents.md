# Agents

An index of the read-only agents capsule's skills hand work to. Each can read and search,
and cannot edit, run commands, or start other agents. A skill that uses one
also works without it by applying the same checks directly.

| Agent | Used by | What it checks |
| --- | --- | --- |
| [code-review-silent-failures](../skills/engineering/code-review/assets/claude-agents/code-review-silent-failures.md) | `code-review` deep | Errors a change swallows, hides behind fallbacks, or loses |
| [code-review-type-design](../skills/engineering/code-review/assets/claude-agents/code-review-type-design.md) | `code-review` deep | Whether changed types still enforce their invariants |
| [code-review-comments](../skills/engineering/code-review/assets/claude-agents/code-review-comments.md) | `code-review` deep | Comments and docs that no longer match the code |
| [code-review-tests](../skills/engineering/code-review/assets/claude-agents/code-review-tests.md) | `code-review` deep | Whether the tests would catch the change breaking |
| [java-reviewer](../skills/engineering/code-review/assets/claude-agents/java-reviewer.md) | `code-review` deep | Java changes in Spring Boot, Quarkus, or plain Java: security, errors, layering, persistence, concurrency |
| [code-review-stack](../skills/engineering/code-review/assets/claude-agents/code-review-stack.md) | `code-review` deep | Python, Go, TypeScript, React, and C# changes: the defects each stack's idioms make easy |
| [code-review-security](../skills/engineering/code-review/assets/claude-agents/code-review-security.md) | `code-review` deep | Reachable security weaknesses in a change that touches input, authentication, authorization, secrets, files, network, or dependencies |
| [database-migrations-reviewer](../skills/engineering/database-migrations/assets/claude-agents/database-migrations-reviewer.md) | `database-migrations`, `code-review` deep | Migrations, schema, and queries that can lose data, lock tables, or break deploys |
| [performance-reviewer](../skills/engineering/performance/assets/claude-agents/performance-reviewer.md) | `performance`, `code-review` deep | Hot paths, unbounded work, and bundle weight, as potential impact |
| [benchmark-auditor](../skills/engineering/benchmark/assets/claude-agents/benchmark-auditor.md) | `benchmark`, `performance`, `code-review` deep | Whether a harness or a reported number supports its claim |
| [accessibility-reviewer](../skills/engineering/accessibility/assets/claude-agents/accessibility-reviewer.md) | `accessibility`, `code-review` deep | Likely WCAG barriers in UI code, for manual checks to confirm |
| [production-readiness-auditor](../skills/engineering/production-readiness/assets/claude-agents/production-readiness-auditor.md) | `production-readiness` | The evidence a launch review needs: what exists, what is missing, what looks risky |
| [security-review-sanitizer](../skills/engineering/security-review/assets/claude-agents/security-review-sanitizer.md) | `security-review` | Secrets, personal data, and internal references before publishing |
| [adlc-spec-miner](../skills/adlc/adlc-spec/assets/claude-agents/adlc-spec-miner.md) | `adlc-spec` | Current behavior of existing code, as evidence-backed requirements and invariants |

The five `orchestrate-*` roles are in
[`skills/engineering/orchestrate/assets/`](../skills/engineering/orchestrate/assets),
with their Codex versions.

Every agent file lives with the skill that owns it, at
`skills/<bucket>/<skill>/assets/claude-agents/<name>.md`, so it travels with
that skill. This page is the index; it lives under `docs/` because the plugin host reads every file in a root `agents/` folder as an agent definition. To add an agent, put its file beside its skill, list
it under `agents` in `.claude-plugin/plugin.json` and in the table above, and
keep its tools read-only; `scripts/review-agents.test.mjs` checks every agent except the `orchestrate-*` roles.
