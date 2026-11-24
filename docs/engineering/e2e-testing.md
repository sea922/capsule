# End-to-end testing

Use `e2e-testing` to build, repair, and prune end-to-end test suites.

Examples:

- “Add an end-to-end test for checkout.”
- “This Playwright test fails one run in five.”
- “Our e2e suite takes 50 minutes.”
- “Set up traces and screenshots for failed runs in CI.”

The skill reads the existing suite, then admits only journeys that lose their meaning at a lower level; checks a unit or integration test could hold go there instead. Each test is one journey: preconditions are created through the API or fixtures, the interface is driven only for the journey, and assertions are on what a user can see. Elements are selected by role, label, or a dedicated test identifier, data is unique per test, and waits are for states, never durations.

A flaky test is reproduced and traced before it is changed, then sorted into one of four causes: a race in the test, a race in the application, shared state, or an unstable dependency. Sleeps and extra retries are not fixes, and quarantine needs an issue, an owner, and a date. CI runs keep traces and screenshots for failures. The method is tool-neutral, with Playwright as the worked example.

## Workflow fit

`tdd` owns unit and integration test-first work, `diagnosing-bugs` an application race a flaky test exposes, `accessibility` a control that cannot be found by role, and `verification-before-completion` a one-off check that a change works.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/e2e-testing/SKILL.md).
