# Cost and latency

Load this when a feature's model spend or response time needs to come down, or before a batch job whose cost is not yet known.

Prices, model names, cache rules, minimum cacheable sizes, retention times, and usage field names differ by provider and change often. Read the provider's current documentation and pricing page for the exact model and endpoint in use, and keep those values in configuration, not scattered through the code.

## Measure first

Log per call: model, input tokens, output tokens, cached tokens read and written, latency (time to first token and total), retries, and the outcome. Aggregate per feature and per unit of work (a document, a conversation, a ticket). Without this, every later step is a guess.

Estimate a batch before running it: items times expected tokens times the current rate, checked on a small sample.

## Cheapest levers first

1. **Do not call the model.** Handle regular input with code, cache whole results for identical inputs, and skip work whose output is unused.
2. **Send less.** Trim instructions, examples, history, and retrieved text that an eval shows are not needed. Shorter prompts are also faster.
3. **Ask for less.** Output usually costs more per token than input and dominates latency. Request structured, bounded output.
4. **Route by difficulty.**
5. **Cache the stable prefix.**
6. **Use asynchronous or batch processing** for work no one is waiting on, where the provider discounts it.

## Routing

Send each class of input to the cheapest model that passes the evals for that class.

- Start every class on the cheapest candidate and move a class up only when its evals fail.
- Route on signals available before the call: input length, item count, input class, or a low confidence score from a code path.
- An escalation path (try cheap, check the result with code, retry on a stronger model on failure) works when the check is reliable. Count both calls in the cost.
- Keep thresholds and model identifiers in configuration, log each routing decision, and tune thresholds from the logs.

## Prompt caching

Providers can reuse a request prefix they have seen before, charging less and answering faster for the reused part. The mechanics vary; the layout rule does not:

- Put content that repeats across requests first: fixed instructions, tool definitions, examples, reference material. Put what changes last: the user's question, fresh retrieval results, timestamps, request metadata.
- A prefix matches only when it is identical. A timestamp, a reordered tool list, or a per-user string near the top defeats reuse from that point on.
- Check the provider's rules for the model in use: whether caching is automatic or must be requested, the minimum size, how long an entry lives, and whether writing an entry costs more than ordinary input. Where writes cost extra, caching pays only if the prefix is reused enough within the entry's lifetime; work the arithmetic with current rates.
- Do not pad a prompt or widen what it can read just to reach a caching threshold.
- Caching reduces price and latency. It does not free context window.
- Confirm with the usage counters the API returns. Report cached input as a share of total input, and label any hit rate that was not measured from real traffic as an estimate.

Caching is not access control. Decide what a user may see before building the request, and never let a shared cached prefix carry one user's or tenant's private content to another.

## Budgets

- Set limits at each level that can run away: per request (maximum output, maximum tool-loop steps), per job or batch, per user or tenant, and per day for the feature.
- Check the budget before the call and stop with a clear error when it is spent. A batch that fails early is cheaper than one that overspends.
- Track spend as an append-only record of calls, so a total can be audited and a bad figure traced to its call.
- Alert on a change in cost per unit of work, not only on total spend.

## Retries

Retry only failures that may succeed next time: timeouts, connection errors, rate limits, and server errors. Use exponential backoff with jitter, honour any retry delay the provider returns, and cap attempts. Do not retry authentication failures, invalid requests, or content the model declined; they fail the same way and cost again. Make retried operations safe to repeat, and count retries against the budget.

## Verify the saving

Rerun the same evals after each change. Report cost and latency per unit of work before and after, with the quality result beside them.
