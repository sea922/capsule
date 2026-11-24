---
name: api-design
description: Design or change an HTTP API contract, covering resource names, methods and status codes, one error shape, pagination, filtering and sorting, versioning, idempotency, rate limits, and whether a change breaks existing callers. Use when adding or reshaping endpoints, deciding what a request or response should look like, choosing a pagination or versioning scheme, or reviewing whether an API change is safe for consumers. Module and function interfaces inside one codebase belong to codebase-design; authentication and authorization depth to security-review.
---

# API design

An endpoint's shape is a promise to code you do not control. Callers come to depend on everything they can observe, documented or not, so decide the contract on purpose and treat any change to it as a change to someone else's system.

A private endpoint with a single caller in the same deployable unit needs little of this: match the surrounding code and move on.

This skill covers REST-style APIs over HTTP. GraphQL, gRPC, and webhooks call for the same thinking about consumers and compatibility, but their specifics are outside it.

## 1. Read the API that exists

Read three or four neighbouring endpoints before designing anything, plus the API description, the shared error and pagination helpers, and any style guide. Record what the project already does for URL style, field casing, date and money formats, identifiers, the error body, authentication, pagination, and versioning.

Those conventions win over every default in this skill. An endpoint that disagrees with its neighbours is a defect even when it is individually better. Where the existing API disagrees with itself, say so and follow the dominant convention; do not add a third.

List the known consumers: the project's own clients, other services, mobile releases that cannot be force-updated, partners, and webhook receivers. When the list cannot be completed, say the reach is unknown. Unknown is not the same as none.

**Complete when:** the existing conventions are recorded, and the consumers are listed or their reach is stated as unknown.

## 2. Model resources and operations

Name resources as nouns from the consumer's vocabulary, not as a mirror of database tables. An API that is a view of the schema ties every later schema change to a contract change. Nest a resource under a parent only when it cannot exist without that parent, and keep nesting to one level.

Choose the method by its contract. `GET` is safe and never changes state. `PUT` replaces the whole resource and can be repeated. `PATCH` changes part of it and is not guaranteed repeatable; state which patch format. `DELETE` can be repeated with the same end state. `POST` is everything else. `POST` and `PATCH` are the ones a client may not blindly retry.

When an operation is an action that resists this, model it as a subordinate resource (`POST /orders/{id}/refunds`) or a named state transition (`POST /jobs/{id}/cancel`) rather than a verb-shaped URL family or a flag hidden in a `PATCH`.

**Complete when:** each resource and operation has a name, a method chosen by its contract, and a place for any action that is not plain create, read, update, or delete.

## 3. Decide the responses

For each endpoint, list the success status and every error status it can return. Use the status line for the outcome and the body for detail: never a success status wrapping an error, and never a server error for a caller's mistake. The [contract reference](references/CONTRACT.md) has the status table and the usual confusions.

Use one error shape for the whole API. It needs a stable machine-readable code, a human-readable message, per-field detail for validation failures, and a request or correlation identifier. With no precedent in the project, `application/problem+json` is a reasonable default. Errors carry no stack traces, queries, internal hostnames, or another tenant's identifiers.

Decide how absent data is expressed (omitted field, `null`, or empty collection) and keep it uniform. Validate input where it enters, reject malformed input before any work is done, and say whether unknown fields are rejected or ignored, since that choice decides whether new request fields can ever be added safely.

**Complete when:** every endpoint lists its success and error statuses in the one error shape, and the rules for absent data and unknown fields are stated.

## 4. Design collections

Every collection endpoint is bounded: a default page size, a server-enforced maximum, and a stable order with a unique tiebreaker. Choose the pagination style from how the list is used and how large it gets:

- **Cursor** for large, growing, or frequently changing sets and for public APIs. The cursor is opaque to callers. Deep pages stay fast and concurrent inserts do not shift results.
- **Offset** for small, stable lists a person browses by page number. It degrades on deep pages and skips or repeats rows when the set changes mid-scan.

A total count is a separate and often expensive promise; offer it only when a consumer needs it. Filtering and sorting accept an allowlist of fields. A client string never reaches a query expression, and each allowed field is a compatibility commitment and usually an index. Details are in the [contract reference](references/CONTRACT.md).

