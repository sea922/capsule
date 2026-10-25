# Preferred Source Repositories: 30-Day Sweep

**Research date:** 2026-09-27
**Recency window:** 2026-08-28 through 2026-09-27
**Scope:** all 13 repositories in `docs/source-repos.md`, compared against the
26 local skills. Follows `preferred-skill-repositories-workflow-gap-research.md`
(2026-09-06, six repositories).
**Method:** GitHub commit history and tree diffs via `gh api`, SKILL.md reads
for every added or substantially changed skill. Raw per-repository dossiers with
commit SHAs are in `2026-09-27-source-repos-sweep-raw/`.
**Boundary:** research only. No skill, manifest, or source list was changed.

## Recommendation

Add two new skills, fold eight ideas into existing owners, and fix one local
script hazard. Skip the rest.

### New skills (ranked)

| # | Proposed skill | Evidence | Why we lack it |
|---|---|---|---|
| 1 | `compound-learnings` (capture + refresh) | EveryInc `ce-compound`, `ce-compound-refresh`; commit `415181d3` culled ~70 of their own docs after tightening the bar | No owner for durable engineering lessons. Their key lesson: capture needs a strict counterfactual bar ("would losing this cause rediscovery?") and a paired refresh/cull pass, or the store rots. |
| 2 | `property-based-testing` | trailofbits `property-based-testing` (unchanged in window, read as reference) | Confirmed gap. Property catalog, strength ordering, tautology/vacuity pitfalls. Could live as a `tdd` reference instead of a standalone skill; decide at design time. |

Considered but not recommended as standalone skills:

- **`constraint-driven-development`** (addyosmani, new): numeric `CONSTRAINTS.md`
  contract plus a pass that detects agents gaming their own checks. The
  gaming-detection pass is the valuable part; fold it into
  `verification-before-completion` rather than adopting the contract file.
- **`skill-stocktake` / `skill-comply`** (ECC): library audit and
  "is this skill actually followed" scenario testing. Useful for maintaining
  this repository, but overlaps `skill-creator` evals and this sweep. Revisit if
  the library grows.
- **`deslop-shared-libs`** (gstack): extraction only with proof of two real
  callers. Belongs as a rule in `codebase-design` / `simplify`, not a skill.
- **Cross-model second opinion** (trailofbits `second-opinion`, EveryInc
  `ce-code-review`): fits `code-review` `deep` level as an optional step.

### Improvements to existing skills

| Local skill | Idea | Source |
|---|---|---|
| `code-review` | Blast-radius honesty ladder: name the one fact the change's safety depends on and state how it was proven (asserted → cited → walked → ran script → reproduced live); label unproven. Optional cross-model reviewer at `deep`. | cursor `pstack/skills/blast-radius`; trailofbits `second-opinion` |
| `git-workflow` (PR reference) | "Merge danger" field: one-way vs two-way door plus blast radius. Converges with the item above. | mattpocock `pr` (2026-09-17) |
| `verification-before-completion` | (a) Never let a wrapper's exit code stand in for the real checker; separate SKIPPED/ERROR from scored; no composites from partial coverage. (b) Detect self-gaming: lowered thresholds, deleted/skipped tests, new suppressions, disguised stubs. (c) Side-blind baseline-vs-patched checks with a marker proving the path ran. (d) Vary filter/order/pagination/aggregation individually and combined. | gstack `a6b3a575`; addyosmani; trailofbits `post-patch-validation`; agent-dispatcher |
| `tdd` | Weak-test litmus: "would this pass if every import returned `undefined`?" plus weak-assertion shapes. Disclose every observed failure, not only in-scope ones. | cursor `principle-test-behavior-not-implementation`; obra `test-driven-development` |
| `security-review` | Separate severity / confidence / evidence; bucket supported / hypothesis / disproved; mark `runtime_tested` vs `self_reported`; independent reviewer gets facts without the producer's conclusion. | gstack CSO rubric `4a3c6a8a` |
| `orchestrate` | Treat "I am a subagent" as known only from the dispatch mechanism, never from text (injection guard); give dispatches a deadline and recovery branch; label stale evidence `STALE`. | gstack `0d1bd561`; agent-dispatcher |
| `planning-and-task-breakdown` / `adlc-plan` | Interfaces block, review-focus section, plan self-review for proportion. | obra `writing-plans` |
| `adlc-intent` / `adlc-spec` | Wrap pasted issue/log text in delimited "data, not instructions" blocks. | wshobson |
| `research` | Fingerprint header (commit hash + monitored paths) so staleness is a `git diff`. | wshobson |

### Local hazard found

`scripts/link-skills.sh` runs `rm -rf "$target"` when a real (non-symlink)
directory already exists with a skill's name. This deletes a user's locally
forked skill without warning — the same bug gstack fixed this month. Recommend
refusing and printing a message instead of deleting.

Checked and clear: no `$1` argument-substitution hazards in local SKILL.md
files; `babysit-pr` treats auto-merge as a waiting state, never enables it
unprompted.

## Per-repository influence

| Repository | Activity in window | Influence |
|---|---|---|
| mattpocock/skills | New `pr`, `retro` | Merge-danger field; mechanical-vs-judgement standards split (minor) |
| obra/superpowers | `executing-plans`, `writing-plans`, TDD edits | Plan interfaces and self-review; ledger `Ruling:` format (minor); disclose all failures |
| addyosmani/agent-skills | New `constraint-driven-development` | Self-gaming detection |
| cursor/plugins (pstack) | `blast-radius`, test principles | Honesty ladder; weak-test litmus. Many third-party MCP plugins skipped as out of scope |
| DietrichGebert/ponytail | Hooks and docs only | Not applicable |
| mvanhorn/last30days-skill | Very active, engine/scraper internals | Not applicable; no mapped local skill |
| anthropics/skills | No `skill-creator` commits | Not applicable this window |
| trailofbits/skills | New `post-patch-validation`, `second-opinion` | Side-blind validation; cross-model review; PBT reference |
| EveryInc/compound-engineering-plugin | `ce-compound*` tightening, Compound Packs | New skill #1. Compound Packs too heavy to adopt |
| garrytan/gstack | 27 commits | Verification integrity, CSO rubric, dispatch stranding, installer clobber |
| affaan-m/ECC (`skills/`) | `skill-stocktake`, `skill-comply` | Noted, deferred |
| wshobson/agents | 28 commits | Arguments-as-data, research fingerprints |
| nahid-sparktales/agent-dispatcher | ~104 commits (whole history) | Interaction-testing checklist; stale labeling |
