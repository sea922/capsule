# Lesson format

One lesson per file. Name the file after the problem a reader would search for, in kebab-case: `webhook-dedup-collides-across-modes.md`, not `fix-2026-09-27.md`. Use a subdirectory only when the store already groups lessons that way.

Match an existing store's frontmatter and section names when they differ from these; consistency across the store beats this template.

## Template

```markdown
---
title: Webhook deduplication collides across test and live mode
date: 2026-09-27
area: payments/webhooks
tags: [webhooks, idempotency]
retire_when: The provider guarantees globally unique event ids, or webhooks stop using event-id deduplication. Check the provider changelog and src/payments/webhooks/dedup.ts.
---

# Webhook deduplication collides across test and live mode

## Symptom
Live webhook events were silently dropped as duplicates after a test-mode replay on the same database.

## Cause
The provider reuses event ids across test and live mode. Deduplicating on the id alone treats a live event as a replay of a test event.

## What did not work
- A unique index on `event_id`: it enforced the same wrong key.
- Separate tables per mode: the replay tooling writes through the shared path.

## Fix
Deduplicate on `(livemode, event_id)`. See `src/payments/webhooks/dedup.ts` and the regression test `dedup.test.ts > "keeps live event after test replay"`.

## Why it stays written down
The composite key looks redundant to a reader who does not know the provider reuses ids; the provider documentation does not say so.
```

## Section rules

- **Symptom** uses the words a future reader would search for: the error text, the observed behaviour.
- **What did not work** carries the approaches a reasonable engineer would try first. Omit the section only when there were none.
- **Fix** points at the code and test rather than reproducing them.
- **Why it stays written down** names what is not recoverable from the fix. If this section cannot be written, the lesson fails the durable bar.
- **retire_when** names an observable change and where to check for it. "When no longer relevant" is not a retirement condition.

Omit session narrative, lists of changed files, and restatements of contracts another file owns.
