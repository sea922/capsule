# ECC adoption research

Research for the skills, agents, hooks, folds, and tooling adopted after the
[2026-11-24 ECC review](2026-11-24-ecc-review.md). `performance` and
`accessibility` have their own
[research note](2026-11-24-performance-accessibility-research.md). Every
preferred repository in `docs/source-repos.md` was searched at the commit below
for each topic. No file is vendored, and the instructions use original wording.

## Sources

| # | Repository | Commit | Relevant material |
| --- | --- | --- | --- |
| 1 | mattpocock/skills | `abeeaf9` | None for these topics |
| 2 | obra/superpowers | `22f0b46` | None |
| 3 | addyosmani/agent-skills | `8c99fa3` | `shipping-and-launch`, `documentation-and-adrs`, `performance-optimization` |
| 4 | cursor/plugins (pstack) | `005d8f6` | `benchmark-checklist` |
| 5 | DietrichGebert/ponytail | `ebd8654` | None |
| 6 | mvanhorn/last30days-skill | `7c15d02` | None |
| 7 | anthropics/skills | `e4bb5d9` | None |
| 8 | trailofbits/skills | `149d7b2` | None |
| 9 | EveryInc/compound-engineering-plugin | `fcb5e3a` | `ce-optimize` |
| 10 | garrytan/gstack | `6b7714c` | `benchmark`, `canary`, `land-and-deploy` |
| 11 | affaan-m/ECC | `4adeee67` | The skills, agents, hooks, and guide named below |
| 12 | wshobson/agents | `34e50fe` | `architecture-decision-records`, `deploy-with-verification`, database agents |
| 13 | nahid-sparktales/agent-dispatcher | `564c3f0` | `migrations`, `database-migration-verification`, `deployment` |
| 14 | humanlayer/skills | `4d69d20` | None |
| 15 | testdouble/han | `abba73a` | `architectural-decision-record`, `codebase-explorer` |

## New skills

### `benchmark` and `benchmark-auditor`

| Idea | Source |
| --- | --- |
| Agreed search budget; hard constraints judged apart from the score; frozen metric, inputs, and evaluator; expected results independent of the candidate; a proxy is not the user outcome; promotion gate that re-runs baseline and winner; "best measured variant" wording; separate benchmark, acceptance, and deployed results | ECC `benchmark-optimization-loop` |
| Write the claim first; the seven vetting questions (limiter, tuning, limits, errors, repeatability, relevance, work done); interleaved runs; one run is only a ballpark; inconclusive verdict | pstack `benchmark-checklist` |
| A ledger of every variant with keep or reject | ECC, EveryInc `ce-optimize`, Addy Osmani |
| Page, API, and build-time examples of what to measure | ECC `benchmark`, gstack `benchmark` |

Not taken: EveryInc's spec, worktree, and spend-cap machinery; gstack's browser
setup and telemetry.

### `database-migrations` and `database-migrations-reviewer`

| Idea | Source |
| --- | --- |
| Read every reader first; classify additive, rewriting, or data only; expand, dual-write, backfill, switch reads, contract across deploys | agent-dispatcher `migrations` |
| Lock and statement timeouts; online index builds and the invalid-index trap; constraints added unvalidated then validated; MySQL online tooling | agent-dispatcher `migrations` |
| Forward-only production changes; schema and data separated; never edit a migration that has run; batched, resumable backfills | ECC `database-migrations` |
| Honest rollback: a down migration restores shape, not data | agent-dispatcher |
| Rehearse on realistic volume, capture the before-state, stop before production | agent-dispatcher |
| Verification by history, counts, checksums, catalog state, query plans, and invariant queries that return rows | agent-dispatcher `database-migration-verification` |
| Reviewer checklist for data loss, deploy safety, locking, hygiene, queries, and constraints | ECC `database-reviewer`, wshobson database agents |

Not taken: ECC's per-tool sections for Prisma, Drizzle, Django, and others (the
skill reads the project's own tool instead).

### `production-readiness` and `production-readiness-auditor`

| Idea | Source |
| --- | --- |
| Local evidence only; risk areas for security, data, payments and webhooks, operations, and user experience; hard caps that force a block | ECC `production-audit` |
| Staged rollout, thresholds to advance, hold, or roll back, and a rollback plan with its time and data effect | Addy Osmani `shipping-and-launch` |
| A green job is not a live check; verify the deployed revision | wshobson `deploy-with-verification`, gstack `canary` |
| Health checks, fail-fast configuration, and CI practices to look for | ECC `deployment-patterns`, agent-dispatcher `deployment` |

Changed from the sources: ECC's 0–100 score became a three-way verdict, because
a number implies precision the evidence does not have.

### `decision-records`

