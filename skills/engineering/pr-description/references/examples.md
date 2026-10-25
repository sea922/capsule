# PR examples

Read when choosing wording or evidence for a particular change type. These are
invented examples, not verified results. Replace evidence placeholders with
observed outcomes and follow the project's template and title convention.

| Change | Example title | Body content that earns its space |
| --- | --- | --- |
| Bug fix | Prevent duplicate charges when payment requests retry | Trigger and previous failure; how the behavior changes; reproduction result and remaining integration gaps |
| Feature | Let workspace owners export audit history | Who gains the capability, scope/permissions, evidence for successful export and denied access |
| Refactor | Centralize token expiry checks | Why consolidation is needed, intended behavior preservation, evidence across existing callers; name any intentional behavior change |
| Contract change | Paginate the list-projects API response | Affected consumers, before/after of the request or payload shape, migration step and compatibility window |
| Migration | Preserve existing subscriptions during plan migration | Compatibility window, migration evidence, rollout sequence, irreversible steps, recovery limits |
| Dependency update | Upgrade the parser to reject malformed headers | Relevant upstream change and local compatibility evidence; disclose untested integrations |
| Stacked change | Store revocation epochs for subsequent session checks | This slice's role, named parent, what consumes it now, and known follow-on work; do not claim enforcement before it exists |

Example fix body:

~~~markdown
## Summary

A timeout after a successful payment could make a retry create a second charge.
Retries now reuse one idempotency key per payment attempt.

```text
chargePayment(attempt)
  key = attempt.idempotencyKey   # was: new key per call
  provider.charge(amount, key)
```

## Evidence

- **Before:** [reproduction command] -> two charges for one attempt.
- **After:** same command -> one charge; retry returns the original result.
- Not run: [integration check and its practical limit].

## Merge danger

**Door:** two-way. Reverting restores per-call keys.

**Blast radius:** checkout for every customer; if wrong, retried payments fail
or double-charge until reverted.
~~~

Example mechanical refactor body:

~~~markdown
## Summary

Token expiry checks now use one implementation, so every caller applies the same
boundary condition. Behavior is intended to remain unchanged.

```diff
 src/auth/
-├── session-expiry.ts
-├── refresh-expiry.ts
+├── expiry.ts           # single boundary check
 └── session.ts
```

## Evidence

- **Before/after:** [existing regression suite and its result on both revisions].

## Merge danger

**Door:** two-way.

**Blast radius:** every authenticated caller; if wrong, sessions near expiry are
accepted or rejected one tick early or late.
~~~

Example breaking contract body:

~~~markdown
## Summary

`GET /projects` now returns one page of results with a cursor instead of every
project, so large workspaces no longer time out. Clients that read the top-level
array must read `items` and follow `nextCursor`.

```diff
-[{ "id": "p1" }, { "id": "p2" }]
+{ "items": [{ "id": "p1" }], "nextCursor": "c2" }
```

## Evidence

- **Before:** [listing request on a large fixture workspace] -> timeout.
- **After:** same request -> first page with a cursor; following the cursor
  returns the remaining projects once each.

## Merge danger

**Door:** one-way. Revert restores the array, but clients migrated to `items`
break again, so the API needs a compatibility window rather than a revert.

**Blast radius:** every API client that lists projects, including the CLI and
third-party integrations.
~~~

Example migration merge danger:

~~~markdown
## Merge danger

**Door:** one-way. The backfill rewrites plan IDs in place; revert restores the
code but not the old IDs, so recovery needs the pre-migration snapshot.

**Blast radius:** affected subscribers lose access until restored.
~~~

## Editing checks

| Weak wording | Revision rule |
| --- | --- |
| “Update files” | Name the resulting behavior or concrete structural change |
| “Add retry.ts and edit payment.ts” | Explain the payment outcome; file changes are visible in the diff |
| “Fully tested” | Show the before/after result for the exercised behavior and name material gaps |
| “Addressed review feedback”, “Implemented step 3 of the plan” | Name the behavior the change now has; prompt, plan, and review history are not review context |
| A pasted test log | Quote the one result line that proves the claim |
| “Fix retries” when scope also changes charge identity | Cover both outcomes in title/opening or find a precise shared outcome |
| “Safe rollback” for an irreversible migration | State the actual recovery procedure and its limits |
| “Low risk” | Name the door and who is affected if the change is wrong |

**Complete when:** examples have guided the wording without introducing invented
facts, unearned guarantees, or sections that answer no reviewer question.
