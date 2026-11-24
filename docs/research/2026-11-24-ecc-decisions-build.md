# ECC decisions build: research

Research for what was built from the
[decision for every ECC skill](2026-11-24-ecc-skills-decisions.md): the 8
Recommend, 18 Possible, and 30 Fold as reference rows. Every preferred
repository in `docs/source-repos.md` was searched for each topic at the commits
listed in the [adoption research](2026-11-24-ecc-adoption-research.md); most
searches were by skill name and keyword, not a full read. No file is vendored,
and the instructions use original wording.

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

## Not verified

- No new eval has been run against a model.
- Version-dependent facts (Playwright options, Next.js and Vite settings,
  Prisma adapters, engine behaviours in the database references, HTTP header
  standards in `api-design`) come from the sources and general knowledge, not
  from a check against current vendor documentation. The files say to confirm
  them against the installed version.
- Each stack and engine reference adds some traps that are in no cited source.
