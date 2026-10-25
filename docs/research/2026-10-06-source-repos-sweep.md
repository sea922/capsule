# Preferred Source Repositories: Delta Sweep

**Research date:** 2026-10-06
**Window:** 2026-09-27 through 2026-10-06, following
`2026-09-27-source-repos-sweep.md`
**Scope:** all 13 repositories in `docs/source-repos.md`
**Method:** fresh blobless clones; `git log --since=2026-09-27` and
`git diff --name-status <last commit before window> HEAD -- '*SKILL.md'`, then
reads of every added skill and of the substantive skill diffs.
**Boundary:** the source list was not changed. The follow-up changes are listed under Applied.

## Activity

| Repository | Commits | Skill changes |
|---|---|---|
| mattpocock/skills | 35 | New `in-progress/chief-of-staff`; `SCOPE.md` + `.out-of-scope/`; edits to `implement`, `to-tickets`, `handoff` |
| obra/superpowers | 0 | None |
| addyosmani/agent-skills | 33 | Fixes in 5 skills (spec stops the turn after writing, Prisma rollback, perf Step 3); docs/hosts churn |
| cursor/plugins | 44 | pstack: new `correct`, `benchmark-checklist`, `principle-explain-the-number`, `poteto-help`; `architect` design red flags. New `dyl-stack` plugin |
| DietrichGebert/ponytail | 87 | Host/installer fixes, v4.12–4.13; review/audit findings are now numbered |
| mvanhorn/last30days-skill | 34 | Engine and source fixes; not skill-shaped |
| anthropics/skills | 2 | `claude-api` only; `skill-creator` unchanged |
| trailofbits/skills | 2 | `semgrep` large-file scanning; `culture-index` description |
| EveryInc/compound-engineering-plugin | 35 | `ce-debug`, `ce-work`/`ce-plan` scope discipline, `ce-compound` artifact handoff, `ce-code-review` I/O gaps |
| garrytan/gstack | 21 | New `test-audit`; "test value bar" in review/qa/ship; CSO scanner qualification |
| affaan-m/ECC | 152 | Rename to "ECC"; hooks/installer hardening; translations. No new English skills |
| wshobson/agents | 12 | New `connectivity-triage` (macOS); setup-example fixes |
| nahid-sparktales/agent-dispatcher | 5 | Retrieval and store-error fixes; no skill changes |

## What is new and worth acting on

### 1. "Make the mistake impossible" ladder (three repos converged)

- cursor pstack `correct`: find mistake classes that occurred twice, fix each at
  the highest level that works: architecture → types → lint whose error names
  the fix → behavior test → docs last. Prove each new check fails on a real past
  mistake. Keep a rule→enforcer table; an unenforced rule that repeats escalates.
- cursor pstack `architect` red flags: split ownership, two ways to do one task,
  importable internals, hand-synced lists. Framing: "the next contributor is an
  agent that sees only the files it opened and copies the nearest example."
- EveryInc `ce-debug`: after the minimal fix, "remove the way to write the bug"
  (one helper, a type that cannot hold the bad state, or a lint/test) when the
  pattern recurs; otherwise name the structural fix as follow-up.
- mattpocock `chief-of-staff`: "pit of success" and "no workarounds" environment.

**Local fit:** `diagnosing-bugs` (structural-prevention step), `codebase-design`
(agent-proof red flags), `compound-learnings` (escalate a lesson to an enforcer
instead of a doc when possible). Strongest signal of this window.

### 2. Measured-number discipline

cursor pstack `principle-explain-the-number` + `benchmark-checklist`: before
reporting a speedup or eval result, answer "why not double?" (name the limiter
from a profile), check tuning parity, physical limits, error counts, ≥5
interleaved runs with median and range, end-to-end share, and that the work
actually ran. Verdict is "inconclusive" when the limiter is unnamed.

**Local fit:** `verification-before-completion` reference for performance and
eval claims. We have no owner for this today.

### 3. Test value bar and test-suite audit

gstack `test-audit` and the bar now applied in `/review`, `/qa`, `/ship`: a test
needs four answers (what it protects, what regression fails it, why existing
coverage misses it, whether it needs a test-only production seam). Includes a
low-value catalog and a regression proof (fails at HEAD, passes at base, passes
after fix). pstack `correct` repeats the "would pass if every call returned
nothing" litmus already noted in the previous sweep.

**Local fit:** `tdd` and `code-review` (bar for new tests). A standalone audit
skill is optional; the catalog alone is the reusable part.

### 4. Build what was asked

EveryInc `ce-work`/`ce-plan`: add an unrequested guard, fallback, option, or
abstraction only when a contract requires it, omitting it lets harm land
unnoticed, or adding it later is expensive (stored data, public interface,
money, security). Never narrow requested behavior to fit a safeguard. Replace
in-repo callers instead of leaving wrappers. After two failed fixes, name and
check the shared assumption.

**Local fit:** `implement` and `planning-and-task-breakdown`.

### Smaller items

- EveryInc `ce-compound`: subagents write full output to a per-run artifact and
  return only the path, avoiding summary collapse. Fits `orchestrate`.
- EveryInc `ce-code-review`: flag missing I/O error handling only when the
  failure costs something where the code runs. Fits `code-review`.
- mattpocock `SCOPE.md`: a curation bar (observed failure + fits philosophy)
  with `.out-of-scope/` decision records. Could guide this repository's own
  intake.
- mattpocock `implement`: invoke `tdd`/`code-review` via the Skill tool by name.
- mattpocock `to-tickets`: attach split tickets as native sub-issues.
- mattpocock `handoff`: fixed temp-dir resolution order (`$TMPDIR`, `/tmp`,
  `%TEMP%`); compare with local `handoff`.
- dyl-stack `principle-the-algorithm`: question requirement → delete → optimize
  → accelerate → automate. Overlaps `simplify`; low priority.
- ponytail: numbered review/audit findings for easy reference.

## Not applicable this window

obra/superpowers (no commits), anthropics/skills (`claude-api` only),
trailofbits (tool-specific), last30days (engine internals), ECC (rename and
infra), wshobson (`connectivity-triage` is macOS ops, no local owner),
agent-dispatcher (internals), addyosmani (fixes only).

## Applied

| Local skill | Change |
|---|---|
| `diagnosing-bugs` | Search for recurrence sites after a confirmed cause; propose a structural prevention separate from the minimal fix (#1) |
| `implement` | "Build what was asked" rule; delete replaced in-repo interfaces; name the shared assumption after two failed fixes (#4) |
| `codebase-design` | Agent-proof design red flags (#1) |
| `compound-learnings` | Ranked mechanism ladder; prove the mechanism fails on the original mistake (#1) |
| `tdd` | Test value questions and no test-only production seam (#3) |
| `code-review` | Cost condition for missing I/O handling; hollow or seam-adding tests as findings (#3, smaller items) |
| `orchestrate` | File-based worker results (smaller items) |
| `verification-before-completion` | New `references/MEASURED-CLAIMS.md` for performance and eval numbers (#2) |

Not applied: a standalone `test-audit` skill, `SCOPE.md`, `to-tickets`
sub-issues (no local owner), and `principle-the-algorithm` (covered by
`simplify` and `codebase-design`). The local `handoff` already writes a
task-scoped file, so the temp-directory fix does not apply.
