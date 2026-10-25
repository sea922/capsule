---
name: grilling
description: Stress-test a consequential or ambiguous plan, decision, or idea through a live interview. Use when the user asks to be grilled, wants their thinking challenged, or material choices remain silently assumed. Do not use for clear mechanical work, information retrieval, or review of a completed artifact.
---

# Grilling

Expose and resolve the decision branches that would otherwise remain hidden. Treat the interview as working process; hand the confirmed understanding back to the calling workflow.

## 1. Frame the decision

Read the available context. State the current hypothesis, the decision boundary, and the uncertainty that makes an interview useful. Resolve facts from accessible sources before questioning the user.

Grilling requires a live decision-maker. If the run is unattended, return the unresolved branches and who owns each decision, then stop. Do not answer them or claim shared understanding.

**Complete when:** the subject, boundary, and live decision-maker are clear.

## 2. Build the decision tree

Map the root choice and the consequential choices that depend on it. Keep facts and decisions separate:

- investigate discoverable facts with available tools;
- ask the user for judgement, preference, authority, intent, or information only they possess;
- return external evidence gaps to the caller's `research` workflow and empirical uncertainty to its `prototype` workflow; the caller owns any artifact creation and then returns the observation to the interview.

The **frontier** is every unresolved question whose prerequisites are already settled.

**Complete when:** the tree is explicit enough to identify the current frontier and no frontier question merely asks the user to retrieve an accessible fact.

## 3. Ask one frontier round

Ask independent frontier questions together unless the user requests one question at a time. Number each question and include:

1. the decision in plain language;
2. why it matters and what it changes downstream;
3. concrete options when comparison helps;
4. a recommendation with its principal trade-off.

Before sending the round, remove any question whose wording, options, or recommendation could change based on another unanswered question in that round. For example, settle the intended user and guest definition before asking about conversion thresholds, packaging, limits, or rollout evidence.

Wait for the user's answers. Do not choose on their behalf or bury the recommendation in neutral option lists.

**Complete when:** the user has answered the current frontier or explicitly deferred a branch.

## 4. Recompute and challenge

Fold the answers into the tree. Reopen, prune, or add branches as needed. Challenge contradictions, vague outcomes, unsupported urgency, hidden assumptions, accidental scope, and answers that avoid the actual trade-off. Then ask the new frontier.

Repeat until every consequential reachable branch is settled or explicitly owned as an unknown.

**Complete when:** no unresolved choice can silently change the proposed outcome, boundary, or trade-offs.

## 5. Confirm shared understanding

Summarize:

- the outcome and why it matters;
- decisions and consequential assumptions;
- constraints and non-goals;
- rejected alternatives and why;
- remaining unknowns and their owners.

Ask the user to confirm or correct the summary. Do not edit files, update trackers, create a plan, implement, commit, publish, or take other downstream action as part of grilling. The caller owns the durable artifact and all execution.

**Complete when:** the user explicitly confirms the summary. Return that summary to the caller without the interview transcript.
