---
name: prototype
description: Build a small experiment to answer a design or feasibility question through observation. Use for trying a state model, comparing an interaction, or measuring an uncertain approach. Established bug diagnosis belongs to diagnosing-bugs; production changes belong to implement.
---

# Prototype

Answer one empirical question with the smallest artifact that can distinguish the alternatives.

## 1. Define the experiment

Name the question, competing expectations, representative input or interaction, and the observation that would change the decision. Resolve human preferences through the user; measurement cannot choose a product goal. For an existing failure, use `diagnosing-bugs` instead.

Set a task-appropriate effort bound and completion condition. Use a throwaway location allowed by the repository or a unique temporary directory. Check the destination before writing and preserve existing work. A request to build a prototype authorizes that artifact; a read-only question permits observations but does not authorize creating it.

**Complete when:** the question is testable, the experiment is within scope, and its location and stop condition are clear.

## 2. Build the discriminating slice

Reuse the available runtime, dependencies, and fixtures where they preserve the property being tested. Implement only what the observation needs. Synthetic data and stubbed boundaries are appropriate when they cannot determine the answer; disclose them.

For UI questions, build the states and interactions needed for comparison and inspect them in a real renderer. For logic or performance, run representative and decisive boundary cases; compare alternatives under equivalent conditions. Separate measurements from estimates.

**Complete when:** the artifact exercises the uncertain property and the observed result distinguishes alternatives, or the agreed effort bound has been reached.

## 3. Interpret and preserve

Record the question, method, exact run instructions, observations, limitations, and artifact path. Classify the result as supports, contradicts, or inconclusive relative to the hypothesis. Explain which decision the result supports and which production properties remain untested.

Keep the artifact available for inspection and terminate task-owned background processes. “Throwaway” limits engineering investment; it does not grant deletion authority. If the user already requested production implementation, return the evidence to `implement` and continue using production contracts and checks. Otherwise return the result and the next decision.

**Complete when:** the observation is reproducible, the decision follows from it, and the prototype is distinguishable from a verified production change.
