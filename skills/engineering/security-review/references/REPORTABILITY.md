# Reportable findings

Read this when the goal is findings that will be reported to someone who must act on them: a maintainer through a disclosure channel, a bounty program, or a team that will only fix what is proven. It narrows the review to weaknesses an outside party can actually reach, and it filters out the look-alikes that waste a triager's time.

This reference changes what counts as worth reporting. It does not widen what you may do: the skill's limits on live exploitation, other people's data, and destructive checks still apply, and a proof of concept runs only against an isolated fixture or a target the user is authorized to test.

## 1. Read the rules first

Before looking at code, read the project's security policy, its disclosure channel, and, for a program, its scope and exclusions. Note what is out of scope, which versions and deployments count, and what the program asks for in a report. A finding outside the stated scope is not reportable there, however real it is.

## 2. Start from the entry points

List where input from outside arrives: request handlers, uploads, webhooks, background jobs fed by users, parsers of files or messages, and integration endpoints. Work forward from those. Scanner output is a list of places to read, not a list of findings.

The classes that are usually worth the effort, because a remote party can trigger them and the impact is concrete:

| Class | What to prove |
| --- | --- |
| Server-side request forgery | A user-supplied URL or host reaches a server-side fetch that can address internal services or metadata endpoints |
| Authentication or authorization bypass | A request without the required identity or role reaches the protected operation, or one tenant reaches another's data |
| Injection (SQL, command, template) | User input reaches the interpreter as code, not as a bound value or argument |
| Unsafe deserialization or upload leading to execution | Attacker-supplied bytes are deserialized or stored where they will be executed |
| Path traversal | A user-supplied path escapes the intended directory for a read or a write |
| Cross-site scripting that fires without help | Stored or reflected input executes in another user's session without that user pasting or typing it |

## 3. Drop the look-alikes

These look dangerous in a search result and are usually not reportable. Record them as hardening notes at most, unless the program's rules say otherwise:

- unsafe deserialization, `eval`, or dynamic execution that only local, trusted input can reach, such as a command-line tool loading the operator's own file;
- a shell call whose command is fully hardcoded;
- a missing security header on its own, with no attack it enables;
- a rate-limit complaint with no demonstrated impact;
- cross-site scripting that needs the victim to paste the payload themselves;
- weaknesses in tests, fixtures, examples, demos, or vendored code that never ships;
- build or pipeline injection when the pipeline is outside the stated scope.

Each has an exception: a hardcoded command becomes a finding when an environment variable or a configuration value a user controls feeds it. Check for the exception before dropping the item.

## 4. Apply the gate

Keep a finding only when all of these hold, using the skill's supported, hypothesis, and disproved buckets:

- the path starts at a real user or network boundary;
- the input is controlled by the attacker, not by an operator or the code itself;
- the sink does something that matters, and no existing control stops the path;
- the smallest safe proof works, on a fixture or an authorized target;
- it is not already covered by a published advisory, a CVE, or an open report;
- the target and version are in scope.

A candidate that fails the proof stays a hypothesis with the missing evidence named. Do not submit hypotheses.

## 5. Draft the report

Write it for a triager who has not seen the code. Use the skill's finding format and add what a report needs: a one-paragraph description of the weakness and why it matters, the file and line range with a short excerpt, the minimal request or script that demonstrates it, what the attacker gains, and the version, commit, or deployment tested. Leave out secrets and other people's data. Send nothing: sharing the report through a disclosure channel is the user's action.