| Idea | Source |
| --- | --- |
| Record only decisions with a present forcing reason; mark each supporting fact by where it comes from | testdouble/han `architectural-decision-record` |
| Match the project's existing location, numbering, and headings before any default; when to write one | Addy Osmani `documentation-and-adrs` |
| Nygard-style parts, status vocabulary, an index, and answering "why did we choose X" from the records | ECC `architecture-decision-records` |
| Never rewrite an accepted record; supersede with links both ways | ECC, wshobson `architecture-decision-records` |

Not taken: han's configuration probes and sub-agent review dispatch.

### `codebase-onboarding`

| Idea | Source |
| --- | --- |
| Survey manifests, entry points, structure, CI, and tests before reading deeply; map stack, architecture, and key directories; detect conventions from the code and git history | ECC `codebase-onboarding` |
| Trace one real path with file and line anchors, aimed at a named reader | ECC `code-tour` |
| Adapt the search to what is found; report findings with evidence | testdouble/han `codebase-explorer` |

Capsule adds checking existing documentation against the code and never
overwriting existing docs. It reuses `orchestrate-explorer` rather than adding
an explorer agent.

## Folds into existing skills

| Change | Target | Source |
| --- | --- | --- |
| Trace a UI handler call by call for undone state, async order, and stale values | `diagnosing-bugs`, `code-review` | ECC `click-path-audit` |
| Classify MCP and tool configuration references as pinned or mutable, without running servers | `security-review` | ECC `mcp-dependency-review` |
| Minimum controls for systems that run agents with tools | `security-review` | ECC `the-security-guide.md`, `agent-security-hardening` |
| The reproducing test stays as the regression test and covers every path; a same-model re-read is not independent evidence | `tdd`, `verification-before-completion` | ECC `ai-regression-testing` |
| Run each downstream consumer's own check | `verification-before-completion` | ECC `module-regression` |
| Post-deploy page, asset, stream, sign-in, and load-time checks | `ship-it` | ECC `canary-watch`, `browser-qa`; gstack `canary` |
| Loop goals a command can decide, round caps, and the three loop failure modes; refine a worker's context in rounds | `orchestrate`, `babysit-pr` | ECC `loop-design-check`, `iterative-retrieval` |
| Look for something existing before building, and before writing a new skill | `implement`, `codebase-design`, `writing-for-agents` | ECC `search-first`, `skill-scout` |
| `TOOLS.md`: action space, descriptions, results, and recoverable errors for tools an agent calls | `writing-for-agents` | ECC `agent-harness-construction` |

## Agents and hooks

The four `code-review-*` passes, `security-review-sanitizer`, and
`adlc-spec-miner` adapt ECC's `silent-failure-hunter`, `type-design-analyzer`,
`comment-analyzer`, `pr-test-analyzer`, `opensource-sanitizer`, and
`spec-miner`. Each is read-only and reports candidates for its owning skill to
validate. The `block-no-verify` and `config-protection` hooks follow the intent
of ECC's hooks of the same names with new, smaller implementations that target
casual bypasses and say they are not a security boundary.

## Tooling

`scripts/validate-repo.mjs` now rejects frontmatter keys that other agent hosts
do not accept and Claude-only variables inside shell snippets, after ECC's
`skill-host-compat`. Capsule ships one `SKILL.md` to every host, so the check
runs on the canonical file instead of on per-host copies.

## Rules

ECC ships 122 rule files in a `common` layer plus language directories, copied
into `~/.claude/rules/` or a project's `.claude/rules/` by an install script,
with a `paths:` header scoping each language rule to its files. Capsule takes
both the delivery model and the content for eight sets: `common`,
`typescript`, `react`, `web`, `python`, `java`, `golang`, and `csharp`. This is
the one place capsule vendors upstream files, at the repository owner's
request; `rules/THIRD-PARTY-NOTICE.md` carries ECC's MIT notice.

The 49 copied files were adapted in four ways:

- **References.** ECC skill, agent, command, and tool names now name capsule's
  skills, agents, and hooks, and pointers to ECC's framework skills (Spring
  Boot, Quarkus, JPA, Django, FastAPI) are removed. A test fails if a rule names
  a skill capsule does not have.
- **Defaults, not mandates.** "ALWAYS", "MANDATORY", and fixed figures such as
  80% coverage became defaults that defer to the project, and each set's
  `coding-style.md` links `common/precedence.md`, so the rules agree with
  `coding-standards` and `tdd`.
- **Model guidance.** `common/performance.md` drops claims about specific model
  versions, which date quickly, for task-to-tier guidance and a pointer to
  `orchestrate`.
- **Hook suggestions.** Each stack's `hooks.md` says capsule does not ship those
  hooks and a project may configure them; `common/hooks.md` describes capsule's
  two.

Capsule adds five `common` rules ECC has no equivalent for: `precedence`,
`evidence`, `untrusted-content`, `scope`, and `skill-routing`. An opt-in
installer previews first and never overwrites a file the project changed.

Not taken: ECC's other language sets.
