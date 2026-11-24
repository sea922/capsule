# Contract reference

Defaults for the choices in [api-design](../SKILL.md). The project's existing conventions take precedence over all of them.

## Status codes

| Status | Use it when |
| --- | --- |
| `200` | The request succeeded and the body carries the result |
| `201` | A resource was created; include `Location` pointing at it |
| `202` | The work was queued; the body says how to follow it |
| `204` | The request succeeded and there is nothing to return |
| `400` | The request is malformed: bad syntax, wrong content type, unparseable body |
| `401` | No valid credentials were presented |
| `403` | The caller is identified and not allowed |
| `404` | The resource does not exist, or its existence must not be confirmed |
| `409` | The request conflicts with current state: duplicate, version mismatch, invalid transition |
| `412` | A precondition such as `If-Match` failed |
| `422` | The request is well formed and fails validation or a business rule |
| `429` | The caller exceeded a limit; include `Retry-After` |
| `500` | The server failed; the body reveals nothing internal |
| `503` | The service is temporarily unavailable; include `Retry-After` when known |

Usual confusions:

- `400` against `422`. Projects differ on where the line sits; pick one rule and apply it everywhere.
- `401` against `403`. The first means "identify yourself", the second "identified, and no".
- A success status with an error in the body. Monitoring, caches, and client libraries all read the status line.
- A server error for invalid input. It pages the wrong people and invites the client to retry.

## Error body

One shape for every error. A workable minimum:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "The request has invalid fields.",
    "details": [{ "field": "email", "code": "invalid_format", "message": "Must be an email address." }],
    "request_id": "req_8f3a"
  }
}
```

- `code` is the contract: stable, documented, and what clients branch on. The message can change and may be localized.
- Validation reports every failing field at once, not the first one found.
- `application/problem+json` (RFC 9457) offers the same information as a standard and is a sound choice for a new API.

## Pagination

| | Cursor | Offset |
| --- | --- | --- |
| Request | `?limit=50&cursor=<opaque>` | `?limit=50&offset=100` or `?page=3` |
| Deep pages | Constant cost | Cost grows with the offset |
| Changing data | No skipped or repeated rows | Rows shift between pages |
| Jump to page N | No | Yes |
| Fits | Feeds, large or growing sets, public APIs, sync | Small stable lists, admin tables, page-numbered search |

For either style:

- Sort by a stable key and add a unique tiebreaker such as the identifier, or rows with equal keys move between pages.
- Encode the cursor so callers cannot build or edit one, and say how long it stays valid.
- Return the next cursor, or its absence, as the signal that the list is finished. Do not make callers infer the end from a short page.
- Enforce the maximum page size on the server and say what happens when a caller asks for more: clamp or reject.

## Filtering, sorting, and field selection

- Simple equality as plain query parameters: `?status=active`.
- Ranges and operators in one consistent notation, for example `?created_at[gte]=2026-01-01`.
- Sorting in one parameter with a direction marker: `?sort=-created_at,name`.
- Free-text search in a dedicated parameter such as `?q=`, separate from structured filters.
- Field selection or expansion (`?fields=`, `?include=`) only when a consumer needs it, with a bounded depth.

Every accepted field comes from an allowlist and maps to a query the database can serve. Unknown parameters are either rejected or ignored; choose one and document it.

## Idempotency keys

- The key is generated once per intent by the client or the initiating event and reused on every retry. A key generated per attempt protects nothing.
- The server claims the key in one atomic write, such as an insert under a unique constraint. Reading first and writing after is a race between concurrent retries.
- Store a hash of the request with the key. The same key with a different body is a client bug and is rejected, not answered with the first response.
- Store the outcome and return it on replay. Decide what a replay sees while the first attempt is still running: usually a conflict status telling the client to retry later.
- Decide whether failures are stored. Replaying a validation failure is safe; replaying a transient server failure blocks a retry that would have worked.
- Keys expire. State the retention period and scope keys to the caller so one client's key cannot collide with another's.

## Rate limits

State the limit, its window, and what it is keyed on (credential, account, address, endpoint). Exceeding it returns `429` with `Retry-After`. Expose remaining allowance in response headers, using the project's existing header names, or the current IETF rate-limit header draft after checking its status, so clients can slow down before being refused. Give expensive endpoints their own tighter limit instead of lowering the global one.

## Deprecation

1. Ship the replacement beside the old form.
2. Mark the old form deprecated in the description and announce a removal date. `Deprecation` and `Sunset` response headers make the notice machine-readable.
3. Measure who still calls the old form and contact them where they are known.
4. Remove it when use has stopped or the date has passed with notice. Afterwards answer with `410` or a clear error, not silence.

Notice periods depend on the consumers: a first-party web client can move in one release; mobile apps and partners need months.

## Common formats

- Timestamps in ISO 8601 with an explicit offset, normally UTC.
- Money as an integer in minor units, or a decimal string, with a currency code. Never a float.
- Identifiers as opaque strings, so their format can change.
- Enumerations as strings, with consumers told whether new values may appear.
- One field casing across the API.
