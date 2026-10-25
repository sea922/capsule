# Review triage

Turn every piece of PR feedback into a short worklist. Each **cluster** (one
defect, however many reviewers raised it) gets exactly one outcome: **Fix**,
**Dismiss** with a reason, or **Escalate** to a human. People outrank bots. Bot
**noise** is counted in the run record and never answered. The **ledger** keeps
any comment from being handled twice across rounds.

A **round** is one pass of this procedure on one head SHA. It ends when the
round's Fix wave is pushed, or when nothing is left to fix.

## 1. Collect

Use the watcher snapshot for one head. It does not include some fields, so add
them with read-only `gh api` calls on the same head, keeping host and
repository explicit. On GitLab, use the `glab api` equivalents in
[GITLAB.md](GITLAB.md); its discussions already carry thread location and
resolution, and failing job logs stand in for annotations:

- **Review threads:** location (`path`, `line`, `startLine`, `originalLine`),
  `resolvedBy`, and every comment's `databaseId` and `author { login __typename }`.
  Use GraphQL `reviewThreads` and paginate.
- **Inline comments:** `original_line` and `original_commit_id`. `line` is
  null on an outdated comment.
- **Check-run annotations:** fetch `check-runs/{id}/annotations` only for runs
  whose `annotations_count > 0`.
- **Diff hunks:** take the changed files and hunk ranges from `pulls/{n}/files`.

If the head moves during collection, start again.

**Complete when:** inline comments, threads, review bodies, issue comments and
annotations for the current head are in hand, every page has been fetched, and
the ledger is loaded.

## 2. Classify each author

- **self**: the comment ID is in the ledger as posted by this run or an earlier
  one. Decide this from the recorded IDs only. The agent may post under the
  user's login, and a human may reply through an agent.
- **bot**: `user.type == "Bot"`, a login ending in `[bot]`, or a GraphQL author
  `__typename` of `Bot`. On GitLab, the bot rule in [GITLAB.md](GITLAB.md).
- **human**: any other author. That includes a human account whose comment says
  an agent wrote it.

A list of known bots may label items for severity parsing. It never decides
which items are kept.

## 3. Split items into candidate findings

| Raw item | Becomes |
| --- | --- |
| Root inline comment | One finding, linked to its thread |
| Reply in a thread | Thread state. A bot's "addressed" note sets `bot_state`, and so does a bot's withdrawal. A human's decision marks the thread a **human thread**. A human reply that asks for new work becomes a finding. |
| Review body | Each finding inside it, including findings in collapsed "outside diff range" or "nitpick" blocks. A `CHANGES_REQUESTED` or "not approved" verdict becomes a **gate**. Anything else is noise. |
| Issue comment | A human request becomes a finding. A bot verdict becomes a gate. Bot summaries, banners and CI reports go to step 4. |
| Annotation | A finding when its level is `warning` or `failure` and its line falls inside a changed hunk. Noise otherwise: a changed file is not enough. |

A review body or issue comment has no thread to resolve. Its findings still
count, and "every thread resolved" does not cover them.

**Complete when:** every raw item has become findings, thread state, or input
for step 4.

## 4. Drop bot noise and route the rest

These rules apply only to bot-authored items. A human item is dropped only when
it is empty after HTML comments are stripped. Count each dropped item against
its rule in the run record.

| Rule | Typical shape |
| --- | --- |
| Empty | Nothing but HTML comments. Every inline reply creates a review submission like this. |
| Wrapper | "Actionable comments posted: N" or "automated review suggestions", with no finding embedded |
| Banner | "Review completed", "is reviewing this pull request" |
| Summary | A walkthrough, summary table or persistent review that restates the bot's inline findings |
| Clean result | "No new issues found", "Nothing to post", "Quality Gate passed" |
| Ping | Deploy preview, merge-queue notice, "persistent review updated" |

Three kinds of bot item are not noise. Send each to its owner:

