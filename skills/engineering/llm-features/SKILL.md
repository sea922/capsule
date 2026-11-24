---
name: llm-features
description: Build, evaluate, and tune product features that call a language model, from deciding whether a model is needed at all to evals, cost and latency control, and diagnosing a pipeline or agent that behaves badly. Use when adding or changing a feature that calls an LLM API, writing evals for one, cutting its cost or latency, choosing between models, prompts, or agents, or working out why an LLM app got worse. Prompt, skill, and tool wording belongs to writing-for-agents; measurement loops to benchmark; agent security to security-review.
---

# LLM features

A model call is slow, costly, and not repeatable, so it has to earn its place. Use deterministic code where it works, send the model only what is left, and keep or revert every change on eval results from the project's own data rather than on how one output looked.

## 1. Decide whether a model is needed

Look at real inputs before choosing a tool. Sort the job:

- **Regular structure** (repeating formats, known fields, fixed vocabularies): parse it with ordinary code. It is fast, free, and testable.
- **Mostly regular, with a tail of odd cases:** parse with code, score each result's confidence from concrete signals (a missing field, too few options, a value outside its range), and send only the low-confidence items to a model.
- **Free-form or judgment-heavy** (open text, summarizing, classification with fuzzy edges): use a model, and keep code checks around it.

Measure the split on a sample instead of guessing it: how many items code handles correctly, how many fall through, and what each fallthrough costs. A model fixing the tail should return the same typed shape as the code path, so the rest of the system cannot tell which produced a result.

**Complete when:** the share of the job each path handles is measured on real inputs, and the model's part is named.

## 2. Define evals before building

Write what success means before the first prompt, following [references/EVALS.md](references/EVALS.md):

- **Capability evals:** cases the feature must newly handle, drawn from real inputs, including hard and adversarial ones.
- **Regression evals:** behaviour that already works and must keep working.
- **A grader for each case:** code when the answer can be checked (exact match, schema, a test run), a model with a written rubric when it cannot, a person for the few calls that carry real risk.
- **Pass criteria, agreed up front:** the threshold for each set and how many trials each case runs, since one pass of a non-deterministic system proves little.

Version the eval set with the code. Keep a held-out portion you do not tune against.

**Complete when:** the cases, graders, trial count, and thresholds are written down and the evals run against a trivial baseline.

## 3. Build the smallest pipeline

Start with one call, a plain prompt, and typed output validated at the boundary. Add retrieval, tools, memory, multiple steps, or a second model only when an eval shows the simpler version failing, and add one at a time so the eval attributes the gain. Read the provider's current documentation, or the project's own client wrapper, for model names, parameters, and limits; do not write them from memory.

Keep these out of the prompt and in code: required tool calls, output schemas, permissions, and limits. A rule that exists only as prompt text is a request. Treat retrieved documents, tool results, and user text as data the model may be steered by, and validate what comes back before acting on it. Use `writing-for-agents` for the prompt and tool descriptions themselves.

**Complete when:** the simplest version that passes the agreed thresholds is identified, and each added part has an eval result that justifies it.

## 4. Control cost and latency

Instrument first: tokens in and out, cache reads and writes, latency, model, and outcome for every call. Then apply the levers in [references/COST.md](references/COST.md), measuring each:

- **Route by difficulty:** the cheapest model that passes the evals for a class of input, with the threshold in configuration and the routing decision logged.
- **Cache the stable prefix:** fixed instructions, tool definitions, and reference material first, changing content last, confirmed by the provider's cache counters.
- **Budget:** a spend and token limit per request, per batch, and per user, checked before the call, failing early instead of overspending.
- **Retry narrowly:** only transient failures (timeouts, rate limits, server errors), with backoff and a cap. Never retry authentication, validation, or refusal responses.

A saving that drops an eval below its threshold is a regression, not a saving.

**Complete when:** cost and latency per unit of work are measured before and after, and quality held on the same evals.

## 5. Audit the layers when behaviour is poor

When the app is worse than the bare model, or got worse after a change, do not start by rewording the prompt. Capture one failing case end to end and walk the layers in [references/AUDIT.md](references/AUDIT.md): assembled prompt, history, memory, summaries, tool choice, tool execution, tool results, output shaping, rendering, hidden retry or repair passes, and persisted state. Compare what the model actually received and produced with what the user saw.

Record each finding as symptom, mechanism, layer, and evidence (a file and line or a log entry). Prefer fixes in code: enforce required tool calls, remove or expose silent second passes, cut context that arrives twice, and let a user's correction outrank the app's own stored notes. Add the failing case to the regression evals before fixing it. `diagnosing-bugs` owns ordinary defects in the surrounding code.

**Complete when:** the failing layer is named with evidence, or the layers checked and cleared are listed.

## 6. Compare alternatives head to head

To choose between models, prompts, pipeline designs, or coding agents, run each on the same task set drawn from the project's own work, from the same starting state, with the same graders, several trials each. Report pass rate, consistency across trials, cost, and time together; a small quality gain at many times the cost may not be the right trade. Include at least one deterministic grader per task. Change one variable per comparison.

Use `benchmark` when the comparison becomes a longer optimization loop with a frozen metric and a promotion gate.

**Complete when:** each option has results from the same tasks and trial count, and the choice names what it trades.

## 7. Keep or revert, then report

Keep a change only when the regression set holds and the capability set or the cost improves by more than run-to-run noise. Otherwise revert it and record what was tried. Report:

- what the model does and what code does, with the measured split;
- eval results against the thresholds, with trial counts;
- cost and latency per unit, before and after;
- what was not measured, and anything taken from provider documentation instead of observation.

Do not call a figure a result unless it was measured in this project. Use `verification-before-completion` before claiming the feature is done, `security-review` for prompt injection, tool permissions, and data exposure, and `production-readiness` before launch.
