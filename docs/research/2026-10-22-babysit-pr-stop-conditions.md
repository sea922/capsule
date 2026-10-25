# babysit-pr: stop conditions compared

Date: 2026-10-22

Trigger: a `/last30days` run on "pull request skill" surfaced three babysit
skills. This report compares their stop conditions with ours. It builds on
[`pr-babysitter-2026-09-12/report.md`](pr-babysitter-2026-09-12/report.md),
which already covered OpenAI's watcher design, pstack's babysit playbook and
Compound Engineering's `ce-babysit-pr`. Those findings are not repeated. They
are cited only where they bear on stopping.

"Stop conditions" covers round caps, time and polling limits, success criteria,
escalation to a human, things the skill never does, merge-conflict handling and
the final report.

## Sources

| Skill | Source read | Version |
| --- | --- | --- |
| Ours | [`SKILL.md`](../../skills/engineering/babysit-pr/SKILL.md), [`references/RECOVERY.md`](../../skills/engineering/babysit-pr/references/RECOVERY.md), [`references/WATCH.md`](../../skills/engineering/babysit-pr/references/WATCH.md), [`scripts/watch_pr.py`](../../skills/engineering/babysit-pr/scripts/watch_pr.py), [`scripts/test_watch_pr.py`](../../skills/engineering/babysit-pr/scripts/test_watch_pr.py), [`evals/evals.json`](../../skills/engineering/babysit-pr/evals/evals.json), [`agents/openai.yaml`](../../skills/engineering/babysit-pr/agents/openai.yaml) | Branch `research/pr-skills-comparison` at `59a78a0` |
| tilomitra `/babysit-pr` | [Gist `SKILL.md`](https://gist.github.com/tilomitra/e0dca29b3a63b5b5aba62c1baeaa27b4/7c16aff7e6c2b7f57989c870bc4572db408c9a3a) (the gist's only file and only revision) | `7c16aff`, 2026-03-10 |
| Jökull Sólberg | ["Babysitting PRs With Claude Code"](https://www.solberg.is/babysit-pr) | Published 2026-03-26. The roughly 170-line skill file itself is not published. A search of `jokull`'s public repositories (including `jokull/jokull-skills`) found no copy. |
| OpenAI `babysit-pr` | [`SKILL.md`](https://github.com/openai/codex/blob/84aa75204ad604bcf498df180d128181c89b2f0b/.codex/skills/babysit-pr/SKILL.md), [`references/heuristics.md`](https://github.com/openai/codex/blob/84aa75204ad604bcf498df180d128181c89b2f0b/.codex/skills/babysit-pr/references/heuristics.md), [`references/github-api-notes.md`](https://github.com/openai/codex/blob/84aa75204ad604bcf498df180d128181c89b2f0b/.codex/skills/babysit-pr/references/github-api-notes.md), [`agents/openai.yaml`](https://github.com/openai/codex/blob/84aa75204ad604bcf498df180d128181c89b2f0b/.codex/skills/babysit-pr/agents/openai.yaml), [`scripts/gh_pr_watch.py`](https://github.com/openai/codex/blob/84aa75204ad604bcf498df180d128181c89b2f0b/.codex/skills/babysit-pr/scripts/gh_pr_watch.py) | `84aa752`, 2026-09-01. This is the last version. See the note below. |

**OpenAI removed the skill.** Commit
[`1813127`](https://github.com/openai/codex/commit/18131270fe82ef947830840eb5d6923d4b82609f)
(#49713, 2026-09-30) deleted every skill under `.codex/skills/`. `main` no longer
has a babysit-pr `SKILL.md`. The
[listing](https://claudemarketplaces.com/skills/openai/codex/babysit-pr)
(crossaitools.com now redirects there) was last updated 2026-08-21. It links
only to the repository root and does not show the file. This report reads the
last version before deletion. The 2026-09-12 research pinned the earlier
`c4017a8`. Changes since then include
[#27080](https://github.com/openai/codex/commit/a770e5b8470d3320eb53a56a286ea4a0a70a1f59)
(ignore pending reviews) and
[#27038](https://github.com/openai/codex/commit/f3a807497590a8b86ef44480606f92cc71cf52f1)
(state-mutation policy).

### The leads, checked

- **tilomitra: "stops after 5 rounds, never force-pushes main/master, never
  auto-merges".** All three are confirmed
  ([L120](https://gist.github.com/tilomitra/e0dca29b3a63b5b5aba62c1baeaa27b4/7c16aff7e6c2b7f57989c870bc4572db408c9a3a#file-skill-md-L120),
  [L124](https://gist.github.com/tilomitra/e0dca29b3a63b5b5aba62c1baeaa27b4/7c16aff7e6c2b7f57989c870bc4572db408c9a3a#file-skill-md-L124),
  [L127](https://gist.github.com/tilomitra/e0dca29b3a63b5b5aba62c1baeaa27b4/7c16aff7e6c2b7f57989c870bc4572db408c9a3a#file-skill-md-L127)).
  The force-push rule is narrower than it sounds. The gist rebases the PR
  branch onto `origin/main` and runs `git push --force-with-lease` whenever the
  branch has conflicts
  ([L93-L99](https://gist.github.com/tilomitra/e0dca29b3a63b5b5aba62c1baeaa27b4/7c16aff7e6c2b7f57989c870bc4572db408c9a3a#file-skill-md-L93-L99)).
- **Sólberg: "CI + Greptile + local `codex review` in parallel, Fix / Dismiss /
  Escalate triage, max 3 iterations".** Partly right. CI and Greptile are polled
  in parallel. `codex review --base main` is the next step, and the article does
  not say it runs in parallel. The triage table and "Max 3 iterations" are
  confirmed. The article does not say what happens at the cap. Its worked
  example ends with "Auto-merge queued", so this flow does not rule out merging.
- **OpenAI: "polls for review comments, CI failures and merge conflicts".**
  Confirmed by
  [`agents/openai.yaml`](https://github.com/openai/codex/blob/84aa75204ad604bcf498df180d128181c89b2f0b/.codex/skills/babysit-pr/agents/openai.yaml).
  The skill is no longer on `main` (see above).

## Side by side

Citations: `S` is our `SKILL.md`, `R` is `RECOVERY.md`, `W` is `WATCH.md` and
`py` is `watch_pr.py`. Gist line numbers refer to its `SKILL.md`. OpenAI lines
refer to `84aa752`: `SKILL` is `SKILL.md`, `heur` is `heuristics.md` and `watch`
is `gh_pr_watch.py`.

| Stop condition | Ours | tilomitra gist | Sólberg | OpenAI (last version) |
| --- | --- | --- | --- | --- |
| **Round or iteration cap** | None. Repair waves are unbounded (S L36, L46). | 5 rounds, then "stop and report remaining issues" (L120). | "Max 3 iterations". What happens at the cap is not stated. | None by design: "Do not stop to ask the user whether to continue polling" (SKILL L175). |
| **Wall-clock and polling** | The watcher reads every 30 s and wakes after 300 s (py L131-L132). Those 300 s are "a wakeup interval, not the task deadline" (W L16). A deadline applies only when the user gives one; otherwise it runs "while the host supports the session" (S L46). | None. "Wait for CI to start, then check status again" (L103). | `gh pr checks --watch` and the Greptile MCP. No timeouts. | Every minute in the prose (SKILL L182). The watcher defaults to 30 s (watch L63-L65). No deadline. Polling continues after green while the PR is open (SKILL L183). |
| **Flaky retry budget** | One rerun per failure and head, at most 3 reruns per run. New SHAs do not reset the count (R L6, eval 5). | None. | None. "CI failures always get fixed." | 3 reruns **per head SHA** (heur L35, watch L66-L71, L653-L667), so every new commit renews the allowance. Exhaustion emits the terminal `stop_exhausted_retries` (watch L723-L724, L909). |
| **Success criteria** | For **ready**: required checks and reviews pass on the current head, all feedback has a disposition, there are no conflicts, the PR is not a draft, the forge says it can merge, and expected reviewers have finished, with a disclosed 5-minute quiet window for bots that send no completion signal. An empty check list must be confirmed as having no required checks. Unknown state blocks the claim (S L42). For **merged**: the remote PR reports merged (S L44). | "All checks pass and no unresolved comments" (L20, L117). It reads only the bodies from `pulls/comments`, not whether threads are resolved (L39). | "CI is green and no unaddressed issues remain." | `ready_to_merge` needs all checks terminal with none failed or pending, no new review items, `MERGEABLE`, a merge state other than `BLOCKED`/`DIRTY`/`DRAFT`/`UNKNOWN`, and no `REVIEW_REQUIRED` or `CHANGES_REQUESTED` (watch L680-L697). |
| **Does success end the run?** | Yes, at the chosen endpoint. A green build is only progress (S L8). | Yes. It reports "ready to merge" (L117). | Yes. | No. Ready is "a progress state, not a watcher stop". It stops only when the PR is merged or closed, or when the user must step in (SKILL L13, L188-L192). |
| **Escalation to a human** | Feedback "needing a decision" (S L24). Semantic conflicts get alternatives (R L9). **Needs input** when a human action is the only path left (S L46). A permission error needs a capability handback (R L13). No named categories. | Unclear comment: ask (L85). "Subjective or architectural" comment: flag (L130). Stuck on something that needs the user: stop (L119). | The Escalate verdict: "Needs human judgment", flagged for the user. | Stop and ask on: a dirty worktree, `gh` auth failure, a branch that cannot be pushed, failures that survive the retry budget, product decisions or cross-team work, and a human comment that needs a written reply (heur L57-L66). No auto-fix when the comment is ambiguous, conflicts with the user's instructions, needs an unmade product or design decision, or the checkout is dirty (heur L49-L55). |
| **Same failure returns** | "Investigate oscillation instead of repeating the patch". It goes back to the loop only with a different, evidenced approach, or hands the decision back (R L10). No numeric trigger. | Only the 5-round cap. | Only the 3-iteration cap. | Only the per-SHA retry cap. |
| **Never does: git** | Uses normal pushes. Rebase, force-push, branch deletion, base retargeting and stack rewriting each need their own established scope. No automatic stash or reset (R L16). Says nothing about `--no-verify` or amending. | Never force-push `main`/`master`. Never `--no-verify`. New commits, no amend unless asked (L124-L126). | Not stated. | Works only on the head branch and avoids destructive commands. Stops on unrelated uncommitted changes. Runs one watcher (SKILL L141-L150). Does not patch flaky tests, CI config or dependency pins (SKILL L82). |
| **Never does: the forge** | Replies and resolves only "within the granted messaging scope", after the repair has landed (S L34). Merges only with authority. Enabling auto-merge or joining the queue is a waiting state. Never bypasses branch protection (S L14, L44). Says nothing about dismissing reviews, changing draft state, or closing the PR. | Never auto-merges. Never dismisses reviews (L127-L128). | Not stated. The example queues auto-merge. | Never replies to a human thread without the user confirming the exact text, prefixed `[codex]` (SKILL L112). Resolves only threads from the requesting user or the Codex bot, never threads other humans joined (SKILL L122-L125). Unless asked: no draft or ready toggle, no close or reopen, no talking to other humans (SKILL L130-L136). Has no merge step. |
| **Merge conflicts** | Updates the base only when policy, the user or an actual merge blocker requires it. Repairs mechanical conflicts whose intent is known. Presents alternatives for semantic ones (R L9). | Rebases onto `origin/main` and force-pushes with lease. "Only rebase if there are actual conflicts" (L93-L99). | Not stated. | Shows conflicts: `DIRTY` blocks ready (watch L42-L47, SKILL L36). The skill has no resolution procedure. |
| **Failure outside the diff** | Investigate the base history, dependencies and infrastructure. Line overlap alone cannot establish cause (R L7). | If it also fails on main, "note it and move on" (L129). | Not distinguished: CI failures are always fixed. | Do not patch it. Rerun when the watcher recommends that; otherwise wait or stop (SKILL L82, heur L21). |
| **API or auth failures** | Keep the last observation, back off and refresh (R L13). The watcher exits nonzero on the first failure (py L143-L145). No limit on consecutive failures. | Not stated. | Not stated. | `gh` auth or permission failure: stop and ask (heur L62). |
| **Report at stop** | Endpoint or status, PR URL, final SHA, fixes, checks, unresolved decisions, and whether monitoring is active or paused (S L48). When paused, a resume command (S L46). | A status block with CI x/y, the unresolved comment count, merge ready or blocked, and the action taken (L105-L113). | Not described. Dismissals must carry reasons. | Final SHA, CI summary, mergeability or conflicts, fixes pushed, **flaky retry cycles used**, and remaining failures or comments (SKILL L213-L218). Heartbeats during quiet periods (SKILL L206). |

### Preferred-repository babysitters, for reference

| Stop condition | Cursor pstack [`babysit.md`](https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/skills/poteto-mode/playbooks/babysit.md) | Compound Engineering [`ce-babysit-pr`](https://github.com/EveryInc/compound-engineering-plugin/blob/738067a599c68f1f0f4a32273fa9d7d2476f0715/skills/ce-babysit-pr/SKILL.md) |
| --- | --- | --- |
| Cap | Watcher `--timeout` defaults to 0, which disables it. `--max-query-errors` defaults to 5 consecutive failures ([`cli.ts` L110-L128](https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/skills/poteto-mode/scripts/watch-pr/cli.ts#L110-L128)). | 8 h of active watch time, or the user's choice, plus a 3-calendar-day backstop and an optional round cap set by the user. Rearms "can neither reset nor extend the cap" ([`settle.md` L21](https://github.com/EveryInc/compound-engineering-plugin/blob/738067a599c68f1f0f4a32273fa9d7d2476f0715/skills/ce-babysit-pr/references/settle.md#L21)). Pipeline mode: 3 CI fix rounds per head lineage and about 30-45 minutes ([`watch-loop.md` L47](https://github.com/EveryInc/compound-engineering-plugin/blob/738067a599c68f1f0f4a32273fa9d7d2476f0715/skills/ce-babysit-pr/references/watch-loop.md#L47)). |
| Repeated failure | "One retry only. An identical second failure means it was never flake" (L19). | A deterministic `trajectory`: a check that fails, clears and fails again on a new head, and `invariant_rounds >= 2`. Either triggers a mandatory approach review before the next push. Oscillation is split from progressive migration ([`watch-loop.md` L53-L62](https://github.com/EveryInc/compound-engineering-plugin/blob/738067a599c68f1f0f4a32273fa9d7d2476f0715/skills/ce-babysit-pr/references/watch-loop.md#L53-L62)). |
| Escalation | Always escalates "security, auth, billing, data, or migrations" rather than dismissing them. From the third Bugbot pass on, leans toward dismissing patterns it has already documented (L20). | Standing residuals (`needs-human`, `blocked-failing`, semantic conflict) block a ready call, but the watch keeps going around them ([`settle.md` L9](https://github.com/EveryInc/compound-engineering-plugin/blob/738067a599c68f1f0f4a32273fa9d7d2476f0715/skills/ce-babysit-pr/references/settle.md#L9)). |
| Never | No retarget, rebase, stack-wide submit or force-push (L10). Babysitting never authorizes a merge (L21). | Never merges except under `stack-land`. Excludes rebase, force-push, approving CI and branch updates nobody asked for ([`SKILL.md` L25-L27](https://github.com/EveryInc/compound-engineering-plugin/blob/738067a599c68f1f0f4a32273fa9d7d2476f0715/skills/ce-babysit-pr/SKILL.md#L25-L27)). |
| Conflicts | Reports and stops: "the one blocker you report rather than resolve" (L11). | Updates the branch only for an emitted currency item. A semantic conflict is a residual. |
| Report | Triage decisions swept once into a candidate shared rubric (L21). | A fixed status line first, then a recap someone could merge from. Never says "safe to merge" ([`SKILL.md` L59](https://github.com/EveryInc/compound-engineering-plugin/blob/738067a599c68f1f0f4a32273fa9d7d2476f0715/skills/ce-babysit-pr/SKILL.md#L59)). |

## Gaps and risks in ours

1. **Nothing bounds an unattended run except the retry budget.** With no
   user deadline the loop runs "while the host supports the session" (S L46).
   Repair waves, reviewer round-trips and quiet waits have no ceiling. tilomitra
   caps at 5 rounds and Sólberg at 3. CE caps active time and keeps a calendar
   backstop. Only OpenAI, now removed, is openly unbounded. The risk is token and
   CI spend on a PR that a reviewer keeps re-opening, or on a scheduler-driven
   run that nobody is watching.
2. **The oscillation rule has no trigger.** R L10 names the right behaviour but
   leaves the agent to notice it. `watch_pr.py` digests snapshots and keeps no
   failure history. `run.md` records "recurring failure history" (W L27), but no
   threshold turns that record into a stop. Eval 5 tests the scenario, but only
   when the prompt states the oscillation outright.
3. **"Needing a decision" is undefined.** Every external skill names classes
   that go to the human. Ours leaves the line to judgement (S L24), so an
   agent can "fix" an architectural or product-level comment that the author
   should decide.
4. **Default social limits are implicit.** Ours ties replies and resolution to
   the authority granted (S L34). That is stronger than a fixed list when the
   authority is explicit. When it was given loosely ("fix and reply"), nothing
   stops the agent from dismissing a review, flipping draft state, closing the
   PR, or resolving a thread other people have joined. OpenAI and tilomitra rule
   these out by default.
5. **Commit hygiene is silent.** Nothing in `babysit-pr` or the rest of
   `skills/engineering/` forbids `--no-verify`, and nothing covers amending
   pushed commits outside a scoped rewrite. The R L16 rewrite rule may cover an
   amend followed by a force-push, but a reader has to infer that.
6. **There is no limit on consecutive API failures.** The watcher stops on
   the first failure, which is correct for a single observation. The
   back-off-and-refresh rule (R L13) has no count, so a revoked token or a long
   outage can loop silently, or end the run early, depending on how the agent
   reads it. Cursor allows 5 consecutive failures before a terminal `BLOCKER`.
7. **The final report omits how much budget was used.** Retries used, waves
   used, time elapsed and dismissed findings live only in `run.md` (W L22-L29).
   The user-facing report (S L48) does not include them, so the reader cannot
   tell a clean finish from a nearly exhausted one.
8. **Minor.** Our watcher reads `/pulls/{n}/reviews`, which also returns the
   operator's own unsubmitted `PENDING` review. OpenAI ignores pending reviews
   until they are submitted (SKILL L95-L97). There is no heartbeat rule for long
   quiet periods (OpenAI SKILL L206).

## Recommended changes, ranked

| # | Change | Why | Source |
| --- | --- | --- | --- |
| 1 | **Default run budget.** When the user gives none, cap repair waves (for example 5) and active watch time. Both survive rearms and resumes, like the retry count already does. Reaching either ends the run as **paused** with the resume command and what remains. The user can raise either cap. | Closes gap 1 without giving up the persistence that sets ours apart. The no-reset rule matches our existing retry semantics. | tilomitra L120 (5 rounds); Sólberg (3 iterations); CE `settle.md` L21 (active budget, backstop, no reset on rearm); gstack [`land-and-deploy` L180-L188](https://github.com/garrytan/gstack/blob/514fbfdc9799376edfd2536f60659501a48ead64/land-and-deploy/SKILL.md.tmpl#L180-L188) (bounded waits with an explicit choice to extend) |
| 2 | **Concrete non-convergence trigger in R L10.** When a check or finding that an earlier wave fixed comes back on a later head, or one invariant needs a second repair wave, stop changing that stream and park it as needs-input with its history. Keep fixing other streams. Progressive migration (A fixed, then B appears) is not a trigger. Track it in `run.md`, not in a new engine. | Turns gap 2 into a testable rule. Lets eval 5 check the trigger itself, not just the prose. | CE `watch-loop.md` L53-L62 (recurrence on a new head, `invariant_rounds >= 2`, oscillation versus migration); Cursor `babysit.md` L19 (an identical second failure was never flake) |
| 3 | **Name the escalation classes** in step 2: product or design choices; architectural or subjective preferences; requests that conflict with the user's stated intent; changes touching security, auth, billing, data or migrations; and comments that only need a written answer. These are parked as needs-input while independent work continues. | Closes gap 3. Gives "needing a decision" a test. | OpenAI `heuristics.md` L49-L66; tilomitra L130; Cursor `babysit.md` L20; Sólberg Escalate verdict |
| 4 | **Default social limits under any messaging scope.** Never dismiss reviews, toggle draft or ready, or close or reopen the PR. Never resolve or reply in a thread another human has joined unless the user named that thread or text. Mark automated replies as automated. | Closes gap 4. Default-deny for actions other people can see is cheap, and the user can still override it. | OpenAI `SKILL.md` L112, L122-L136; tilomitra L128 |
| 5 | **Commit hygiene line in R L16.** Never bypass hooks (`--no-verify`). Add new commits rather than amending pushed ones. | Closes gap 5 in one sentence. If `git-workflow` takes ownership later, replace it with a pointer. | tilomitra L125-L126 |
| 6 | **Limit consecutive failed observations.** After 5 in a row, end as paused with an infrastructure or capability handback. A single failure still means back off and refresh. | Closes gap 6. Separates a blip from an outage. | Cursor [`cli.ts` L123-L128](https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/skills/poteto-mode/scripts/watch-pr/cli.ts#L123-L128), `types.ts` BLOCKER 7 and RETRY verdicts |
| 7 | **Report the budget used.** Start with one status line, then add retries, waves and active time against their budgets, mergeability and conflict state, and findings dismissed with their reasons. | Closes gap 7. Shows the reader how close the run came to its limits. | OpenAI `SKILL.md` L213-L218 (retry cycles used); CE `SKILL.md` L59 (status line, never "safe to merge"); Sólberg (dismiss with reason) |
| 8 | **Ignore unsubmitted reviews, and send heartbeats when quiet.** Skip `PENDING` reviews in triage. During long unchanged periods, report only changes plus an occasional heartbeat. | Low-cost polish (gap 8). | OpenAI `SKILL.md` L95-L97, L206 |

Every change touches babysit-pr's own files, so each needs a matching scenario in
`evals/evals.json`, following
[`anthropics/skills` skill-creator](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/skill-creator/SKILL.md).

### Considered and not recommended

- **Sólberg's "CI failures always get fixed".** It erases the split between a
  flake, infrastructure and the branch (R L6-L7), which every other source keeps.
- **tilomitra's rebase plus force-with-lease when the branch is behind.**
  Ours updates without rewriting history and only when a merge actually needs
  it (R L9, L16).
- **OpenAI's per-SHA retry budget.** Each push renews the allowance. Our
  run-level budget is stricter on purpose (eval 5).
- **OpenAI's "never stop while open".** Our explicit **ready** endpoint
  already handles "watch until merge-ready" without an unbounded loop.
- **CE's full trajectory engine.** Change 2 keeps the trigger and drops the
  machinery, in line with ponytail's resistance to complexity.
- **Running several reviewers (Greptile, `codex review`) as part of the
  loop.** Sorting comments from multiple review bots is a separate task in this
  research batch and is out of scope here.

## Keep: what ours has that the others lack

- **Endpoint and authority are separate** (S L14). Ours merges only with
  authority. tilomitra and OpenAI never merge. Sólberg's example queues
  auto-merge without saying who authorized it.
- **Merged means merged on the remote.** Auto-merge and queue entry are
  waiting states (S L44). None of the three external skills checks this.
- **Head and base race detection** while collecting a snapshot
  (py L78-L81, test L29-L35).
- **Reconciling lost mutations** before any retry (R L12, eval 3).
- **A run-level retry budget** that new SHAs do not renew (R L6, eval 5).
- **No author allowlist.** Edits wake the watcher through the digest
  (py L85-L87, test L37-L48). OpenAI only shows trusted authors
  (`gh_pr_watch.py` L548-L562, L618-L621). The 2026-09-12 report covers the
  Copilot miss.
- **Unknown, empty or quiet state never proves ready.** The bot quiet window
  is disclosed (S L42, eval 2).
- **Monitoring status is reported honestly**, active or paused, with a durable
  resume record (S L46, W L31-L33).
- **Independent work continues while a decision is pending** (S L36, R L18).
  tilomitra and OpenAI stop at the first blocker that needs the user.
- **Unrelated failures still get a diagnosis** (R L7). tilomitra's "note it
  and move on" (L129) and Cursor's stale-base shortcut (L19) skip that step.
- **Comment and log text are evidence, not instructions** (S L24). Neither
  tilomitra nor OpenAI says so. Cursor, CE and ECC do.

## Preferred-source consultation

Read in owner order from [`docs/source-repos.md`](../source-repos.md). Each
repository's current HEAD tree was searched for babysit, PR-loop, ship and merge
paths. Unless noted, the content findings come from the 2026-09-12 report
(revisions pinned there).

| # | Repository (HEAD searched) | Influence or why not applicable |
| --- | --- | --- |
| 1 | `mattpocock/skills` (`5beb35b`) | No babysit skill. `docs/engineering/resolving-merge-conflicts.md` still exists. Its rule from the earlier research, keep both changes' intent, is already in R L9. No new influence. |
| 2 | `obra/superpowers` (`2ce8aa1`) | No babysit or PR-loop skill. Its receiving-code-review stance (verify a suggestion before changing code), adopted earlier, supports the dismiss-with-evidence rule. No new influence. |
| 3 | `addyosmani/agent-skills` (`aeac41d`) | `shipping-and-launch` and `/ship` cover deployment, which is beyond a PR babysitter. Not applicable. |
| 4 | `cursor/plugins` (`eb4db2b`) | **Direct influence** on changes 2, 3 and 6. The `/babysit` here is the pstack playbook (also mirrored under `harness/pstack/claude-code/`). It says it "replaces Cursor's built-in babysit skill" (L3), which is not in this repository and was not inspected. `cursor-team-kit/skills/fix-ci` repeats "until green" with no cap or stop rule. |
| 5 | `DietrichGebert/ponytail` (`09c434a`) | Simplicity: it argues for the thresholds in change 2 over CE's trajectory engine. |
| 6 | `mvanhorn/last30days-skill` (`0f524f1`) | Its run on 2026-10-22 found the three external sources. It adds no stop-condition content of its own. |
| 7 | `anthropics/skills` (`dbd4588`) | skill-creator: each change needs an eval scenario. |
| 8 | `trailofbits/skills` (`f0dd11d`) | No PR loop. Evidence discipline only. Not applicable. |
| 9 | `EveryInc/compound-engineering-plugin` (`738067a`) | **Direct influence** on changes 1, 2 and 7. Its active-time budget, backstop, non-convergence triggers and status line were re-read at this HEAD. |
| 10 | `garrytan/gstack` (`514fbfd`) | `land-and-deploy` is a merge-and-deploy skill, not a babysitter. Its bounded CI wait (4-minute rounds, 15 minutes, then the user chooses to extend or stop) and "stop on conflicts" (L173) support change 1. |
| 11 | `affaan-m/ECC` (`90606c8`) | `skills/github-ops`: PR text and CI logs are untrusted ([L29-L34](https://github.com/affaan-m/ECC/blob/90606c8315ee09cafc303515c5f33024db6b9882/skills/github-ops/SKILL.md#L29-L34)), and "merging is a user-authorized action (propose, never auto-merge)" ([L147](https://github.com/affaan-m/ECC/blob/90606c8315ee09cafc303515c5f33024db6b9882/skills/github-ops/SKILL.md#L147)). Both support "Keep". No babysit loop. |
| 12 | `wshobson/agents` (`0874a27`) | `ship-mate` and `git-pr-workflows` cover spec and PR creation, with no watch loop. Not applicable. |
| 13 | `nahid-sparktales/agent-dispatcher` (`564c3f0`) | No PR or CI loop skill in the tree. Not applicable. |
| 14 | `humanlayer/skills` (`653b641`) | `design-control-loop` keeps a human "on the loop" for scheduled agents that open PRs. Its framing fits change 1, but it does not babysit an existing PR. `visual-pr` covers PR text. Not applicable. |

## Limits

- Sólberg's skill file is unpublished. That column reflects only the
  article, and "not stated" may mean "not shown".
- OpenAI's column is a deleted skill. It records how that skill was designed,
  not a maintained reference.
- Cursor's built-in babysit skill is not public in `cursor/plugins` and was
  not compared.
- No skill was run against a real PR. Nothing in `skills/`, any README or any
  manifest was changed.
