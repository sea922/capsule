# Catalogue stocktake

Read this when the request is about the whole set of skills rather than one
skill's failure: "audit our skills", "which skills overlap", "what can we
retire", or a catalogue that has grown until descriptions compete. It produces
a verdict per skill and a list of proposals. It changes nothing by itself:
improvements that alter behaviour still go through steps 3 to 6 of
`skill-evolve`, and nothing is merged, retired, or deleted without the user's
approval of that specific item.

## 1. Fix the scope and the mode

List the skill locations being audited, such as a repository's `skills/`
directory or a harness's installed skills, and say which were found. Leave
archived or disabled skills out of the inventory.

| Mode | Use when | Covers |
| --- | --- | --- |
| Quick scan | A previous stocktake exists and is recent | Skills added or changed since then, plus any skill whose neighbours changed |
| Full pass | No previous result, the catalogue was reorganized, or the user asks | Every skill |

A quick scan carries earlier verdicts forward for unchanged skills and says
so. Keep the result table where the user wants it; do not write it into a
skills directory.

## 2. Build the inventory

For each skill, record its name, description, size, last change, the
references and scripts it ships, and which other skills, rules, or agents name
it. Add usage when the project measures it. When it does not, write
"unmeasured"; never treat missing data as zero use.

## 3. Check each skill against the others

Read every description side by side first, because descriptions are what a
harness routes on, then read the bodies of any that look close.

- **Overlap.** Two skills that own the same job, or one whose content is a
  section of another. Quote the overlapping passages.
- **Trigger collision.** Descriptions that would both fire on the same
  request, or boundary sentences that contradict each other ("X belongs to A"
  in one, claimed by B in another). Write the request that collides.
- **Stale references.** A skill, agent, file, command, flag, or tool the skill
  names that no longer exists or has changed. Check against the repository and
  the tool itself, not memory.
- **Duplication with always-loaded instructions.** Content already present in
  project instruction files or rules.
- **Weight.** A body far longer than its job needs, or detail that belongs in
  an on-demand reference.
- **Unused.** Measured low use, or no path by which it would be invoked.

For a large catalogue with subagents available, split the bodies into batches
for read-only passes, and give every batch the full list of descriptions so
overlap can still be seen.

## 4. Give each skill a verdict

| Verdict | Meaning | The reason must state |
| --- | --- | --- |
| Keep | Useful, current, and distinct | What it owns that nothing else does |
| Improve | Worth keeping with a named change | The section, the change, and the evidence for it |
| Merge into another | Substantial overlap | The target skill and exactly what moves there |
| Retire | Stale, superseded, or costing more than it returns | The defect, and what covers the need instead |

Each reason stands alone: a reader who has not seen the skill can act on it.
"Overlaps with X" or "too long" is not a reason. Judge every skill by the same
criteria whatever its origin. A verdict rests on what you read and checked;
when the evidence is thin, say so and prefer Keep.

## 5. Present, then stop

Report a table of skill, verdict, and reason, then the collisions and stale
references as their own lists, then what was not examined. For each Merge or
Retire, add what depends on the skill: other skills, rules, agents, docs
pages, manifests, and indexes that name it.

Wait for the user to choose. A chosen Improve that changes how a skill behaves
or triggers goes through `skill-evolve` from step 3, with evals deciding. A
correction of a wrong fact or dead reference is verified against the real
target and applied once approved. A Merge or Retire is carried out only on
explicit approval of that item, through the repository's own workflow, with
every dependent entry updated in the same change.
