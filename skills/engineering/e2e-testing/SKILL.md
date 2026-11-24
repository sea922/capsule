---
name: e2e-testing
description: Build, repair, and prune end-to-end test suites that exercise real user journeys through the running application, with Playwright as the worked example. Use when adding an end-to-end or browser test, choosing which journeys deserve one, fixing or triaging flaky end-to-end tests, speeding up a slow suite, or setting up end-to-end runs and failure artifacts in CI. Unit and integration test-first work belongs to tdd; a one-off manual check that a change works to verification-before-completion.
---

# End-to-end testing

End-to-end tests are the most expensive coverage a project has and the only kind that proves a whole journey holds together. Suites fail when those two facts are confused: everything gets tested at this level, the suite grows slow and unreliable, people rerun it by habit, and a failure no longer tells anyone to stop. Once a team ignores red runs, the suite costs more than having none.

The method is the same for any runner. Examples use Playwright; the [Playwright reference](references/PLAYWRIGHT.md) has the concrete forms.

## 1. Read the suite that exists

Find the runner, its configuration, how the application and its data are started for tests, the existing helpers and page objects, how CI runs the suite, and its recent history: runtime, failures, retries, skipped tests. Follow the project's structure and naming. If there is no suite, choose the runner the project's stack and team already lean toward before reaching for a default.

Confirm what environment the tests target. A suite never runs against production or shared data that real people use: it creates records, sends messages, and can charge cards. If only such an environment is available, stop and ask.

**Complete when:** the runner, the data setup, the CI run, and the recent history are known, and the target environment is confirmed safe to write to.

## 2. Choose the journeys

Admit a journey only when it loses its meaning at a lower level: sign-up through first use, cart through payment confirmation, a permission boundary that spans interface, API, and storage. If a unit or integration test could observe the same failure, put it there with `tdd`, where it runs faster and names the cause instead of the symptom. Field-by-field validation, message wording, and formatting rules do not belong here.

Rank candidates by what a failure would cost: money movement, sign-in and account recovery, data loss, and the few paths most users take. A small suite that covers those and stays green is worth more than broad coverage nobody trusts.

**Complete when:** each journey has a reason it cannot be tested lower down, and the list is ranked by the cost of failure.

## 3. Structure each test

One test is one journey with one reason to fail. A test that walks six features says only that one of six broke, and breaks six times as often.

- **Arrange through the back door, act through the front.** Create preconditions with an API call, fixture, or seed, then drive the interface only for the journey under test. Clicking through setup multiplies runtime and makes every test fail when an unrelated screen changes.
- **Sign in once.** Establish a session through the API or saved browser state and reuse it. The sign-in form is one test's journey, not every test's preamble.
- **Assert what a user could observe.** Visible text, the URL, a field's value, an item appearing or disappearing. Asserting on internal state or a network call alone is an integration test wearing a browser.
- **Share mechanics, not assertions.** Put selectors and multi-step actions for a screen behind a page object or helper once several tests use them; keep the assertions in the test so it reads as the journey.

**Complete when:** each test covers one journey, sets up through the back door, and asserts only what a user could observe.

## 4. Select elements by what users perceive

Prefer, in order: role and accessible name, label or visible text that is part of the contract, then a dedicated test identifier. Avoid CSS class chains, DOM position, and generated identifiers; they break on changes that break nothing real. Role-based selection also checks something true about the page, and a control that cannot be found by role is often a finding for `accessibility`.

Use a test identifier where the visible text is volatile or translated, and keep those identifiers stable as part of the component's contract.

**Complete when:** no selector depends on CSS class chains, DOM position, or generated identifiers.

## 5. Isolate data and state

Each test creates the data it needs, unique per run, and depends on nothing another test created. Shared seed records make tests order-dependent and turn parallel workers into cross-talk. Clean up, or use a disposable tenant, account, or database per worker.

Pin what differs between a laptop and CI: the build under test, viewport, time zone, locale, and animations (reduced or disabled). Control the clock where a journey depends on time. Replace third-party services you do not own at the boundary where they are called: in the browser for calls the page makes, and with a stub server or the provider's sandbox for calls the backend makes. Keep the application's own backend real, since exercising it is the point.

**Complete when:** each test passes alone, in any order, and beside parallel workers, and the environment differences are pinned.

## 6. Wait for states, never for durations

Wait for a condition the journey depends on: an element visible and enabled, a specific response received, the URL or text changed. Use the runner's retrying assertions with an explicit timeout. A hard-coded pause wastes time on a fast machine and still loses the race on a slow one.

Waiting for the network to go idle is a duration in disguise on pages with polling, streaming, or analytics; wait for the specific thing instead.

**Complete when:** no fixed sleep remains, and each wait names the state it waits for.

## 7. Diagnose flaky tests

A test that fails once and passes on rerun is flaky, not passing. Reproduce it before changing it: run it repeatedly, in isolation and in the full suite, with parallel workers, and under CI-like constraints. Read the trace or recording from a failing run.

Sort the cause into one of four, because each has a different fix:

1. **A race in the test.** It acts before the application is ready. Wait on the right state.
2. **A race in the application.** A real defect a user can also hit, such as a double submit or a stale render. Fix the application with `diagnosing-bugs`; a longer wait hides it.
3. **Shared or leaked state.** Data, session, or storage crossing between tests. Isolate it.
4. **An unstable dependency.** A third-party service, a slow environment, an undersized runner. Stub at the boundary or fix the environment.

Adding a sleep or raising retries is not a fix. Keep retries low, record every pass-on-retry as a flake to triage, and never let a retry turn a real failure green.

Quarantine only when a flaky test blocks others and cannot be fixed now: mark it skipped with a linked issue, an owner, and a date, and keep the list short. Never quarantine a test that is failing consistently; that is a failing test.

**Complete when:** each flaky test has a reproduced cause in one of the four classes and a fix for that cause, or a quarantine with an issue, owner, and date.

## 8. Run it in CI with evidence

Run the suite against a built application in a disposable environment, on every change where runtime allows and at least before release. Keep it fast with parallel workers and sharding before cutting journeys, and run a small smoke subset first when the full suite is slow.

Capture artifacts on failure: trace, screenshot, video where cheap, console and network logs. Upload them from CI even when the job fails, and keep them long enough to triage. A failure without an artifact costs a full reproduction; with one, triage usually takes minutes.

**Complete when:** CI runs the suite against a disposable environment and uploads failure artifacts even when the job fails.

## 9. Prune on evidence

For a suite that hurts, measure before cutting: runtime per test, failure and retry history, and how often a red run found a real defect. Move checks a lower level can hold down to that level, merge tests that walk the same journey, and propose deletions with the numbers attached. Removing a test removes someone's coverage, so get agreement before deleting.

**Complete when:** each proposed move, merge, or deletion carries its numbers, and deletions are agreed.

## Finish

Before calling a new or repaired test stable, run it several times in a row, once in the full suite with parallel workers, and once in CI. One green run proves little.

Report the journeys covered and why they need this level, what was moved to lower levels, the cause found for each flaky test and how it was fixed, anything quarantined with its owner and date, and the suite's runtime and pass history before and after.
