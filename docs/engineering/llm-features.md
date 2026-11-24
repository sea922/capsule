# LLM features

Use `llm-features` to build, evaluate, and tune product features that call a language model.

Examples:

- “Add an LLM step that extracts fields from these documents.”
- “Write evals for our summarizer before we change the prompt.”
- “Our model bill doubled; bring it down without hurting quality.”
- “The assistant got worse after the last release. Find out why.”
- “Which of these two models should we use for triage?”

The skill first asks whether a model is needed at all: regular input is parsed with ordinary code, and only the low-confidence remainder goes to a model, with the split measured on real inputs. Before any prompt is written it defines capability and regression evals, a grader for each case, the number of trials, and the pass thresholds. It then builds the smallest pipeline that passes and adds retrieval, tools, or extra steps only when an eval shows the need.

Cost and latency are instrumented and then reduced by routing each class of input to the cheapest model that passes, ordering prompts so the stable prefix can be cached, setting budgets, and retrying only transient failures. When an app behaves worse than the bare model, the skill audits its layers, from the assembled prompt through memory, tools, and rendering to hidden repair passes, and records findings with evidence. Alternatives are compared head to head on the project's own tasks. Every change is kept or reverted on eval results.

For retrieval features, a reference covers when to retrieve at all, chunking, evaluating retrieval apart from generation, access control at retrieval time, and treating retrieved text as untrusted.

The skill stays provider-neutral: model names, prices, and caching rules come from the provider's current documentation, not from the skill.

## Workflow fit

`writing-for-agents` owns the wording of prompts, skills, and tool descriptions. `benchmark` owns longer optimization loops with a frozen metric. `security-review` owns prompt injection, tool permissions, and data exposure, and `production-readiness` the launch decision.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/llm-features/SKILL.md).
