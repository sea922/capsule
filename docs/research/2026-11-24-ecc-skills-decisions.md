# ECC skills: decision for every skill

A decision and reason for each of the 328 skills in
[`affaan-m/ECC`](https://github.com/affaan-m/ECC/tree/main/skills) at `4adeee67`,
compared with capsule. The description column is ECC's own, shortened. Skills
judged one by one have their own reason; language, framework, and domain packs
share a group reason. See the [review](2026-11-24-ecc-review.md), the
[stack skills review](2026-11-24-ecc-stack-skills-review.md), and the
[adoption research](2026-11-24-ecc-adoption-research.md).

**Update:** the Recommend, Possible, and Fold as reference rows have since
been built. The [build research](2026-11-24-ecc-decisions-build.md) maps each
row to the skill or reference that answers it; the tables below keep the
decision as it was made.

## Summary

| Decision | Skills | Meaning |
| --- | --- | --- |
| Adopted | 24 | Already built into capsule on the `feat/ecc-adoption` branch. |
| Recommend | 8 | Worth adding; not built yet. |
| Possible | 18 | Could be added, but overlaps something capsule has or serves a narrower need. |
| Fold as reference | 30 | Stack deep-dives: better as an on-demand reference under `coding-standards` than as separate skills. |
| Covered | 53 | Capsule already has a skill that does this job. |
| Out of scope | 195 | Not a fit for a general engineering skill library. |
| **Total** | **328** | |

## Adopted (24)

Already built into capsule on the `feat/ecc-adoption` branch.

| ECC skill | What it is (ECC's description) | In capsule | Reason |
| --- | --- | --- | --- |
| `accessibility` | Design, implement, and audit accessible UI to WCAG 2.2 Level AA across Web, iOS, and Android — semantic ARIA r | `accessibility` skill + `accessibility-reviewer` agent | Capsule had only a few accessibility lines in `coding-standards`; now a WCAG 2.2 AA audit-and-fix skill |
| `agent-harness-construction` | Design and optimize AI agent action spaces, tool definitions, and observation formatting for higher completion | `writing-for-agents` (TOOLS.md) | Capsule had nothing on designing tools an agent calls |
| `agent-security-hardening` | Security hardening guidance for AI agent frameworks that process untrusted content, invoke tools, write worksp | `security-review` (SURFACES.md) | Minimum controls for systems that run agents |
| `ai-regression-testing` | Regression testing strategies for AI-assisted development. Sandbox-mode API testing without database dependenc | `tdd`, `verification-before-completion` | A rule about when a fix counts as done |
| `architecture-decision-records` | Capture architectural decisions as numbered ADR markdown files in docs/adr/ with context, alternatives conside | `decision-records` skill | Nothing in capsule wrote ADRs |
| `benchmark` | Measure performance baselines and detect regressions across browser Core Web Vitals (LCP, INP, CLS, page weigh | `benchmark` skill + `benchmark-auditor` agent | Capsule had no owner for trustworthy measurement |
| `benchmark-optimization-loop` | Turn a user's improvement goal into a bounded benchmark-guided loop: define success and hard constraints, esta | `benchmark` skill + `benchmark-auditor` agent | Capsule had no owner for trustworthy measurement |
| `browser-qa` | Run automated post-deploy UI verification with a browser automation MCP (claude-in-chrome, Playwright, or Pupp | `ship-it` (DEPLOYMENT.md) | Concrete post-deploy checks for a step `ship-it` owns |
| `canary-watch` | Monitors and verifies deployed URLs after releases by checking HTTP endpoints, SSE streams, static assets, con | `ship-it` (DEPLOYMENT.md) | Concrete post-deploy checks for a step `ship-it` owns |
| `change-impact` | Perform evidence-backed impact analysis before changing code, data, interfaces, or governance documents, then | `ship-it`, `adlc-flow` | Taken by the 2026-11-16 upstream sweep |
| `click-path-audit` | Trace every user-facing button/touchpoint through its full state change sequence to find bugs where functions | `diagnosing-bugs`, `code-review` | A UI-state tracing technique inside jobs those skills own |
| `code-tour` | Create CodeTour `.tour` files — persona-targeted, step-by-step walkthroughs with real file and line anchors. U | `codebase-onboarding` skill | Nothing mapped an unfamiliar repository |
| `codebase-onboarding` | Analyze an unfamiliar codebase and generate a structured onboarding guide with architecture map, key entry poi | `codebase-onboarding` skill | Nothing mapped an unfamiliar repository |
| `context-and-decisions` | Govern stable domain context with a narrowly scoped CONTEXT.md when needed, and route hard-to-reverse decision | `decision-records` skill | Its ADR routing is covered; its CONTEXT.md glossary idea is already in `codebase-design` |
| `database-migrations` | Safe, reversible database migration patterns: forward-only production changes, expand-contract zero-downtime r | `database-migrations` skill + `database-migrations-reviewer` agent | Capsule had nothing on migration safety |
| `iterative-retrieval` | Pattern for progressively refining context retrieval to solve the subagent context problem. Use when a subagen | `orchestrate`, `babysit-pr` | Guards for agent loops those skills already run |
| `loop-design-check` | Design a goal-oriented agent loop or review one for failure modes: spinning, Goodhart-gaming the verifier, or | `orchestrate`, `babysit-pr` | Guards for agent loops those skills already run |
| `mcp-dependency-review` | Statically review MCP configuration for mutable package references before approval or CI, without executing di | `security-review` (SURFACES.md) | A supply-chain check for a kind of config file capsule did not cover |
| `module-regression` | Govern cross-module regression in large repositories with a REGRESSION.md ledger that records each module's do | `verification-before-completion` | One rule: rerun downstream consumers |
| `opensource-pipeline` | Open-source pipeline: fork, sanitize, and package private projects for safe public release. Chains 3 agents (f | `security-review-sanitizer` agent | Its sanitizing step became a read-only agent; forking and packaging were not taken |
| `production-audit` | Local-evidence production readiness audit for shipped apps, pre-launch reviews, post-merge checks, and "what b | `production-readiness` skill + `production-readiness-auditor` agent | No "ready to launch?" entry point existed |
| `search-first` | Research-before-coding workflow: search npm/PyPI, MCP servers, skills, and GitHub for existing tools before wr | `implement`, `codebase-design`, `writing-for-agents` | Reuse-before-build as one decision step |
| `skill-host-compat` | Lint ECC skills for Codex/Cursor-safe frontmatter and Claude-only substitutions before a skill PR | `scripts/validate-repo.mjs` | Capsule ships one SKILL.md to several hosts, so the check runs in its validator |
| `skill-scout` | Search existing local, marketplace, GitHub, and web skill sources before creating a new skill. Use when the us | `implement`, `codebase-design`, `writing-for-agents` | Reuse-before-build as one decision step |

## Recommend (8)

Worth adding; not built yet.

| ECC skill | What it is (ECC's description) | In capsule | Reason |
| --- | --- | --- | --- |
| `api-design` | REST API design patterns including resource naming, status codes, pagination, filtering, error responses, vers | New skill `api-design` | REST decisions with real tradeoffs that no capsule skill owns |
| `design-system` | Generate a design system from an existing codebase or audit one for visual consistency: extract tokens (colors | New skill for interface design | Capsule has no interface-design skill; these give concrete, checkable details |
| `e2e-testing` | Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and | New skill `e2e-testing` | End-to-end structure and flaky-test handling, which `tdd` does not cover |
| `i18n-sync` | Translate and synchronize application JSON locale files using source-key usage, project terminology, and focus | Small new skill | Concrete and self-contained; only useful for localized products |
| `make-interfaces-feel-better` | Apply concrete design-engineering details that make interfaces feel polished. Use when reviewing or improving | New skill for interface design | Capsule has no interface-design skill; these give concrete, checkable details |
| `mysql-patterns` | MySQL and MariaDB schema, query, indexing, transaction, replication, and connection-pool patterns for producti | Reference under `database-migrations`, or a `database-design` skill | Compact, specific index, type, and query guidance |
| `postgres-patterns` | PostgreSQL database patterns for query optimization, schema design, indexing, and security. Based on Supabase | Reference under `database-migrations`, or a `database-design` skill | Compact, specific index, type, and query guidance |
| `react-performance` | React and Next.js performance optimization patterns adapted from Vercel Engineering's React Best Practices (ht | Reference under `performance` | A prioritized React and Next.js rule set adapted from Vercel (MIT) |

## Possible (18)

Could be added, but overlaps something capsule has or serves a narrower need.

| ECC skill | What it is (ECC's description) | In capsule | Reason |
| --- | --- | --- | --- |
| `agent-architecture-audit` | Full-stack diagnostic for agent and LLM applications. Audits the 12-layer agent stack for wrapper regression, | A later skill for building LLM features | Useful only for projects that build on LLMs |
| `agent-eval` | Head-to-head comparison of coding agents (Claude Code, Aider, Codex, etc.) on custom tasks with pass rate, cos | A later skill for building LLM features | Useful only for projects that build on LLMs |
| `backend-patterns` | Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, | Fold missing points into `coding-standards` references | Overlaps `BACKEND.md` and `FRONTEND.md` |
| `clickhouse-io` | ClickHouse database patterns, query optimization, analytics, and data engineering best practices for high-perf | Reference beside the database material | No overlap, but narrow |
| `content-hash-cache-pattern` | Cache expensive file processing results using SHA-256 content hashes — path-independent, auto-invalidating, wi | Reference beside the database material | No overlap, but narrow |
| `cost-aware-llm-pipeline` | Cost optimization patterns for LLM API usage — model routing by task complexity, budget tracking, retry logic, | A later skill for building LLM features | Useful only for projects that build on LLMs |
| `deployment-patterns` | Deployment workflows, CI/CD pipeline patterns, Docker containerization, health checks, rollback strategies, an | One skill for containers and deploys | `production-readiness` reviews these but does not build them |
| `docker-patterns` | Docker and Docker Compose patterns for local development, hardened CLI installer harnesses, container security | One skill for containers and deploys | `production-readiness` reviews these but does not build them |
| `error-handling` | Patterns for robust error handling across TypeScript, Python, and Go. Covers typed errors, error boundaries, r | Reference under `coding-standards` | Overlaps the `code-review-silent-failures` agent and the rules |
| `eval-harness` | Eval-driven development (EDD) framework for AI coding sessions — define capability and regression evals before | A later skill for building LLM features | Useful only for projects that build on LLMs |
| `frontend-patterns` | Frontend development patterns for React, Next.js, state management, performance optimization, and UI best prac | Fold missing points into `coding-standards` references | Overlaps `BACKEND.md` and `FRONTEND.md` |
| `kubernetes-patterns` | Kubernetes workload patterns, resource management, RBAC, probes, autoscaling, ConfigMap/Secret handling, and k | One skill for containers and deploys | `production-readiness` reviews these but does not build them |
| `mcp-server-patterns` | Build MCP servers with Node/TypeScript SDK — tools, resources, prompts, Zod validation, stdio vs Streamable HT | Reference beside `writing-for-agents` TOOLS.md | TOOLS.md covers tool design; building a server is narrower and SDK-specific |
| `product-lens` | Validate the why before building through four product diagnostics — a YC-style product diagnostic that produce | `grilling` or a product-validation skill | Validates the "why" before building; `grilling` covers part of it |
| `prompt-caching-strategy` | Optimize LLM prompt caching hit rate to reduce API costs and improve latency | A later skill for building LLM features | Useful only for projects that build on LLMs |
| `redis-patterns` | Redis data structure patterns, caching strategies, distributed locks, rate limiting, pub/sub, and connection m | Reference beside the database material | No overlap, but narrow |
| `regex-vs-llm-structured-text` | Decision framework for parsing structured text (quizzes, forms, invoices, receipts, tables) with a hybrid rege | A later skill for building LLM features | Useful only for projects that build on LLMs |
| `terraform-patterns` | Terraform and OpenTofu infrastructure-as-code patterns for project layout, remote state, modules, variables, s | One skill for containers and deploys | `production-readiness` reviews these but does not build them |

## Fold as reference (30)

Stack deep-dives: better as an on-demand reference under `coding-standards` than as separate skills.

| ECC skill | What it is (ECC's description) | In capsule | Reason |
| --- | --- | --- | --- |
| `csharp-testing` | C# and .NET testing patterns with xUnit, FluentAssertions, mocking, integration tests, and test organization b | Reference under `coding-standards` (C#) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `django-celery` | Django + Celery async task patterns — configuration, task design, beat scheduling, retries, canvas workflows, | Reference under `coding-standards` (Python) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `django-patterns` | Django architecture patterns, REST API design with DRF, ORM best practices, caching, signals, middleware, and | Reference under `coding-standards` (Python) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `django-security` | Django security best practices, authentication, authorization, CSRF protection, SQL injection prevention, XSS | Reference under `coding-standards` (Python) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `django-tdd` | Django testing strategies with pytest-django, TDD methodology, factory_boy, mocking, coverage, and testing Dja | Reference under `coding-standards` (Python) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `django-verification` | Run the full Django verification loop — environment check, mypy/ruff/black linting, migration safety, pytest w | Reference under `coding-standards` (Python) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `dotnet-patterns` | Idiomatic C# and .NET patterns, conventions, dependency injection, async/await, and best practices for buildin | Reference under `coding-standards` (C#) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `fastapi-patterns` | FastAPI best practices covering project structure, Pydantic v2 schemas, dependency injection, async handlers, | Reference under `coding-standards` (Python) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `golang-patterns` | Idiomatic Go patterns, best practices, and conventions for building robust, efficient, and maintainable Go app | Reference under `coding-standards` (Go) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `golang-testing` | Go testing patterns including table-driven tests, subtests, benchmarks, fuzzing, and test coverage. Follows TD | Reference under `coding-standards` (Go) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `java-coding-standards` | Java coding standards for Spring Boot and Quarkus services: naming, immutability, Optional usage, streams, exc | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `jpa-patterns` | JPA/Hibernate patterns for entity design, relationships, query optimization, transactions, auditing, indexing, | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `mybatis-patterns` | MyBatis and MyBatis-Spring patterns for mapper design, XML and annotation SQL, result mapping, dynamic SQL saf | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `nestjs-patterns` | NestJS architecture patterns for modules, controllers, providers, DTO validation, guards, interceptors, config | Reference under `coding-standards` (TypeScript) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `nextjs-turbopack` | Next.js 16+ and Turbopack guidance — incremental Rust bundling, file-system caching, faster dev startup and HM | Reference under `coding-standards` (React) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `prisma-patterns` | Prisma ORM patterns for TypeScript backends — schema design, query optimization, transactions, pagination, and | Reference under `coding-standards` (TypeScript) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `python-patterns` | Pythonic idioms, PEP 8 standards, type hints, and best practices for building robust, efficient, and maintaina | Reference under `coding-standards` (Python) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `python-testing` | Python testing strategies using pytest, TDD methodology, fixtures, mocking, parametrization, and coverage requ | Reference under `coding-standards` (Python) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `quarkus-patterns` | Quarkus 3.x LTS architecture patterns with Camel for messaging, RESTful API design, CDI services, data access | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `quarkus-security` | Quarkus security implementation patterns: JWT and OIDC authentication, @RolesAllowed RBAC and SecurityIdentity | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `quarkus-tdd` | Test-driven development for Quarkus 3.x LTS using JUnit 5, Mockito, REST Assured, Camel testing, and JaCoCo. U | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `quarkus-verification` | Verification loop for Quarkus projects: build, static analysis (Checkstyle, PMD, SpotBugs), tests with JaCoCo | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `react-patterns` | React 18/19 patterns including hooks discipline, server/client component boundaries, Suspense + error boundari | Reference under `coding-standards` (React) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `react-testing` | React component testing with React Testing Library, Vitest/Jest, MSW for network mocking, accessibility assert | Reference under `coding-standards` (React) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `springboot-patterns` | Spring Boot architecture patterns, REST API design, layered services, data access, caching, async processing, | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `springboot-security` | Spring Security best practices for authn/authz, validation, CSRF, secrets, headers, rate limiting, and depende | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `springboot-tdd` | Test-driven development for Spring Boot using JUnit 5, Mockito, MockMvc, Testcontainers, and JaCoCo. Use when | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `springboot-verification` | Run the full Spring Boot verification loop — Maven or Gradle build, SpotBugs, PMD, and Checkstyle static analy | Reference under `coding-standards` (Java) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `typescript-patterns` | TypeScript patterns for strict, type-safe, maintainable code in modern TypeScript and JavaScript applications | Reference under `coding-standards` (TypeScript) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |
| `vite-patterns` | Vite build tool patterns including config, plugins, HMR, env variables, proxy setup, SSR, library mode, depend | Reference under `coding-standards` (React) | Catalogue of idioms that repeats the stack rules capsule now ships; better as an on-demand reference than as a skill |

## Covered (53)

Capsule already has a skill that does this job.

| ECC skill | What it is (ECC's description) | In capsule | Reason |
| --- | --- | --- | --- |
| `agent-introspection-debugging` | Structured self-debugging workflow for AI agent failures using capture, diagnosis, contained recovery, and int | `skill-evolve`, `writing-for-agents` | Evidence-gated skill improvement is owned there |
| `agent-self-evaluation` | Use after completing any non-trivial task. The agent self-rates its output on 5 axes — accuracy, completeness, | `skill-evolve`, `writing-for-agents` | Evidence-gated skill improvement is owned there |
| `api-connector-builder` | Build a new API connector or provider by matching the target repo's existing integration pattern exactly. Use | `implement` | Matching an existing pattern is part of framing a change |
| `article-writing` | Write articles, guides, blog posts, tutorials, newsletter issues, and other long-form content in a distinctive | `writing-for-humans` | Same job |
| `autonomous-loops` | Patterns and architectures for autonomous Claude Code loops — from simple sequential pipelines to RFC-driven m | `orchestrate` | Delegation, parallel lanes, and loop control are owned there |
| `blueprint` | Turn a one-line objective into a step-by-step construction plan for multi-session, multi-agent engineering pro | `planning-and-task-breakdown` | Same job |
| `brownfield-retrospective` | Run the ECC engineering process retroactively against an existing project slice. Audit current state, reconstr | `adlc-spec` + `adlc-spec-miner`, `production-readiness` | Auditing an existing slice and recovering its spec are covered |
| `coding-standards` | Baseline cross-project coding conventions for naming, readability, immutability, and code-quality review. Use | `coding-standards` | Same job; capsule puts the project conventions first |
| `continuous-agent-loop` | Patterns for continuous autonomous agent loops with quality gates, evals, and recovery controls. Use when runn | `orchestrate` | Delegation, parallel lanes, and loop control are owned there |
| `continuous-learning` | [DEPRECATED - use continuous-learning-v2] Legacy v1 stop-hook skill extractor. v2 is a strict superset with in | `skill-evolve`, `writing-for-agents` | Evidence-gated skill improvement is owned there |
| `continuous-learning-v2` | Instinct-based learning system that observes sessions via hooks, creates atomic instincts with confidence scor | `skill-evolve`, `writing-for-agents` | Evidence-gated skill improvement is owned there |
| `contract-first` | Coordinate frontend/backend or service-to-service work through one authoritative machine-checkable contract (O | `api-design`, `codebase-design` | Boundaries, dependency direction, and contracts are owned there |
| `conventional-commit-review` | Reviews staged changes and drafts a Conventional Commits-compliant commit message with the right type, scope, | `git-workflow` | Same job |
| `council` | Convene a four-voice council for ambiguous decisions, tradeoffs, and go/no-go calls. Use when multiple valid p | `code-review` deep mode, `grilling` | Deep review already runs independent passes and an optional second-model reviewer |
| `council-multi-model` | Add one optional external Codex critique after the existing council has produced a decision draft. Use when an | `code-review` deep mode, `grilling` | Deep review already runs independent passes and an optional second-model reviewer |
| `deep-research` | Produce cited research reports from multiple web sources using firecrawl and exa MCP tools — plan sub-question | `research` | Same job; these depend on specific search tools |
| `dev-team` | Simulate a collaborative dev team session where multiple role-based personas (PM, Architect, Developer, QA) re | `code-review` deep mode, `grilling` | Deep review already runs independent passes and an optional second-model reviewer |
| `docs-governance` | Route broad documentation-governance requests to existing ECC skills and run an opt-in, read-only audit of map | `compound-learnings`, `decision-records` | Durable project knowledge is owned there |
| `documentation-lookup` | Use up-to-date library and framework docs via Context7 MCP instead of training data. Activates for setup quest | `research` | Same job; these depend on specific search tools |
| `dynamic-workflow-mode` | Design task-local harnesses, eval gates, and reusable skill extraction for Claude dynamic workflow mode and ot | `orchestrate` | Delegation, parallel lanes, and loop control are owned there |
| `exa-search` | Neural search via Exa MCP for web, code, and company research. Use when the user needs web search, code exampl | `research` | Same job; these depend on specific search tools |
| `frontend-a11y` | Accessibility patterns for React and Next.js — semantic HTML, ARIA attributes, form labeling, keyboard navigat | `accessibility` | Same job, narrower (React only) |
| `git-workflow` | Git workflow patterns including branching strategies, commit conventions, keeping history clean and readable, | `git-workflow` | Same job |
| `github-ops` | GitHub repository operations, automation, and management. Issue triage, PR management, CI/CD operations, relea | `babysit-pr`, `git-workflow`, `pr-description` | Capsule splits repository operations across these |
| `hexagonal-architecture` | Design, implement, and refactor Ports & Adapters systems with clear domain boundaries, dependency inversion, a | `codebase-design` | Boundaries, dependency direction, and contracts are owned there |
| `inherit-legacy-style` | Prevent AI style drift on legacy projects by scanning the codebase for implicit conventions, resolving conflic | `coding-standards` | Same job; capsule puts the project conventions first |
| `intent-driven-development` | Turn ambiguous or high-impact product and engineering changes into scoped, verifiable acceptance criteria befo | `adlc-intent`, `adlc-spec`, `adlc-plan` | The ADLC suite already turns intent into acceptance criteria and a plan |
| `issue-review` | Review a GitHub issue the way /code-review reviews a PR. Fetches the issue with the gh CLI, checks the report | `research`, `code-review` | Upstream sweep judged it added nothing those lack |
| `living-docs-governance` | Keep a long-lived project's documentation from rotting by assigning existing project docs clear constitution, | `compound-learnings`, `decision-records` | Durable project knowledge is owned there |
| `module-governance` | Establish or maintain a business module's local agent instructions, domain-context links, and interface owners | `codebase-design` | Boundaries, dependency direction, and contracts are owned there |
| `orch-add-feature` | Orchestrate building a brand-new feature end to end — research, plan, TDD implementation, review, and gated co | `orchestrate` with `implement`, `tdd`, `code-review` | Capsule composes these skills instead of one pipeline per task type |
| `orch-build-mvp` | Orchestrate bootstrapping a working MVP from a design or spec document — ingest the SDD/PRD, plan thin vertica | `orchestrate` with `implement`, `tdd`, `code-review` | Capsule composes these skills instead of one pipeline per task type |
| `orch-change-feature` | Orchestrate altering an existing, working feature to new desired behavior — update its tests to the new spec, | `orchestrate` with `implement`, `tdd`, `code-review` | Capsule composes these skills instead of one pipeline per task type |
| `orch-fix-defect` | Orchestrate fixing a bug — reproduce it as a failing regression test, fix to green, review, and gated commit — | `orchestrate` with `implement`, `tdd`, `code-review` | Capsule composes these skills instead of one pipeline per task type |
| `orch-pipeline` | Shared orchestration engine behind the orch-* skill family — the gated Research-Plan-TDD-Review-Commit pipelin | `orchestrate` with `implement`, `tdd`, `code-review` | Capsule composes these skills instead of one pipeline per task type |
| `orch-refine-code` | Orchestrate a behavior-preserving refactor — confirm tests are green, restructure without changing behavior, k | `orchestrate` with `implement`, `tdd`, `code-review` | Capsule composes these skills instead of one pipeline per task type |
| `parallel-execution-optimizer` | Speed up a task by turning it into a dependency graph of parallel lanes with a lane matrix, batched reads and | `orchestrate` | Delegation, parallel lanes, and loop control are owned there |
| `plan-orchestrate` | Read a plan document, decompose it into steps, classify each step, and emit the ready-to-paste ECC slash comma | `planning-and-task-breakdown` | Same job |
| `product-capability` | Translate PRD intent, roadmap asks, or product discussions into an implementation-ready capability plan that e | `adlc-intent`, `adlc-spec`, `adlc-plan` | The ADLC suite already turns intent into acceptance criteria and a plan |
| `prompt-optimizer` | Analyze draft prompts, detect intent and missing context, match ECC commands, skills, and agents, and output a | `skill-evolve`, `writing-for-agents` | Evidence-gated skill improvement is owned there |
| `ralphinho-rfc-pipeline` | Split an RFC into a multi-agent execution DAG — decompose into work units with dependencies and acceptance tes | `orchestrate` | Delegation, parallel lanes, and loop control are owned there |
| `research-ops` | Evidence-first current-state research workflow for ECC. Use when the user wants fresh facts, comparisons, enri | `research` | Same job; these depend on specific search tools |
| `rules-distill` | Scan skills to extract cross-cutting principles and distill them into rules — append, revise, or create new ru | `skill-evolve`, `writing-for-agents` | Evidence-gated skill improvement is owned there |
| `santa-method` | Multi-agent adversarial verification: two independent reviewers with the same rubric must both pass before out | `code-review` deep mode, `grilling` | Deep review already runs independent passes and an optional second-model reviewer |
| `security-review` | Security review checklist and patterns for adding authentication, handling user input, managing secrets, creat | `security-review` | Same job; capsule traces concrete abuse paths rather than a checklist |
| `skill-comply` | Visualize whether skills, rules, and agent definitions are actually followed — auto-generates scenarios at 3 p | `skill-evolve`, `writing-for-agents` | Evidence-gated skill improvement is owned there |
| `skill-stocktake` | Use when auditing Claude skills and commands for quality. Supports Quick Scan (changed skills only) and Full S | `skill-evolve`, `writing-for-agents` | Evidence-gated skill improvement is owned there |
| `story-lifecycle` | Manage a file-based epic → story → sprint development loop without requiring an external project management to | `sprint-planning` | Same ground |
| `tdd-workflow` | Test-driven development workflow: write a failing test first, watch it fail, implement the smallest change to | `tdd` | Same job; capsule follows the project coverage threshold instead of a fixed 80% |
| `team-agent-orchestration` | Run team-based orchestration for agent squads: work items with owners and scope, agent Kanban state, branch is | `orchestrate` | Delegation, parallel lanes, and loop control are owned there |
| `test-collaboration` | Inventory and govern a project's test assets. Connect requirements, business rules, risks, bugs, and cross-bou | `tdd`, `verification-before-completion` | Test registries and regression evidence are owned there |
| `unified-memory` | Share durable, inspectable context and handoffs between Claude, Codex, Hermes, Cursor, OpenCode, and other age | `handoff` | Task state across sessions and agents is owned there |
| `verification-loop` | Run a six-phase verification of a Claude Code session's work — build, type check, lint, tests with coverage, s | `verification-before-completion` | Same job; capsule ties the evidence to each claim instead of running a fixed checklist |

## Out of scope (195)

Not a fit for a general engineering skill library.

| ECC skill | What it is (ECC's description) | In capsule | Reason |
| --- | --- | --- | --- |
| `agent-payment-x402` | Add x402 payment execution to AI agents with per-task budgets, spending controls, and non-custodial wallets. S | — | Single industry or specialist domain |
| `agent-runtime-gateway-smoke-test` | Verify a local agent API, temporary gateway tunnel, and remote sandbox callback with a tool-free task, then re | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `agent-sort` | Build an evidence-backed ECC install plan for a specific repo by sorting skills, commands, rules, hooks, and e | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `agentic-engineering` | Operate as an agentic engineer using eval-first execution, decomposition, and cost-aware model routing. Use wh | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `agentic-os` | Build persistent multi-agent operating systems on Claude Code. Covers kernel architecture, specialist agents, | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `ai-first-engineering` | Engineering operating model for teams where AI agents generate a large share of implementation output. Use whe | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `android-clean-architecture` | Clean Architecture patterns for Android and Kotlin Multiplatform projects — module structure, dependency rules | — | Language, framework, or platform outside the seven stacks capsule targets |
| `angular-developer` | Generates Angular code and provides architectural guidance. Trigger when creating projects, components, or ser | — | Language, framework, or platform outside the seven stacks capsule targets |
| `automation-audit-ops` | Evidence-first automation inventory and overlap audit workflow for ECC. Use when the user wants to know which | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `autonomous-agent-harness` | Transform Claude Code into a fully autonomous agent system with persistent memory, scheduled operations, compu | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `benchmark-methodology` | Score a scoped competitor set into comparable profile cards: nine weighted dimensions (positioning, voice, vis | — | Business, marketing, or operations work, not software engineering |
| `bengali-nlp` | Bengali (Bangla) text processing patterns including Unicode normalization, script detection, tokenization, con | — | Single industry or specialist domain |
| `blender-motion-state-inspection` | Inspects Blender characters, rigs, poses, animation retargeting, ground contact, facing direction, or model-vs | — | Media production or an ECC-specific design direction |
| `brand-discovery` | Run a structured, resumable multi-session brand identity interview across 8 modules (purpose, positioning, aud | — | Business, marketing, or operations work, not software engineering |
| `brand-voice` | Build a source-derived writing style profile from real posts, essays, launch notes, docs, or site copy, then r | — | Business, marketing, or operations work, not software engineering |
| `bun-runtime` | Bun as runtime, package manager, bundler, and test runner. When to choose Bun vs Node, migration notes, and Ve | — | Language, framework, or platform outside the seven stacks capsule targets |
| `carrier-relationship-management` | Manage truckload, LTL, and intermodal carrier portfolios: sourcing and FMCSA vetting, freight rate and fuel-su | — | Single industry or specialist domain |
| `cisco-ios-patterns` | Cisco IOS and IOS-XE review patterns for show commands, config hierarchy, wildcard masks, ACL placement, inter | — | Single industry or specialist domain |
| `ck` | Persistent per-project memory for Claude Code (Context Keeper) driven by deterministic Node.js /ck commands: i | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `codehealth-mcp` | Real-time structural Code Health via CodeScene MCP — review before edits, verify score deltas after changes, g | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `competitive-platform-analysis` | Use when scoping a competitive landscape — identifying, categorising, and score-filtering a competitor set bef | — | Business, marketing, or operations work, not software engineering |
| `competitive-report-structure` | Assemble scored competitor profile cards (from benchmark-methodology) into a decision-grade competitive report | — | Business, marketing, or operations work, not software engineering |
| `compose-multiplatform-patterns` | Compose Multiplatform and Jetpack Compose patterns for KMP projects — state management, navigation, theming, p | — | Language, framework, or platform outside the seven stacks capsule targets |
| `config-gc` | Garbage collection for your Claude Code configuration. Periodically scans ~/.claude (skills, memory, hooks, pe | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `config-health` | Runtime configuration integrity monitoring for Claude Code. Detects config drift, rule staleness, and hook wir | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `configure-ecc` | Run the conversational ECC setup wizard inside the current harness: inventory the install, collect scope (user | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `connections-optimizer` | Reorganize the user's X and LinkedIn network with review-first pruning, add/follow recommendations, and channe | — | Business, marketing, or operations work, not software engineering |
| `content-engine` | Create platform-native content systems for X, LinkedIn, TikTok, YouTube, newsletters, and repurposed multi-pla | — | Business, marketing, or operations work, not software engineering |
| `context-budget` | Routes live context checks to the native Codex or Claude Code meter without scanning files, and performs a bou | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `cost-tracking` | Track and report Claude Code token usage, spending, and budgets from the local ECC cost-tracker metrics log. U | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `counterparty-channel-discipline` | Per-channel strict prompts, mention gating, silent observation, and a communication autonomy policy for agents | — | Business, marketing, or operations work, not software engineering |
| `cpp-coding-standards` | C++ coding standards based on the C++ Core Guidelines (isocpp.github.io). Use when writing, reviewing, or refa | — | Language, framework, or platform outside the seven stacks capsule targets |
| `cpp-testing` | Use only when writing/updating/fixing C++ tests, configuring GoogleTest/CTest, diagnosing failing or flaky tes | — | Language, framework, or platform outside the seven stacks capsule targets |
| `crosspost` | Multi-platform content distribution across X, LinkedIn, Threads, and Bluesky. Adapts content per platform usin | — | Business, marketing, or operations work, not software engineering |
| `customer-billing-ops` | Operate customer billing workflows such as subscriptions, refunds, churn triage, billing-portal recovery, and | — | Business, marketing, or operations work, not software engineering |
| `customs-trade-compliance` | Codified customs and trade compliance expertise — HS/HTS tariff classification with GRI rules, commercial invo | — | Single industry or specialist domain |
| `dart-flutter-patterns` | Production-ready Dart and Flutter patterns covering null safety, immutable state with Freezed, async compositi | — | Language, framework, or platform outside the seven stacks capsule targets |
| `dashboard-builder` | Build monitoring dashboards that answer real operator questions for Grafana, SigNoz, and similar platforms. Us | — | Single industry or specialist domain |
| `data-scraper-agent` | Build a fully automated AI-powered data collection agent for any public source — job boards, prices, news, Git | — | Single industry or specialist domain |
| `data-throughput-accelerator` | Diagnose and accelerate large data movement — ingestion, backfill, export, ETL, warehouse loading, manifest ca | — | Single industry or specialist domain |
| `deepseek-harness-setup` | Install and operate Everything Claude Code (ECC) on the DeepSeek Harness (DSH): native skill roots (~/.dsh/ski | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `defi-amm-security` | Security checklist for Solidity AMM contracts, liquidity pools, and swap flows. Covers reentrancy, CEI orderin | — | Single industry or specialist domain |
| `delivery-gate` | Stop hook that blocks Claude from finishing until quality checks pass. Detects rationalization patterns (surfa | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `devfleet` | Orchestrate multi-agent coding tasks via Claude DevFleet — plan projects, dispatch parallel agents in isolated | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `dmux-workflows` | Multi-agent orchestration using dmux (tmux pane manager for AI agents). Patterns for parallel agent workflows | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `ecc-contribution-review` | Prepare an ECC skill contribution for review by organizing repository, install-surface, cross-harness, validat | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `ecc-guide` | Answer questions about ECC by reading the live repo surface — agents, skills, commands, hooks, rules, install | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `ecc-recipes` | Map a described workflow to the right ECC command group with run-order and stop condition, or browse all comma | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `ecc-tools-cost-audit` | Evidence-first ECC Tools burn and billing audit workflow. Use when investigating runaway PR creation, quota by | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `email-ops` | Evidence-first mailbox triage, drafting, send verification, and sent-mail-safe follow-up workflow for ECC. Use | — | Business, marketing, or operations work, not software engineering |
| `energy-procurement` | Procure electricity and natural gas for commercial and industrial facilities: tariff and rate-schedule optimiz | — | Single industry or specialist domain |
| `enterprise-agent-ops` | Operational controls for long-lived or cloud-hosted agent systems — runtime lifecycle (start, pause, stop, res | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `esign-field-placement` | Deterministic method for placing signature, date, and text fields in a web e-signature composer through a brow | — | Single industry or specialist domain |
| `evm-token-decimals` | Prevent silent decimal mismatch bugs across EVM chains. Covers runtime decimal lookup, chain-aware caching, br | — | Single industry or specialist domain |
| `fal-ai-media` | Unified media generation via fal.ai MCP — image, video, and audio. Covers text-to-image (Nano Banana), text/im | — | Media production or an ECC-specific design direction |
| `finance-billing-ops` | Evidence-first revenue, pricing, refunds, team-billing, and billing-model truth workflow for ECC. Use when the | — | Business, marketing, or operations work, not software engineering |
| `flox-environments` | Create reproducible, cross-platform (macOS/Linux) development environments with Flox, a declarative Nix-based | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `flutter-dart-code-review` | Library-agnostic Flutter/Dart code review checklist covering widget best practices, state management patterns | — | Language, framework, or platform outside the seven stacks capsule targets |
| `foundation-models-on-device` | Apple FoundationModels framework for on-device LLM — text generation, guided generation with @Generable, tool | — | Language, framework, or platform outside the seven stacks capsule targets |
| `frontend-design-direction` | Set an ECC-specific frontend design direction for production UI work. Use when building or improving websites, | — | Media production or an ECC-specific design direction |
| `frontend-slides` | Create stunning, animation-rich HTML presentations from scratch or by converting PowerPoint files. Use when th | — | Media production or an ECC-specific design direction |
| `fsharp-testing` | F# testing patterns with xUnit, FsUnit, Unquote, FsCheck property-based testing, integration tests, and test o | — | Language, framework, or platform outside the seven stacks capsule targets |
| `gan-style-harness` | GAN-inspired Generator-Evaluator agent harness for building high-quality applications autonomously. Based on A | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `gateguard` | PreToolUse fact-forcing gate that denies the first Edit/Write/Bash (including MultiEdit and NotebookEdit) atte | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `generating-python-installer` | Commercial-grade Python installer expert for Windows: Nuitka extreme compilation, dist slimming, DLL footprint | — | Language, framework, or platform outside the seven stacks capsule targets |
| `godot-patterns` | Idiomatic Godot 4 GDScript patterns - static typing, scene and node design, signals, resources, autoloads, inp | — | Language, framework, or platform outside the seven stacks capsule targets |
| `godot-testing` | Testing Godot 4 GDScript projects - a zero-dependency headless check scene, gdUnit4 and GUT suites, scene-runn | — | Language, framework, or platform outside the seven stacks capsule targets |
| `google-workspace-ops` | Operate across Google Drive, Docs, Sheets, and Slides as one workflow surface for plans, trackers, decks, and | — | Business, marketing, or operations work, not software engineering |
| `growth-log` | Write growth log entries that extract reusable patterns from completed work — root cause, transferable rule, a | — | Business, marketing, or operations work, not software engineering |
| `healthcare-cdss-patterns` | Clinical Decision Support System (CDSS) development patterns. Drug interaction checking, dose validation, clin | — | Single industry or specialist domain |
| `healthcare-emr-patterns` | EMR/EHR development patterns for healthcare applications. Clinical safety, encounter workflows, prescription g | — | Single industry or specialist domain |
| `healthcare-eval-harness` | Patient safety evaluation harness for healthcare application deployments. Automated test suites for CDSS accur | — | Single industry or specialist domain |
| `healthcare-phi-compliance` | Protected Health Information (PHI) and PII compliance patterns for healthcare applications: data classificatio | — | Single industry or specialist domain |
| `hermes-imports` | Convert local Hermes operator workflows into sanitized ECC skills and release-pack artifacts. Use when prepari | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `hipaa-compliance` | HIPAA-specific entrypoint for healthcare privacy and security work. Use when a task is explicitly framed aroun | — | Single industry or specialist domain |
| `homelab-network-readiness` | Readiness checklist for homelab VLAN segmentation, local DNS filtering (Pi-hole, AdGuard Home), and WireGuard- | — | Single industry or specialist domain |
| `homelab-network-setup` | Practical home and homelab network planning for gateways, switches, access points, IP ranges, DHCP reservation | — | Single industry or specialist domain |
| `homelab-pihole-dns` | Pi-hole installation, blocklist management, DNS-over-HTTPS setup, DHCP integration, local DNS records, and tro | — | Single industry or specialist domain |
| `homelab-vlan-segmentation` | Segmenting home networks into VLANs for IoT, guest, trusted, and server traffic using UniFi, pfSense/OPNsense, | — | Single industry or specialist domain |
| `homelab-wireguard-vpn` | WireGuard VPN server setup, peer configuration, key generation, split tunneling vs full tunnel routing, and re | — | Single industry or specialist domain |
| `hookify-rules` | Create and configure hookify rules — markdown files with YAML frontmatter that match bash, file, prompt, or st | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `inventory-demand-planning` | Codified demand planning expertise for multi-location retailers: demand forecasting method selection, ABC/XYZ | — | Single industry or specialist domain |
| `investor-materials` | Create and update pitch decks, one-pagers, investor memos, accelerator applications, financial models, and fun | — | Business, marketing, or operations work, not software engineering |
| `investor-outreach` | Draft cold emails, warm intro blurbs, follow-ups, update emails, and investor communications for fundraising | — | Business, marketing, or operations work, not software engineering |
| `ios-icon-gen` | Generate iOS app icons as PNG imagesets for Xcode asset catalogs from SF Symbols (5000+ Apple-native) or Iconi | — | Language, framework, or platform outside the seven stacks capsule targets |
| `ito-baskets` | Read-only Itô basket and prediction-market data skill. Index the live basket catalog, compare a basket against | — | Single industry or specialist domain |
| `ito-compute` | Query live GPU inventory, submit an authenticated Itô fixed-rate RFQ, inspect RFQ or procurement status, revok | — | Single industry or specialist domain |
| `ito-inference` | Inspect the availability of model serving on a completed Itô compute booking and, when the canonical backend b | — | Single industry or specialist domain |
| `ito-training` | Inspect the availability of ML training on a completed Itô compute booking and, when the canonical backend bec | — | Single industry or specialist domain |
| `jira-integration` | Retrieves Jira tickets, analyzes requirements, updates ticket status, adds comments, or transitions issues via | — | Business, marketing, or operations work, not software engineering |
| `knowledge-ops` | Knowledge base management, ingestion, sync, and retrieval across multiple storage layers (local files, MCP mem | — | Business, marketing, or operations work, not software engineering |
| `kotlin-coroutines-flows` | Kotlin Coroutines and Flow patterns for Android and KMP — structured concurrency, Flow operators, StateFlow, e | — | Language, framework, or platform outside the seven stacks capsule targets |
| `kotlin-exposed-patterns` | JetBrains Exposed ORM patterns including DSL queries, DAO pattern, transactions, HikariCP connection pooling, | — | Language, framework, or platform outside the seven stacks capsule targets |
| `kotlin-ktor-patterns` | Ktor server patterns including routing DSL, plugins, authentication, Koin DI, kotlinx.serialization, WebSocket | — | Language, framework, or platform outside the seven stacks capsule targets |
| `kotlin-patterns` | Idiomatic Kotlin patterns, best practices, and conventions for building robust, efficient, and maintainable Ko | — | Language, framework, or platform outside the seven stacks capsule targets |
| `kotlin-testing` | Kotlin testing patterns with Kotest, MockK, coroutine testing, property-based testing, and Kover coverage. Fol | — | Language, framework, or platform outside the seven stacks capsule targets |
| `laravel-patterns` | Laravel architecture patterns, routing/controllers, Eloquent ORM, service layers, queues, events, caching, and | — | Language, framework, or platform outside the seven stacks capsule targets |
| `laravel-plugin-discovery` | Discover and evaluate Laravel packages via LaraPlugins.io MCP. Use when the user wants to find plugins, check | — | Language, framework, or platform outside the seven stacks capsule targets |
| `laravel-security` | Laravel security best practices — authentication, authorization, Eloquent safety, CSRF, XSS prevention, API se | — | Language, framework, or platform outside the seven stacks capsule targets |
| `laravel-tdd` | Laravel testing strategies with PHPUnit, Pest, model factories, HTTP tests, Sanctum authentication testing, mo | — | Language, framework, or platform outside the seven stacks capsule targets |
| `laravel-verification` | Verification loop for Laravel projects: env checks, linting, static analysis, tests with coverage, security sc | — | Language, framework, or platform outside the seven stacks capsule targets |
| `latency-critical-systems` | Optimize and verify latency-sensitive systems — realtime dashboards, market data feeds, streaming agents, exec | — | Single industry or specialist domain |
| `lead-intelligence` | AI-native lead intelligence and outreach pipeline. Replaces Apollo, Clay, and ZoomInfo with agent-powered sign | — | Business, marketing, or operations work, not software engineering |
| `leanrea` | Reverse engineers shipped software with bounded local CLI inspection. Covers PE headers, Electron archives, cu | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `liquid-glass-design` | iOS 26 Liquid Glass design system — dynamic glass material with blur, reflection, and interactive morphing for | — | Language, framework, or platform outside the seven stacks capsule targets |
| `llm-trading-agent-security` | Security patterns for autonomous trading agents with wallet or transaction authority. Covers prompt injection, | — | Single industry or specialist domain |
| `logistics-exception-management` | Codified freight-exception handling expertise for shipment delays, damages, losses, shortages, and carrier dis | — | Single industry or specialist domain |
| `mailtrap-email-integration` | Guides agents through integrating transactional email sending via Mailtrap's Email API, including sandbox test | — | Language, framework, or platform outside the seven stacks capsule targets |
| `manim-video` | Build reusable Manim explainers for technical concepts, graphs, system diagrams, and product walkthroughs, the | — | Media production or an ECC-specific design direction |
| `market-research` | Conduct market research, competitive analysis, investor due diligence, and industry intelligence with source a | — | Business, marketing, or operations work, not software engineering |
| `marketing-campaign` | End-to-end marketing campaign planning and execution. Covers audience research, positioning, campaign angle de | — | Business, marketing, or operations work, not software engineering |
| `master-agreement-generator` | Generate review drafts of counterparty master agreements from one template plus a JSON spec, with role-selecte | — | Single industry or specialist domain |
| `messages-ops` | Evidence-first live messaging workflow for ECC. Use when the user wants to read texts or DMs, recover a recent | — | Business, marketing, or operations work, not software engineering |
| `ml-adoption-playbook` | End-to-end methodology for AI agents and software engineers to add machine learning algorithms to existing non | — | Single industry or specialist domain |
| `mle-workflow` | Production machine-learning engineering workflow for data contracts, reproducible training, model evaluation, | — | Single industry or specialist domain |
| `motion-advanced` | Advanced motion patterns for React / Next.js — drag & drop, gestures, text animations, SVG path drawing, custo | — | Language, framework, or platform outside the seven stacks capsule targets |
| `motion-foundations` | Motion tokens, spring presets, performance rules, device adaptation, accessibility enforcement, and SSR safety | — | Language, framework, or platform outside the seven stacks capsule targets |
| `motion-patterns` | Production-ready animation patterns for React / Next.js — button, modal, toast, stagger, page transitions, exi | — | Language, framework, or platform outside the seven stacks capsule targets |
| `nanoclaw-repl` | Operate and extend NanoClaw, ECC's zero-dependency session-aware REPL, with persistent markdown-backed session | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `nasiko-control-plane` | Manage the experimental Nasiko CLI lifecycle through ECC — read-only status checks, consent-gated install of t | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `netmiko-ssh-automation` | Safe Python Netmiko patterns for read-only collection, bounded batch SSH, TextFSM parsing, guarded config chan | — | Single industry or specialist domain |
| `network-bgp-diagnostics` | Diagnostics-only BGP troubleshooting patterns for neighbor state, route exchange, prefix policy, AS path inspe | — | Single industry or specialist domain |
| `network-config-validation` | Pre-deployment checks for router and switch configuration, including dangerous commands, duplicate addresses, | — | Single industry or specialist domain |
| `network-interface-health` | Diagnose interface errors, drops, CRCs, duplex mismatches, flapping, speed negotiation issues, and counter tre | — | Single industry or specialist domain |
| `nodejs-keccak256` | Prevent Ethereum hashing bugs in JavaScript and TypeScript. Node's sha3-256 is NIST SHA3, not Ethereum Keccak- | — | Language, framework, or platform outside the seven stacks capsule targets |
| `nutrient-document-processing` | Process, convert, OCR, extract, redact, sign, and fill documents using the Nutrient DWS API. Works with PDFs, | — | Single industry or specialist domain |
| `nuxt4-patterns` | Nuxt 4 app patterns for hydration safety, performance, route rules, lazy loading, and SSR-safe data fetching w | — | Language, framework, or platform outside the seven stacks capsule targets |
| `openclaw-persona-forge` | 为 OpenClaw AI Agent 锻造完整的龙虾灵魂方案。根据用户偏好或随机抽卡， 输出身份定位、灵魂描述(SOUL.md)、角色化底线规则、名字和头像生图提示词。 如当前环境提供已审核的生图 skill，可自动生 | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `operator-approval-loop` | Operator approval contract with internal filing notices for agent-drafted outbound messages, hashed drafts, ep | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `osint-investigation` | Sparse-clue OSINT investigation methodology for extracting overlooked leads, connecting fragmented evidence, a | — | Single industry or specialist domain |
| `perl-patterns` | Modern Perl 5.36+ idioms, best practices, and conventions for building robust, maintainable Perl applications | — | Language, framework, or platform outside the seven stacks capsule targets |
| `perl-security` | Comprehensive Perl security covering taint mode, input validation, safe process execution, DBI parameterized q | — | Language, framework, or platform outside the seven stacks capsule targets |
| `perl-testing` | Perl testing patterns using Test2::V0, Test::More, prove runner, mocking, coverage with Devel::Cover, and TDD | — | Language, framework, or platform outside the seven stacks capsule targets |
| `plan-canvas` | Open plans and HTML artifacts in a local browser canvas where the human annotates elements, chats, and approve | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `plankton-code-quality` | Write-time code quality enforcement using Plankton — auto-formatting, linting, and Claude-powered fixes on eve | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `platform-factory` | Build deterministic OCI images, SBOM/provenance evidence and hardened container or microVM runs from a compile | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `prediction-market-oracle-research` | Research prediction markets as data sources or oracle signals for products, agents, dashboards, and corporate | — | Single industry or specialist domain |
| `prediction-market-risk-review` | Review prediction-market, basket, oracle, and trading-agent workflows for compliance, safety, data-quality, pr | — | Single industry or specialist domain |
| `production-scheduling` | Codified expertise for production scheduling, job sequencing, line balancing, changeover optimization, and bot | — | Single industry or specialist domain |
| `project-flow-ops` | Operate execution flow across GitHub and Linear by triaging issues and pull requests, linking active work, and | — | Business, marketing, or operations work, not software engineering |
| `pytorch-patterns` | PyTorch deep learning patterns and best practices for building robust, efficient, and reproducible training pi | — | Language, framework, or platform outside the seven stacks capsule targets |
| `quality-nonconformance` | Quality control and non-conformance management for regulated manufacturing (FDA 21 CFR 820, IATF 16949, AS9100 | — | Single industry or specialist domain |
| `rails-patterns` | Ruby on Rails framework patterns for Rails 7.1+ and 8.x apps. Covers the directory contract, skinny controller | — | Language, framework, or platform outside the seven stacks capsule targets |
| `rails-security` | Ruby on Rails security practices for Rails 7.1+ and 8.x apps. Covers production configuration, authentication, | — | Language, framework, or platform outside the seven stacks capsule targets |
| `react-native-patterns` | React Native and Expo app patterns — Expo Router navigation, state separation (server/client/route/form), TanS | — | Language, framework, or platform outside the seven stacks capsule targets |
| `recsys-pipeline-architect` | Design composable recommendation, ranking, and feed pipelines using the six-stage Source→Hydrator→Filter→Score | — | Single industry or specialist domain |
| `recursive-decision-ledger` | Run repeated rollouts ("Prime Gauss" style recursive prompting) while keeping an append-only decision ledger o | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `remotion-video-creation` | Best practices for Remotion - Video creation in React. 29 domain-specific rules covering 3D, animations, audio | — | Media production or an ECC-specific design direction |
| `repo-scan` | Bootstrap pointer that installs the external repo-scan skill from a pinned, reviewable commit. Use when repo-s | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `returns-reverse-logistics` | Codified expertise for returns authorization, receipt and inspection, disposition decisions, refund processing | — | Single industry or specialist domain |
| `roundhouse-x402` | Discover x402-paid services and ERC-8004 agent identity via Roundhouse (open catalog, paid SQL, MCP server, rh | — | Single industry or specialist domain |
| `rust-patterns` | Idiomatic Rust patterns, ownership, error handling, traits, concurrency, and best practices for building safe, | — | Language, framework, or platform outside the seven stacks capsule targets |
| `rust-testing` | Rust testing patterns including unit tests, integration tests, async testing, property-based testing, mocking, | — | Language, framework, or platform outside the seven stacks capsule targets |
| `safety-guard` | Guard against destructive operations with three modes: Careful intercepts dangerous commands (rm -rf, git push | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `scientific-db-openalex-database` | OpenAlex REST API workflows for cross-disciplinary literature search, DOI/PMID lookup, open-access links, cita | — | Single industry or specialist domain |
| `scientific-db-pubmed-database` | Direct PubMed and NCBI E-utilities search workflows for biomedical literature, MeSH queries, PMID lookup, cita | — | Single industry or specialist domain |
| `scientific-db-uspto-database` | USPTO patent and trademark data workflow for official record lookup, PatentSearch queries, TSDR checks, assign | — | Single industry or specialist domain |
| `scientific-pkg-gget` | gget CLI and Python workflow for quick genomic database queries, sequence lookup, BLAST-style searches, enrich | — | Single industry or specialist domain |
| `scientific-thinking-literature-review` | Systematic literature-review workflow for academic, biomedical, technical, and scientific topics, including se | — | Single industry or specialist domain |
| `scientific-thinking-scholar-evaluation` | Structured scholarly-work evaluation for papers, proposals, literature reviews, methods sections, evidence qua | — | Single industry or specialist domain |
| `security-bounty-hunter` | Hunt for exploitable, bounty-worthy security issues in repositories. Focuses on remotely reachable vulnerabili | — | Active security testing of live systems, a different job from the read-only `security-review` |
| `security-scan` | Scan your Claude Code configuration (.claude/ directory) for security vulnerabilities, misconfigurations, and | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `seo` | Audit, plan, and implement SEO improvements across technical SEO, on-page optimization, structured data, Core | — | Business, marketing, or operations work, not software engineering |
| `short-video-distribution` | Ship a finished vertical video to TikTok, YouTube Shorts, and Instagram Reels. Checks the file against each pl | — | Business, marketing, or operations work, not software engineering |
| `social-graph-ranker` | Weighted social-graph ranking for warm intro discovery, bridge scoring, and network gap analysis across X and | — | Business, marketing, or operations work, not software engineering |
| `social-publisher` | Agent-driven scheduling and publishing of social media posts across 13 platforms via SocialClaw. Use when the | — | Business, marketing, or operations work, not software engineering |
| `strategic-compact` | Suggests manual context compaction at logical intervals to preserve context through task phases rather than ar | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `swift-actor-persistence` | Thread-safe data persistence in Swift using actors — in-memory cache with file-backed storage, eliminating dat | — | Language, framework, or platform outside the seven stacks capsule targets |
| `swift-concurrency-6-2` | Swift 6.2 Approachable Concurrency — single-threaded by default, @concurrent for explicit background offloadin | — | Language, framework, or platform outside the seven stacks capsule targets |
| `swift-protocol-di-testing` | Protocol-based dependency injection for testable Swift code — mock file system, network, and external APIs usi | — | Language, framework, or platform outside the seven stacks capsule targets |
| `swiftui-patterns` | SwiftUI architecture patterns, state management with @Observable, view composition, navigation, performance op | — | Language, framework, or platform outside the seven stacks capsule targets |
| `taste` | Creative-direction layer for music videos and short-form edits in the angelcore / cloud-trance / hyperpop fami | — | Media production or an ECC-specific design direction |
| `taste-application` | Generate new video against a distilled style pack and cut it into a finished piece - plan takes from the refer | — | Media production or an ECC-specific design direction |
| `taste-distillation` | Measure a set of reference videos into a reusable style pack - colour grade as a 3D LUT, cut rhythm as a shot- | — | Media production or an ECC-specific design direction |
| `tasteforge-video` | Use for file-driven multimodal image, video, and 3D-asset discovery; taste interviews; distill or apply workfl | — | Media production or an ECC-specific design direction |
| `team-builder` | Interactive picker that discovers available agent personas via the claude agents command and agents/ markdown | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `terminal-opener` | Open an executable and its argument array in a visible terminal window through a reusable, shell-free launch p | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `terminal-ops` | Evidence-first repo execution workflow for ECC. Use when the user wants a command run, a repo checked, a CI fa | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `tinystruct-patterns` | Expert guidance for developing with the tinystruct Java framework. Use when working on the tinystruct codebase | — | Language, framework, or platform outside the seven stacks capsule targets |
| `token-budget-advisor` | Offer a choice of response depth (25%/50%/75%/100%) with token estimates before answering, then answer at that | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `token-card` | Render a token-usage stat card from local Claude Code, Codex, Gemini CLI, and OpenCode session logs and commit | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `ui-canvas` | Preview a UI component mockup in a local browser canvas where the human directly edits it (move, resize, edit | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `ui-demo` | Record polished UI demo videos using Playwright. Use when the user asks to create a demo, walkthrough, screen | — | Media production or an ECC-specific design direction |
| `ui-to-vue` | Use when the user has UI screenshots or design exports that need batch conversion into Vue 3 components, espec | — | Language, framework, or platform outside the seven stacks capsule targets |
| `uncloud` | Use when managing an Uncloud cluster — deploying services, configuring Caddy ingress, adding static proxy rout | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `unified-notifications-ops` | Operate notifications as one ECC-native workflow across GitHub, Linear, desktop alerts, hooks, and connected c | — | Business, marketing, or operations work, not software engineering |
| `video-editing` | AI-assisted video editing workflows for cutting, structuring, and augmenting real footage. Covers the full pip | — | Media production or an ECC-specific design direction |
| `videodb` | Ingest, index, search, edit, and monitor video and audio with the VideoDB Python SDK — upload from files, URLs | — | Media production or an ECC-specific design direction |
| `visa-doc-translate` | Translate visa document images (bank deposit, employment, income, and retirement certificates; HEIC, PNG, or J | — | Single industry or specialist domain |
| `vue-patterns` | Vue.js 3 Composition API patterns, component architecture, reactivity best practices, Pinia state management, | — | Language, framework, or platform outside the seven stacks capsule targets |
| `web-perimeter-owasp-2025-audit` | Passive, non-destructive web perimeter security auditing mapped to OWASP Top 10:2025 surface leads, CDN Unkeye | — | Active security testing of live systems, a different job from the read-only `security-review` |
| `windows-desktop-e2e` | E2E testing for Windows native desktop apps (WPF, WinForms, Win32/MFC, Qt) using pywinauto and Windows UI Auto | — | Language, framework, or platform outside the seven stacks capsule targets |
| `workspace-surface-audit` | Audit the active repo, MCP servers, plugins, connectors, env surfaces, and harness setup, then recommend the h | — | ECC runtime, hook, or harness tooling rather than a portable skill |
| `x-api` | X/Twitter API integration for posting tweets, threads, reading timelines, search, and analytics. Covers OAuth | — | Business, marketing, or operations work, not software engineering |
| `yoruba-localization-testing` | Test Yoruba (yo) and English bilingual interfaces for tone marks, underdots, Unicode normalization, translatio | — | Single industry or specialist domain |