**Complete when:** every collection has a page size, a maximum, a stable order, a pagination style with its reason, and allowlisted filter and sort fields.

## 5. Make writes safe to retry

Networks fail after the server has acted, so decide for every write what happens when the same request arrives twice. Give non-repeatable operations with real cost (payments, messages, order creation) an idempotency key supplied by the client, and specify the server's behaviour: the key is claimed atomically, a replay returns the original result, and the same key with a different body is rejected. Accepting a key and handling it carelessly is worse than not offering one, because the client now believes retrying is safe.

For updates that can conflict, choose between last-write-wins and a precondition (`ETag` with `If-Match`, or a version field) and return `412` when an `If-Match` precondition fails, or `409` when a version field in the body is out of date. For work that outlives the request, return an accepted status with a resource the caller can poll.

**Complete when:** each write states what a repeated request does, and each conflicting update states its rule.

## 6. Set limits and access

State for each endpoint whether it is public or needs authentication, and which caller may act on which resource, including whether one user can read another's record. Decide whether a forbidden resource answers as forbidden or as not found, since confirming existence can leak information. Load `security-review` when the change adds an authentication scheme, a trust boundary, or tenant isolation.

Bound what a caller can ask for: request body size, page size, filter and expansion depth, and a rate limit with a documented response (`429` and `Retry-After`) and headers that let well-behaved clients slow down first. Pick limits from the expected use, and say which ones are estimates.

**Complete when:** each endpoint states who may call it and on which resources, and its size and rate limits, with estimates marked.

## 7. Classify the change and choose a versioning rule

Classify each change as additive or breaking before it ships. Additive: new endpoints, new optional request fields, new response fields. Breaking: removing or renaming a field, changing a type or format, tightening validation, changing a default, changing a status or error code, changing ordering callers rely on, or keeping a name while changing what it means. A new enum value is breaking unless consumers were told to tolerate unknown values. When it is unclear, treat the change as breaking.

Prefer extending the current version over creating a new one. If the project has no versioning mechanism, pick one (URL path, media type, or a date header) and do not mix them. For a breaking change, plan the path: introduce the replacement alongside, announce the deprecation with a date, measure remaining use, and remove only when use has stopped or the date has passed with notice. Sequencing a storage change underneath belongs to `database-migrations`.

**Complete when:** each change is classified, and each breaking change names its consumers and its deprecation path.

## 8. Record the contract

Write the contract where the project keeps it, normally an OpenAPI description, before or with the implementation. Where the stack allows, generate the description from the handlers or schemas; where it is written by hand, add a check that fails when the description and the handlers disagree. A description nothing can fail drifts.

Each endpoint records its method and path, request schema, success response, every error status with its code, authentication and authorization, pagination, idempotency behaviour, and limits. Record a choice others must follow, such as the API's pagination or versioning scheme, with `decision-records`.

**Complete when:** the contract is written where the project keeps it, and something fails when it and the handlers disagree, or the lack of such a check is stated.

## 9. Check it against a consumer

Walk one real consumer sequence end to end and write out the actual requests and responses: authenticate, create, read back, page through a list, hit a validation error, hit a missing resource, retry a write. Most design mistakes surface here.

Then confirm:

- Each deviation from existing conventions is deliberate and stated.
- Every endpoint lists its success status and each error status, all in the one error shape.
- Collections are bounded and stably ordered; filter and sort fields are allowlisted.
- Retry behaviour is defined for every write.
- Each change is classified, breaking changes are named with the consumers they affect, and a removal has a deprecation path.
- The description matches the handlers, by generation or by a failing check.

Contract tests that pin these behaviours are written with `tdd`. Publishing an API, or changing an endpoint other teams or external callers already use, is outward-facing: name the breaking changes and their consumers and get confirmation before it ships.

**Complete when:** one consumer sequence is written out with real requests and responses, the list above holds, and any outward-facing change has confirmation.

## Report

Give the endpoints with their contracts, the conventions followed and any deliberate deviation, the classification of each change, the consumers considered and whether the list is complete, and what was verified against what was only designed. If the description and the implementation disagree, report both and which one is wrong; do not quietly edit the description to match a regression.
