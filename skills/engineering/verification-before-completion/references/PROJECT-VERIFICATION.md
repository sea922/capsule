# Project Verification

Use this branch when existing checks do not exercise the user path behind a completion claim.

Inspect the current entry points, commands, tests, and local setup. Define the smallest repeatable path that reaches the real behavior:

| Part | Record |
| --- | --- |
| Environment | Revision, dependencies, required fixtures, and safe test data |
| Launch | Exact command and observable readiness signal |
| Drive | User inputs or API/CLI calls reaching the claimed behavior |
| Observe | State or output distinguishing success from failure, including a relevant negative case |
| Teardown | Handles and cleanup for task-owned processes and disposable state |

Run the path in the permitted environment. A browser screenshot alone cannot prove persistence; a successful API response alone cannot prove the UI route works. Exercise each distinct entry point that changes the claimed contract, with scope proportional to risk.

If a step is unavailable, report the missing prerequisite and narrow the completion claim. When building or fixing is already authorized, return missing harness work to `implement`. For verification-only requests, propose a script or project-local verification skill without silently editing the project. If recurring verification authoring is requested, use available skill-creation guidance and preserve this skill as the owner of completion verdicts.

Keep durable commands with the project's existing test or operations documentation. Generated verification instructions count only after their launch, drive, observation, and teardown have actually been exercised.
