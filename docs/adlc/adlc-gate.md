# ADLC Gate

`adlc-gate` puts a named human decision between each ADLC stage and the next.

- **Invocation:** user-invoked only, with the stage: `/adlc-gate intent`, `/adlc-gate spec`, `/adlc-gate plan`, or `/adlc-gate slice <id>` for a decision during delivery.
- **Output:** an `## Approvals` row in the artifact and an updated `status`, or a Decisions row in `progress.md` for a slice.

## How it works

1. **Self-check.** The agent evaluates the stage's exit criteria in a pass/fail table labelled *Agent self-check, not approval*. Spec and plan gates fail when the human never responded to the draft, or when an upstream condition or area of concern that is due is only owned rather than decided.
2. **Decision.** The gate shows ready-to-send lines. The human types `approved`, `approved-with-conditions`, `rejected`, or `waived`, with their name and role. A prior explicit decision remains usable when it unambiguously covers the presented revision. A plan approval lists each plan decision by ID, so one word never covers choices nobody saw. Silence, partial praise, and names taken from git config do not count. A single-owner project can declare a *sole approver* at the intent gate; later gates then accept the decision word alone, without granting blanket approval.
3. **Record.** The gate appends the decision, approver, date, and reviewed content hash to the artifact and sets its status.

## The content hash

All five skills use one [approval contract](../../skills/adlc/adlc-gate/references/APPROVALS.md).
Run its bundled helper from the target project's Git working directory:

```text
node "<installed adlc-gate directory>/scripts/content-hash.mjs" "<artifact path>"
```

The helper requires Node.js 18+ and Git, works in PowerShell and POSIX shells,
and performs no writes. It normalizes CRLF and an optional UTF-8 BOM, excludes
only the frontmatter `status` field and final unfenced approval table, and
preserves quoted headings and body fields. Substantive text after the ledger
is an error rather than content silently excluded from approval.

Recording approval leaves that hash unchanged; editing reviewed content makes
it stale. Before recording a decision, the gate recomputes the hash to ensure
the human saw the same revision. Existing well-formed LF hashes remain valid.
Legacy mismatches need renewed review, never a rewritten historical hash.

Downstream work checks the entire intent → spec → plan chain, including latest
decisions, source hashes, conditions, and waiver restrictions. Reapproving changed
intent does not refresh a spec based on the old intent. Conditions carry an ID,
owner, and deadline; dependent work waits when one is due. Waivers retain the
minimum contract and do not silently skip acceptance criteria or authorize delivery.

The gate is advisory. For hard enforcement, a project can separately add a hook
that checks the same contract. A content hash does not authenticate a person.
The row records a human decision; git authorship shows who ran the commit.
Existing explicit commit authorization remains valid. Artifact approval does
not itself grant implementation, delegation, merge, or deployment authority.

The [2026-09-28 review](../research/2026-09-28-adlc-review.md) records findings,
preferred-source influences, regression checks, and evaluation limits.
