# ADLC review and improvements

Date: 2026-09-28. Local baseline: `aac8cf938ef5b9a627fa13f625805e60a15725e9`.
Working branch: `feature/adlc-review`. Scope: the five existing user-invoked ADLC
skills and their publication pages, templates, executable support, and evals.
The preferred-source order is unchanged. Three pre-existing untracked research
reports from September 27 were left untouched.

## Conclusion

Keep the five-skill composition. The existing intent/spec/plan separation is
useful, but approval freshness and delivery state had concrete gaps. Tighten
those boundaries rather than adding another lifecycle framework, autonomous
orchestrator, mandatory hook, or new approval on each build step.

The implemented changes are original wording and one small read-only hash
helper. They reuse the existing implementation, review, verification, delivery,
and learning owners. No upstream skill, runtime, or hook was installed or vendored.

## Research method and limits

Read `docs/source-repos.md` before researching. Read all five local skills, all
four artifact templates, publication pages, workflow guidance, the original ADLC
research, and the planning/verification composition seams. Consulted all 13
preferred repositories at current pinned revisions using authenticated read-only
GitHub API calls. The [revision and file ledger](2026-09-28-adlc-review/source-ledger.json)
records exact SHAs, commit dates, paths, and links. The
[inspection script](2026-09-28-adlc-review/inspect-sources.py) retrieves matching
files and prints bounded topic-relevant excerpts; this was targeted inspection,
not a complete audit of each repository.

Invoked the user-selected local `last30days` v3.25.0 engine through Git Bash with
host web-search enabled, the [three-query plan](2026-09-28-adlc-review/query-plan.json),
five resolved software-development communities, no browser-cookie reads, and
`--days=30 --emit=compact`. It returned 68 dated items for August 29–September 28:
18 Reddit threads, 34 Hacker News stories, and 16 GitHub items. Polymarket
returned no relevant items. X and YouTube were unavailable, not quiet. Only 30
items were from the final seven days. The engine normalized the how-to plan's
freshness mode to `evergreen_ok` despite the supplied `strict_recent`; use item
dates and the explicit run window rather than claiming that flag was enforced.

The raw engine report is retained locally under
`docs/research/2026-09-28-adlc-review/agentic-development-lifecycle-software-raw-v3.md`
with a web supplement appendix; the raw dump is not published in this change.
Counts are retrieval coverage, not
68 endorsements of these changes. Results include irrelevant agent products,
geometric/CUDA tools, and promotional workflow reposts; these did not inform the
recommendations. Three post-engine web queries covered Cloudflare, the Anthropic
playbook, and JetBrains Air. Cloudflare secondary reports were not corroborated
by a first-party result and are excluded from the design evidence.

## Evidence used

