# Coding standards skill research

Research date: 2026-09-13. Community window: 2026-08-14 through 2026-09-13.

## Recommendation

Create one `skills/engineering/coding-standards/` skill with a concise shared baseline and selectively loaded backend and frontend references. This preserves the user's preferred ECC split while giving this library one discoverable entry point. This is a proposed design, not a published skill or a measured performance result.

Suggested structure:

```text
coding-standards/
  SKILL.md
  references/
    BACKEND.md
    FRONTEND.md
  evals/
    evals.json
```

Keep shared rules in the entry point; load backend for server/data changes, frontend for UI changes, and both for a full-stack change. Add language references only when actual stack needs justify them. The user's languages and frameworks are not yet established: ECC's TypeScript, React, and Node examples must not silently become universal requirements.

## What ECC actually provides

The inspected [ECC revision](https://github.com/affaan-m/ECC/tree/8321021c54d670126ce3b2969d5deb880b4b0c2a) has three separate skills, rather than one skill containing two subsections:

- [coding-standards](https://github.com/affaan-m/ECC/blob/8321021c54d670126ce3b2969d5deb880b4b0c2a/skills/coding-standards/SKILL.md): shared readability, naming, simplicity, immutability, and code-quality guidance. Its opening explicitly routes framework work elsewhere.
- [backend-patterns](https://github.com/affaan-m/ECC/blob/8321021c54d670126ce3b2969d5deb880b4b0c2a/skills/backend-patterns/SKILL.md): APIs, data access, caching, error handling, authentication, rate limits, and background processing, illustrated mainly with Node/Next.js and Supabase.
- [frontend-patterns](https://github.com/affaan-m/ECC/blob/8321021c54d670126ce3b2969d5deb880b4b0c2a/skills/frontend-patterns/SKILL.md): React composition, hooks, state, rendering performance, forms, and accessibility.

Adopt the separation and concrete examples. Reduce duplication: the baseline still includes React, API, database, and performance examples despite its narrower opening. Treat example architectures as options, not instructions to add a repository/service layer, cache, custom fetching hook, or state library to every project.

Do not promote illustrative thresholds or defaults into unconditional standards. Function length is a review clue, not proof that extraction helps. Mutation of shared state differs from local construction. Manual memoization needs a reason: [React's useMemo documentation](https://react.dev/reference/react/useMemo) describes it as a performance optimization and notes that React Compiler reduces the need for manual calls. Check the project's compiler configuration before prescribing a memoization style.

## Proposed content and boundaries

| Area | Standards to cover | Avoid |
| --- | --- | --- |
| Shared | Follow applicable project rules and tooling; clear domain names; explicit contracts; validate untrusted inputs; preserve errors; minimal justified abstractions; explain non-obvious decisions | Imposing a new formatter, framework, naming style, dependency, or universal architecture |
| Backend | Validate at trust boundaries; enforce authorization on the server; preserve API contracts; define transaction boundaries; bound queries and concurrency; make retries safe; prevent sensitive logging | Automatic layers, blanket retries, in-memory limits assumed to work across instances, speculative caching |
| Frontend | Reuse design-system components; semantic controls and keyboard interaction; model loading/empty/error/success states; keep state ownership clear; prevent stale async results; profile relevant performance issues | Blanket memoization, custom replacements for existing data libraries, aesthetic redesign during unrelated fixes |
| Verification | Use existing formatter/linter/compiler for mechanical rules and focused behavioral checks for meaningful risks | Repeating entire TDD, security-review, implementation, or completion workflows |

The backend/frontend rows above are proposed evaluation targets, not a claim that every item was empirically validated by this research. Validate framework-specific examples against official versioned documentation during authoring.

Suggested execution contract:

1. Read applicable repository instructions, documented standards, tool configuration, and representative nearby code.
2. Identify the affected domain and load only its reference.
3. Apply documented project conventions first. Use this skill's defaults where the project is silent; do not infer a convention from one suspicious example.
4. In implementation, apply standards within the authorized change. In review, identify the violated rule, affected location, and concrete consequence; distinguish suggestions from defects.
5. Use existing checks. Report meaningful exceptions or unresolved conflicts briefly.

This supplies criteria to local `implement` and `code-review`. `codebase-design` owns consequential architecture decisions, `simplify` owns requested cleanup, `tdd` owns test-first delivery, and `verification-before-completion` owns completion claims. Merely loading standards should not start these workflows, a repository-wide audit, or a refactor.

## Time to see a result

There are two different timing questions:

- Research takes longer than a quick opinion because it includes setup checks, source resolution, current repository inspection, and synthesis. The community engine reported 15.9 seconds for this run; that is only the engine's interval, not the total task duration.
- Using the future skill adds instruction-reading work and possibly relevant checks. Smaller conditional references are intended to limit overhead, but this research provides no benchmark showing they make coding faster. Better first-pass consistency could reduce rework; that remains a hypothesis.

Measure time to the first usable result and time to the accepted result separately. A fast initial patch that requires corrections can be slower overall.

## Recent community evidence and limitations

The invoked last30days engine used the saved two-query plan and the requested 30-day window. It returned 13 Reddit threads, 24 Hacker News stories, and one GitHub result. Reddit was partial due to HTTP 429. X and YouTube were unavailable; TikTok and Instagram did not contribute evidence. Most displayed clusters concern general coding-agent usage rather than this exact skill design. No sufficiently specific community comments supported quoting a consensus about frontend/backend separation.

Therefore the recommendation is a synthesis of primary repository design and the user's stated preference, not a popularity ranking or evidence of measured productivity gains. GitHub stars and discussion totals are retrieval metadata, not proof of skill quality. The query used `evergreen_ok` because this is a design/how-to question; current repository snapshots are clearly separate from claims of newly introduced practices.

The web-rendered ECC baseline differed from the freshly fetched GitHub file's opening. This report uses the pinned snapshot as the authority. Raw engine output, a query plan, source snapshots, revision index, and a reproducible source-inspection script are retained in [coding-standards-evidence](coding-standards-evidence/).

## Evaluation before publication

Compare no new skill, ECC's relevant skills, and the proposed compact skill on the same bounded tasks. Repeat runs rather than treating one output as a benchmark.

| Scenario | Expected observation |
| --- | --- |
| Backend-only endpoint change | Backend reference applies; existing API shape survives; no UI rules or speculative layers |
| Frontend-only form change | Frontend reference applies; meaningful keyboard and async states work |
| Full-stack feature | Both domains apply; shared contract remains consistent |
| Existing repository style conflicts with default | Local convention wins without unrelated churn |
| Compiler-enabled React project | No automatic memoization additions without demonstrated need |
| Small script or non-web project | Shared baseline applies without inventing a frontend/backend framework |
| Review-only request | Findings are evidenced and scoped; no edits occur |
| Formatter or compiler already enforces a rule | Reuse the tool instead of duplicating mechanical review |

Record applicable-rule failures, unnecessary edits/abstractions, missed behavior, instruction tokens, wall-clock time, and correction rounds. Set concrete acceptance thresholds during authoring; do not fabricate pass rates now.

When implementation is requested, publish the top-level README entry, engineering README entry, manifest entry, and human-facing docs page required by AGENTS.md. Keep package and plugin versions synchronized and run `claude plugin validate . --strict` after manifest changes. This research does not alter manifests or publish a skill.

## Preferred repository audit

Every preferred repository was consulted at the revisions below. Selected source paths and full fetched text are recorded in `coding-standards-evidence/source-index.json` and its sibling snapshots. The preference ordering is unchanged.

| Repository | Pinned revision | Influence or non-applicability |
| --- | --- | --- |
| [mattpocock/skills](https://github.com/mattpocock/skills/tree/3cca18b368ae95cdbdebbff572ccafa662551015) | `3cca18b368ae` | Use its distinction between repository standards and feature specification. Keep standards discovery; do not import its parallel review orchestration. |
| [obra/superpowers](https://github.com/obra/superpowers/tree/b36e0829c6d0140e93cfef2ca599b1b07d4a7797) | `b36e0829c6d0` | YAGNI and technically verified review feedback support restraint. Implementation and review ceremony remain outside this skill. |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/be4e44a9fbc5e8df0beaefadbb28bd22ee61cc39) | `be4e44a9fbc5` | Quality review favors repository conventions and justified patterns; frontend guidance contributes accessibility and state ownership. Avoid importing its aesthetic direction or fixed thresholds wholesale. |
| [cursor/plugins](https://github.com/cursor/plugins/tree/5bf2b1544db739998121a306340631963c2ff3de) | `5bf2b1544db7` | pstack TypeScript guidance contributes boundary validation, discriminated unions, schema reuse, and simplest sufficient types. Make language-specific rules conditional and avoid absolute cast bans. |
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail/tree/356918eba965ee1eac64bd3a7f0dd02108350de5) | `356918eba965` | README favors minimal implementations and provides qualified benchmark claims. Use the simplicity principle; its results do not establish performance for this proposed skill. |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill/tree/ac0ed3b7f610ec64cc898349d1e4507cd6220942) | `ac0ed3b7f610` | Provides the recency scan, query planning, source-status distinctions, and retained raw evidence. No direct backend/frontend coding standard contribution. |
| [anthropics/skills](https://github.com/anthropics/skills/tree/34040c9c568585f6929bedeaad110ad08f079624) | `34040c9c5685` | skill-creator supports progressive disclosure and evaluation. frontend-design is mainly aesthetic guidance and should not own coding conventions. |
| [trailofbits/skills](https://github.com/trailofbits/skills/tree/321ccfe628eca0d314b0ee4eaffcdd8a05639aaf) | `321ccfe628ec` | Differential review contributes evidence-backed findings; property-based testing suggests invariant-oriented checks. Dedicated security audit and test generation stay with their owners. |
| [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin/tree/44d65ad64a0ac8e542eabee31ce031a7aeb41b28) | `44d65ad64a0a` | ce-compound and ce-compound-refresh support capturing durable lessons and checking stale or contradictory guidance. Do not automatically rewrite standards or commit learnings. |
| [garrytan/gstack](https://github.com/garrytan/gstack/tree/71f6048e8ada25180e61438abc1d98cb151fe9a7) | `71f6048e8ada` | README emphasizes distinct engineering workflow roles. Useful boundary comparison, but no direct coding-standards text selected; do not import the whole workflow. |
| [affaan-m/ECC](https://github.com/affaan-m/ECC/tree/8321021c54d670126ce3b2969d5deb880b4b0c2a) | `8321021c54d6` | Primary structural inspiration: shared standards plus backend/frontend patterns. Keep the separation, reduce duplication, and qualify framework-specific examples. |
