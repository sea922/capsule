# Approval and freshness contract

Use this contract before drafting from an upstream artifact, recording a gate,
or starting/resuming delivery. A status label alone never authorizes a transition.

## Compute the reviewed revision

From the **target project's Git working directory**, run the bundled helper using
the installed `adlc-gate` directory, not a guessed project-relative skill path:

```text
node "<adlc-gate directory>/scripts/content-hash.mjs" "<artifact path>"
```

Requires Node.js 18+ and Git. It is read-only and prints the full Git blob hash
using that repository's object format. An error or unavailable runtime means
freshness is unverified; never substitute a guessed hash or fall back to the old
shell snippets. It does not authenticate a human, parse approval decisions, or
enforce permissions.

The byte contract normalizes CRLF to LF and removes an optional UTF-8 BOM,
excludes only the top-level `status:` line inside the opening YAML frontmatter,
and excludes the final, unfenced `## Approvals` section. That section contains
only the six-column approval table, or is empty on a draft. Put requirements,
conditions carried into the artifact, and other substantive text **before** it.
Fenced source material remains in the hash, including quoted `status:` or
`## Approvals` lines. Keep source material in a fence longer than any fence
inside the pasted content; never let pasted text close its own data boundary.

Well-formed existing LF artifacts keep their hashes. If a legacy artifact used
CRLF, BOM, a quoted approval heading, or another excluded body `status:` line,
compare the helper result with the existing record. A mismatch needs a new
human review; never rewrite an old reviewed hash to make it match. An invalid
ledger layout needs an explicitly disclosed repair and renewed review.

## Verify the chain from the root

1. Read intent, then spec, then plan as far as this operation needs them. Confirm
   their stage and work-item identity agree; resolve `source` paths using the
   project's convention (fallback: repository-relative paths). Do not guess
   between multiple work items or follow source cycles.
2. For each artifact, compare its current hash with the **latest decision row
   for that stage**, not the latest historical approval that happens to match.
   Require `status: approved`, a complete row, an explicitly recorded human
   identity, and decision `approved`, `approved-with-conditions`, or `waived`.
   A missing row, rejected/superseded artifact, mismatch, or unverifiable record
   cannot pass. A row records a decision; it is not cryptographic identity proof.
3. For each downstream artifact, require `source: <upstream path>@<full hash>`
   to match the **currently approved** upstream content. Check this even when
   both artifacts independently have matching approvals. Reapproval of changed
   intent does not refresh the spec's source, or a plan based on that spec.
4. If the root is stale, return its gate. If an upstream artifact is current but
   a downstream source is old, return the downstream authoring command to
   reconcile the change, then its gate. State which behavior or coverage needs
   review; never update only the source hash to make the chain look current.
5. Carry every active condition/waiver restriction into the next artifact or
   progress record with a stable ID, owner, and `decide by`. A decision due at
   entry blocks dependent work; a slice expressly producing that decision may
   run. Independent authorized slices can continue. Missing owner or deadline
   is unresolved, not unconditional approval.

A waiver skips a named checkpoint, not the information downstream needs.
Retain a minimal artifact naming the scope, reason, constraints, and replacement
evidence so downstream work has a contract. Waiving spec review cannot invent
acceptance criteria or authorize deployment. Legacy `status: approved` waivers
remain distinguishable by their decision row.

## Bind the decision to the review

Present the artifact hash and relevant decision IDs before accepting a decision.
Finalize the terminal approval section before showing that revision; if a legacy
artifact lacks the section or needs formatting repairs, disclose those edits
before asking the human to review it.
An explicit earlier human decision in the current conversation remains valid
when it unambiguously names that presented revision and scope. Do not ask again
solely because the turn changed. A later material edit, ambiguous referent, or
new scope needs a new review. A sole-approver declaration supplies identity only;
it never supplies the decision or extends its scope.

Immediately before recording, recompute the hash and compare it with the one
shown to the human. If it changed, present the new revision; do not attach the
old decision to it. Append the row, change only frontmatter status, then verify
the hash again. Store conditions and reasons in the table with literal pipes
escaped so they cannot split its columns. For a slice decision, bind the record
to the current approved plan hash, decision ID, exact code revision or captured
measurement, and conditions. A mutable filename or PR URL alone is insufficient.

Human approval does not turn a failed criterion into a pass. Keep failed
self-checks visible, record the specific accepted exception or deferred condition,
and preserve any non-waivable project policy. Artifact approval, permission to
implement, permission to delegate, and permission to merge/deploy are separate;
reuse existing explicit authorization only within its stated scope.