- **Recent community signal:** the September 23
  [ExperiencedDevs discussion](https://www.reddit.com/r/ExperiencedDevs/comments/1wojx18/maintaining_quality_in_the_age_of_agentic/)
  had 437 points and 233 comments at retrieval. Its discussion of lost thinking
  time supports preserving human intent and review. These are practitioner
  experiences, not a controlled estimate of agent productivity.
- **Recent primary source:** JetBrains' September 22
  [Air announcement](https://blog.jetbrains.com/blog/2026/09/22/introducing-jetbrains-air/)
  frames agent development around coordination, verification, shared context, and
  governance across tools. This supports explicit handoff context and evidence,
  not adopting its platform or treating announced capabilities as proven results.
- **Foundational primary source, outside the 30-day window:** Anthropic's
  [AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)
  is dated August 21, 2026. It connects intent, spec, plan, testing, deployment,
  and maintenance; preserves an existing authoritative artifact system; and
  distinguishes advisory instructions from enforced action boundaries. Its
  feedback loop supports assigning an outcome observation after delivery.
  It is background guidance, not a new September release.
- **Decisive local evidence:** the baseline hashing expression truncated at a
  quoted `## Approvals` line and removed body `status:` lines. Executable paired
  checks show changed requirements could retain the same legacy hash. The
  router checked independent status/hash pairs without requiring every source
  link to agree; the plan stage checked only the immediate spec. Those are local
  instruction defects irrespective of community popularity.

## Preferred-source influence ledger

Exact revisions and file URLs are in the linked JSON ledger. This table follows
the owner's preference order. Repository-wide HEAD movement is not evidence that
every selected skill changed during the window.

| Preferred repository | Consulted material and influence / exclusion |
| --- | --- |
| `mattpocock/skills` | `to-spec`, `wayfinder`: preserve settled human context, scope boundaries, and unresolved decisions separately. Keep ADLC's interview when information is missing; do not adopt automatic issue publishing. |
| `obra/superpowers` | `brainstorming`, `writing-plans`: approval is scoped to the artifact actually presented; plans need coverage and fresh review. Preserve that scope while avoiding a second approval solely because a turn changed. No mandatory subagent workflow adopted. |
| `addyosmani/agent-skills` | `spec-driven-development`: use existing spec conventions, observable criteria, and explicit boundaries. Reuse the current artifact instead of inventing another specification system. |
| `cursor/plugins` | pstack's `principle-never-block-on-the-human` and `principle-prove-it-works`: continue reversible authorized work; inspect the real artifact. Conditions block dependent work rather than the entire frontier. |
| `DietrichGebert/ponytail` | `ponytail-review`: reuse-first and complexity restraint. Keep five skills and one small helper instead of a database or workflow engine. It supplies no approval protocol, so none is attributed to it. |
| `mvanhorn/last30days-skill` | README, installed engine and run: community discovery and coverage reporting. Not an authority for software approval semantics. |
| `anthropics/skills` | `skill-creator`, `doc-coauthoring`: scenario fixtures and evidence limits; fresh-reader evaluation is stronger than author self-review. This pass adds fixtures and records same-session walkthroughs, not independent model-performance results. |
| `trailofbits/skills` | `differential-review`, `property-based-testing`: baseline comparison, risk-relevant failure paths, and invariance checks. The hash tests vary newline/BOM/fence inputs and preserve known Git hash behavior; no fuzzing campaign claimed. |
| `EveryInc/compound-engineering-plugin` | `ce-plan`, `ce-compound-refresh`: distinguish planning from execution, preserve settled choices, and check stale evidence against current state. Route durable lessons to existing `compound-learnings`; no automatic learning capture or commits adopted. |
| `garrytan/gstack` | `spec`, `autoplan`: verified current behavior, measurable acceptance, rollback, and explicit decisions about scope. Reject oversized templates and automatic external execution for this suite. |
| `affaan-m/ECC` | `intent-driven-development`, `operator-approval-loop`, `delivery-gate`: observable ACs, revision-bound approvals, and limits of mechanical checks. Apply revision binding to artifact and slice decisions; do not copy the outbound-message database or mistake a hash for authenticated approval. |
| `wshobson/agents` | Conductor `workflow-patterns`: durable checkpoints and completion evidence. Retain ADLC's separate progress record rather than updating status inside a hashed approved plan. |
| `nahid-sparktales/agent-dispatcher` | `VERIFICATION.md`, `CONTROLS.md`: fresh receipts, reported versus verified outcomes, and explicit authority. Carry these into progress and handoff without installing its dispatcher or changing decision controls. |

## Findings and implemented decisions

| Finding | Change | Why this boundary |
| --- | --- | --- |
| Shell hashing was duplicated and could ignore substantive text | One Node/Git helper normalizes UTF-8 BOM/CRLF, excludes only frontmatter status and the final unfenced ledger, and rejects substantive content after the ledger | Deterministic byte operation deserves executable support; the helper neither approves nor authenticates |
| Approved downstream content could name an old upstream hash | Shared root-to-leaf approval contract checks identity, latest decision, content hash, source links, and conditions | Reapproved upstream content still needs downstream reconciliation |
| An approval could be recorded after its reviewed content changed | Recompute immediately before recording and after the write; preserve history | A human decision must bind to what was shown |
| Gate demanded name/decision in the current turn only | Reuse explicit prior conversation authorization for the same presented revision and scope | Turn boundaries are not revocation; edited content still requires review |
| Conditional approval/waiver looked unconditional through status alone | Read decision rows, carry IDs/owners/deadlines, retain minimal waived contracts | Permission to skip a checkpoint cannot invent requirements or release blocked work |
| Progress was not bound to plan or code revision | Plan hash, revision-specific receipts, actual decision authors, and explicit invalidation/reconciliation | Mutable progress is useful only when its evidence remains attributable |
| Missing evidence was handled by decrementing state once | Reconstruct the highest state with all prerequisites supported | An old verified label cannot leave a false reviewed label after code changed |
| `done` meant merged, and the router lacked ordinary terminal and combined-acceptance paths | Declare local/PR/merge/deployment endpoint and check combined acceptance; preserve old merged semantics for legacy plans | Delivery scope follows the user; merged does not imply deployed or successful in use |
| Carried decisions could deadlock discovery or independent work | Separate entry prerequisites from decisions a slice produces; route actual blockers | Discovery can resolve uncertainty without unblocking dependent implementation |
| Spec barred all paths, including observable API contracts | Ban implementation file choices, permit routes/data fields/user-visible paths; add failure cases and stable AC revisions | Specifications need precise external vocabulary |
| Success signal had no owner or observation point | Add baseline/acceptance method, owner, and observation point without inventing targets | Delivered output and realized outcome are separate claims |
| Raw command arguments were treated as untrusted even when directly requested by the human | Distinguish direct task direction from quoted source material; use longer data fences | Preserve user authority while preventing embedded source text from becoming instructions |

## Verification and evaluation limits

The executable suite is kept with `adlc-gate` and included in normal `npm test`
through `scripts/adlc-content-hash.test.mjs`. Seven tests cover:

1. Legacy LF hash compatibility, approval-recording invariance, and changed-body detection.
2. UTF-8/non-ASCII text, CRLF/LF, and optional BOM invariance.
3. Quoted approval headings and body status changes, with a paired legacy failure.
4. Ambiguous/malformed boundaries, trailing substantive text, and duplicate status.
5. The target repository's SHA-1 and SHA-256 object formats.
6. CLI paths containing spaces and failure without a misleading hash on stdout.
7. Invocation through the directory links used by local skill installations.
   This test first failed (exit 0 with empty output), then passed after resolving
   real paths in the CLI entry guard.

The five skills have 15 self-contained scenario fixtures in their own `evals/`
directories. A [paired instruction walkthrough](2026-09-28-adlc-review/scenario-review.md)
compares the baseline and revised instructions against the same inputs. It is
author self-review, not an independent agent evaluation. No quantified improvement
in agent compliance, review quality, or productivity is claimed. Independent
baseline-versus-revised model runs remain useful follow-up evidence.

Repository validation and final test results are recorded after execution in the
walkthrough record. The initial review used synchronized plugin/package version
`0.1.0`; shipping rebases this patch onto the released `0.2.0` base without
changing either manifest. A patch changeset records the behavior change.
The subsequent ship-it request authorizes commit, push, and a merge-ready PR;
deployment and local harness relinking remain outside this change.

## Compatibility and remaining limits

- Existing well-formed LF artifact hashes are preserved. A legacy record affected
  by the old exclusions or encoding differences needs renewed review; never
  overwrite its old reviewed hash to force a match.
- The helper needs Node.js 18+ and Git. Missing runtimes leave freshness unverified.
  It handles the documented flat frontmatter/fenced-source/final-table format;
  it is not a general Markdown or YAML approval parser.
- Approval-chain checks, identity attribution, condition interpretation, and
  routing remain advisory agent instructions. Trusted hooks or protected approval
  services would be a separate, project-specific enforcement task.
- No mandatory monitoring, thresholds, multi-agent execution, or universal
  delivery policy is introduced. Outcome observation does not create an automation.
