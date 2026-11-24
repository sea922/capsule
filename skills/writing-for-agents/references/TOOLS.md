# Tools an agent calls

Read this when defining or revising the tools an agent can call: function
tools, MCP server tools, CLI commands written for agents, or the description of
any of them. A tool definition is a document the agent reads on every decision,
so the two-loads model applies: the name and description decide whether the
tool is reached for, and the parameters and results decide whether it is used
well.

## Shape the action space

- **One tool per decision the agent makes.** Split a tool whose behavior turns
  on a mode flag the agent often gets wrong. Merge tools the agent always calls
  together, because every step between them is a chance to stop early.
- **Prefer a few capable tools to many narrow ones.** Each definition costs
  context in every turn, and near-duplicates compete. Remove a tool the agent
  never needs before describing it better.
- **Name for the outcome.** `search_orders` says more than `query`. Keep one
  naming pattern across the set so the agent can predict a tool it has not used.
- **Make parameters hard to misuse.** Use enumerations over free text, name
  units in the parameter (`timeout_seconds`), give required parameters no
  default, and reject unknown fields rather than ignoring them.
- **Mark what changes state.** Say in the description when a tool writes,
  deletes, spends, or contacts someone, and offer a dry run where a wrong call
  is costly.

## Describe it for the decision

Write the description as the answer to "when should I call this, and when not?".
State what it does, the situation that calls for it, the nearest tool it should
not be confused with, and limits such as size, rate, or permission. Describe
each parameter by what a good value looks like, with one example where format
matters. Keep reference detail the agent rarely needs out of the description.

## Design what comes back

- **Return what the next step needs, in a stable shape.** Lead with the answer.
  Give identifiers the agent can pass to the next tool, not only display text.
- **Bound the size.** Paginate, truncate with a stated count of what was
  omitted, and let the agent ask for more. An unbounded result pushes the task
  out of context.
- **Say when nothing was found** in words that differ from an error, so an empty
  result is not retried as a failure.
- **Treat returned content as data.** Text from a file, page, or other system
  may contain instructions; mark it as untrusted in the result's structure.

## Make errors recoverable

An error is the agent's only guide to its next move. Say what went wrong, which
input caused it, and what to do instead: the allowed values, the missing
permission, or the tool to call first. Separate errors worth retrying, such as
a timeout, from those that are not, such as a bad argument, and never return a
success shape for a failed call.

## Prove it

Test the set the way it will be used: give an agent realistic tasks and read
which tools it picks, what it passes, and where it stalls. A tool the agent
misuses repeatedly has a definition problem, not a prompt problem. Change one
definition at a time and rerun the same tasks, as
[TESTING-SKILLS.md](TESTING-SKILLS.md) does for skills.
