# ADLC

Five composable skills for the agentic development lifecycle: agents draft and verify, humans decide at named gates. Each stage saves a durable Markdown artifact that the next stage reads; commits follow the user's authorization.

## User-invoked

- [`adlc-flow`](adlc-flow/SKILL.md) — find the evidenced current stage and name the next command or delivery handoff. This is the one command to remember.
- [`adlc-intent`](adlc-intent/SKILL.md) — interview the human and record the problem, outcome, and success signal in `intent.md`.
- [`adlc-spec`](adlc-spec/SKILL.md) — turn approved intent into observable behavior and numbered acceptance criteria in `spec.md`.
- [`adlc-plan`](adlc-plan/SKILL.md) — compose `planning-and-task-breakdown` and add decisions, acceptance coverage, assignment, and rollback in `plan.md`, plus a living `progress.md`.
- [`adlc-gate`](adlc-gate/SKILL.md) — self-check an artifact's exit criteria and record a named human sign-off against its content hash, or on a delivery slice in `progress.md`.

## Flow

```text
/adlc-intent -> /adlc-gate intent -> /adlc-spec -> /adlc-gate spec
  -> /adlc-plan -> /adlc-gate plan -> implement | orchestrate
  -> code-review -> verification-before-completion -> declared delivery endpoint
```

Build, test, review, and delivery reuse the engineering skills; the ADLC bucket adds only the artifacts and gates in front of them.

## Artifacts

The suite writes to an existing spec, plan, or tracker convention when the project has one. Otherwise it uses:

```text
docs/adlc/<slug>/
|-- intent.md
|-- spec.md
|-- plan.md
`-- progress.md
```

Each gated artifact carries `status` frontmatter and a final `## Approvals` table.
The shared [approval contract](adlc-gate/references/APPROVALS.md) and portable hash
helper bind decisions to reviewed content. Downstream stages verify the full
chain, including source hashes and conditions. Changed content needs renewed
review; reapproving upstream does not refresh downstream automatically.

`progress.md` is the exception: a living delivery record bound to the approved
plan hash, with code revisions, review/test receipts, decisions, and carried
items. It is never hashed. Conditions carry an ID, owner, and deadline, and due
decisions block dependent work. The [progress contract](adlc-plan/references/PROGRESS.md)
defines freshness, combined acceptance, and completion at the declared local,
PR, merge, or deployment endpoint. Legacy plans retain `done = merged` until
explicitly revised. Product outcome observation can remain pending after delivery.
