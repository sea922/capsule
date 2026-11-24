# Performance and accessibility skills research

Research for two new skills, `performance` and `accessibility`, each owning one
read-only reviewer agent that `code-review` deep mode reuses. Capsule had no
owner for either job: `diagnosing-bugs` explains regressions and
`coding-standards` holds frontend accessibility rules, but nothing made software
faster on purpose or audited an interface. The
[2026-11-24 ECC review](2026-11-24-ecc-review.md) surfaced both gaps. Every preferred repository in `docs/source-repos.md` was read at the
commit below; no file is vendored, and the instructions use original wording.

## Sources

| # | Repository | Commit | Performance | Accessibility |
| --- | --- | --- | --- | --- |
| 1 | mattpocock/skills | `abeeaf9` | None | None |
| 2 | obra/superpowers | `22f0b46` | None | None |
| 3 | addyosmani/agent-skills | `8c99fa3` | `performance-optimization`, `web-performance-auditor` | `accessibility-engineering`, `accessibility-auditor` |
| 4 | cursor/plugins (pstack) | `005d8f6` | `benchmark-checklist` | None |
| 5 | DietrichGebert/ponytail | `ebd8654` | None | None |
| 6 | mvanhorn/last30days-skill | `7c15d02` | None | None |
| 7 | anthropics/skills | `e4bb5d9` | None | None |
| 8 | trailofbits/skills | `149d7b2` | None | None |
| 9 | EveryInc/compound-engineering-plugin | `fcb5e3a` | `ce-optimize`, `performance-oracle` | None |
| 10 | garrytan/gstack | `6b7714c` | `benchmark` (web regression detection) | None |
| 11 | affaan-m/ECC | `4adeee67` | `performance-optimizer` agent, `benchmark` | `accessibility`, `frontend-a11y`, `a11y-architect` |
| 12 | wshobson/agents | `34e50fe` | `performance-engineer`, `database-optimizer` | `wcag-audit-patterns`, `screen-reader-testing`, `accessibility-expert` |
| 13 | nahid-sparktales/agent-dispatcher | `564c3f0` | `performance-profiling`, `frontend-performance`, `query-optimization` | `accessibility`, `accessibility-verification` |
| 14 | humanlayer/skills | `4d69d20` | None | None |
| 15 | testdouble/han | `abba73a` | None | None |

## Performance: what each source contributed

| Idea in `performance` | Source |
| --- | --- |
| One metric, workload, environment, and threshold before any change | agent-dispatcher `performance-profiling`, Addy Osmani |
| Repeated baseline with median and range; fix a noisy harness first | pstack `benchmark-checklist`, agent-dispatcher, Addy Osmani |
| Count errors and confirm the work happened inside the timed region | pstack `benchmark-checklist` questions 4 and 7 |
| Profile on the metric's axis; self versus inclusive time; computing versus waiting | agent-dispatcher |
| Confirm the limiter by removing its work before optimizing it | agent-dispatcher, pstack "why not double?" |
| Avoid the work before making it cheaper; change one thing per measurement | agent-dispatcher, Addy Osmani |
| Keep or revert table: neutral is a revert; a win that loosened a test is a regression | Addy Osmani |
| Log every attempt, including reverted ones | Addy Osmani, EveryInc `ce-optimize` persistence |
| Name the invariants caching, batching, and concurrency add | agent-dispatcher, Addy Osmani red flags |
| Reading code never yields numbers; findings are potential impact | Addy Osmani `web-performance-auditor` metric-honesty rule |
| Reviewer checklist: N+1, unbounded work, blocking I/O, missing indexes, bundle weight, cache keys | EveryInc `performance-oracle`, ECC `performance-optimizer`, wshobson `performance-engineer` |
| Inconclusive verdict when the limiter, tuning, or error count is missing | pstack `benchmark-checklist` report rules |

Not taken: EveryInc `ce-optimize`'s multi-phase spec, worktree, and spend-cap
machinery (heavier than a skill needs); gstack `benchmark`'s preamble,
telemetry, and browser setup (tied to gstack); wshobson's tool catalogue
(OpenTelemetry, load-testing products), which names tools rather than a method.

## Accessibility: what each source contributed

| Idea in `accessibility` | Source |
| --- | --- |
| Write the scope (routes, states, viewport, browser) before testing | agent-dispatcher `accessibility-verification` |
| Test the running app from a current build, not the source | agent-dispatcher, Addy Osmani |
| A clean scan is a floor; record the tool, version, and exact failures | agent-dispatcher, Addy Osmani `accessibility-engineering` |
| Keyboard, screen-reader, zoom and reflow, text spacing, and rendered contrast passes | agent-dispatcher, Addy Osmani, wshobson `screen-reader-testing` |
| The accessibility tree does not replace a screen-reader pass; manual results beat a clean scan | agent-dispatcher failure handling |
| Native elements first, ARIA only as a bridge; re-check after fixing | Addy Osmani phase 4, ECC `accessibility` anti-patterns |
| Severity bands tied to who is blocked | Addy Osmani `accessibility-auditor` |
| Refuse conclusions the evidence does not support; leave formal statements to the user | agent-dispatcher "what this refuses to conclude" |
| Reviewer checklist of code-level barriers | Addy Osmani static anti-patterns, ECC `a11y-architect`, wshobson `wcag-audit-patterns` |

Not taken: wshobson's per-reader keyboard command tables (reference detail that
changes with reader versions); ECC's iOS and Android code samples (capsule's
skill stays platform-neutral and names native traits generally); pinned scanner
install commands (the skill uses the scanner a project already has).

## Placement decisions

- Both are standalone skills because people ask for them as jobs, and each
  produces its own result. Each owns a read-only agent that `code-review` deep
  mode reuses, following the `adlc-spec` and `adlc-spec-miner` pattern.
- `diagnosing-bugs` keeps regression diagnosis; `performance` starts once the
  work is making something faster. `coding-standards` keeps the rules applied
  while writing code; `accessibility` owns audits and fixes.
