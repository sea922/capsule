# Broken build or type errors

Load this when a build, compile, or type-check step fails with messages that name files and lines. The compiler has already located the failure, so the work is a short repair loop, not a root-cause investigation. Reading the errors is diagnosis; editing to fix them needs the same authorization as any other change, and goes through `implement` when the user asked for a fix.

## 1. Get the real errors

Find the project's own build or check command from its scripts or configuration and run that, not a guess. Capture the full output. If it was failing before your first edit, say so and separate those errors from the ones a change introduced.

Read the first error, not the last. Later messages are often consequences of an earlier one: a failed import, a missing type, or a syntax error can produce dozens of follow-on errors that vanish when it is fixed. Group the rest by file, and take imports, missing modules, and declarations before the errors that depend on them.

## 2. Fix one error at a time

1. Read the code around the reported location and both sides of the mismatch: the value and the type or signature it is checked against.
2. Decide which side is wrong. An error at a call site may mean the caller is wrong or the declaration is; pick from intent, not from which edit is shorter.
3. Make the smallest change that corrects it.
4. Rerun the same command and confirm that error is gone and no new one appeared.

Keep the diff to the errors. No redesign, renaming, reformatting, or unrelated cleanup, even in a file already open.

## 3. Do not buy a pass

A build that passes because a check was silenced is not fixed. Do not add a type-escape cast, a suppression comment, a widened type, a skipped test, an excluded file, or a loosened compiler or lint setting to make an error disappear. If the check itself is wrong for the project, that is a decision for the user. `coding-standards` holds the same line.

Clearing caches or reinstalling dependencies is reasonable when the evidence points at stale state, such as an error naming a file that no longer exists. Say why before doing it, and ask before deleting a lockfile or changing dependency versions.

## 4. Stop and report

Stop the loop and report when:

- the same error returns after a few different attempts, which means the hypothesis about it is wrong; go to the full diagnostic workflow;
- a fix produces more errors than it removes;
- the fix would need a change of interface, ownership, or architecture, which belongs to `codebase-design`;
- the cause is a missing or conflicting dependency, a toolchain version, or the environment, where the change is outside the code.

**Complete when:** the project's build or check command exits cleanly with every check still enabled, or the remaining errors are listed with what was tried and why each needs a decision.
