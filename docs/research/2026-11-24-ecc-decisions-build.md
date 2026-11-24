# ECC decisions build: research

Research for what was built from the
[decision for every ECC skill](2026-11-24-ecc-skills-decisions.md): the 8
Recommend, 18 Possible, and 30 Fold as reference rows. Every preferred
repository in `docs/source-repos.md` was searched for each topic at the commits
listed in the [adoption research](2026-11-24-ecc-adoption-research.md); most
searches were by skill name and keyword, not a full read. The skills, agents, hooks,
and references adapt ideas in capsule's own wording and vendor no file;
`rules/java/springboot.md` is capsule-written, and the other rule files are
ECC's, copied and adapted under its MIT licence.

## What was built

| Capsule result | Kind | ECC skills it answers |
| --- | --- | --- |
| `api-design` | New skill | `api-design` |
| `e2e-testing` | New skill | `e2e-testing` |
| `interface-polish` | New skill | `design-system`, `make-interfaces-feel-better` |
| `i18n-sync` | New skill | `i18n-sync` |
| `database-design` | New skill with engine references | `postgres-patterns`, `mysql-patterns`, `redis-patterns`, `clickhouse-io` |
| `containers-and-deploys` | New skill with references | `docker-patterns`, `deployment-patterns`, `kubernetes-patterns`, `terraform-patterns` |
| `llm-features` | New skill with references | `eval-harness`, `cost-aware-llm-pipeline`, `prompt-caching-strategy`, `regex-vs-llm-structured-text`, `agent-architecture-audit`, `agent-eval` |
| `seo` | New skill (second pass) | `seo` |
| `interface-polish` `MOTION.md` | Reference (second pass) | `motion-foundations`, `motion-patterns`, `motion-advanced` |
| `performance` `LATENCY.md`, `THROUGHPUT.md` | References (second pass) | `latency-critical-systems`, `data-throughput-accelerator` |
| `coding-standards` `TYPESCRIPT.md` Bun section | Addition (second pass) | `bun-runtime` |
| `rules/java/springboot.md` | Rule file | The four `springboot-*` skills |
| `java-reviewer` | Read-only agent under `code-review` | ECC agent `java-reviewer` |
| `performance` `REACT.md` | Reference | `react-performance` |
| `performance` `CACHING.md` | Reference | `content-hash-cache-pattern` |
| `coding-standards` `ERROR-HANDLING.md` | Reference | `error-handling` |
| `coding-standards` `BACKEND.md`, `FRONTEND.md` | Additions | `backend-patterns`, `frontend-patterns` |
| `coding-standards` `TYPESCRIPT.md` | Reference | `typescript-patterns`, `nestjs-patterns`, `prisma-patterns` |
| `coding-standards` `REACT.md` | Reference | `react-patterns`, `react-testing`, `nextjs-turbopack`, `vite-patterns` |
| `coding-standards` `PYTHON.md` | Reference | `python-patterns`, `python-testing`, `fastapi-patterns`, `django-patterns`, `django-security`, `django-tdd`, `django-verification`, `django-celery` |
| `coding-standards` `JAVA.md`, `JAVA-SPRING.md`, `JAVA-QUARKUS.md` | References | `java-coding-standards`, `springboot-patterns`, `springboot-security`, `springboot-tdd`, `springboot-verification`, `jpa-patterns`, `mybatis-patterns`, `quarkus-patterns`, `quarkus-security`, `quarkus-tdd`, `quarkus-verification` |
| `coding-standards` `GO.md` | Reference | `golang-patterns`, `golang-testing` |
| `coding-standards` `CSHARP.md` | Reference | `dotnet-patterns`, `csharp-testing` |
| `writing-for-agents` `MCP-SERVERS.md` | Reference | `mcp-server-patterns` |
| `grilling` `PRODUCT.md` | Reference | `product-lens` |

The rows marked second pass were first classified Out of scope from their
names and descriptions, then reconsidered because they fit the web, React,
TypeScript, and performance work capsule covers. `seo` draws its method mainly
from agent-dispatcher `seo`; the motion reference from the three ECC motion
skills; `java-reviewer` is read-only, unlike ECC's, and leaves builds and
static analysis to the parent.

## Choices the decision table left open

- **`database-design` is its own skill.** Designing a schema or query is a
  different job from changing a live schema, which `database-migrations` owns.
- **Content-hash caching sits under `performance`**, not beside the database
  material: it is a way to avoid repeated work, not a storage design.
- **Java is three files.** The Spring Boot and Quarkus material did not fit one
  reference; `JAVA.md` routes to the framework file by build file.
- **The stack references cover what the rule sets omit.** `rules/` already
  carries most of each stack's style, testing, and security guidance.

## Influence by result

