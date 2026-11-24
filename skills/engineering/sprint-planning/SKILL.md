---
name: sprint-planning
description: Plan a team sprint with reference-anchored Fibonacci story points, capacity, and timeboxed spikes. Use when asked to plan or prepare a sprint, size or point a backlog, break an epic or feature into tickets, prepare for planning poker or refinement, decide what fits a sprint, or when velocity stopped meaning anything after the team adopted AI coding tools. Agent implementation plans belong to planning-and-task-breakdown; an unclear product decision belongs to grilling.
---

# Sprint Planning

Produce a sprint plan a team can commit to: one sprint goal, sized stories and timeboxed spikes that serve it, and a selection that fits measured capacity. For a partial request — backlog refinement, epic breakdown, or pointing only — run only the applicable steps (Steps 1, 3, and 4) without inventing sprint dates, a sprint goal, or capacity.

Three leading words run through this skill:

- **Anchor**: a finished story the team agreed represents a point value. Every point assigned here is a comparison to an anchor, never an hour estimate.
- **Done-cost**: everything between "ticket started" and "meets the definition of done": understanding, implementation, review, testing, integration, and release. With AI-assisted coding, typing is the cheapest part; points measure done-cost.
- **Spike**: timeboxed work that answers a question. It produces a decision or an artifact, not shippable scope, and it carries hours, not points.

## 1. Gather the inputs

Collect from the user, the tracker, or the repository:

- candidate backlog items in priority order, plus in-flight carryover work from the prior sprint (remaining done-cost);
- sprint length and dates (full sprint plan only);
- team members, availability (leave, on-call, part-time), and who can review which areas;
- completed points for the last three sprints (and whether those sprints already included spikes or reduced availability);
- the definition of done;
- anchors for at least 1, 3, and 5 points, ideally 2 and 8 as well.

When anchors are missing, propose them from completed stories the team recognises: pick one story per value, show its scope and the effort it took, and have the user confirm or replace each one. Points assigned without confirmed anchors are guesses with numbers on them, so no story receives a point until the anchors are confirmed. If anchors cannot be confirmed in this conversation, continue through the breakdown in step 3 and deliver it with the anchor request, leaving every point blank (skip steps 4–5). When fewer than three sprints of history exist (including zero), say so and treat capacity as a forecast range.

**Complete when:** every relevant input above is recorded or explicitly marked missing with its consequence, and either the anchors are confirmed or the run is marked for the step-3 unpointed exit.

## 2. Draft the sprint goal

Write one sentence naming the outcome the sprint delivers for a user or the business, chosen from the top of the backlog. The goal decides what belongs in the sprint: an item that does not serve it needs a stated reason to be included (a commitment, an incident, a deadline).

**Complete when:** the goal is one outcome sentence accepted by the user, or marked proposed for team confirmation in a single-pass draft.

## 3. Break down the work

Split each candidate feature into stories and spikes.

A **story** is a vertical slice a user or operator can observe when done. Split a story where a reviewer could reject one part while approving the other. Write it with:

- a title naming the outcome;
- acceptance criteria as checkable statements;
- dependencies on other stories, teams, or decisions;
- an **agent fit** tag: `mechanical` (renames, scaffolds, mappings, routine tests), `assisted` (an agent drafts, a human steers design), or `judgment` (unfamiliar integration, architecture, product nuance).

A **spike** replaces a story whenever the approach, feasibility, or expected result is unknown, including experimental AI or model work whose outcome may be "this approach does not work". Write it with:

- the question it answers;
- a timebox in hours or days;
- the exit artifact: a decision record, prototype, benchmark, or the follow-up stories with acceptance criteria.

Point the follow-up stories after the spike ends, not before.

**Complete when:** every candidate feature is fully covered by stories and spikes, each story has acceptance criteria and an agent-fit tag, and each spike has a question, timebox, and exit artifact.

## 4. Assign the points

Use the Fibonacci scale 1, 2, 3, 5, 8, 13. For each story:

1. Find the nearest anchor by done-cost and start from its value.
2. Move up when this story carries more of the drivers below than the anchor did; move down when it carries fewer.
3. Record the value with a one-line rationale naming the anchor and the driver that moved it.

Done-cost drivers:

| Driver | Moves the size up when |
| --- | --- |
| Uncertainty | behaviour, data, or an external system is unknown |
| Review load | the diff is large, cross-cutting, or in an area few people can review |
| Verification | it needs new test infrastructure, manual QA, migration rehearsal, or a staged rollout |
| Integration | it touches other teams, shared contracts, or deployment ordering |
| Agent fit | it is `judgment` work, where AI assistance gains little |

AI assistance lowers implementation effort and leaves review and verification untouched. A `mechanical` story can sit one step below a comparable hand-written anchor; a story whose generated diff will be large often moves up because of review load. When the anchors predate the team's AI tooling, say which ones and flag them for the retro.

A 13 means the story must be split before it enters the sprint. If no honest value exists because the approach is unknown, the story becomes a spike. Every assigned value is the plan's value; mark it so the team can challenge it in planning poker, and record any change the team makes.

**Complete when:** every story has a Fibonacci value of 8 or less with an anchor-based rationale, no 13 remains in the selection, and every unsizeable item has become a spike.

## 5. Fit the sprint to capacity

1. Compute capacity as: baseline velocity × (available person-days − extra spike person-days) ÷ a normal sprint's person-days, then deduct carryover remaining points. Use the 3-sprint mean when 3+ sprints exist; with 1–2 sprints use their range; with 0 sprints present a conservative forecast range flagged for confirmation. Deduct only spike days beyond what the baseline sprints already absorbed (avoid double-deducting), count one person-day per assignee, and show the arithmetic.
2. Check review load: count `assisted` and `judgment` points per reviewer area. Name any area whose reviewers are overloaded and rebalance, because review is where AI-assisted teams queue.
3. Select stories in goal order until capacity is reached. Draw the cut line there: mark the next one or two as stretch, each with the condition that would pull it in. When the candidates run out below capacity, report the gap and leave the choice to fill it to the team.

**Complete when:** the selected points sit within capacity, spikes are deducted, every review area has a named reviewer with a sustainable load, and stretch items carry their pull-in condition.

## 6. Write the plan

Save the plan where the team keeps sprint plans; otherwise use `docs/sprints/<sprint-name>.md`. Ticket text should be ready to paste into the tracker. Create or change tracker tickets only when the user asked for that in this conversation. When they did, create blockers first so every dependency can name a real ticket, use the tracker's native blocking link where it has one, and make each ticket a sub-issue of the feature or epic it came from when that exists. Write cross-references in a second pass with real IDs; a placeholder such as `#<n>` links to an unrelated issue.

The plan contains, in order:

1. **Sprint**: name, dates, goal.
2. **Capacity**: baseline velocity, availability factor, spike deduction, resulting capacity, and the history it came from.
3. **Anchors**: each value with its reference story.
4. **Committed work**: a table with ID, title, type (story or spike), points or timebox, agent fit, rationale, and dependencies.
5. **Stretch**: the stretch items and their pull-in conditions.
6. **Ticket text**: each story's acceptance criteria and each spike's question and exit artifact.
7. **Risks and open questions**: missing inputs, flagged anchors, overloaded review areas, and decisions the team must make in the session.

**Complete when:** the plan is saved or delivered in the requested form, every section is filled or marked missing with its consequence, and the user knows which values the team still needs to confirm.
