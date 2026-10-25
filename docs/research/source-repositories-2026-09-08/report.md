# Additional preferred source repositories

Research date: 2026-09-08. Community window: 2026-08-09 through 2026-09-08.

## Recommendation

Yes. The best additions offer a distinct method that can improve this library. My suggested first three are **anthropics/skills**, **trailofbits/skills**, and **EveryInc/compound-engineering-plugin**. Keep **ai-evals-course/evals-skills** and **pbakaus/impeccable** as strong specialist candidates. **vercel-labs/agent-skills** is useful when researching frontend implementation.

This is a proposed order among additions, not a replacement for the owner's existing preference order. `docs/source-repos.md` was not changed. No skills were installed or modified.

## Ranked candidates

| Priority | Repository | Specific material to study | Incremental value for this library | Overlap and limits |
| --- | --- | --- | --- | --- |
| 1 | [anthropics/skills](https://github.com/anthropics/skills) | `skills/skill-creator`, including graders, blind comparisons, timing and token measurements, trigger evaluations | A concrete authoring and evaluation reference for `writing-for-agents` and verification work | Baseline testing already exists in Superpowers and pstack. The addition is reusable evaluation machinery and output contracts. Already credited in the local `docs/authoring/writing-for-agents.md`. |
| 2 | [trailofbits/skills](https://github.com/trailofbits/skills) | `differential-review`, `audit-context-building`, `property-based-testing`, `spec-to-code-compliance` | More detailed security analysis for `security-review`, `code-review`, and test research: change history, callers affected, attack scenarios and coverage limits | General review overlaps Addy and pstack. Prioritize specialist analysis; several other plugins concern domains this library does not target. |
| 3 | [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) | `skills/ce-compound` and `skills/ce-compound-refresh` | A disciplined method for retaining non-obvious lessons from verified work; useful for `handoff`, `agile-retro`, and documentation lifecycle research | The overall brainstorm/plan/build/review loop overlaps existing sources heavily. Study the learning retention and maintenance rules selectively. |
| 4 | [ai-evals-course/evals-skills](https://github.com/ai-evals-course/evals-skills) | `error-discovery`, `eval-audit`, `validate-evaluator` | Find failure modes in real traces, then validate judges against human labels; helps when measuring actual skill behavior | Primarily about product-specific AI evaluations. Adapting its methods to this skill library requires representative task traces and labels; it is not a drop-in skill benchmark. |
| 5 | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Design command reference, especially `critique`, `audit`, `harden`, and `distill` | Stronger visual hierarchy, usability, accessibility and browser evidence for `prototype`, `html-writeup`, or future UI skills | Addy already covers frontend engineering. Impeccable adds design critique and concrete detection tools; its current critique workflow can be expensive. |
| Conditional | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `web-design-guidelines`, `composition-patterns`, React Native guidance, `writing-guidelines` | Concrete frontend and documentation rules when the task matches that stack | More stack-specific than the first five. Deployment and optimization guidance is often Vercel-specific; editorial house rules should not become universal defaults. |

### Why the first three are strongest

**Anthropic formalizes an existing influence.** The local authoring documentation explicitly credits its skill creator for layout, progressive loading, evaluation set structure and predictable behavior. The inspected upstream skill runs candidate and baseline tasks, captures cost and time, supplies an HTML review interface, and supports blind comparison. Its trigger tests include difficult near misses. These are concrete methods worth comparing with existing tests, not evidence that every Anthropic skill is better. [Pinned skill creator](https://github.com/anthropics/skills/blob/41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f/skills/skill-creator/SKILL.md).

One methodological caveat: its description optimization loop selects among candidates using a repeatedly consulted test partition. If adapting it, reserve a separate untouched final evaluation set before claiming generalization. This is my inference from the inspected instructions, not a measured failure of the upstream tool.

**Trail of Bits supplies specialist depth.** Its differential review instructions explicitly use Git history, quantify callers affected by a change, examine test coverage, and require findings tied to attack scenarios and locations. This gives security research more substance than another general review checklist. Borrow the evidence requirements selectively: absence of tests alone should not be copied into a blanket severity rule. [Pinned differential review](https://github.com/trailofbits/skills/blob/d3323cefbcf645678b8dc481de204b02ad3d02dc/plugins/differential-review/skills/differential-review/SKILL.md).

**Compound Engineering has a useful retention test.** Its current `ce-compound` requires a solved, verified problem and asks whether a future engineer would repeat the mistake or substantial investigation without the learning document. It rejects information already recoverable from code, tests or existing documentation, and updates existing learnings instead of duplicating them. That fits a small library that wants reliable handoffs without accumulating routine completion notes. [Pinned learning capture skill](https://github.com/EveryInc/compound-engineering-plugin/blob/8df67793b9733d2220fa9a7fc37139931471af62/skills/ce-compound/SKILL.md).

### Why the specialist candidates still matter

AI Evals Course distinguishes discovering failures from writing evaluators. Its audit checks whether full traces are reviewed, judges are validated, and evaluation data has leaked into examples. Its validation skill separates development from final held-out testing and measures pass/fail classification against human labels. That complements Anthropic's skill authoring mechanics. [Pinned evaluation audit](https://github.com/ai-evals-course/evals-skills/blob/11d35781d43c281baddd3c6a766b12d81c274c29/skills/eval-audit/SKILL.md), [pinned evaluator validation](https://github.com/ai-evals-course/evals-skills/blob/11d35781d43c281baddd3c6a766b12d81c274c29/skills/validate-evaluator/SKILL.md).

Impeccable distinguishes subjective design assessment from detector/browser evidence. Its critique instructions require independent assessments where agent tools exist, then synthesis and a persisted result. Its README describes deterministic detectors alongside design commands. This is a useful source to study; I did not run its detectors or validate the quality claims. [Pinned critique reference](https://github.com/pbakaus/impeccable/blob/2bc2879276c1f321a53c4ca99d3371e411329b52/.agents/skills/impeccable/reference/critique.md).

## Existing preferred sources: consultation and influence

All six were consulted through current repository pages and pinned README snapshots. This was a focused comparison, not an exhaustive audit of every skill.

| Existing preference | What it already contributes | Effect on recommendations |
| --- | --- | --- |
| [mattpocock/skills](https://github.com/mattpocock/skills) | Small, adaptable engineering skills, requirements clarification, domain vocabulary and composable work | Prefer focused methods that complement this model. Another broad process owner has a higher overlap cost. |
| [obra/superpowers](https://github.com/obra/superpowers) | Development workflow, TDD, planning and verification; baseline-first authoring is also credited locally | Do not present another plan/build/review loop or baseline comparison as an entirely missing capability. |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Broad production engineering, frontend, security, performance, observability and documentation | Additional sources must offer more specific techniques, useful tools or a different evaluation perspective. |
| [cursor/plugins, pstack](https://github.com/cursor/plugins/tree/main/pstack) | Current README includes task playbooks, blinded evaluations, architecture, blast-radius analysis, recall and prose tools | Important overlap with Anthropic, Trail of Bits and Every. Recommend their specific methods rather than duplicate broad coverage. |
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Simplification and resistance to unnecessary implementation complexity | No additional generic simplicity collection is needed for this proposal. Its marketing metrics were not independently reproduced. |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | Recent community discovery and saved research evidence | Used to discover practical discussion; primary repository contents determine technical claims and candidate fit. |

## What the last 30 days support

Two relevant threads were especially useful:

- [Top Agent Skills Repositories, August 26](https://www.reddit.com/r/claudeskills/comments/1vypjfq/top_agent_skills_repositories/): participants discuss selecting parts of Matt's, Addy's and Anthropic's collections and the difficulty of distinguishing skills from larger harness systems. This supports selective investigation, not ranking by stars.
- [My agent skills stack, August 27](https://www.reddit.com/r/claudeskills/comments/1w05e6t/my_agent_skills_stack_in_2026_actually/): the author explicitly includes AI Evals Course and Anthropic tools. A commenter reports “token usage going through the roof when I had more skills loaded.” That is one user's anecdote, not a controlled measurement or proof that installed skills are all loaded.

The engine retrieved 54 items across Reddit, Hacker News and GitHub. Many HN/GitHub items were tangential and did not influence candidate rankings. Reddit returned six items with partial coverage after HTTP 429. X and YouTube were unavailable; TikTok and Instagram were not active. The engine reduced the supplied three-query plan to two executable queries. Search supplementation and direct primary-source reads broadened coverage, but this is not a comprehensive community consensus.

All 12 inspected repositories were unarchived, and their default-branch tip dates were within the window. Recent commits establish activity only, not quality. No upstream skills, evaluators or benchmarks were executed.

## Evidence and revisions

`repository-snapshots.json` preserves repository metadata, pinned READMEs and complete inspected source files. A null GitHub license field means the API did not identify one; it does not establish reuse permission. Trail of Bits identifies CC-BY-SA-4.0; Anthropic's README distinguishes its open-source examples from source-available document skills. Check the particular file's terms before copying; this proposal recommends research sources.

| Repository | Inspected default-branch revision | Tip date (UTC) |
| --- | --- | --- |
| mattpocock/skills | `3cca18b368ae95cdbdebbff572ccafa662551015` | 2026-09-04 |
| obra/superpowers | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | 2026-08-12 |
| addyosmani/agent-skills | `6ca0cd7db39b41b1c37e26d335c507ee92382c6d` | 2026-09-08 |
| cursor/plugins | `71ed0d1076fec562c1b74ee353121a8d00f75382` | 2026-09-08 |
| DietrichGebert/ponytail | `356918eba965ee1eac64bd3a7f0dd02108350de5` | 2026-09-07 |
| mvanhorn/last30days-skill | `310f0b405db2d84adb4993bbf140cef9584057d2` | 2026-09-08 |
| anthropics/skills | `41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f` | 2026-09-03 |
| trailofbits/skills | `d3323cefbcf645678b8dc481de204b02ad3d02dc` | 2026-09-02 |
| ai-evals-course/evals-skills | `11d35781d43c281baddd3c6a766b12d81c274c29` | 2026-08-31 |
| pbakaus/impeccable | `2bc2879276c1f321a53c4ca99d3371e411329b52` | 2026-09-07 |
| vercel-labs/agent-skills | `063bee94c3f4df8453406c830b0a7df0f2860278` | 2026-08-28 |
| EveryInc/compound-engineering-plugin | `8df67793b9733d2220fa9a7fc37139931471af62` | 2026-09-07 |

The research artifacts are `query-plan.json`, `engine-output.md`, `agent-skills-repositories-raw.md`, `repository-snapshots.json`, and this report. The engine also created its local `.last30days-library.db` cache. The raw evidence appendix records web supplements. The preferred list and published skills remain unchanged.