| Result | ECC | Other preferred repositories |
| --- | --- | --- |
| `api-design` | Topic coverage: naming, status codes, error shape, pagination, filtering, rate limits, versioning | agent-dispatcher `api-design` (read the neighbours first, additive versus breaking, walk one consumer sequence); addyosmani `api-and-interface-design` (Hyrum's Law, addition over modification, idempotency keys) |
| `e2e-testing` | Page objects, quarantine with an issue, repeat-run flake detection, artifacts | agent-dispatcher `e2e-testing` (admit a journey only when a lower level cannot observe it, flake causes, pruning on evidence) |
| `interface-polish` | Token inventory and drift audit; nearly all of the detail checklist | agent-dispatcher `design-systems` (find conventions first, report a token gap, list call sites before changing a shared token); addyosmani `frontend-ui-engineering` (minor) |
| `i18n-sync` | Worklist, usage context, glossary-first translation, structure-preserving edits | None found |
| `database-design` | The four engine skills and the `database-reviewer` agent | wshobson `postgresql-table-design` (constraints, partitioning limits) and `sql-optimization-patterns` (plan reading) |
| `containers-and-deploys` | The four infrastructure skills | addyosmani `ci-cd-and-automation` (gates, cheap failures first, flag lifecycle); wshobson `deployment-pipeline-design` (troubleshooting, shallow and deep health checks); trailofbits `devcontainer-setup` (image pinning, layer order) |
| `llm-features` | The six LLM skills | wshobson `llm-evaluation` (pairwise judging, checking the judge against human labels) |
| `performance` `REACT.md` | `react-performance`, itself adapted from Vercel Labs `react-best-practices` (MIT) | None |
| `coding-standards` `TYPESCRIPT.md` | The three TypeScript skills | cursor pstack `typescript-best-practices` (constructive modelling, narrowing order, derive before declare); wshobson `typescript-advanced-types` (minor) |
| `coding-standards` `REACT.md` | The four React skills | humanlayer `narrow-react-prop-types` |
| `coding-standards` `PYTHON.md` | The eight Python skills | wshobson `python-anti-patterns`, `async-python-patterns`; trailofbits `modern-python` (verification) |
| `coding-standards` `GO.md` | The two Go skills | wshobson `go-concurrency-patterns` |
| `coding-standards` `CSHARP.md`, Java files, `ERROR-HANDLING.md` | The matching ECC skills | wshobson `error-handling-patterns` for the error reference; none for C# or Java |
| `writing-for-agents` `MCP-SERVERS.md` | Transport-independent logic, pinning the SDK | anthropics `mcp-builder` (workflow tools, stateless HTTP, stderr logging, annotations, inspector), the main source |
| `grilling` `PRODUCT.md` | The product questions | gstack `office-hours` (demand as behavior, the narrowest wedge) |
| `performance` `CACHING.md` | The pattern | None found |

Repositories with nothing for any of these topics: mattpocock/skills,
obra/superpowers, DietrichGebert/ponytail, mvanhorn/last30days-skill,
EveryInc/compound-engineering-plugin, and testdouble/han (its `design-an-api`
is a design-document process that `codebase-design` covers).

## Left out on purpose

ECC's fixed targets (80% coverage gates, a pass@3 threshold, resource-sizing
tables, a 0–10 design score), its pricing tables, model names, cache lifetimes,
and provider field names, and its ECC-specific harness sections. The skills
state defaults that yield to the project and send the reader to current vendor
documentation for anything that changes between versions.

## Deep review

After the build, six read-only reviewers re-read the work and the sources: the
skills still marked Out of scope (opening each file), ECC's agents, hooks, and
commands, every rule file against its ECC original, the 53 Covered claims, and
every line of the new skills and references. The corrections they led to:
HTTP retry and precondition semantics in `api-design`; row-level-security and
production-plan safety in `database-design`; Quarkus interception in the
Quarkus reference and `java-reviewer`; Prisma, Vite, and Next.js claims in the
TypeScript and React references; the scope of browser request stubbing in
`e2e-testing`; the hook configuration shape in `rules/web/hooks.md`; the
`paths:` header and test-slice lines of `rules/java/springboot.md`; and
pointers from the rules and neighbouring skills to the new skills. The review
rested on model knowledge, not on current vendor documentation.

A second review round then executed the hooks against about 200 commands and
re-read everything added after the first. It led to fixes in the hooks (false
blocks on quoted paths, heredoc text, and unrelated SQL text, and several
misses), the perimeter reference (made truly passive), deep-review pass
selection (a cap and a selection rule), references that their skill's
description could not reach, stale docs pages, and attribution in the README
and these notes.

The gaps it found were then built: the `issue-triage` and `observability`
skills; the read-only `code-review-stack` and `code-review-security` agents;
the `block-destructive` and `block-secret-commit` hooks; and references for
passive perimeter checks (`security-review`), cutting a release (`ship-it`),
design direction (`interface-polish`), independent dissent (`grilling`), a
catalogue audit (`skill-evolve`), keeping docs current
(`codebase-onboarding`), retrieval (`llm-features`), and build errors
(`diagnosing-bugs`), with short additions to `i18n-sync`, `implement`, and the
`writing-for-agents` tools reference.

