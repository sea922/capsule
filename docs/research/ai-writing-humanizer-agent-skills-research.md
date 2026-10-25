# Research: Agent Skills That Remove AI Writing Tells

**Research date:** 2026-08-21

**Primary window:** 2026-07-23 through 2026-08-21

**Baseline:** [`pstack/unslop`](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md)

**Scope:** Current agent skills, rule packs, and plugins that remove formulaic AI prose, humanize text, or enforce plain-language style. This is a source and design audit, not a recommendation to evade AI detectors.

## Executive finding

The strongest projects do not treat "humanize" as a synonym-substitution task. They separate at least three concerns:

1. **Generation policy:** lightweight rules applied while the model drafts.
2. **Revision pass:** an explicit audit and rewrite that preserves claims, citations, structure, and voice.
3. **Verification:** deterministic checks for visible tells plus preservation checks for meaning-bearing artifacts.

`pstack/unslop` is unusually compact and well integrated. Its host mode declares every reply a prose surface, and the skill ends with a self-audit. Its main weakness is proof: the repository offers no dedicated evaluation showing that `unslop` improves blind human judgment, preserves meaning, or generalizes across genres. The most credible neighboring projects add modes, preservation invariants, deterministic scoring, write-beside behavior, or small comparative evaluations.

The available evidence supports a modest claim: these skills can reduce selected mechanical patterns. It does not support the stronger claim that they make text reliably indistinguishable from human writing. One recent cross-project blind test found that a popular humanizer introduced a recognizable editing fingerprint.

## How the research was conducted

- Read the current skill and supporting files in each repository.
- Inspected GitHub commit history and repository metadata directly.
- Prioritized projects updated or evaluated in the last 30 days.
- Used a Last30Days source pass across Reddit, Hacker News, GitHub, and the web. That pass produced broad discussion but little primary evidence specific to writing skills, so the conclusions below rely mainly on repository source, history, tests, and published evaluations.
- Treated stars and forks as adoption signals only, not proof of effectiveness.

Repository counts are a GitHub API snapshot captured on 2026-08-21 and will drift.

## Comparative map

