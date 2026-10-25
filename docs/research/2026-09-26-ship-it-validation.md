# Ship-it evaluation record

Date: 2026-09-26. Authoring method: writing-for-agents, baseline plus repeatable
paired text scenarios. This evaluates instruction application, not live delivery.

## Design and control

The three prompts in `skills/engineering/ship-it/evals/evals.json` were supplied
to a fresh-context agent without the proposed skill. A separate fresh-context
agent received the same prompts plus SKILL.md and its deployment reference.
Neither agent was allowed to mutate Git or external state. The control did not
read the proposed skill, research or sibling skill files. The guided agent did
not read the control result. Each scenario was sampled once per condition.

The target behavior is explicit endpoint selection and continuity across
delivery stages. Common sequencing stays inline; only deployment-specific
preparation and health checks are disclosed. Existing skills retain review,
implementation, verification, Git and PR monitoring mechanics.

## Baseline observation

Scenarios 1 and 2 passed their decision criteria without new guidance. The
control preserved unrelated billing staging, required tests and readiness on B,
respected the user's reserved merge, continued after queue admission, and
respected the messaging restriction. These scenarios check regressions but do
not establish an incremental benefit from this skill.

Scenario 3 failed the unambiguous-endpoint criterion. The control selected:

> I would stop when the PR is ready for review or merge, describing that state precisely rather than implying deployment.

Its proposed final status was:

> The fix is committed and pushed, and PR [link] is ready for review/merge. Checks passed.

This is a shaping failure, not demonstrated disregard for a known safety rule:
ready-for-review and merge-ready permit different stopping points. The skill
therefore states a positive default endpoint and carries it explicitly into the
receiving workflow, rather than adding a rationalization table.

## Guided results

| Scenario | Control | With skill |
| --- | --- | --- |
| 1. Repair B after green A, mixed staging, user merges | Pass | Pass: preserves staging, checks B, reuses PR 42, waits for readiness on B, leaves merge to user |
| 2. Queue accepted, PR open, messaging restricted | Pass | Pass: continues observing, requires confirmed merge, preserves messaging restriction |
| 3. Bare ship it | Endpoint ambiguous | Pass: explicitly selects merge-ready, requires fresh remote gates, rules out ready-for-review as completion |

The guided response for scenario 3 stated:

> I interpret “ship it” as delivering a **merge-ready PR**.

> I stop successfully only when fresh evidence establishes that the current PR head meets those gates. A PR URL or “ready for review” status is insufficient.

The observed improvement is limited to endpoint clarity in this sample. Scenarios
1 and 2 passed in both conditions and provide no evidence of added effectiveness.

## Structural checks

- `npm run check`: all 18 tooling tests passed; initial repository validation
  identified the not-yet-written evaluation record. After adding the record,
  `npm run validate` passed metadata, publication entries, evals, local links and
  synchronized versions.
- `claude plugin validate . --strict`: passed.
- `scripts/list-skills.sh`, executed with Git Bash: discovered the new skill.
  The default `bash` resolved to an unavailable WSL shell; using the installed
  Git Bash executable completed the check.
- `git diff --check`: passed.

A minor changeset records the new skill. Package and plugin versions remain
synchronized at 0.1.0 for the repository's release workflow to advance together.

## Limits

These short text scenarios test choices under supplied facts. They do not
exercise actual Git staging preservation, remote races, authorization plumbing,
CI observation, deployments, or sibling-skill execution. One sample per condition
does not measure reliability or prove that the wording reduces variance.
Deployment and missing-sibling branches receive author read-through only.