| Result | ECC source | Other preferred repositories |
| --- | --- | --- |
| `issue-triage` | `issue-review`, `github-ops` | testdouble/han `issue-triage`; mattpocock `triage`; trailofbits `github-triage` |
| `observability` | `dashboard-builder` | addyosmani `observability-and-instrumentation` (main source); agent-dispatcher `observability`; wshobson `slo-implementation` |
| `code-review-stack` | Agents `python-`, `django-`, `fastapi-`, `go-`, `typescript-`, `react-`, `csharp-reviewer` | wshobson `python-pro`, `django-pro`, `fastapi-pro`, `golang-pro`, `typescript-pro`, `csharp-pro` found, not used (general personas that write code, not review checklists); humanlayer `narrow-react-prop-types` already reflected in the React reference; nothing else relevant |
| `code-review-security` | Agent `security-reviewer`; `security-bounty-hunter` | Found, not used: addyosmani `agents/security-auditor.md`, wshobson `security-auditor`, EveryInc `ce-code-review` persona `security-reviewer`, gstack `cso` (same job; the reachable-path gate matches capsule's `security-review`, so nothing new was taken) |
| `block-destructive`, `block-secret-commit` | `safety-guard`; the secret patterns of hook `pre-bash-commit-quality` | gstack `careful` (a similar watchlist, delivered as an opt-in warning skill, found after the build and not used); addyosmani `scripts/staged-secret-scan-test.js` (confirms the rule the hook follows: name the file, never print the value); nothing else relevant |
| `security-review` `PERIMETER.md` | `web-perimeter-owasp-2025-audit` | Searched, nothing relevant |
| `ship-it` `RELEASE.md` | `github-ops` | EveryInc compound-engineering (release automation drift); wshobson `changelog-automation` |
| `interface-polish` `DIRECTION.md` | `frontend-design-direction` | Found, not used: gstack `design-consultation`, `design-shotgun`, `design-html` (generate a whole design system and previews, a larger job than setting one direction) |
| `grilling` `DISSENT.md` | `council` | Found, not used: gstack `codex` consult and challenge modes and `office-hours` second opinion (a second model, not independent roles); testdouble/han `adversarial-validator` (attacks an investigation, not a decision) |
| `skill-evolve` `STOCKTAKE.md` | `skill-stocktake` | Found, not used: addyosmani `scripts/lib/skill-lint.js` (structural lint, not an overlap audit); agent-dispatcher `catalog/` (a routing index); nothing else relevant |
| `codebase-onboarding` `LIVING-DOCS.md` | `living-docs-governance`, `docs-governance`, command `update-docs` | Found, not used: gstack `document-release` (a post-ship documentation audit); testdouble/han `han-documentation` (writes feature and decision docs, which `decision-records` covers) |
| `llm-features` `RETRIEVAL.md` | Agent `rag-pipeline-reviewer` | wshobson `llm-application-dev` (topic list only) |
| `diagnosing-bugs` `BUILD-ERRORS.md` | Agent `build-error-resolver`, command `build-fix` | addyosmani `debugging-and-error-recovery` lists broken builds as a debugging trigger, consistent with keeping this under `diagnosing-bugs`; trailofbits `codeql` `build-fixes.md` is tool-specific; nothing else relevant |
| `handoff` `COMPACTION.md` | `strategic-compact` (when to compact, what survives, write state first; its hook and thresholds are not taken) | Not searched |
| `security-review` `REPORTABILITY.md` | `security-bounty-hunter` (scope first, entry points, the skip list, the quality gate, report structure; nothing is submitted) | Not searched |
| `security-review` `AGENT-CONFIG.md` | `security-scan` (the surfaces it checks; its scanner tool and score are not taken) | Not searched |
| Additions to `i18n-sync`, `implement`, `TOOLS.md` | `yoruba-localization-testing`, `agent-introspection-debugging`, `agentic-engineering` | Not searched |

The searches behind the third column were by file name and keyword across
the fourteen other preferred repositories, not a full read.

The optional status line in `statusline/` takes its idea and its context-bar colour thresholds from ECC's `ecc-statusline.js`. It is capsule's own code, in a look chosen from previewed options after reading how ccstatusline and claude-powerline lay out their segments: it adds the git branch with change and ahead or behind counts, a gradient context bar, and wrapping for narrow terminals, and it drops ECC's metrics hook, todo-list reading, and plugin listing so that it reads only the status line input and `git status`. Its input fields were checked against the Claude Code status line documentation on 2026-11-24.

Not taken: ECC's Vue and Nuxt rule sets, a classical machine-learning skill,
and its write-capable build-resolver agents.

## Not verified

- No new eval has been run against a model.
- Version-dependent facts (Playwright options, Next.js and Vite settings,
  Prisma adapters, engine behaviours in the database references, HTTP header
  standards in `api-design`) come from the sources and general knowledge, not
  from a check against current vendor documentation. The files say to confirm
  them against the installed version.
- Each stack and engine reference adds some traps that are in no cited source.
