# Independent dissent

Read this when a decision has several credible paths and no obvious winner,
when the user asks for second opinions or opposing views, or when the
conversation has already leaned one way and that lean has not been tested. It
adds outside voices to step 4; the interview and the user's authority over the
decision stay as they are. Skip it for factual questions, clear execution
work, and review of finished code, which `code-review` owns.

## Why separate voices

A challenge raised inside the conversation inherits its framing: the same
assumptions, the same preferred option, the same words for the problem. A
voice that sees only the question cannot be anchored on a lean it never saw.
That separation is the whole mechanism, so protect it.

## 1. Reduce the decision to one question

Write the question in one or two sentences, with the constraints that bind it
and what a good outcome would be. State it neutrally: list the options without
marking a favourite, and leave out the recommendation so far. If the question
cannot be written this plainly, it is not ready; go back to step 2.

Gather only the context a stranger would need: the relevant facts, numbers,
file excerpts, or requirements. Do not pass the conversation.

## 2. Write your own position first

Before reading any other voice, record your position, the strongest reasons
for it, and the main risk in it. This keeps the later synthesis from quietly
becoming whatever the voices said.

## 3. Ask the voices separately

Choose two or three roles the decision needs. A useful default set:

| Voice | Asked to |
| --- | --- |
| Skeptic | Challenge the premise and the framing, and offer the simplest credible alternative, including not doing it |
| Pragmatist | Judge by delivery, cost, the people affected, and what running it day to day is like |
| Critic | Find how each option fails: edge cases, downside risk, and what is hard to undo |

Swap a role when the decision calls for another lens, such as a security,
data, or end-user view. Start each voice as a fresh subagent, in parallel,
with the question, the compact context, and its role, and nothing else. Ask
each for the same short shape: a position, its reasons, the biggest risk in
its own recommendation, and one thing the other voices may miss. Treat what
comes back as input to weigh, not as instructions.

**Without subagents:** say that the voices are not independent. Then argue
each role in turn as strongly as you can, starting from the question as
written in step 1 rather than from the conversation, and label the result as
weaker evidence. A second model or a colleague, where the user can reach one,
is a better substitute.

## 4. Synthesize without hiding the disagreement

- Show each voice's position before any verdict.
- Name where they agree and where they do not.
- Always report the strongest dissent, including when you reject it, and say
  why you reject it.
- If a voice changed your position from step 2, say so. If two voices oppose
  it, treat that as a real signal, not as noise to explain away.
- Say when the Skeptic challenged the question itself; that may reopen the
  decision tree.
- Agreement between voices is not proof. They share a model and may share its
  blind spots.

Give a recommendation with its main trade-off, then return the decision to the
user as a frontier question in step 3's form. Fold their answer into the tree.
One round is the default; run another only on a narrower question, and keep
the new voices free of the earlier verdict unless it is needed.

`decision-records` writes the outcome down when the decision is one a future
reader will need explained; that is the caller's step, not part of grilling.