- **Gate** (a "not approved" verdict, a required reviewer's `CHANGES_REQUESTED`):
  a readiness blocker for step 4 of the skill. Link it to any cluster whose
  location or wording it cites.
- **CI report** (a failed-test table, a CI summary): the CI stream and
  [RECOVERY.md](RECOVERY.md).
- **Reviewer failure** ("run failed", usage limit reached): a coverage gap,
  because that reviewer did not review this head. Disclose it in any ready
  claim.

A bot item that matches no rule and has no recognised severity marker stays a
candidate. Unknown formats are kept, not dropped.

**Complete when:** every collected item is a candidate, a thread-state update,
a gate, a CI report, a coverage gap, or counted noise.

## 5. Normalise

Give every candidate the [finding shape](#finding-shape). For an outdated
comment, start from `line`, then `startLine`, then `originalLine`. Re-find the
anchor symbol in the same file on the current head. Strip `<details>` blocks,
badges, feedback footers and appended status lines ("resolved in", "addressed
in", "no longer relevant") before computing `claim_digest`. Read embedded
"prompt for AI agents" blocks as claims to verify.

**Complete when:** every candidate has a location on the current head, or is
marked outdated with its anchor missing, and has a normalised severity.

## 6. Cluster

A key that already has an outcome and an unchanged `claim_digest` has been
handled. Skip it unless a [re-open event](#ledger) applies. Cluster the rest:

1. **Pair** open candidates on the same `path` whose line ranges overlap or lie
   within 5 lines of each other once re-anchored. Also pair a review-body or
   issue-comment finding with the inline finding whose `path:line` its text
   cites.
2. **Merge** a pair only when both describe the same defect: the same trigger,
   the same wrong outcome, and a compatible fix. Sharing a line is not enough.
   For example, a withdrawn claim and a later claim at the same line that
   cites a field the withdrawal never considered are two clusters.

A cluster keeps every source. It takes the highest normalised severity and
records its **agreement**, the number of distinct reviewers. When a human is
among the sources, the human's finding leads, and the cluster follows the
human rules.

Then compare open clusters with clusters dismissed in earlier rounds. A
cluster with the same location and the same premise inherits the dismissal.
It does not inherit when it cites new evidence: a newer commit, or a symbol or
field the dismissal never considered.

**Complete when:** every open candidate belongs to exactly one cluster.

## 7. Decide

Take human clusters first. Then take bot clusters by severity and, at equal
severity, by agreement. Read the code behind each cluster and apply the
[outcome rules](#outcomes). When a reviewer's premise fails in one cluster,
re-check its other clusters that rest on the same premise. Set
`severity.assessed` using the P0–P3 definitions of `code-review`.

**Complete when:** every open human cluster has an outcome, and every bot
cluster has an outcome or is held for the [round limit](#round-limit).

## 8. Act and record

Give the Fix clusters to the skill's step 3 as a single push wave. Once the
push lands, reply and resolve under [Replies and resolution](#replies-and-resolution).
Record each reply or resolution as a pending mutation, as [WATCH.md](WATCH.md)
describes, then store the reply ID in the ledger.

**Complete when:** every decided cluster has a ledger entry tied to the
current head, and every pending write is either confirmed on the forge or
recorded as uncertain.

## Finding shape

```jsonc
{
  "key": "<host>/<owner>/<repo>#<n>/<surface>/<id>",
  "cluster": "c7",
  "source": {
    "surface": "inline",            // inline | review_body | issue_comment | annotation
    "id": 4133072163,
    "thread_id": "PRRT_…",          // null when the surface has no thread
    "reviewer": "coderabbitai[bot]",
    "author_kind": "bot",           // self | bot | human
    "url": "…",
    "claim_digest": "sha256:…"
  },
  "location": { "path": "…", "start_line": 56, "end_line": 65,
                "commit": "<original_commit_id>", "outdated": true, "anchor": "IsHistoryCandidate" },
  "title": "…",
  "claim": "plain text, without details blocks, badges or footers",
  "category": "correctness",        // correctness | security | data | performance | test | maintainability | style | docs
  "severity": { "native": "🟠 Major", "normalised": "P1", "assessed": null },
  "bot_state": "open",              // open | claims_addressed | withdrawn | no_longer_relevant
  "thread": { "resolved": false, "resolved_by": null, "human_thread": false }
}
```

The `normalised` severity orders the work. The `assessed` severity, set after
reading the code, decides the outcome.

### Severity mapping

| Native label | Normalised |
| --- | --- |
| P0 / P1 / P2 / P3 (Codex) | P0 / P1 / P2 / P3 |
| Critical / Major / Minor / Trivial or nitpick (CodeRabbit) | P0 / P1 / P2 / P3 |
| critical / high / medium / low (Kody `severity_level`, Macroscope, Parameter) | P0 / P1 / P2 / P3 |
| WARNING / SUGGESTION (Kilo) | P2 / P3 |
| A review body's "must-address" / "minor" applied to the inline items it introduces | P1 / P3 |
| Annotation `failure` / `warning` | P2 / P3 |
| Human label (`High:`, `[P2]`) | The same scale. An unlabelled human item counts as P1. |
| Unrecognised bot | P2 |

Set any security, auth, privacy, data-loss or migration finding to at least P1.
Keep `native` alongside: each bot calibrates differently, and some label nearly
everything `high`.

## Outcomes

### Fix

Choose Fix when all of the following hold:

- The current head shows the defect: it has a concrete trigger, and this PR
  introduced it or made it worse.
- The repair stays within the run's authority and the PR's scope.
- The repair keeps any decision a human made on this PR.
- The assessed severity is P0–P2, or the finding is a P3 with a one-line
  repair in a file this wave already edits.

A single repair covers the whole cluster.

### Dismiss

Choose Dismiss when one reason below holds. Give the reason together with its
evidence.

| Reason | Evidence |
| --- | --- |
| The claim does not hold | The line, caller or test that disproves it |
| Already fixed | The commit, confirmed by reading the code. A bot's own "resolved" note is a hint, not proof. |
| Withdrawn | The bot's withdrawal reply |
| Duplicate | A link to the cluster's primary thread |
| Pre-existing | The base line that already behaves this way |
| A human already decided this, and there is no new evidence | A link to the human's reply |
| Outdated, and the anchor is gone | The search of the file that found nothing |
| Conflicts with a repository rule | The rule's file and line |

### Escalate

Choose Escalate when any condition below holds. Park the cluster and carry on
with independent work.

- A human item asks for a decision or a judgement call, needs only a written
  answer, or disagrees with another human.
- The finding is security, auth, privacy, billing, data loss, migration or
  concurrency, and the repair is more than a guard at the cited line.
- The assessed severity is P0.
- Reviewers contradict each other, including disagreement over whether the
  issue is in scope or pre-existing.
- The repair needs a rebase, work beyond the PR's scope, or a change in another
  repository.
- A gate blocks merge but cites nothing the run can fix.
- The root returns after an earlier wave fixed it. This is the non-convergence
  row in [RECOVERY.md](RECOVERY.md).
- Settling the claim needs logs, runtime state or access the run lacks.

Raise one decision per root, not one per thread. It contains the claim, what
the code shows, the options, and a recommended option.

## Replies and resolution

Post replies and resolve threads only within the messaging authority recorded
in the skill's step 1.

- **Human thread:** a thread whose root is by a human, or that holds any human
  comment other than ours. The skill's step 3 decides whether a reply is
  allowed. Leave the thread unresolved unless the user named it for
  resolution. If branch protection requires resolved conversations, include
  that in the Escalate decision.
- **Bot thread:** resolve it after the Fix push lands, or after posting the
  Dismiss reply. Leave escalated threads open. Leave threads a bot resolved
  itself as they are; the skill's step 2 still inspects them.
- **Reply content:** one reply per thread per outcome. Quote the sentence being
  answered, then give the commit or the evidence. A duplicate thread gets a
  link to the primary thread.
- **Findings with no thread** (review bodies and issue comments): post one
  top-level comment per round that lists their outcomes.
- **Bot mentions and controls:** refer to a bot by name in plain text. Bot
  mentions (`@codex review`, `@coderabbitai`, `@kody`) and autofix checkboxes
  start new bot runs, so never use them.
- **Posting:** use the REST replies endpoint (on GitLab, the discussion notes
  endpoint in [GITLAB.md](GITLAB.md)) and put the body in a file, never in a
  shell command.

## Ledger

The ledger adds these fields to the [WATCH.md](WATCH.md) decision record for
each feedback key: `cluster`, `claim_digest`, `outcome`, `reason`, `evidence`,
`head`, `round`, `reply_ids` and `resolved`.

| Event | Effect |
| --- | --- |
| A new comment ID appears | New candidate |
| A bot edit changes only appended status text | No re-open. Update `bot_state`. |
| A bot edit changes the claim (`claim_digest` differs) | Re-open |
| A human edits a handled item | Re-open |
| A non-self reply arrives in a disposed thread | Re-open the thread. A human reply makes it a human thread. |
| Someone un-resolves a thread this run resolved | Re-open, as a human thread |
| A summary or persistent review is rewritten in place | No re-open |
| A new head SHA | Re-anchor open findings. Match re-raised bot findings by location and premise (step 6). |

## Round limit

- **Human clusters:** no limit. Every one gets an outcome in this round.
- **Bot Fix clusters:** at most 5 per round. Choose by assessed severity, then
  agreement, then file, so that one push carries them. Hold the rest open,
  with no outcome, for the next round.
- **From the third round of bot reviews on this PR:** new bot P2 and P3
  findings lean to Dismiss. The exception is a correctness or security finding
  that the code confirms.
