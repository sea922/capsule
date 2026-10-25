# pstack principles: adoption review

Research date: 2026-09-26. Source: [`cursor/plugins`](https://github.com/cursor/plugins)
`pstack/skills/` at commit `12d587dfb2`. That was the last commit touching `pstack/`,
dated 2026-09-23. All 48 `SKILL.md` files were read, including the 23 `principle-*`
leaf skills. Each was mapped against every skill under `skills/` in this repository
and against earlier reports in `docs/research/`.

## Question

pstack puts a lot of engineering principles into skills. Which of them should this
repository adopt, and in what form?

## Answer

**Adopt none of them as standalone skills.** Most are already encoded in the skill
that owns the concern. Earlier research had already taken several of them from pstack.
A small number of concrete rules are worth folding into existing skills. The rest are
agent behaviour defaults, and their natural home is `CLAUDE.md`/`AGENTS.md`, not a
skill.

## How pstack packages principles

- Every `principle-*` skill sets `disable-model-invocation: true`. Principles never
  trigger on their own. They are short leaf files (about 1-2 KB) that link to each
  other.
- A single mode skill, `poteto-mode` (frontmatter `mode: true` plus a `reminder`),
  indexes the principles under "when it applies" conditions in five groups: Core,
  Architecture, Verification, Delegation, and Meta. It tells the agent to read a leaf
  in full before applying it and to name each principle it used.
- `setup-pstack` does not touch principles. It only writes a Cursor rule that maps
  roles to models.

This model does not suit this repository. Our skills are workflows the model can
invoke, each routed by its own `description`. Claude Code has no counterpart to
`mode:`. Copying the pstack model would mean adding a router skill or an index that is
always loaded, which is exactly the context-load cost that `writing-for-agents` warns
about. The useful part is each rule's content, and that belongs in whichever skill
already owns the concern.

## Principle map

Status key: **Covered** means an existing skill already says the same thing. **Fold**
means one or two lines should go into the named skill. **Behaviour** means an agent
default that fits `CLAUDE.md` if it is wanted at all. **Skip** means not adopted.

| Principle | Core rule | Where it lives here | Status |
|---|---|---|---|
| attack-the-premise | After two failed fixes that share one premise, suspect the premise | `implement` (switch to diagnosis after two failed corrections); `diagnosing-bugs` step 3 | Covered |
| boundary-discipline | Validate at boundaries, trust internal types | `coding-standards` ("validate untrusted input where it enters") | Covered |
| build-the-lever | Mechanical work ships a codemod or script a reviewer can rerun | Not stated anywhere | Fold → `implement` |
| encode-lessons-in-structure | Replace a repeated instruction with a check, lint rule, or script | Practised by the repo's CI validation, but not written down | Fold → `writing-for-agents` |
| exhaust-the-design-space | Build 2-3 materially different designs | `codebase-design` "Design it twice" | Covered |
| experience-first | Prefer the user's experience over implementation convenience | Not stated anywhere | Skip (product taste) |
| fix-root-causes | Ask why until you reach the cause; do not add guards that hide the symptom | `diagnosing-bugs`, already cited in `diagnosing-bugs-skill-research.md` | Covered |
| foundational-thinking | Get the data shape right before writing logic | Partly in `codebase-design` | Skip (generic advice) |
| guard-the-context-window | Main thread gets summaries, not raw output | `implement` (compact evidence receipts); `orchestrate`; `writing-for-agents` | Covered |
| laziness-protocol | Smallest diff; delete before adding | Global `CLAUDE.md` §2-3; `simplify` | Covered (behaviour) |
| make-operations-idempotent | Same end state even if the previous run crashed partway | `codebase-design/references/RELIABILITY.md` | Covered |
| migrate-callers-then-delete-legacy-apis | Migrate every internal caller and delete the old API in the same change | `DEEPENING.md` §6 defaults to a gated, incremental retirement | Fold → `codebase-design` |
| minimize-reader-load | Collapse layers; a new reader should find where X comes from in 30 s | `simplify`; `DEEPENING.md` (pass-through layers) | Covered |
| model-the-domain | Put domain logic in one structure (state machine, union, table), not branching conditionals | Partly in `coding-standards` ("explicit representations") | Fold → `codebase-design` |
| never-block-on-the-human | Proceed on reversible work, then present the result | `implement`; `git-workflow` | Covered (conflicts with global CLAUDE.md, see below) |
| outcome-oriented-execution | Accept planned breakage mid-migration | Rejected as a default in `implement-skill-research.md` | Skip |
| prove-it-works | Check the real thing, not a proxy | `verification-before-completion` | Covered |
| redesign-from-first-principles | Redesign as if the requirement had always existed | Close to `codebase-design` "Design it twice" | Skip |
| separate-before-serializing-shared-state | Give each concurrent writer its own file or key before adding a lock | `orchestrate` and `implement` for agents; application code only in general terms | Covered |
| sequence-verifiable-units | Verify each unit before starting the next; order commits so the failing test lands first | `implement`; `planning-and-task-breakdown`; `tdd` | Covered |
| subtract-before-you-add | Remove before building | `simplify`; the YAGNI section of `codebase-design`; global `CLAUDE.md` | Covered (behaviour) |
| test-behavior-not-implementation | Would the test still pass if every import returned `undefined`? The skill lists five shapes of hollow test | `tdd` warns about mock-only tests but has no concrete test for hollowness | Fold → `tdd` |
| type-system-discipline | Unrepresentable illegal states, branded primitives, exhaustive matching | `coding-standards` covers boundary narrowing only | Fold → `coding-standards` |

## Recommended changes, by payoff

1. **`tdd`: hollow-test check.** Add pstack's rule: before keeping a test, ask whether
   it would still pass if every imported function returned `undefined`. Also add the
   five hollow test shapes: weak assertion, mock-only, self-referential, constant
   pinning, and a fixture asserting its own values. The current wording ("a test that
   only proves how mocks were called is weak evidence") names one of the five and gives
   no test to apply. `code-review` could reuse the same list as review criteria.
2. **`coding-standards`: typed-language discipline.** Add a short section: sum types
   instead of bags of optional fields, branded IDs, exhaustive matches, and derivation
   from a single schema. `coding-standards-skill-research.md` already took pstack's
   TypeScript guidance, but not these rules.
3. **`codebase-design`: signs a domain model is missing.** Add to
   `references/MODULE-DESIGN.md` two signs that a domain model is missing: a new
   feature adds a branch to an existing if/else chain, or a second boolean must stay
   in sync with the first. Include the warning against organizing modules by execution
   phase.
4. **`codebase-design`: internal-only retirement.** Add a branch to `DEEPENING.md` §6.
   When every caller is internal and in the same repo, migrate them all and delete the
   old shape in the same change, with no compatibility layer. The existing gated path
   stays for public or cross-deploy callers. This is the only principle that
   contradicts a current repo default. The fold narrows that default rather than
   reversing it.
5. **`implement`: rerunnable lever.** Add one row to the routing table: for a
   mechanical change across many sites, the evidence is the codemod or script that made
   it, and that script is part of the diff.
6. **`writing-for-agents`: prefer mechanisms.** Add one line: when a rule has to be
   repeated, replace the prose with a check or script.

Each of these is a surgical edit to a skill that already exists. No new skill, bucket,
or manifest entry is needed. All six were applied on 2026-09-26; see
`.changeset/pstack-principle-folds.md`.

## Non-principle pstack skills

Only two fill a real gap:

- **`reflect`**: three reviewers read the session transcript, then feed lessons back
  as edits to existing skills. This repo has nothing that improves skills from real
  sessions. It is a candidate for a new skill and deserves its own research pass,
  including EveryInc `ce-compound`, which is listed in `docs/source-repos.md` for
  exactly this purpose.
- **`blast-radius`**: finds what a change breaks outside the diff and proves one safety
  fact by running code. This is a partial gap in `code-review`, whose deep mode reviews
  the diff and the intent but never traces callers outside the diff. Fold it into
  `code-review/references/DEEP-REVIEW.md`.

`create-verification-skill` is a possible gap, partly covered by
`verification-before-completion/references/PROJECT-VERIFICATION.md`. The rest
(`architect`, `arena`, `swarm`, `interrogate`, `figure-it-out`, `show-me-your-work`,
`recall`, `teach`, `how`, `why`, `technical-writing`, `unslop`, `no-comments`,
`typescript-best-practices`, `tdd`, `bro`, `make-bot-ui`, `automate-me`,
`maintain-verification-skill`) is either covered by `orchestrate`, `code-review`,
`grilling`, `implement`, `handoff`, `writing-for-humans`, or `coding-standards`, or is
personal or niche tooling.

## Open decision for the owner

`principle-never-block-on-the-human` ("proceed, then present") contradicts the global
`CLAUDE.md` instruction "If uncertain, ask". The repository's `implement` and
`git-workflow` skills already follow the pstack stance for reversible work. Whether to
align the global instruction is the owner's decision, so no change is recommended here.

## Other preferred repositories

This review is scoped to pstack, entry 4 in `docs/source-repos.md`. It maps
pstack's `principle-*` skills, so the other preferred repositories are not
applicable to its question; none of them publishes an equivalent principle set.
Each was assessed for the same skills elsewhere:

| Repository | Where it was assessed |
|---|---|
| mattpocock/skills | `2026-09-27-source-repos-sweep.md`, `2026-10-06-source-repos-sweep.md` |
| obra/superpowers | `2026-09-27-source-repos-sweep.md`, `tdd-skill-research.md` |
| addyosmani/agent-skills | `2026-09-27-source-repos-sweep.md`, `2026-10-06-source-repos-sweep.md` |
| cursor/plugins (pstack) | This report |
| DietrichGebert/ponytail | `codebase-design-ponytail-research.md`, sweeps |
| mvanhorn/last30days-skill | Sweeps; not applicable (research engine, no principle skills) |
| anthropics/skills | Sweeps; not applicable (`skill-creator` covers authoring only) |
| trailofbits/skills | `2026-09-27-source-repos-sweep.md` |
| EveryInc/compound-engineering-plugin | `2026-09-27-source-repos-sweep.md`, `2026-10-06-source-repos-sweep.md` |
| garrytan/gstack | `2026-09-27-source-repos-sweep.md`, `2026-10-06-source-repos-sweep.md` |
| affaan-m/ECC | `2026-09-27-source-repos-sweep.md` |
| wshobson/agents | `2026-09-27-source-repos-sweep.md` |
| nahid-sparktales/agent-dispatcher | `2026-09-27-source-repos-sweep.md`, `2026-09-26-model-orchestration/preferred-sources.md` |

Their overlapping ideas reached this repository through earlier reports, which this
review relied on:
`implement-skill-research.md`, `verification-before-completion-skill-research.md`,
`tdd-skill-research.md`, `coding-standards-skill-research.md`,
`diagnosing-bugs-skill-research.md`, `2026-09-26-adlc.md`, and
`2026-09-26-model-orchestration/preferred-sources.md`. Any fold above that is
implemented should check those reports first, so that the pstack wording does not
override a choice made there on purpose. The main case is `outcome-oriented-execution`,
which `implement-skill-research.md` rejected explicitly.
