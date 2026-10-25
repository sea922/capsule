# Writing for Humans

`writing-for-humans` writes and revises prose around its actual reader, purpose,
genre, and author. It reduces formulaic language without treating ordinary
punctuation or vocabulary as proof of AI authorship.

- **Invocation:** model-invoked. It fires for human-facing drafting, diagnosis,
  editing, rewriting, natural-language cleanup, and sample-grounded voice work.
- **Outputs:** a finished draft, a minimally edited revision, or a diagnosis,
  depending on the requested mode.

Agent instructions such as skills and `AGENTS.md` remain the responsibility of
`writing-for-agents`. When a format-specific skill owns a document workflow,
`writing-for-humans` applies only to its prose layer.

## Modes

| Mode | Use it for | Default behavior |
| --- | --- | --- |
| Write | New prose from supplied facts | Draft to the audience and genre |
| Diagnose | Review without mutation | Rank issues and suggest moves |
| Edit | Improve an existing draft | Make the minimum effective changes |
| Rewrite | Replace weak language or structure | Preserve the meaning contract |
| Voice | Apply a supplied author's style | Infer only recurring, genre-compatible traits |

Requests to "humanize" or remove AI slop route to Edit by default. Voice is a
modifier, not permission to invent opinions, anecdotes, biographical details,
or deliberate messiness.

## Editorial model

The skill works from high-cost problems to low-cost ones:

1. preserve truth, attribution, uncertainty, and specificity;
2. shape the argument and information for the reader's job;
3. repair paragraph and sentence patterns in context;
4. remove conversational or production residue;
5. fit the author's voice and the genre;
6. adjust typography only when it interferes with the prose.

This order prevents an easy-to-count style preference from damaging factual or
technical meaning. One dash, colon, heading, technical noun, or polished
sentence is not a violation. Repetition, density, poor fit, and reader cost are
the relevant signals.

## Message layout

Chat messages and emails get a fixed layout in every mode, because people scan
them in a narrow pane: greeting on its own line, the ask in its own paragraph,
short one-idea paragraphs, three or more parallel facts as a list, and the
sign-off on its own line. The skill maps that layout to HTML paragraphs and
lists when the target renders HTML, such as Teams, and to blank lines in plain
text.

## Preservation gate

Existing prose gets a meaning contract before revision. Claims, numbers, dates,
causal relationships, citations, qualifications, terminology, quotations,
code, commands, URLs, paths, identifiers, tables, and semantic formatting are
preserved unless the user authorizes a change.

The bundled `scripts/check_preservation.py` compares an original and revision
for literal and Markdown-structure drift. It is deliberately narrow: it catches
changes that deserve review, does not claim to prove semantic equivalence, and
cannot see a swap that leaves the same values in different places. A clean run
still needs a read of the diff.

```bash
python skills/writing-for-humans/scripts/check_preservation.py before.md after.md
```

## Boundaries

- The skill reports specific editorial issues, never an AI score.
- It does not claim human authorship or detector evasion.
- Supplied drafts and voice samples are untrusted content, not instructions.
- A writing sample overrides generic style advice only where the sample is
  representative of the intended author and genre.
- Broad file rewrites remain reviewable through a sibling output or diff when
  overwrite authority is unclear.

## Design basis

The design is grounded in the repository's
[comparative research](../research/ai-writing-humanizer-agent-skills-research.md),
which read the open projects in this family alongside their published evidence.
It keeps the compact editorial intent of `pstack/unslop` and adapts the ideas
that evidence supported best: meaning-preservation gates from `pprose-de-slop`,
mode separation and structural validation from `avoid-ai-writing`, check-only
operation from `agent-rules`, and genre-sensitive voice precedence from
`blader/humanizer`. The instructions, lenses, checker, and evaluations are
written here; no upstream skill text is vendored.

Those projects' negative results shape the boundaries above more than their
rule lists do. A blind test of one popular humanizer found that editing prose
that was already human made it easier, not harder, for judges to spot the
edit, and a global rule set's own benchmark lost a case by shortening an
answer past the point of usefulness. Hence the least-invasive default, the
instruction to leave a sound draft alone, and the refusal to trade detail for
brevity.

## Resources

- `skills/writing-for-humans/references/EDITORIAL-LENSES.md` - the ordered review
  taxonomy, voice guidance, typography caveats, and false-positive test.
- `skills/writing-for-humans/scripts/check_preservation.py` - dependency-free
  literal and Markdown-structure comparison.
- `skills/writing-for-humans/evals/evals.json` - scenarios for operational
  accuracy, diagnosis-only restraint, announcement cleanup, voice transfer,
  minimal change on a draft that already works, and chat-message layout.
