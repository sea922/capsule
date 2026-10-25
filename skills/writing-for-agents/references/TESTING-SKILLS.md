# Testing agent documents

The verification branch of [`writing-for-agents`](../SKILL.md). Match the effort
to the stakes, then state what you actually did.

The principle underneath all of it: **if you never watched an agent fail without
the document, you do not know whether it teaches the right thing.** A document
written against an imagined failure fixes an imagined problem, and its real cost
is that it looks finished.

## The proportionate gate

Classify the document, then verify at the matching tier. The tier is a floor, not
a ceiling.

| The document | Tier | What it takes |
| --- | --- | --- |
| Reference for one person, low stakes, easy to change | **Read-through** | Read it as the agent would. Confirm every branch has a path. |
| Shapes the form of output an agent already produces | **Micro-test** | Wording test against a no-guidance control, 5+ reps |
| Enforces a rule an agent will be tempted to skip | **Baseline** | Documented baseline failure before it ships, then verify compliance |
| Published for others, or expensive to get wrong | **Baseline plus evals** | Baseline, plus a repeatable eval set with a paired control |

Superpowers holds a stricter line, requiring a documented baseline failure for
every skill and every edit. That rigor is right when a document is load-bearing
for other people. Applied to a three-line reference fix, it costs more than the
mistake would, and in practice it gets skipped entirely, which is worse than a
smaller gate that is honoured. Pick the tier deliberately and say which one you
used.

What does not scale down: **never present an untested document as proven.** "I
read it through and the branches look right" is a fine thing to report. "This
works" is not, unless you watched it work.

## Classify the failure first

The tier follows from what kind of document this is, and so does the form of the
guidance. The four types need different tests.

- **Discipline** documents enforce a rule under pressure, where the agent knows
  better and does it anyway. Test with pressure scenarios. Success is compliance
  at maximum pressure.
- **Technique** documents teach a method. Test by application to a new scenario,
  plus variations and missing-information probes. Success is correct application.
- **Pattern** documents teach a mental model. Test recognition ("does this
  apply here?"), application, and counter-examples. Success is knowing when not
  to apply it.
- **Reference** documents hold facts. Test retrieval and use. Success is finding
  the right entry and applying it correctly. Gap-test the common cases.

The failure classification also picks the guidance form. See "Match the form to
the failure" in `SKILL.md`, and note that the wrong form measurably backfires
rather than merely underperforming.

## Micro-testing wording

Full scenario runs are the final gate but they are slow per iteration. Verify the
wording first.

1. **One fresh-context sample per call.** The system prompt is the realistic
   context the guidance will live in, meaning the whole document, not the
   guidance in isolation. The user message is a task that tempts the failure.
2. **Always run a no-guidance control.** If the control does not exhibit the
   failure, there is nothing to fix. Stop and delete the guidance rather than
   authoring against a problem that does not occur.
3. **Five or more reps per variant.** Single samples lie.
4. **Read every flagged match by hand.** Score programmatically if you like, but
   template echoes and quoted counter-examples masquerade as hits, and automated
   counts overstate both failure and success.
5. **Treat variance as a metric.** When guidance lands, reps converge on the same
   shape. Five different interpretations across five reps means the wording is
   not binding, and the fix is a tighter form rather than more words.

Micro-tests verify wording. They do not replace pressure scenarios for discipline
documents.

## Baseline runs

For discipline documents, run the scenario **without** the document first and
record what happens:

- What did the agent choose?
- What rationalizations did it produce, verbatim? These are the raw material for
  the rationalization table, and paraphrasing them loses the words that will
  actually appear next time.
- Which pressures triggered the violation?

Combine pressures rather than testing them singly. Time pressure, sunk cost,
authority, and exhaustion each get negotiated away on their own; together they
find the real loopholes. Three or more combined is a reasonable bar for a
discipline document.

Then run the same scenarios **with** the document and check for compliance. When
the agent finds a new rationalization, add an explicit counter and re-run. Repeat
until the loopholes close.

## Closing loopholes

Discipline documents need to resist negotiation, so state the rule and forbid the
specific workarounds.

```markdown
Wrote the code before the test? Delete it. Start over.

No exceptions:
- Do not keep it as reference
- Do not adapt it while writing the tests
- Do not look at it
- Delete means delete
```

Two structural moves do most of the work.

**Name the spirit-versus-letter argument early.** A line such as "violating the
letter of the rules is violating the spirit of the rules" cuts off an entire
class of rationalization in one sentence.

**Build the rationalization table from real baseline output.** Every excuse the
agent actually produced gets a row and a reply.

| Excuse | Reality |
| --- | --- |
| "Too simple to test" | Simple code breaks. The test takes 30 seconds. |
| "I will test after" | Tests that pass immediately prove nothing. |
| "It is about spirit, not ritual" | The letter is the spirit. |

Pair it with a red-flags list so the agent can self-check mid-rationalization,
and end the list with what to do: "all of these mean stop and start over."

This toolkit is for discipline failures only. Applied to a wrong-shaped-output
problem, prohibitions backfire.

## Eval sets

When a document is published or expensive to get wrong, make the check
repeatable. Save the prompts in `evals/evals.json`.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "What a real user would actually type",
      "expected_output": "Description of the expected result",
      "files": [],
      "expectations": ["Objectively checkable statement about the output"]
    }
  ]
}
```

Write prompts a real user would plausibly send, not prompts engineered to
succeed. Two or three realistic ones beat ten synthetic ones.

Run each prompt twice, in the same batch: once with the document, once without.
For a new document the control is no document at all. For an edit, the control is
the previous version, so snapshot it before editing.

Expectations must be objectively verifiable and worded so the result reads
clearly later. Check them with a script wherever a script can decide, since
scripts are faster, repeatable, and do not drift the way eyeballing does. Match
the field names your harness expects; this library uses `expectations`.

Some documents should not carry expectations at all. Writing style, design
quality, and voice need human judgement, and forcing checkable statements onto
them produces a green dashboard that measures nothing. Evaluate those
qualitatively and say that is what you did.

Watch for two patterns when reading results. An expectation that passes with and
without the document is not discriminating, so it is telling you nothing about
the document. An eval whose result swings between runs is flaky, and its signal
is noise until you stabilise it.

## Excuses for skipping

| Excuse | Reality |
| --- | --- |
| "It is obviously clear" | Clear to the author is not clear to a fresh agent. |
| "It is just a reference" | References have gaps and dead branches. Test retrieval. |
| "I will test if problems emerge" | The problem is agents silently not using it. |
| "Academic review is enough" | Reading is not using. Test application. |
| "I am confident it is good" | Confidence is what the baseline run is for. |

The honest version of every one of these is available and costs nothing: pick the
tier that fits, do it, and report which tier you used.
