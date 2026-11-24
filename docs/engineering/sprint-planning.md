# Sprint Planning

Use `sprint-planning` to prepare a team sprint: a sprint goal, stories and investigation spikes broken out of features, Fibonacci story points, and a selection that fits capacity. It is model-invoked and can also be requested directly.

The result is a saved sprint plan with the goal, the capacity calculation, the confirmed anchors, a committed-work table, stretch items, ticket-ready text, and the risks and open questions the team must settle in the session.

## How it sizes work

Every point is a comparison to an **anchor**, a finished story the team agreed represents that value. Without confirmed anchors the skill proposes candidates from completed work and assigns no points until the team accepts them.

Points measure **done-cost**: everything from starting the ticket to meeting the definition of done. AI coding tools make implementation cheap but leave review, verification, and integration as they were, so those drivers decide most moves away from the nearest anchor. Each story also gets an agent-fit tag (`mechanical`, `assisted`, or `judgment`), and the capacity step checks that review load per area is sustainable.

Work whose approach or outcome is unknown, including experimental model work, becomes a timeboxed **spike** with a question and an exit artifact. Spikes carry hours, come off capacity first, and their follow-up stories are pointed after they finish. A 13 must be split before it enters the sprint.

## When it fits

An implementation plan for an agent to execute goes to `planning-and-task-breakdown`. An unresolved product decision goes to `grilling`. This skill owns the team-level commitment.

The plan is saved locally. Tracker tickets are created or changed only when the user asks for that.

## Example

"Plan our next sprint. Last three sprints did 34, 29, and 31 points, one dev is out for three days, here are our anchors and the top of the backlog. Save the plan; don't touch Jira."

The plan should derive capacity from the three-sprint mean, scale it for the leave, turn any unproven work into a spike, and give each story a value with the anchor and driver behind it.

## Design basis

The [research report](../research/2026-10-28-sprint-planning.md) records the community discussion this skill responds to and the preferred-source review.

The [2026-11 source sweep](../research/2026-11-16-source-repos-sweep.md) adds ticket creation order, native blocking links, sub-issues, and a second pass for real cross-references, from Matt Pocock's `to-tickets` and `wayfinder`.