| Project | Invocation model | Rule model | Completion gate | Evidence |
|---|---|---|---|---|
| [`pstack/unslop`](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md) | Always applied inside [`poteto-mode`](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md); can also be invoked as a skill | Compact blacklist plus plain-language and voice heuristics | Rewrite, add appropriate voice, then ask what still makes the result look AI-generated | 4,347 stars for the host repository; active integration, but no dedicated outcome evaluation |
| [`practical-prose/pprose-de-slop`](https://github.com/jlevy/practical-prose/blob/main/skills/pprose-de-slop/SKILL.md) | Explicit edit skill, with optional automatic use on machine-sounding prose | Two-pass diagnosis organized around claims, actors, mechanisms, quantities, consequences, and voice | Preserve claim strength, citations, terms, and structure; inspect the diff for meaning drift | Broad eval framework and regression assets; maintainer explicitly labels the project young and model scoring variable |
| [`agent-style`](https://github.com/yzhao062/agent-style) | Persistent adapter rules plus opt-in `/style-review` | 21 generation rules from writing references and field observation | Deterministic audit, semantic audit, scorecard, write-beside output, verification, and diff | 10-task sanity bench across four models; large measured reductions for three models, no change for Copilot control |
| [`agent-rules`](https://github.com/tornikegomareli/agent-rules) | Reversible global installation or explicit `clean up` and `check` skill modes | Answer shape, sentence patterns, vocabulary, technical English, uncertainty, estimates, and working style | Deterministic scorer; check mode reports line-level violations without editing | 12-prompt A/B set with blind pairwise judging; rules won 9, baseline won 1, 2 were inconsistent |
| [`avoid-ai-writing`](https://github.com/conorbronsdon/avoid-ai-writing) | Natural-language triggers or explicit `rewrite`, `detect`, and `edit` modes | Layered formatting, syntax, lexical-density, structural, and communication rules | Audit, rewrite, diff summary, optional second pass, and structural preservation validator | 3,176 stars, active tests and detector work; evidence is mainly pattern detection and preservation, not blind prose quality |
| [`blader/humanizer`](https://github.com/blader/humanizer) | Natural-language rewrite skill with genre and voice guidance | Large pattern catalog with writing-sample precedence and no-fabrication constraint | Rewrite, preserve meaning and facts, match voice, return the requested shape | 37,035 stars and 3,275 forks; packaging validation only, no repository-native prose evaluation; independent blind test found possible overediting fingerprint |
| [`keez97/humanizer`](https://github.com/keez97/humanizer) | `full`, `light`, `off`, and `detect` modes | Architecture-first revision, sentence/rhetoric pass, lexical/surface pass, then statistics | Severity-ranked detection plus no-fabrication and genre-sensitive review | Small controlled detector study reported that none of six rewrites cleared the document verdict |
| [`no_ai_slop_writing_rules`](https://github.com/realrossmanngroup/no_ai_slop_writing_rules) | Installable agent skills or Claude plugin | Separate subtractive no-slop rules from a corpus-derived additive voice profile | Read both skills and self-check banned patterns | 654 stars; a documented 513,683-word source corpus, but no dedicated comparative outcome test |

## Baseline: what `pstack/unslop` is trying to do

The skill's intent is broader than removing a few banned words. It defines a compact editorial stance:

- Scan for formulaic content, language, typography, chatbot artifacts, filler, hedging, jargon, and vague claims.
- Rewrite while preserving meaning and tone.
- Add "soul" through opinions, rhythm variation, first person, specificity, and limited messiness when the genre permits it.
- End with a self-audit: identify what still makes the result obviously machine-generated.

The current rules cover six recurring families:

1. **Content and epistemics:** puffery, vague attribution, promotional claims, name-dropping, formulaic challenge sections, and unsupported generality.
2. **Rhetoric:** participial add-ons, negation pivots, rule-of-three cadence, false ranges, synonym cycling, and repetitive copular sentences.
3. **Typography and layout:** em dash, colon, bold, inline headers, title case, emoji, and curly-quote habits.
4. **Conversation residue:** canned greetings, offers to help, sycophancy, and knowledge-cutoff disclaimers.
5. **Filler and abstraction:** hedging, repeated conclusions, noun-heavy metaphors, jargon, and adverbs.
6. **Plain-language repair:** name the mechanism, add specificity, split overloaded sentences, prefer active voice, and choose common words.

The invocation is intentionally aggressive. [`poteto-mode`](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md) says that any prose surface goes through `unslop`, including the assistant's reply. A [2026-08-02 commit](https://github.com/cursor/plugins/commit/99559f2f52047978602ef365589275831e76af07) tightened rule titles, added cross-project replacement checks, and banned metaphor-heavy nouns. That is useful evidence of active maintenance and dogfooding. It is not an effectiveness test.

One naming trap matters: the same plugin collection also contains [`cursor-team-kit/deslop`](https://github.com/cursor/plugins/blob/main/cursor-team-kit/skills/deslop/SKILL.md), but that skill removes code-generation residue such as needless comments, defensive checks, deep nesting, and weak types. It is adjacent in spirit, not a prose humanizer.

## Strong primary-source examples

### 1. Practical Prose: protect the author's meaning before polishing style

[`pprose-de-slop`](https://github.com/jlevy/practical-prose/blob/main/skills/pprose-de-slop/SKILL.md) is the clearest example of a revision skill that treats semantic preservation as a completion condition. It asks the agent to determine purpose, audience, genre, voice, and local rules, then perform a two-pass audit. Revisions should make the actor, claim, relationship, mechanism, quantity, or consequence explicit rather than merely swapping vocabulary.

Its strongest instructions are negative constraints:

- Do not strengthen or weaken claims without cause.
- Preserve citations, terms, and relevant structure.
- Do not manufacture anecdotes, slang, typos, or personal details as fake humanity.
- Re-read the diff for meaning drift, flattened voice, unsupported specificity, awkward rhythm, and new repetition.

The skill sits in a larger editorial ladder that distinguishes common correction, de-slopping, copy-editing, full editing, review, evaluation, and comparison. That makes routing more precise than a single universal humanizer. The repository includes evaluation dimensions and regression assets, but its own documentation describes it as a young project and warns that model-based scores vary. The [2026-08-19 v0.4.0 change](https://github.com/jlevy/practical-prose/commit/fc984e4573ba) repaired its bootstrap and distribution path, showing current maintenance rather than broad adoption.

### 2. Agent Style: pair generation guidance with a write-beside reviewer

[`agent-style`](https://github.com/yzhao062/agent-style) separates soft generation-time rules from a stricter opt-in reviewer. Users can install persistent rules into `AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot, Kiro, and other adapters. `/style-review FILE` then runs deterministic and semantic audits, combines them into a scorecard, asks before writing `FILE.reviewed.md`, verifies the result, and presents a diff. A two-file mode supports A/B comparison without writing.

The taxonomy combines 12 rules adapted from established writing references with 9 field-observed rules. The latter target false bullets, casual dash use, repeated sentence openings, transition overuse, summary closures, terminology drift, heading case, missing evidence, and unnecessary abbreviations.

The repository publishes a small sanity benchmark: 10 tasks, two generations per condition, across four model environments. Its corrected results report mechanical-violation reductions of 47 percent for Claude Opus 4.7, 46 percent for GPT-5.4, and 86 percent for Gemini 3 Flash, while a Copilot control was unchanged. The maintainers also state the limits: only 7 of 21 rules were mechanically checked, most measured improvement came from sentence length, dash use, and jargon, and important rules about tacit knowledge and evidence were not measured. A [2026-08-12 repair](https://github.com/yzhao062/agent-style/commit/021dba0ee8ab) fixed six directive-versus-detector divergences and re-scored preserved drafts.

This is the best example of an honest, bounded evaluation. It proves that selected rules fire less often. It does not prove better argument quality or human authorship.

### 3. Agent Rules: always-on installation with an escape hatch

[`agent-rules`](https://github.com/tornikegomareli/agent-rules) offers two distinct invocation paths. Its installer appends marker-delimited, reversible rules to the global memory of Claude, Codex, Pi, Amp, Gemini, and OpenCode. Its Agent Skill exposes explicit `clean up` and `check` modes. Check mode makes no changes and reports line-level violations with a deterministic score.

The rule set extends beyond common style tells. It covers answer shape, expected length, 19 sentence patterns, vocabulary, plain technical English, formatting, opinions, anti-sycophancy, uncertainty, numeric estimates, progress reporting, working style, and when to stop and ask.

The repository's 12-prompt comparison ran baseline and rule-enabled answers twice, then used blind pairwise judging with swapped positions. The rules won 9 prompts, the baseline won 1, and 2 judgments were inconsistent. The published failure is instructive: a git rebase answer became too short and lost useful detail. The evaluation also found that a flat em-dash ban still left instances in a fifth of responses. This shows the central tradeoff of global rules: lower visible slop can come at the cost of coverage, while the prompt consumes tokens and can conflict with host instructions.

### 4. Avoid AI Writing: layered detection plus preservation validation

[`avoid-ai-writing`](https://github.com/conorbronsdon/avoid-ai-writing) has the strongest engineering around deterministic checks. Its skill exposes `rewrite`, `detect`, and minimally invasive `edit` modes, plus voice and context controls. It explicitly treats the target document as untrusted text, which prevents embedded instructions from hijacking the editing agent.

Its taxonomy is tiered instead of treating every occurrence as a violation:

- formatting patterns;
- sentence and rhetorical patterns;
- frequent lexical markers;
- clarity edits;
- cluster and density signals;
- structural and conversational residue.

The accompanying tooling detects dozens of pattern types and validates that rewriting did not damage code fences, frontmatter, blockquotes, tables, inline code, URLs, paths, or heading structure. The intended gate is audit, rewrite, diff summary, then at most one corrective pass. Recent commits added [code-fence protection](https://github.com/conorbronsdon/avoid-ai-writing/commit/b504e), [an optional house-style layer](https://github.com/conorbronsdon/avoid-ai-writing/commit/f666087), and [false-positive proofing](https://github.com/conorbronsdon/avoid-ai-writing/commit/f0a5).

This is a good model for safety and regression testing. Its tests demonstrate that the scanner and preservation validator behave as designed. They do not by themselves establish that the resulting prose reads more naturally to blind readers.

### 5. Humanizer projects: large adoption, mixed proof

[`blader/humanizer`](https://github.com/blader/humanizer) is the clearest adoption signal in this category, with 37,035 stars and 3,275 forks in the research snapshot. Its current skill adds two important safeguards that simpler humanizers lack: a real writing sample overrides generic style rules, and personality should only be added when the genre permits it. Technical, legal, reference, and factual material should remain neutral. The skill also forbids invented facts.

The repository validates its own packaging but publishes no prose evaluation. A recent independent field guide, [`ai-writing-skill-field-guide`](https://github.com/Daguilar0123/ai-writing-skill-field-guide), tested a then-current version on 16 held-out paragraphs from one author. Model judges identified the humanized version in 83 percent of cold trials and 77 percent of calibrated trials, above chance in that small setup. The guide's additive voice experiment also failed to make the text look more human to those judges, and scored more machine-like on tells than a bare model draft. The guide limits that second result itself: every drafting arm, including the no-skill baseline, was identified 16 of 16, so the authorship axis is at ceiling and cannot rank the arms, and the drafting generator was a smaller model than the one whose output prompted the test. This is a small, model-judged study, not a definitive benchmark, but it is important counter-evidence: aggressive editing can create a consistent "humanizer voice" that is itself recognizable.

[`keez97/humanizer`](https://github.com/keez97/humanizer) publishes an even more direct negative result in [`references/DETECTION-LIMITS.md`](https://github.com/keez97/humanizer/blob/main/references/DETECTION-LIMITS.md). Six rewrites across two genres failed to clear a GPTZero document-level verdict. Its conclusion is appropriately narrow: optimize for prose quality and provenance, not detector evasion. The skill's `light` mode is also a useful design choice for technical and analytical prose because it preserves hedging and confidence labels that a full "make it punchy" pass might erase.

### 6. No AI Slop Writing Rules: subtractive cleanup is not the same as voice

[`no_ai_slop_writing_rules`](https://github.com/realrossmanngroup/no_ai_slop_writing_rules) splits its design into two composable skills. One removes generic AI patterns. The other applies a voice profile derived from a documented 513,683-word, 5,632-entry corpus. Whether or not that particular voice is desirable, the architecture is sound: removing a known tell and adding a named author's style are different operations with different permissions and failure modes.

This separation avoids a common conceptual error in `unslop`-style skills. "Use plain language" can be a general correction. "Add opinions, first person, and mess" is a genre-sensitive voice transformation. The latter should be opt-in or driven by a supplied voice sample, especially for legal, technical, reference, and scientific writing.

## Rule taxonomy that survives comparison

Across the primary sources, the reusable taxonomy is:

| Layer | Typical checks | Main risk |
|---|---|---|
| Epistemic content | Unsupported praise, vague sourcing, fabricated specificity, certainty inflation | Style editing silently changes truth conditions |
| Discourse structure | Canned preamble, forced headings, false bullets, symmetric recaps, generic conclusions | A global template replaces genre conventions |
| Rhetoric and cadence | Negation pivots, rule of three, colon restatement, uniform sentence length, repeated openings | Mechanical bans punish legitimate rhythm |
| Lexicon and syntax | Stock phrases, nominalizations, formal substitutes, copular repetition, passive voice | Synonym churn changes terminology or tone |
| Typography and chat residue | Dashes, excessive bold, emoji, greetings, offers to help, cutoff notes | House style is mistaken for authorship evidence |
| Voice and genre | First person, opinions, contractions, roughness, humor, supplied writing samples | A generic humanizer persona overwrites the author |
| Preservation | Claims, citations, code, tables, links, headings, confidence labels | A cleaner draft becomes less correct or less useful |

This taxonomy suggests that "AI tells" should not be one undifferentiated blacklist. Epistemic and preservation checks deserve higher priority than typography. Voice changes require more permission than clarity edits. Density and clustering are more defensible than treating one common word or one em dash as proof of machine authorship.

## Invocation patterns and their tradeoffs

### Always-on generation policy

Examples: `pstack/unslop` through `poteto-mode`, `agent-style` adapters, and global `agent-rules` installation.

This catches problems early and keeps every response consistent. It also spends context on every task, can collide with local writing conventions, and is most likely to over-apply genre-sensitive rules. Always-on policy should therefore be short, prioritised, and framed as defaults rather than authorship detection.

### Explicit post-hoc revision

Examples: `pprose-de-slop`, `/style-review`, `avoid-ai-writing edit`, and humanizer rewrite modes.

This model gives the agent a concrete target and makes diffs possible. It is safer when the skill declares preservation invariants and supports detect-only or check-only operation. It is weaker when "rewrite everything" is the only mode.

### Composed editorial pipeline

Examples: the Practical Prose tier ladder and the separate subtractive/additive skills in `no_ai_slop_writing_rules`.

This is the most controllable model. It allows correction, de-slopping, voice transformation, and evaluation to have different triggers and completion conditions. The cost is more routing complexity and more skill surface area.

## Completion gates, ranked by strength

1. **Weak:** "Rewrite it and ask what still sounds AI." Useful as a final reflection, but subjective and not reproducible.
2. **Better:** detect-only and edit modes, an issue list, a rewrite, a diff summary, and a second read for regressions.
3. **Strong:** deterministic pattern scan, genre and voice policy, preservation invariants, write-beside output, and a visible diff.
4. **Strongest available:** fixtures, false-positive tests, A/B runs, blind judgments with swapped order, preserved generations for re-scoring, and published failures.

No reviewed project has a complete gate for truthfulness, voice fidelity, usefulness, and blind human preference. A robust skill should describe which of those dimensions it actually checks.

## Evidence quality and limits

- **Adoption is high, evaluation is sparse.** The largest humanizer has tens of thousands of stars, but no repository-native outcome benchmark. Smaller projects often provide better preservation or comparison evidence.
- **Mechanical scores are useful but narrow.** They show that configured patterns decrease. They do not show that the result is clearer, more accurate, or more human.
- **Model judges are not human readers.** The available blind tests are informative directionally, but sample sizes are small and evaluator models may share the same stylistic priors as rewriting models.
- **Detector evasion is not a sound completion criterion.** The controlled negative result from `keez97/humanizer` and the independent field guide both argue against this framing.
- **Rule lists can overfit fashion.** Dash bans, banned-word lists, and demands for sentence variation are house-style choices unless tied to genre, density, or an author sample.
- **Recent source coverage is uneven.** GitHub supplied the strongest current evidence. The Last30Days Reddit and Hacker News pass found broad concern about generic model voice and prompt-instruction limits, but no recent community consensus or credible independent benchmark specific to these skills.

## Design implications for this repository

If this repository creates or adapts a skill in this family, the most defensible design would be:

1. Keep a short always-on plain-language baseline focused on clarity, specificity, unsupported claims, and conversational residue.
2. Put typography and high-frequency lexical patterns behind density or clustering thresholds.
3. Separate `detect`, `edit`, and `rewrite` modes. Detect mode must not mutate the target.
4. Treat voice transformation as opt-in. A supplied writing sample overrides generic advice.
5. Preserve claims, citations, terminology, code, tables, links, headings, and confidence labels as explicit invariants.
6. Produce a concise issue summary and diff. Use write-beside behavior for broad rewrites.
7. Test false positives and meaning preservation, not only hit counts.
8. Publish negative cases where the rules shorten away useful detail or make authentic writing more formulaic.
9. Describe the objective as reducing formulaic patterns and improving fit, never as proving human authorship or defeating detectors.

## Recommendation

Use `pstack/unslop` as a compact intent and routing reference, not as the full quality model. Borrow semantic-preservation gates from Practical Prose, write-beside and A/B review from Agent Style, explicit check-only operation from Agent Rules, structural validation from Avoid AI Writing, and genre-sensitive voice precedence from the better humanizer implementations.

The central design principle is simple: remove patterns only when they interfere with meaning, voice, or genre. A successful skill should leave behind writing that is more specific and more faithful to its author, not writing that merely complies with a fashionable anti-AI checklist.

## Primary sources

- Cursor Plugins: [`pstack/unslop`](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md), [`poteto-mode`](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md), and [recent rule revision](https://github.com/cursor/plugins/commit/99559f2f52047978602ef365589275831e76af07)
- Practical Prose: [`pprose-de-slop`](https://github.com/jlevy/practical-prose/blob/main/skills/pprose-de-slop/SKILL.md) and [repository](https://github.com/jlevy/practical-prose)
- Agent Style: [repository, adapters, review workflow, and benchmark](https://github.com/yzhao062/agent-style)
- Agent Rules: [repository, skill modes, scorer, and evaluation](https://github.com/tornikegomareli/agent-rules)
- Avoid AI Writing: [skill, detector, validator, tests, and history](https://github.com/conorbronsdon/avoid-ai-writing)
- Blader Humanizer: [current skill and history](https://github.com/blader/humanizer)
- Keez97 Humanizer: [current skill](https://github.com/keez97/humanizer) and [controlled detector limits](https://github.com/keez97/humanizer/blob/main/references/DETECTION-LIMITS.md)
- No AI Slop Writing Rules: [subtractive and additive skill split](https://github.com/realrossmanngroup/no_ai_slop_writing_rules)
- AI Writing Skill Field Guide: [survey data, scripts, and blind-test report](https://github.com/Daguilar0123/ai-writing-skill-field-guide)
