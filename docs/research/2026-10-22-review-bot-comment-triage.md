# Review-bot comment triage: design

Researched 2026-10-22. Design only: no skill, script, README or manifest was
changed. The examples come from comments fetched read-only with `gh api` on
2026-10-22 from three public pull requests:

- [Silo-Server/silo-android#427](https://github.com/Silo-Server/silo-android/pull/427):
  CodeRabbit, Kody (`kody-ai[bot]` and the repo's own `silo-kody[bot]`) and the
  Codex connector (`chatgpt-codex-connector[bot]`) on the same change. Merged
  2026-10-10.
- [community-outpost/GenHub#612](https://github.com/community-outpost/GenHub/pull/612):
  CodeRabbit, Macroscope, Kilo, Pullfrog, Qodo's pr-agent (posting as
  `github-actions[bot]`), SonarCloud and Netlify. Merged 2026-09-30.
- [PostHog/posthog#116406](https://github.com/PostHog/posthog/pull/116406): a
  change to PostHog's own babysit loop, reviewed by Parameter Sentinel,
  stamphog, PostHog Review, Trunk and a CI report bot. Open when fetched.

## Recommendation

Add one triage step that sits between "observe" and "repair" in `babysit-pr`.
It turns everything the bots and people posted into a short, de-duplicated
worklist. People come first. Status noise is dropped and recorded, never
narrated. Each finding gets one outcome: **Fix**, **Dismiss** with a reason,
or **Escalate** to a human. A ledger in the existing run record stops the same
comment from being handled twice after new commits.

Put the step in a reference file, `skills/engineering/babysit-pr/references/TRIAGE.md`,
loaded from babysit-pr step 2. Do not make it a separate skill yet. Later,
extend the watcher helper so it emits normalised findings. The helper does the
deterministic parsing; the agent keeps the judgement. See
[Placement](#placement).

## What the three PRs show

| | Silo #427 | GenHub #612 | PostHog #116406 |
| --- | --- | --- | --- |
| Commits | 36 | 19 | 2 |
| Issue comments | 29, of which 27 are bot status (25 "review complete" banners) | 21, of which 19 are bot status or summaries | 8, of which 6 are bot status, summaries or CI reports |
| Review submissions | 161, of which 141 have an empty or marker-only body | 59, of which 43 are empty or marker-only | 5 |
| Inline root comments | 68 (silo-kody 23, Codex 22, human account 14, Kody 5, CodeRabbit 4) | 38 (Kilo 16, Macroscope 13, Pullfrog 7, CodeRabbit 2) | 1 (Parameter) |
| Review threads open when fetched | 4 of 68 | 0 of 38 | 1 of 1 |
| Check-run annotations | 6, all runner notices on `.github` | 15, all runner or workflow notices on `.github` | 18; 2 point at the PR's changed lines |

Six lessons drive the design:

1. **Most traffic is not findings.** Every reply to an inline comment creates a
   review submission with an empty body. That is why Silo has 141 of them. Bots
   also post a banner for every run: 9 Kody "Code Review Completed!" comments
   and 16 silo-kody "review complete" comments on Silo, and 10 pr-agent
   "Persistent review updated" pings on GenHub.
2. **Findings also live outside threads.** On GenHub, CodeRabbit's review
   [#5356991579](https://github.com/community-outpost/GenHub/pull/612#pullrequestreview-5356991579)
   holds a 🟠 Major security finding (CWE-494, "Reject non-HTTPS history URLs
   and validate every redirect hop") inside a collapsed "Outside diff range
   comments" `<details>` block. No thread exists for it, so "all review threads
   resolved" never covered it. See [example 3](#example-3-a-security-finding-with-no-thread).
3. **Several bots raise the same finding** at nearby lines with different
   wording and different severity scales. Example: on GenHub, three bots flagged
   the same `_EAC` twin bug at lines 62, 64 and 65.
4. **A login does not prove a human.** On PostHog, an agent posts under a human
   login ("via talyn.dev"). The PR itself exists because the loop "drops every
   review body from the PR author", and its own note says a human's reply "is
   indistinguishable from an agent reply by login alone". On Silo, the human
   account's review carries an "AI disclosure". The ledger therefore records
   *which comment IDs we posted* and does not rely on identity.
5. **Bots change their own comments.** Macroscope edits a finding to append "No
   longer relevant as of `<sha>`" or "✅ Resolved in `<sha>`". CodeRabbit appends
   "✅ Addressed in" and can withdraw a finding ("My finding was incorrect").
   pr-agent and the CodeRabbit walkthrough rewrite one comment in place on each
   push. Edit detection must ignore these appended status lines.
6. **Gate verdicts are not findings.** Examples: Macroscope "Verdict: Not
   approved", stamphog "Not approved — this change needs a human reviewer",
   Kilo "No Issues Found | Recommendation: Merge" and SonarCloud "Quality Gate
   passed". They bear on readiness. They are not items to fix.

### Comment shapes observed

| Source | How to recognise it | Severity it reports | Noise it produces |
| --- | --- | --- | --- |
| CodeRabbit | `<!-- This is an auto-generated comment by CodeRabbit -->`, stable `cr-comment:v1:<id>`, `cr-indicator-types:potential_issue` | `_🟠 Major_`, `_🟡 Minor_` plus a category (`_🔒 Security & Privacy_`) and an effort tag (`_⚡ Quick win_`) | Walkthrough issue comment (47 KB on Silo); "Actionable comments posted: N" review wrapper; "🤖 Prompt for AI Agents" blocks; autofix checkbox |
| Codex connector | Heading line with a P-badge image `![P1 Badge]` | P0–P3 | "💡 Codex Review … Reviewed commit" wrapper on every review; `codex-pull-request-review-summary` table comment with machine-readable `codex-security-review:v1 {"headSha":…,"status":"completed"}` |
| Kody / silo-kody | `<!-- kody-codereview -->`; replies add `kody-conversation` | Badge `severity_level-high`, type badge `Bug` or `Kody_Rules` | "Code Review Completed! 🔥" and "review complete" banners on every run; empty review wrappers |
| Macroscope | `<!-- macroscope-meta: {"kind":"code_review"} -->`, `<!-- MURMUR_IGNORE -->` | `🟠 **High**`, `🟡 **Medium**`, `🟢 **Low**` | Marker-only review bodies; `{"kind":"approvability"}` verdict comment |
| Kilo | `**WARNING:**`, `**SUGGESTION:**` (sometimes bracketed) | Two levels | Summary comment with `kilo-review-history` snapshots |
| Pullfrog | `PULLFROG_DIVIDER_DO_NOT_REMOVE_PLZ` | None inline; review body says "must-address" or "minor suggestions" | "Run failed." comments, a usage-limit warning, "✅ No new issues found" reviews |
| pr-agent (Qodo) | `<!-- pr-agent:review:full -->`, posted as `github-actions[bot]` | Effort score, no per-item severity | Persistent review edited in place, plus a "Persistent review updated" ping per push |
| Parameter Sentinel | `<!-- parameter-sentinel-summary -->`; inline icon `severity-medium.svg` | high, medium, low | Summary that restates its own inline finding |
| stamphog, PostHog Review | Review text "Approved." or "Not approved"; `reviewhog:status` marker | None | "Nothing to post" and "no findings" posts |
| Deploy, quality and merge bots | Netlify "Deploy Preview", SonarCloud `sqra-placement-anchor`, `<!-- Trunk Merge -->`, `<!-- posthog-ci-report -->` | None | All status |
| Human accounts | `user.type == "User"` | Optional and free-form: `**High:**`, `[P2]`, "needs your call" | None by default |

Greptile and Copilot did not appear on these PRs. Their shapes are an
[open question](#open-questions).

## Inputs

Collect every surface for one head SHA. Discard the collection and fetch again
if the head or base moves during it. `watch_pr.py` already enforces this.

| Surface | Endpoint | Fields the triage needs |
| --- | --- | --- |
| Inline review comments | REST `pulls/{n}/comments`, paginated | `id`, `in_reply_to_id`, `user.login`, `user.type`, `path`, `start_line`, `line` (null when outdated), `original_line`, `original_commit_id`, `commit_id`, `body`, `updated_at` |
| Review threads | GraphQL `reviewThreads`, paginated, with all comments per thread | `id`, `isResolved`, `isOutdated`, `resolvedBy.login`, `path`, `line`, `startLine`, `originalLine`, each comment's `databaseId` and `author { login __typename }` |
| Review submissions | REST `pulls/{n}/reviews` | `id`, `state`, `body`, `commit_id`, `user` |
| Issue comments | REST `issues/{n}/comments` | `id`, `user`, `body`, `created_at`, `updated_at` |
| Check-run annotations | REST `commits/{sha}/check-runs`, then `check-runs/{id}/annotations` for runs whose `annotations_count > 0` | `annotation_level`, `path`, `start_line`, `end_line`, `title`, `message` |
| Commit statuses | REST `commits/{sha}/status` | `context`, `state` (readiness only) |
| PR facts | `gh pr view` plus `pulls/{n}/files` | author login, the acting account's login, changed files and hunk ranges |
| Run ledger | babysit-pr's private `run.md` / state file | IDs this run posted, past dispositions and body digests |

Today `watch_pr.py` fetches threads as `id isResolved isOutdated` plus only the
first comment's `databaseId`. Triage needs each thread's location,
`resolvedBy` and every comment author. It does not fetch annotations or
changed-file hunks.

## Normalised finding

One record per finding. A raw comment can yield zero findings (a banner),
one (an inline comment) or several (a review body with outside-diff items).

```jsonc
{
  "key": "github.com/community-outpost/GenHub#612/inline/4133072163",
  "cluster": "c7",                        // set by de-duplication
  "source": {
    "surface": "inline",                  // inline | review_body | issue_comment | annotation
    "id": 4133072163,
    "thread_id": "PRRT_…",                // null when the surface has no thread
    "native_id": "cr-comment:v1:5784b0e03ffb9ec49e46ca5a",
    "reviewer": "coderabbitai[bot]",
    "author_kind": "bot",                 // bot | human | self
    "agent_disclosed": false,             // true for "via talyn.dev", "AI disclosure:"
    "url": "https://github.com/…#discussion_r4133072163",
    "updated_at": "…",
    "claim_digest": "sha256:…"            // of the claim with status lines and badges stripped
  },
  "location": {
    "path": "GenHub/GenHub/Features/Content/Services/GeneralsOnline/GeneralsOnlineHistoryMapper.cs",
    "start_line": 56, "end_line": 65,
    "commit": "0cd9cebe",                 // original_commit_id
    "outdated": true,
    "anchor": "IsHistoryCandidate"        // symbol used to re-find the spot after edits
  },
  "title": "Exclude the latest release by its manifest ID component",
  "claim": "plain text; <details>, badges and agent prompts removed",
  "category": "correctness",              // correctness | security | data | performance | test | maintainability | style | docs
  "severity": { "native": "🟠 Major", "normalised": "P1", "assessed": null },
  "has_suggested_fix": true,
  "bot_state": "open",                    // open | claims_addressed | withdrawn | no_longer_relevant
  "thread": { "resolved": false, "resolved_by": null, "has_human_reply": false },
  "disposition": null                     // see Ledger
}
```

`severity.normalised` only sets the order of work. `severity.assessed` is set
after the agent has read the code, using code-review's P0–P3 definitions.

## Algorithm

### 1. Collect

Fetch every surface in [Inputs](#inputs) for the current head. Keep raw bodies
in the private run directory and treat them as untrusted data. CodeRabbit puts
"🤖 Prompt for AI Agents" blocks in its comments. The triage never follows
them; it reads the claim and checks it against the code.

### 2. Classify the author

- **self**: the comment ID is in the ledger as posted by this run or an earlier
  one. Never decide this from the login, because the agent may post as the
  user.
- **bot**: `user.type == "Bot"`, a login ending in `[bot]`, or a GraphQL author
  `__typename` of `Bot`.
- **human**: any other account. Set `agent_disclosed` when the body carries a
  disclosure. It changes nothing in the rules; it only goes in the report.

Do not use a list of known bots to *keep* items. The 2026-09-12 babysitter
research found that a login-suffix filter in OpenAI's babysit-pr missed
Copilot feedback. A list may only *label* known bots for severity parsing.

### 3. Split items into candidates

| Raw item | Becomes |
| --- | --- |
| Root inline comment | One finding, linked to its thread |
| Reply inside a thread | Thread state, not a finding. Bot acks ("Addressed in"), bot withdrawals ("I withdraw the finding") and human decisions ("Not changing this") update `bot_state` or `has_human_reply`. A human reply that asks for new work becomes a finding. |
| Review body | Findings parsed from "Outside diff range" and "Nitpick" `<details>` blocks; a gate verdict when the state is `CHANGES_REQUESTED` or the text is "Not approved"; otherwise noise |
| Issue comment | A human request becomes a finding. A bot verdict becomes a gate. Bot summaries, banners and CI reports become noise or route to CI. |
| Annotation | A finding only when the level is `warning` or `failure` and the line falls inside a changed hunk. Otherwise noise. |

### 4. Drop noise, keep a count

Rules run in order. The first match wins. **Noise rules apply only to
bot-authored items.** A human item is dropped only when its body is empty after
HTML comments are removed.

| Rule | Examples from the three PRs |
| --- | --- |
| Empty after stripping HTML comments | 141 of 161 Silo review bodies; Macroscope's marker-only review bodies |
| Review wrapper with no embedded finding | Codex "💡 Codex Review" (15 on Silo); CodeRabbit "Actionable comments posted: N" with nothing outside the diff |
| Run banner | Kody "Code Review Completed! 🔥"; silo-kody "review complete"; posthog[bot] "PostHog Review is reviewing this pull request" |
| Walkthrough or summary that restates inline findings | CodeRabbit walkthrough; Codex summary table; Kilo "Code Review Summary"; Parameter Sentinel summary; pr-agent persistent review |
| Clean result | "✅ No new issues found" (Pullfrog); "Nothing to post" (PostHog Review); "Quality Gate passed" (SonarCloud) |
| Deploy, merge-queue and ping comments | Netlify "Deploy Preview … canceled"; `<!-- Trunk Merge -->`; pr-agent "Persistent review updated to latest commit" |
| Annotation off the diff | 28 of the 39 annotations are runner and workflow notices on `.github`. On PostHog, 8 of the 10 complexity warnings in the changed file `github_integration_base.py` point at functions outside every hunk, so "file changed" is not enough. One more names a file the PR did not touch. |

Three bot item types are not noise. Route them elsewhere:

- **Gate verdicts** (Macroscope "Not approved", stamphog "Not approved",
  CodeRabbit `CHANGES_REQUESTED`) go to babysit-pr step 4 as readiness
  blockers. Link them to any cluster whose location or wording they cite.
- **CI reports** (Trunk "3 failed" tests, `posthog-ci-report`) go to the CI
  stream and `RECOVERY.md`.
- **Reviewer failures** (Pullfrog "Run failed." and its usage-limit warning)
  are coverage gaps. That reviewer did not review the head. Record it so a
  ready claim can disclose it.

If a bot item matches no rule and has no recognised severity marker, keep it as
a candidate for the agent to judge. Unknown formats fail open.

### 5. Normalise

Fill in the [normalised finding](#normalised-finding). For an outdated comment,
`line` is null. Take `original_line` and `original_commit_id`, then re-find the
`anchor` symbol in the same file on the current head. This follows Compound
Engineering's outdated-thread rule. Strip `<details>` blocks, badges, footers
("Was this suggestion helpful?", "Useful? React with 👍 / 👎") and appended
status lines before computing `claim_digest`.

#### Severity mapping

| Source label | Normalised |
| --- | --- |
| Codex P0 / P1 / P2 / P3 | P0 / P1 / P2 / P3 |
| CodeRabbit Critical / Major / Minor / Trivial or nitpick | P0 / P1 / P2 / P3 |
| Kody `severity_level` critical / high / medium / low | P0 / P1 / P2 / P3 |
| Macroscope Critical / High / Medium / Low | P0 / P1 / P2 / P3 |
| Parameter high / medium / low | P1 / P2 / P3 |
| Kilo WARNING / SUGGESTION | P2 / P3 |
| Pullfrog: review body says "must-address" / "minor" | P1 / P3 for the inline items it points at |
| Annotation `failure` / `warning` | P2 / P3 |
| Human label (`**High:**`, `[P2]`, …) | Mapped the same way; without a label, P1 for ordering |
| Unknown bot | P2 until the agent assesses it |

Two adjustments, both for ordering only:

- **Security floor.** A security, auth, privacy, data-loss or migration
  category raises the finding to at least P1.
- **Agreement.** Two or more independent reviewers in one cluster move it ahead
  of single-reviewer clusters at the same level.

Calibration differs between bots. On Silo, `kody-ai` marked all 5 of its
findings `high`, and `silo-kody` marked 17 of 23 `high`. Keep
`native` so the mapping can be tuned per repository.

### 6. Match against the ledger

Look up each candidate's `key` in the ledger. A key with a disposition and an
unchanged `claim_digest` is already handled. Skip it, unless one of the
[re-open rules](#re-runs-without-acting-twice) fires.

### 7. De-duplicate

Group open candidates in two passes.

1. **Proposed pairs (deterministic):** the same `path`, and line ranges that
   overlap or lie within 5 lines of each other on the current head after
   re-anchoring. Also pair a review-body or issue-comment finding with an
   inline one when its text cites that `path:line`, as CodeRabbit's
   outside-diff summary line does (`GeneralsOnlineHistoryMapper.cs:128`).
2. **Same meaning (agent):** merge a pair only when both describe the same
   defect: the same trigger, the same wrong outcome and a compatible fix. The
   same line is not enough. See [example 6](#example-6-same-line-different-finding).

A cluster keeps every source. It takes the highest normalised severity and
counts its distinct reviewers. When a human is among the sources, the human's
finding leads the cluster and the cluster follows the human rules.

Also match open candidates against **dismissed** clusters from earlier rounds.
A new bot finding with the same location and the same premise inherits the
dismissal unless it cites new evidence: a newer commit, or a symbol or field
the dismissal did not consider. See [example 7](#example-7-a-human-decision-re-raised-by-a-second-bot).

### 8. Decide

Apply the [decision rules](#decision-rules) to each cluster: human clusters
first, then bot clusters by assessed severity and agreement. Read the code
before deciding. Like code-review, a Fix must survive the "Admit only proven
findings" gate. When a bot is shown wrong in one place, check its other
findings that rest on the same premise. That is Compound Engineering's "cluster
by root assumption".

### 9. Apply the round limit

See [Limits](#limits-per-round). Clusters over the limit stay open and
undisposed for the next round. They are not dismissed.

### 10. Act and record

Hand the Fix list to babysit-pr step 3 as one push wave. After the push lands,
post replies and resolve threads under the rules below. Write each disposition
and each posted reply ID to the ledger. Record a pending write *before* posting,
so that a lost response is checked against GitHub before any retry
(`RECOVERY.md`).

## Decision rules

### Fix

All of these hold:

- Reading the current head confirms the defect. It has a concrete trigger, and
  the PR introduced it or made it worse.
- The fix is within the run's authority. It needs no rebase, no new scope and
  no other repository.
- It does not reverse a choice a human made on this PR.
- Severity is P0–P2. A bot P3 is fixed only when it is a one-line change in a
  file this round already edits. Otherwise it waits or is dismissed (open
  question 1).

One fix covers the whole cluster. Every source thread gets a reply citing the
commit.

### Dismiss, with a reason

Dismiss when any of these holds. Each reason names its evidence.

| Reason | Evidence to cite |
| --- | --- |
| Does not hold on the current head | The line, caller or test that shows it |
| Already fixed | The commit, after reading the code. A bot's own "Resolved in" or "Addressed in" is a hint, not proof. |
| Withdrawn by the bot | The withdrawal reply |
| Duplicate | A link to the cluster's primary thread |
| Pre-existing, not introduced by this PR | The base line that already had it |
| A human already decided this root, and there is no new evidence | A link to the human's reply |
| Outdated, and the anchor no longer exists in the file | The search that found nothing |
| Style or preference that conflicts with repository rules | The rule's file and line |

Never change code just to quiet a bot. This is already a babysit-pr rule.

### Escalate to a human

Escalate when any of these holds. Escalation does not block other work.

- A human item asks for a decision or a judgement call ("needs your call", a
  question about intent), or disagrees with another human.
- The cluster is security, auth, privacy, billing, data loss, migration or
  concurrency, and the fix is not an obvious guard at the cited line. Cursor's
  Bugbot rubric asks by default for the same list.
- Any P0.
- Reviewers ask for opposite things, or one reviewer calls the finding in scope
  and another calls it pre-existing.
- The fix needs authority the run lacks: a rebase, scope beyond the PR, or a
  change in another repository.
- A gate verdict blocks merge and points at no finding the run can fix.
- The same root reaches its third round of fixes. This follows Compound
  Engineering's `invariant_rounds >= 2` and Cursor's lean from the third Bugbot
  pass.
- The claim cannot be verified without logs, runtime state or access the run
  lacks.

An escalation is one decision per root, not one per thread. It states the
claim, what the code shows, the options and a recommended option.

### Replies and thread resolution

- **Never resolve a human's thread.** A thread is the human's when its root is
  by a human account, or when any comment in it is by a human account and is
  not ours. Reply, and leave resolution to the human. If branch protection
  requires resolved conversations, escalate and ask the human to resolve.
- **Resolve a bot thread** only within the messaging authority babysit-pr step 1
  records. Do it after a Fix push lands, or after posting a Dismiss reply. Do
  not resolve an escalated thread.
- **Leave bot-resolved threads alone.** Macroscope resolved 12 threads on
  GenHub and CodeRabbit resolved 4 on Silo. babysit-pr already inspects resolved
  threads whose concern may remain.
- **One reply per thread per disposition.** Quote the sentence being
  answered. Cite the commit or evidence. Thank no one; superpowers'
  receiving-code-review sets the same rule. For a duplicate, link the primary
  thread.
- **Never write bot trigger phrases** such as `@codex review`, `@kody`,
  `@coderabbitai` or Kilo's suggested `@kilocode-bot fix it`. Never tick
  CodeRabbit's autofix checkbox. Each one starts more bot work and can start
  a loop.
- **Findings with no thread** (review bodies, issue comments) get one
  top-level comment per round that lists their dispositions. Do not post one
  comment per finding.
- Post through the REST replies endpoint with the body in a file. Never put
  comment text into a shell command; Cursor's playbook sets the same rule.

## Re-runs without acting twice

The ledger extends the decision record that `WATCH.md` already asks for:
feedback IDs, body digest, disposition, reason and evidence. Each entry
holds:

```jsonc
{ "key": "…/inline/4140587015", "cluster": "c3", "claim_digest": "sha256:…",
  "outcome": "fix", "reason": "…", "evidence": "838035a", "head": "838035a…",
  "round": 2, "reply_ids": [4145397837], "resolved": false,
  "pending": null }   // { "action": "reply", "expected": "…" } while a write is in flight
```

| Event | Effect |
| --- | --- |
| New comment ID | New candidate |
| A bot edits a comment and only status text changes ("Resolved in", "Addressed in", "No longer relevant") | No re-open. The claim digest is unchanged. Update `bot_state`. |
| A bot edits a comment and the claim changes | Re-open |
| A human edits a handled comment | Re-open |
| A non-self reply arrives in a disposed thread | Re-open the thread. A human reply makes it a human thread. |
| Someone un-resolves a thread we resolved | Re-open as a human signal |
| A new head SHA | Re-anchor open findings. Bots that review each push will re-raise findings, and these match the ledger by location and premise (step 7). |
| A summary comment is rewritten in place (pr-agent, CodeRabbit walkthrough) | Never a re-open. Compound Engineering's babysit does the same, because status bots rewrite these bodies on every push. |
| A pending write is found on restart | Check GitHub for the reply or resolution before retrying |

The ledger stops the double reply seen on GenHub. There, the author posted the
identical text "Extracted `VersionsDiffer(…)` helper in commit a027ef556…"
twice, 20 seconds apart
([#4144460818](https://github.com/community-outpost/GenHub/pull/612#discussion_r4144460818),
[#4144461668](https://github.com/community-outpost/GenHub/pull/612#discussion_r4144461668)).

## Limits per round

- **Human items have no limit.** They are always triaged in full, and none is
  dismissed without a reply.
- **Bot Fix clusters: at most 5 per round**, chosen by assessed severity, then
  agreement, then grouped by file so that one push carries them. Every push
  starts every bot again. GenHub's 19 commits brought 10 pr-agent update pings
  and a Pullfrog delta review each time, so fewer, larger waves mean less
  churn.
- **P3 bot findings** are fixed only under the Fix rule above.
- **From the third bot review round on**, new P2 and P3 bot findings lean to
  Dismiss unless they are correctness or security findings that hold on the
  code. A root that keeps returning is escalated, not fixed again.
- **Replies only for disposed items.** Noise is never answered.

## Worked examples

### Example 1: three bots, one bug

GenHub, `GeneralsOnlineHistoryMapper.cs`. Each bot uses its own scale:

| Source | Location | Native severity | Claim, paraphrased |
| --- | --- | --- | --- |
| Macroscope [#4133033884](https://github.com/community-outpost/GenHub/pull/612#discussion_r4133033884) | lines 54–64 (original 63) | 🟠 High | `IsHistoryCandidate` excludes only the exact version, so the `_EAC` twin of the current release appears as a second card |
| CodeRabbit [#4133072163](https://github.com/community-outpost/GenHub/pull/612#discussion_r4133072163) | original 65, `cr-comment:v1:5784b0e0…` | 🟠 Major, Data Integrity | Exclude by manifest-ID component, not version string |
| Pullfrog [#4133149369](https://github.com/community-outpost/GenHub/pull/612#discussion_r4133149369) | original 62 | none inline; its review says "One correctness gap to close before merge" | The `_EAC` twin survives exclusion and collides on the manifest ID |

Triage: the pairing pass groups lines 62–65, and the agent confirms the same
defect. The result is one cluster, P1, with agreement 3: **Fix** once and reply
on three threads. What happened: the fix landed in `51a7fc5f`/`7067bb3f`.
Macroscope edited its comment to "No longer relevant as of 51a7fc5f…" and
Pullfrog replied "Addressed in 51a7fc5f/7067bb3f". Under the ledger rules,
neither edit re-opens the finding.

### Example 2: two bots agree a test cannot fail

Pullfrog [#4137494239](https://github.com/community-outpost/GenHub/pull/612#discussion_r4137494239)
and Kilo [#4137504863](https://github.com/community-outpost/GenHub/pull/612#discussion_r4137504863)
both point at line 76 of `GeneralsOnlineDiscovererHistoryTests.cs`. Both say
the new regression test passes even without the fix. The native severities are
low: Kilo SUGGESTION (P3), and Pullfrog "minor suggestions" (P3). Code-review's
gate treats a test that would pass with the behaviour removed as a real
finding, so the assessed severity is P2: **Fix**. What happened: the fix landed
in `f5daab7`, and Pullfrog confirmed that the test now fails without it.

### Example 3: a security finding with no thread

The same concern appears on three surfaces:

- CodeRabbit review body [#5356991579](https://github.com/community-outpost/GenHub/pull/612#pullrequestreview-5356991579),
  inside "Outside diff range comments": 🟠 Major, Security & Privacy, CWE-494,
  `GeneralsOnlineHistoryMapper.cs:128`.
- Macroscope's approvability comment
  [#5889639157](https://github.com/community-outpost/GenHub/pull/612#issuecomment-5889639157):
  "Verdict: Not approved", citing an unverified archive-download path.
- Pullfrog's review [#5357913234](https://github.com/community-outpost/GenHub/pull/612#pullrequestreview-5357913234):
  calls the non-HTTPS and integrity posture "not new to this PR's delta".

Triage: step 3 splits the CodeRabbit body into a finding. Step 7 links the
Macroscope verdict to it through the shared wording, and the security floor
makes it P1. The reviewers disagree on whether the issue is in scope, so the
outcome is **Escalate**: one decision covering whether to enforce HTTPS and
redirect checks now or record the gap as pre-existing. What happened: the
author's "Babysit pass complete" comment
[#5897957459](https://github.com/community-outpost/GenHub/pull/612#issuecomment-5897957459)
reported that all review threads were resolved. None of the fetched comments
replied to this finding. Macroscope's verdict was last updated to "Not approved"
at 22:24 UTC, and the PR merged at 22:36 UTC. A check based on threads alone
cannot catch this.

### Example 4: GenHub noise

19 of the 21 issue comments produce no finding:

- 10 "Persistent review updated" pings
- 4 Pullfrog run failures, recorded as coverage gaps
- the Netlify deploy preview
- the SonarCloud gate result
- the Kilo summary ("No Issues Found | Recommendation: Merge")
- the CodeRabbit walkthrough and the pr-agent persistent review, once their
  findings are linked to inline sources

Each drop is counted in the run record. Of the other two comments, the
Macroscope verdict becomes a gate ([example 3](#example-3-a-security-finding-with-no-thread)),
and the human's summary is read as a human item. 43 of 59 review bodies are
empty.

### Example 5: Kody and Codex on the same marquee bug

On Silo, Kody [#4140587015](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4140587015)
(Bug, `severity_level-high`) and Codex
[#4145021939](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4145021939)
(P1) both target lines 454–455 of `TvFocusMarqueeModel.kt`. Both say the
already-built marquee keeps unprotected content when spoiler preferences
change. Triage gives one cluster, P1, with agreement 2. A human account also
covers it: review
[#5366834621](https://github.com/Silo-Server/silo-android/pull/427#pullrequestreview-5366834621)
reports having verified this and two other threads. The human therefore leads
the cluster: **Fix**, and do not resolve the human's thread. What happened:
the fix landed in `838035a`, and Kody acknowledged it in
[#4145397837](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4145397837).

### Example 6: same line, different finding

These two findings are both at `DetailSharedComponents.kt:509` but must not be
merged:

- CodeRabbit [#4145946069](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4145946069)
  (🟡 Minor) claimed the backdrop could show an episode still. After the author
  explained the server contract, CodeRabbit withdrew it in
  [#4146028839](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4146028839).
  Outcome: **Dismiss (withdrawn by the bot)**.
- Codex [#4146308367](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4146308367)
  (P1) at the same line says the code never reads the new
  `backdropIsEpisodeStill` field. It "re-raises the earlier detail-artwork
  concern based on fresh evidence" from commit `9431eab`.

Triage: the locations pair, but the premises differ, and the second finding
cites a field the withdrawal did not consider. The second finding is new and
does not inherit the dismissal. It is assessed on its own as a P1 candidate.

### Example 7: a human decision re-raised by a second bot

At `DirtyOperationDao.kt:33` on Silo:

1. silo-kody [#4236200859](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4236200859)
   (Kody Rules, `high`) says reconciliation can overwrite pending
   `PERSONAL_V2` intent. The human account replied "Not changing this", with
   the design reason. silo-kody agreed.
2. Codex [#4238549811](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4238549811)
   (P2) later asks to include pending v2 intents in download protection. That
   rests on the same premise, and the human again replied "Not changing this".

Triage: the Codex finding matches the dismissed root at the same location
with the same premise and no new evidence. The outcome is **Dismiss**, with a
reply linking the human's decision instead of arguing the point again. Both
threads contain human replies, so the agent resolves neither. Both were still
unresolved when fetched.

### Example 8: human items that need a call

The human account's review
[#5477288681](https://github.com/Silo-Server/silo-android/pull/427#pullrequestreview-5477288681)
opened 13 inline threads labelled High, Medium or Low. Two of them,
[#4236159050](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4236159050)
and [#4236159059](https://github.com/Silo-Server/silo-android/pull/427#discussion_r4236159059),
say "Medium, needs your call". Outcome: **Escalate** both. They count as human
items, so the bot budget does not apply, and the agent never resolves them.
They were the only open threads not involving a bot when fetched. The same
review states that an AI agent wrote it. That sets `agent_disclosed: true` and
changes no rule.

### Example 9: PostHog's self-review loop

- Parameter's inline finding
  [#4261036933](https://github.com/PostHog/posthog/pull/116406#discussion_r4261036933)
  (🟡 medium, `github_integration_base.py:2559`) says the agent can wake its own
  loop by posting under the user's login. Its summary comment repeats it
  ("Risk: Medium · 1 medium"): noise, linked to the finding.
- stamphog's review
  [#5580005508](https://github.com/PostHog/posthog/pull/116406#pullrequestreview-5580005508),
  "Not approved — this change needs a human reviewer", cites the same thread.
  It is a gate linked to the cluster.
- The category is provenance and credentials. The security floor makes it P1,
  and choosing a provenance mechanism goes beyond the PR: **Escalate**. What
  happened: a human account, writing through an agent, verified the finding,
  left the thread open
  ([#4320853011](https://github.com/PostHog/posthog/pull/116406#discussion_r4320853011))
  and asked two teams to decide
  ([#6281889134](https://github.com/PostHog/posthog/pull/116406#issuecomment-6281889134)).
- Noise and routing: PostHog Review's "Nothing to post" and "no findings" are
  dropped. Trunk's flaky-test table (3 failed) and the CI report go to the CI
  stream. The Python code-quality check reports the complexity warning for
  `get_pull_request_babysit_snapshot` (line 2512) twice, once with a title and
  once without; within-source de-duplication keeps one. That line is inside a
  changed hunk, so it is a P3 candidate, below the bot Fix threshold. The same
  check flags four other functions in that file, among them `list_branches` at
  line 2675. All four are outside every hunk, so they are dropped.

The PR also shows why `self` must come from recorded IDs. Its own change keeps
a human author's single-comment threads. It notes that the author's later
replies remain indistinguishable from the agent's.

## Placement

| Option | For | Against |
| --- | --- | --- |
| Inline in babysit-pr `SKILL.md` | Always loaded; no new file | Grows the main body by many lines that matter only when bots are present; step 2 already has the one-paragraph contract |
| **Reference file `babysit-pr/references/TRIAGE.md`** (recommended) | Fits the existing `WATCH.md` / `RECOVERY.md` pattern; loaded only when needed; one owner for review feedback | Not directly reusable by a non-babysit request |
| Its own skill | Reusable for "address the bot comments" without babysitting, like Cursor's `threads-only` mode or Compound Engineering's `ce-resolve-pr-feedback` | A second owner for review feedback. `git-workflow` routes "review feedback" to babysit-pr, and `ship-it` delegates to it. The repo just removed duplicated guidance between skills (#50). |

Recommended wiring:

1. babysit-pr step 2 adds one line: when bot reviewers are present, or
   feedback items exceed a small number, read `references/TRIAGE.md` before
   classifying. The skill's existing four classes (actionable, already
   addressed, unsupported with evidence, needing a decision) map onto Fix,
   Dismiss (already fixed), Dismiss (does not hold) and Escalate. The triage
   refines step 2 and does not replace it.
2. `WATCH.md`'s decision record gains the ledger fields above.
3. A later helper change (in `watch_pr.py` or a sibling script) emits the
   normalised findings: author kind, noise rule hit, location and anchor,
   native and normalised severity, claim digest and thread ownership. It
   decides nothing about meaning or validity. This follows the pattern shared
   by Compound Engineering and Cursor: a script observes and the agent judges.
4. `code-review` stays read-only and is not a caller. Triage reuses its finding
   gate and P0–P3 definitions for Fix and `assessed` severity.

Promote the reference to its own skill only when a second caller appears. The
likely cause is a request for a one-shot "answer the review comments" mode
outside babysitting.

## Preferred source repositories

`docs/source-repos.md` was read first. Every repository on the list was
checked for handling of incoming PR review feedback. Revisions are the HEAD
commits read on 2026-10-22.

| # | Repository and revision | Relevant source | Influence, or why it did not apply |
| --- | --- | --- | --- |
| 1 | [mattpocock/skills](https://github.com/mattpocock/skills) `5beb35b0` | `docs/engineering/pr.md`, `skills/engineering/code-review/SKILL.md` | Not applicable as a mechanism: its `pr` skill only writes the body. Its FAQ says users asked for a way to triage comments "from other developers or review bots", and that the skill does not do it. That confirms the gap. |
| 2 | [obra/superpowers](https://github.com/obra/superpowers) `2ce8aa15` | `skills/receiving-code-review/SKILL.md` | **Direct.** Verify against the codebase before implementing. Be skeptical of external reviewers. Stop and ask when feedback conflicts with the human partner's earlier decision (Escalate rule; [example 7](#example-7-a-human-decision-re-raised-by-a-second-bot)). No thanks or performative agreement in replies. Reply inside the thread, not at top level. Its "clarify everything before implementing anything" rule is not adopted: in an unattended loop, Escalate parks one item while the rest proceed. |
| 3 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) `aeac41d4` | `skills/code-review-and-quality/SKILL.md` | Minor. Its severity prefixes (Critical, required, Nit, Optional, FYI) and its preference for a few high-conviction comments support a severity floor and a bounded round. It handles outgoing reviews only. |
| 4 | [cursor/plugins](https://github.com/cursor/plugins) `eb4db2b5` | `pstack/skills/poteto-mode/playbooks/babysit.md`, `references/bugbot-triage.md`, `scripts/watch-pr/github.ts` | **Direct.** Its three Bugbot outcomes (`fix`, `dismiss`, `ask`) became Fix, Dismiss and Escalate. Also adopted: ask by default on security, privacy, auth, billing, data, migration and concurrency; the third-pass lean toward Dismiss; "never churn code to quiet a bot"; push before replying so the reply cites the commit; reply bodies passed from a file. Its watcher counts Bugbot passes by `RUN_ID` markers. That inspired round counting, but it recognises only Bugbot, while this design must cover any bot. Its learned skip patterns inform open question 5. Its `threads-only` mode informs the placement trigger. |
| 5 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) `09c434ab` | `skills/ponytail-review/SKILL.md` | Minor. Its rules (a concrete case for every finding, re-read before reporting, and a named `shortcut:` treated as a decision rather than a defect) support the Fix evidence gate and the "a human already decided" Dismiss reason. It reviews outgoing changes only. |
| 6 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) `0f524f12` | `greptile.json`, `docs/residual-review-findings/` | Not applicable: it has no feedback-handling skill. Its hand-kept residual-findings logs are a weak precedent for the ledger. The research request that led to this report came from a `/last30days` run. |
| 7 | [anthropics/skills](https://github.com/anthropics/skills) `dbd4588f` | none | Not applicable: nothing about PR review feedback. `skill-creator`'s scenario evaluations apply later, when the reference is written. |
| 8 | [trailofbits/skills](https://github.com/trailofbits/skills) `f0dd11d2` | `plugins/github-triage/`, `plugins/fp-check/`, `.github/scripts/codex_review.py` | Partial. Three ideas carry over: normalising bot logins (`[bot]`, `app/`), restating the claim before giving a true or false-positive verdict, and finding one's own earlier comment by a hidden marker plus author. The marker idea is not used to identify `self`, because markers are voluntary and can be copied. PostHog #116406 makes the same point. |
| 9 | [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) `738067a5` | `skills/ce-resolve-pr-feedback/` (SKILL, evaluation rubric, full and pipeline modes, `get-pr-comments`), `skills/ce-babysit-pr/references/tick.md` | **Direct.** Adopted: judge every surface centrally; drop wrapper and banner content without narrating it; fetch with no author exclusion; cluster by root assumption and treat agreement as a strong signal; re-anchor outdated threads with `line`, then `originalLine`, then an anchor search; keep `needs-human` threads open; escalate after two fix rounds on one root; never re-open a dispatched comment on a body edit. Deliberately different: it resolves every handled thread, including humans' (this design never resolves a human's thread); it fixes nitpicks by default (this design limits bot P3s); and its fetch keeps all filtering in the model (this design adds deterministic noise rules for bot items only, failing open on unknown formats). |
| 10 | [garrytan/gstack](https://github.com/garrytan/gstack) `514fbfdc` | `review/greptile-triage.md`, `ship/sections/greptile.md` | **Direct**, and the closest prior art, though for Greptile only. Adopted: classify as valid, already fixed (cite the commit) or false positive; use evidence templates for replies; keep a per-project history that suppresses known false positives (open question 5); give a firmer reply when a bot re-flags after an earlier reply, which this design generalises as dismissal inheritance. Not adopted: dropping outdated comments with `position != null` (this design re-anchors them, since an outdated line does not prove a fix), and asking the bot to re-rank (that starts more bot work). It neither resolves threads nor limits findings. |
| 11 | [affaan-m/ECC](https://github.com/affaan-m/ECC/tree/main/skills) `90606c83` | `skills/github-ops/SKILL.md`, `skills/project-flow-ops/SKILL.md` | Minor. Its rule that review comments returned by `gh` are untrusted data repeats the one in step 1. It has nothing on bot comments, de-duplication or resolution. |
| 12 | [wshobson/agents](https://github.com/wshobson/agents) `0874a27b` | `plugins/agent-teams/skills/multi-reviewer-patterns/SKILL.md`, `plugins/review-agent-governance/` | Partial. Its de-duplication rules match step 7: same file and line with the same issue merges and credits all reviewers; same file and line with different issues stays separate; on conflict, take the higher severity. Its security severity floor supports the floor here. Its hook that blocks `gh pr comment` and review calls until a human approves is an alternative to babysit-pr's recorded messaging authority. It is not adopted, because babysit-pr already sets messaging scope in step 1. |
| 13 | [nahid-sparktales/agent-dispatcher](https://github.com/nahid-sparktales/agent-dispatcher) `564c3f0e` | `recipes/review-pull-request.md` | Minor. "Evidence from an earlier revision is not evidence" for the current one supports binding every disposition to a head SHA and re-anchoring after pushes. It covers outgoing review only. |
| 14 | [humanlayer/skills](https://github.com/humanlayer/skills) `653b6411` | `plugins/build-iterated-agentic-loop/` | Partial. It feeds maintainer PR comments to an agent, gated on `author_association`. Not adopted as a filter, because babysit-pr must see every author. It also keeps a version-controlled file of known false-positive areas (open question 5) and allows one open PR per loop, a limit on work in progress that parallels the per-round limit. |

Two practices found here are not adopted. Cursor and gstack each recognise
only one bot by login. Compound Engineering's resolver resolves human threads.
None of the fourteen repositories limits how many bot findings one round acts
on. The per-round limit, the human-thread rule and the cross-bot severity table
are new in this design.

## Open questions

1. **Low-severity bot findings.** Fix them cheaply, dismiss them with a reply,
   or leave them unanswered? Compound Engineering fixes nitpicks by default.
   Cursor dismisses noise. This design defers them unless they are one-line
   fixes in a file the round already edits.
2. **Round limits.** Are 5 bot Fix clusters per round, and leaning to Dismiss
   from the third bot round, the right numbers?
3. **Resolving bot threads after a Dismiss.** Resolve them, or leave them for
   the bot or a human? Some repositories require resolved conversations to
   merge. Some bots resolve their own threads.
4. **Human accounts that disclose an agent.** Should they keep full human
   priority? This design says yes.
5. **Learned dismissal patterns.** Keep a per-repository rubric like Cursor's
   `bugbot-triage.md`, or route them through `compound-learnings`?
6. **Unseen bot formats.** Greptile, Copilot and CodeRabbit "Nitpick comments"
   blocks did not appear on these PRs. Collect samples before writing parsers
   for them.
7. **Completion signals.** Codex reacts with 👍 when a review finds nothing,
   and its summary carries a `status` and `headSha`. Should the helper read
   reactions and these markers to replace part of babysit-pr's five-minute
   quiet window?
8. **Where parsing lives.** Extend `watch_pr.py`, or add a separate triage
   script that reads its observation file?
