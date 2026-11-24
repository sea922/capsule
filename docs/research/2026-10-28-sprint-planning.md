# Sprint Planning Skill Research

Date: 2026-10-28

## Question

What should a team-facing sprint planning skill do when the team uses AI coding tools: how should it break features down, handle investigation work, assign Fibonacci story points, and fit work to capacity?

## Community evidence (last 30 days)

A `/last30days` run on 2026-10-28 (Reddit, Hacker News, GitHub, web) covered 2026-09-28 to 2026-10-28. Reddit search was blocked during the run, so Reddit coverage came from partial listings only; X and YouTube were not available. The raw output is saved outside the repository at `~/Documents/Last30Days/sprint-planning-and-story-point-estimation-with-ai-assisted-development-raw-v3.md`.

Findings that shaped the skill:

- **Experimental work breaks delivery sprints.** An r/agile thread (2026-10-26) reports AI feature work where a sprint often ends with "this approach does not work", which makes velocity look bad. The skill turns unknown-outcome work into timeboxed spikes with exit artifacts, deducted from capacity, with follow-up stories pointed afterwards.
- **Coding is cheap, review is not.** An r/SoftwareEngineering post on reviewing AI-generated PRs after mid-sprint spec changes, and the HN threads "AI promised less work. I've never worked more" (643 points) and "Ask HN: How to deal with shipping AI-written code you don't understand?" (625 points), place the cost in review and understanding. The skill defines points as done-cost and adds a per-area review-load check.
- **Points are team-local.** StoryPointLab argues a model cannot know what a team's 3 means. ProjectManagement.com reports teams resisting automated sizing. The user chose to have the skill assign points, so the skill requires confirmed anchors (reference stories) before any value and records an anchor-based rationale per story.
- **Speedups are uneven.** Kollabe cites METR (experienced developers 19% slower with AI while believing they were 20% faster) and notes gains vary by task and person. An r/ChatGPTCoding team found about 15% of sprint tasks needed frontier reasoning. The skill adds an agent-fit tag (`mechanical`, `assisted`, `judgment`) as a sizing driver and flags anchors that predate the team's AI tooling.
- **Breakdown runs through specs.** GitHub Spec Kit (specify, plan, tasks, implement) and Kiro (requirements, design, tasks) split features into units that can be built and tested in isolation. Daniel Vaughan proposes separating agent-run and human-run capacity; the skill keeps one capacity figure but surfaces the split through agent-fit tags and review load.

## Preferred sources

Inspected through the GitHub API on 2026-10-28. None of the fifteen repositories covers reference-story calibration, review-weighted points, or AI-adjusted sizing; that part is original here.

| Repository | Revision | Files | Influence |
| --- | --- | --- | --- |
| mattpocock/skills | `59db609` | `skills/engineering/to-tickets/SKILL.md`, `skills/engineering/prototype/SKILL.md` | Vertical slices with blocking edges; a prototype answers one question, which matches the spike definition. |
| obra/superpowers | `2ce8aa1` | `skills/writing-plans/SKILL.md` | Split where a reviewer could reject one task while approving its neighbour; adopted as the story-splitting test. |
| addyosmani/agent-skills | `aeac41d` | `skills/planning-and-task-breakdown/SKILL.md` | Acceptance criteria per task and "too large, split it". Its file-count sizing is the proxy this skill replaces with done-cost. |
| cursor/plugins (pstack) | `c742dd6` | `pstack/skills/principle-sequence-verifiable-units/SKILL.md`, `pstack/skills/principle-explain-the-number/SKILL.md` | Each unit ends in a checkable state; state the basis behind a number, used for capacity history and the forecast-range rule. |
| DietrichGebert/ponytail | `09c434a` | skill listing only | Not applicable: over-engineering review, no planning content. |
| mvanhorn/last30days-skill | `e06af25` | `skills/last30days` | Not applicable as a pattern; used as the community research tool above. |
| anthropics/skills | `dbd4588` | `skills/skill-creator/` (listing) | Eval and description-triggering approach informs the `evals/evals.json` scenarios. Its sprint-retro quickstart is post-sprint and not applicable. |
| trailofbits/skills | `bf23bfb` | listing only | Not applicable: security tooling. |
| EveryInc/compound-engineering-plugin | `00d0a5b` | `skills/ce-plan/SKILL.md` | Scale ceremony to scope and risk; end with an explicit next step. Reflected in the plan's open-questions section. |
| garrytan/gstack | `9e3308f` | `spec/SKILL.md`, `plan-eng-review/SKILL.md` (frontmatter) | Weak: review the plan before committing, which the skill leaves to the team's planning session. |
| affaan-m/ECC | `25278e7` | `skills/story-lifecycle/SKILL.md` | Fibonacci points capped with larger values split, points summed against velocity, confirmation before moving stories. The skill adds anchor calibration and review weighting. |
| wshobson/agents | `0874a27` | `plugins/agent-teams/skills/task-coordination-strategies/`, `plugins/ship-mate/stories/_template.md` | Story template with checkable acceptance criteria. File-ownership parallelism is not applicable to a team sprint. |
| nahid-sparktales/agent-dispatcher | `564c3f0` | `skills/product/prd-and-stories/SKILL.md`, `skills/product/prioritization/SKILL.md` | Strongest influence: name the capacity first, a cut line with a condition to bring items back (the stretch pull-in condition), open questions that block decisions, and owners deciding the commitment. |
| humanlayer/skills | `653b641` | `plugins/rpi/skills/rpi/SKILL.md` (head) | Not applicable: single-feature research, design, implement loop. |
| testdouble/han | `abba73a` | `han-planning/skills/plan-work-items/SKILL.md` | Clear boundary with sibling skills in the description; used to separate this skill from `planning-and-task-breakdown`. |

## Decisions

- Scope is the full sprint: goal, capacity, breakdown, pointing, selection, and a saved plan.
- The skill assigns points (user decision), but only against confirmed anchors, and marks values for team confirmation in planning poker.
- Output is a tracker-agnostic Markdown plan; tracker writes need explicit permission.
- The skill lives in `skills/engineering/` next to `planning-and-task-breakdown`, which keeps agent implementation plans.

## Limitations

Evals 1 and 2 were each run once with the skill loaded and met their expectations. Their feedback added the missing-anchor fallback, a single capacity formula, and the underfill rule. There was no without-skill baseline run, and eval 3 (routing to `planning-and-task-breakdown`) was not run. Reddit coverage was partial, and most web sources are blogs or vendor posts rather than measured studies.
