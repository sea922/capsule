# Simplify: source comparison and validation

Date: 2026-09-06. Scope: the user's explicit request to add `simplify` to the workflow suite. This is implementation-focused source research, not a fresh last-30-days community survey.

## Decision

Add one model-discoverable entry point for scoped, behavior-preserving cleanup. The earlier [ecosystem report](preferred-skill-repositories-workflow-gap-research.md) favored using existing design and delivery skills for simplification; the user's subsequent request establishes a useful independent invocation. Keep the new owner narrow: it performs the cleanup pass, while design decisions and overall delivery retain their existing owners.

Read `docs/source-repos.md` and preserve its ordering. Inspected the cached primary-source checkouts from the same-day ecosystem investigation, with Addy's simplification and pstack's refactoring pages also opened online at the pinned revisions. Pins identify inspected snapshots, not a claim that each remains the latest upstream revision.

## Preferred-source influence

| Preferred repository and inspected source | Revision | Influence and boundaries |
| --- | --- | --- |
| [mattpocock/skills: codebase-design](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/codebase-design/SKILL.md) | `3cca18b368ae95cdbdebbff572ccafa662551015` | Judge whether removing an abstraction removes complexity or transfers it to callers. Keep local `codebase-design` as architecture owner and preserve justified seams. |
| [obra/superpowers: test-driven-development](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/test-driven-development/SKILL.md) | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | Refactoring holds behavior steady with green checks. Characterization tests may start green; this pass does not invent a failing behavior requirement or delete implementation to manufacture RED. |
| [addyosmani/agent-skills: code-simplification](https://github.com/addyosmani/agent-skills/blob/48cb1168aeaaa70dfc2bbf709eddfa2a8ed8129a/skills/code-simplification/SKILL.md) | `48cb1168aeaaa70dfc2bbf709eddfa2a8ed8129a` | Main scope and clarity model: understand existing behavior, focus on selected/recent changes, preserve semantics, and retain useful helpers. Exclude universal line/nesting thresholds, mandatory commits, and automatic imitation of code examples. |
| [cursor/plugins: pstack refactoring](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/poteto-mode/playbooks/refactoring.md) | `93b00b89ef425a9c1bac0d0b317dfc49c930ac99` | Pin the contract before structural edits, use small verifiable steps, and prove results on the actual artifact. Exclude forced delegation/model choices, automatic PR/rebase operations, universal removal of one-caller wrappers, and blanket compatibility-shim bans. |
| [DietrichGebert/ponytail: ponytail](https://github.com/DietrichGebert/ponytail/blob/974d940a1c5344210874150b98ff0d2c861fab6a/skills/ponytail/SKILL.md) | `974d940a1c5344210874150b98ff0d2c861fab6a` | Adapt the no-change/reuse/native-first preference only after understanding contracts. Preserve security, validation, failure handling, and justified thin adapters. Exclude always-on modes, shortest-diff objectives, test ceilings, and blanket abstraction bans. |
| [mvanhorn/last30days-skill: last30days](https://github.com/mvanhorn/last30days-skill/blob/56ba5ace27e4697aedc60aa0b1e1bfdcd592ff20/skills/last30days/SKILL.md) | `56ba5ace27e4697aedc60aa0b1e1bfdcd592ff20` | No simplification algorithm to adopt. Its coverage/status discipline remains relevant to research reporting; no engine rerun or claim of current community consensus is warranted for this implementation addition. |

## Local synthesis

- Scope is explicit paths/diff, or identifiable current-task work; unrelated dirty files remain excluded.
- Keep runtime contracts broader than return values: error delivery, effect ordering, resource cleanup, nullish values, identity, and relevant performance constraints can all matter.
- Reuse candidates are hypotheses. For example, replacing an object with a map changes the result contract; changing an awaited call inside `try/finally` can move cleanup before completion. Verify the concrete transformation rather than treating an upstream example as universally equivalent.
- Consolidate shared knowledge, not merely similar syntax. Count reductions do not establish a useful simplification.
- During `implement`, return checks and scope receipts to the caller without routing back into another implementation loop. Standalone cleanup owns its final evidence through `verification-before-completion`.
- Suggestions remain read-only. An observed defect becomes separate work unless its correction is already authorized.

`writing-for-agents` shaped the four short stages, their explicit completion criteria, and the routing boundaries. The skill stays self-contained because no substantial conditional reference is needed. Instructions and fixtures use original wording/code rather than vendored source files.

## Evaluation scope

`skills/engineering/simplify/evals/evals.json` records three scenarios: executable cleanup, preservation of a useful adapter/authorization boundary, and analysis-only authority. The executable fixture uses Node's built-in test runner and covers authorization rejection, nullish versus falsy labels, result shape, null reports, and audit ordering after deferred success or failure.

The fixture is evaluation input, not a new runtime dependency or a command the skill must run in unrelated projects. A forward exercise validates observable behavior in that fixture; it does not establish improvement over a no-skill baseline or prove all refactors safe.

## Validation results

- `quick_validate.py` passed for `simplify`, `implement`, and `codebase-design` using `uv run --no-project --with pyyaml python` with UTF-8 enabled.
- `claude plugin validate . --strict` passed for the marketplace manifest selected by that command. Direct `claude plugin validate .claude-plugin/plugin.json` passed with the existing root-`CLAUDE.md` context warning; this is not a clean direct strict-plugin result.
- Repository packaging checks found 21 skill leaves and 21 distinct manifest entries, matching skill/directory names, valid new UI metadata and eval paths, synchronized `0.1.0` versions, and 131 resolvable relative Markdown links. New files passed newline/trailing-whitespace checks; `git diff --check` passed for tracked changes.
- An independent agent used the written skill in an isolated temporary fixture copy. It removed the unnecessary `else` and mutable label initialization, preserved the user-added product-rule comment, and recorded unchanged hashes for the tests and unrelated note. It ran all 10 initial tests before and after its changes. The fixture was outside Git, so its attempted Git inspections were unavailable; file inspection/hashes supplied the scope evidence instead.
- The exercise retained repeated label getter evaluations rather than assuming a nullish-coalescing rewrite was equivalent. Added a regression check for those observable accesses, inspected the actual simplified artifact, and reran the expanded tests against both original and simplified code: **11 passed, 0 failed, 0 skipped** on each. Commands: `node --test skills/engineering/simplify/evals/fixtures/report.test.mjs` and `node --test C:\Users\joevr\AppData\Local\Temp\simplify-forward-760fd9947f1a4693b2cd29af5ecf821b\report.test.mjs`.
- The temporary simplified artifact remains at `C:\Users\joevr\AppData\Local\Temp\simplify-forward-760fd9947f1a4693b2cd29af5ecf821b\report.mjs`. Canonical fixture code remains unsimplified as repeatable evaluation input. No dependencies were added to the repository, and no skill installation, staging, commits, or publication occurred.

Only scenario 1 received an independent executable forward exercise. Scenarios 2 and 3 remain authored cases, not claimed behavioral passes. There was no paired no-skill comparison, trigger-accuracy benchmark, or exhaustive equivalence proof. The getter finding strengthened the fixture; it did not justify expanding the skill with a language-specific rule catalogue.
