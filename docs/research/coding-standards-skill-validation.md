# Coding standards validation

Date: 2026-09-13.

## Scope

Created one model-invoked skill with a shared baseline and conditional backend
and frontend references. Three scenario prompts are saved in
`skills/engineering/coding-standards/evals/evals.json`. The control agent received
equivalent scenario facts without the skill or research. A separate fresh agent
received the skill and saved prompts for the guided arm. Each arm handled all
three scenarios in one context; these are not repeated independent samples.

This is a paired scenario check, not a coding benchmark, trigger-reliability
study, runtime security test, or proof of latency improvement. No application
fixtures were executed. The baseline exhibited no target failure, so the cases
do not establish that the skill improves model behavior. They remain useful
checks for regressions and domain routing. The skill is a reference candidate,
not a demonstrated remedy for a measured discipline failure.

## Control observations

The no-guidance agent identified:

- Backend: missing resource authorization, invalid input risk, partial transfers,
  unsafe retries, and per-replica rate limits. It proposed transactions or a
  durable cross-system workflow, persisted idempotency, and a common limiter.
- Frontend: stale responses, overlapping loading state, missing error handling,
  query encoding, semantic controls, installed-library reuse, and compiler-aware
  memoization. It rejected blanket manual memoization.
- CLI: local naming/formatter conventions, relevant CSV correctness checks,
  and preservation of a cohesive 55-line function. It explicitly excluded web
  domain guidance and speculative optimization.

The control clearly stated no code was inspected or checks run. All substantive
scenario expectations passed; reference-loading expectations apply only to the
guided arm. No baseline failure or rationalization was observed.

## Repository checks

- `claude plugin validate . --strict`: passed. The CLI selected the repository's
  marketplace manifest.
- `claude plugin validate .claude-plugin/plugin.json --strict`: failed on the
  existing root `CLAUDE.md` warning: that file is not loaded as plugin project
  context. This is a repository-level packaging warning, not an invalid new
  skill entry. Root context files were left unchanged.
- `scripts/list-skills.sh`: discovered the new skill.
- New skill frontmatter, name/directory agreement, reference links, evaluation
  JSON, and documentation links checked.
- Package and plugin versions remain synchronized at `0.1.0`. Added a minor
  changeset for the normal release workflow rather than manually releasing.
- `git diff --check`: passed; Git reported only line-ending conversion notices.

## Guided observations

The guided agent identified all substantive issues captured by the control. It
mapped the transfer scenario to backend guidance, the React scenario to frontend
guidance, and the CLI to the shared baseline. It introduced no architecture
changes or claims of executed application checks.

It fetched both references together for the first two scenarios. Consequently,
domain selection was demonstrated in its reported reasoning, but isolated
per-scenario loading was not demonstrated by the tool trace. Do not count the
reference-isolation expectations as proven.

The reviewer noted that the transfer and search examples closely resemble these
eval prompts. The cases test use of explicit examples more than generalization;
future evaluations should include distinct job-delivery, cache-isolation, and
form-focus scenarios. A short framework-applicability qualifier and clearer
repository-evidence-before-question wording were added after review and checked
by read-through; the scenario run was not repeated for those wording changes.

Result: substantive scenario checks passed in both arms, with no demonstrated
quality gain and no demonstrated reference-loading isolation. Publication wiring
is checked, subject to the pre-existing strict plugin warning above.
