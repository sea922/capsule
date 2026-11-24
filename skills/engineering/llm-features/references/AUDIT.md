# Layer audit

Load this when an LLM app or agent behaves worse than the bare model, got worse after a change, or fails in ways rewording the prompt has not fixed.

## Scope and evidence

Write down the system, how users reach it, the models and providers involved, the symptom in the user's words, and when it began. Then collect evidence before forming a theory:

- one or more failing cases, captured end to end: the exact request sent to the model, the raw response, every tool call and result, and what the user finally saw;
- the code that assembles the prompt, routes tools, admits and recalls memory, and post-processes output;
- configuration: prompt templates, tool definitions, provider settings;
- what changed around the time the symptom began.

Run the same input against the model directly, with the assembled prompt and without the app. If the bare call is fine, the fault is in a layer.

## The layers

| Layer | Typical fault | What to check |
| --- | --- | --- |
| System prompt | Conflicting or accumulated instructions | The assembled text, not the template; rules that contradict each other |
| Conversation history | Stale turns steering the current one | What is carried forward, and truncation |
| Long-term memory | Old or wrong notes resurfacing; corrections that do not stick | What is admitted, by whom, and what overrides what |
| Summaries | Compressed text returning as if it were fact | Whether a summary can be told apart from a source |
| Recall | The same content arriving through several paths | Duplicates across prompt, history, memory, and retrieval |
| Tool selection | Wrong tool, or a required tool skipped | Whether the requirement lives in code or only in prose |
| Tool execution | A claimed call that never ran | Execution records against the model's account of them |
| Tool results | Output misread, truncated, or ignored | The result as the model saw it |
| Output shaping | A correct answer damaged by formatting or parsing | Raw response against the shaped one |
| Rendering and transport | Streaming, markdown, or a client altering the answer | Logged answer against the displayed one, on each surface |
| Hidden second passes | A silent fallback, repair, or rewrite call | Every model call made per user request |
| Persistence | Expired state or cached output served as current | Cache keys, lifetimes, and invalidation |

Audit only the layers the system has, and say which were skipped.

## Recurring patterns

- **Wrapper regression:** fine in a direct call, wrong in the app, often after a new prompt layer was added.
- **Memory contamination:** unrelated past topics appear, or a user's correction loses to an older stored note.
- **Tool discipline failure:** the prompt says a tool must be used and the model answers without it, or describes a call that did not happen.
- **Transport corruption:** logs show the right answer and the user sees a broken one.
- **Hidden layers:** the answer changes between generation and delivery because another pass rewrote it.

## Findings

Record each as: symptom, mechanism, layer, root cause, evidence (file and line, or log entry), and confidence. Separate what was observed from what was inferred. A finding without evidence is a hypothesis; say so.

## Fix order

1. Enforce in code what the prompt only requests: required tool calls, schemas, permissions.
2. Remove silent repair and fallback passes, or make them explicit with a stated contract and a log entry.
3. Remove context that arrives more than once.
4. Tighten what memory admits, and let a user's correction outrank the app's own assertions.
5. Stop compressing what must stay exact, and label summaries as summaries.
6. Reword the prompt last, once the structure is sound.

Add each failing case to the regression evals before fixing it, change one layer at a time, and rerun the full set after each change. A fix that helps the reported case and lowers the suite is not a fix.
