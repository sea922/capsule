# ECC skills review: stack and cross-stack skills

A second pass over [`affaan-m/ECC`](https://github.com/affaan-m/ECC) `skills/`
at `4adeee67` (328 skills, unchanged since the
[first review](2026-11-24-ecc-review.md)). The first review set language and
framework skills aside. Capsule has since added rule sets for web, React,
TypeScript, Python, Java, Go, and C#, so this pass reconsiders the roughly 40
ECC skills for those stacks and for cross-stack backend work. It records
findings only.

## How the candidates were judged

Each skill was read for its outline and for how much of it is code samples.
Three things decided value: knowledge an agent does not already apply reliably,
how often the job comes up, and overlap with what capsule already ships. The
stack rules adapted from ECC already cover each language's style, patterns,
testing, and security, and ECC's rules name these skills as their deeper
versions, so a `*-patterns` skill largely repeats a rule set capsule now has.

## Worth adding

| ECC skill | Lines (code) | Why | Shape in capsule |
| --- | --- | --- | --- |
| `api-design` | 524 (310) | Decisions with real tradeoffs that nothing in capsule owns: resource naming, status codes, error shape, pagination style, filtering, versioning, rate limits | New skill `api-design` |
| `react-performance` | 575 (195) | A prioritized rule set, from waterfalls and bundle size down to micro-optimizations, adapted from Vercel's `react-best-practices` (MIT) | Reference under `performance`, loaded for React and Next.js work |
| `e2e-testing` | 327 (234) | End-to-end test structure and the handling of flaky tests, which `tdd` does not cover | New skill `e2e-testing`, tool-neutral with Playwright as the worked example |
| `postgres-patterns`, `mysql-patterns` | 148, 413 | Index choice, data types, query anti-patterns, and configuration: compact and specific | Reference under `database-migrations` or a new `database-design` skill |
| `design-system`, `make-interfaces-feel-better` | 83, 152 | Extracting and auditing design tokens, and concrete polish details (radius, alignment, shadows, motion, hit areas). Capsule has no interface-design skill | New skill `interface-polish`, or references under `accessibility` |
| `i18n-sync` | 141 | Keeping locale files in step with source keys and project terminology | New small skill, if the user ships localized products |

## Possible, with overlap

| ECC skill | Overlap | If adopted |
| --- | --- | --- |
| `error-handling` | `code-review-silent-failures` agent and the rules' error sections | A reference under `coding-standards` |
| `docker-patterns`, `deployment-patterns` | `production-readiness` reviews these but does not build them | One `containers-and-deploys` skill |
| `redis-patterns` | None, but narrow | A reference beside the database material |
| `backend-patterns`, `frontend-patterns` | `coding-standards` `BACKEND.md` and `FRONTEND.md` | Fold the missing points into those references |

## Stack deep-dives: fold, do not import

`typescript-patterns`, `react-patterns`, `react-testing`, `python-patterns`,
`python-testing`, `fastapi-patterns`, `golang-patterns`, `golang-testing`,
`java-coding-standards`, `springboot-*`, `jpa-patterns`, `dotnet-patterns`,
`csharp-testing`, and `django-*` are catalogues of idioms, 50–75% code samples,
running 320–825 lines each. Importing them as about 20 skills would more than
double capsule's catalogue, and every description loads in every session.

They fit capsule better as on-demand references under `coding-standards`, one
per stack, beside its existing `BACKEND.md` and `FRONTEND.md`. The skill would
route to the reference for the language in hand, as it already routes backend
and frontend work.

## Not for capsule

Kotlin, Quarkus, React Native, and Windows desktop skills (outside the seven
stacks named); `frontend-design-direction` and `frontend-slides` (ECC-specific
or unrelated); `web-perimeter-owasp-2025-audit` (active perimeter testing, a
different job from `security-review`); `frontend-a11y` (covered by
`accessibility`); `api-connector-builder` (covered by `implement`).
