# Agents

Read-only agents that capsule's skills hand work to. Each can read and search,
and cannot edit, run commands, or start other agents. A skill that uses one
also works without it by applying the same checks directly.

| Agent | Used by | What it checks |
| --- | --- | --- |
| [code-review-silent-failures](code-review-silent-failures.md) | `code-review` deep | Errors a change swallows, hides behind fallbacks, or loses |
| [code-review-type-design](code-review-type-design.md) | `code-review` deep | Whether changed types still enforce their invariants |
| [code-review-comments](code-review-comments.md) | `code-review` deep | Comments and docs that no longer match the code |
| [code-review-tests](code-review-tests.md) | `code-review` deep | Whether the tests would catch the change breaking |
| [database-migrations-reviewer](database-migrations-reviewer.md) | `database-migrations`, `code-review` deep | Migrations, schema, and queries that can lose data, lock tables, or break deploys |
| [performance-reviewer](performance-reviewer.md) | `performance`, `code-review` deep | Hot paths, unbounded work, and bundle weight, as potential impact |
| [benchmark-auditor](benchmark-auditor.md) | `benchmark`, `performance`, `code-review` deep | Whether a harness or a reported number supports its claim |
| [accessibility-reviewer](accessibility-reviewer.md) | `accessibility`, `code-review` deep | Likely WCAG barriers in UI code, for manual checks to confirm |
| [production-readiness-auditor](production-readiness-auditor.md) | `production-readiness` | The evidence a launch review needs: what exists, what is missing, what looks risky |
| [security-review-sanitizer](security-review-sanitizer.md) | `security-review` | Secrets, personal data, and internal references before publishing |
| [adlc-spec-miner](adlc-spec-miner.md) | `adlc-spec` | Current behavior of existing code, as evidence-backed requirements and invariants |

The five `orchestrate-*` roles live with their skill, in
[`skills/engineering/orchestrate/assets/`](../skills/engineering/orchestrate/assets),
because its installer ships them together with their Codex versions.

To add an agent, put `<name>.md` here, list it under `agents` in
`.claude-plugin/plugin.json`, and add it to `scripts/review-agents.test.mjs` if
it is read-only.
