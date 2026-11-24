# Playwright worked example

Concrete forms of the method in [e2e-testing](../SKILL.md). Check the installed Playwright version's documentation before relying on an option; names and defaults change between releases. The project's existing configuration and helpers take precedence.

## Layout

```text
e2e/
  auth.setup.ts        signs in once and saves browser state
  checkout.spec.ts     one journey per test
  pages/CheckoutPage.ts
  fixtures.ts          per-test data and shared helpers
playwright.config.ts
```

## A test

```ts
import { test, expect } from './fixtures';

test('a signed-in customer pays for a cart', async ({ page, cart }) => {
  // `cart` was created through the API by a fixture, unique to this test
  await page.goto(`/checkout/${cart.id}`);

  await page.getByLabel('Card number').fill('4242 4242 4242 4242');
  await page.getByRole('button', { name: 'Pay now' }).click();

  await expect(page.getByRole('heading', { name: 'Payment received' })).toBeVisible();
  await expect(page).toHaveURL(/\/orders\/\w+$/);
});
```

Preconditions come from a fixture, the interface is driven only for the journey, and both assertions are things a user sees.

## Selectors

| Prefer | Example |
| --- | --- |
| Role and accessible name | `page.getByRole('button', { name: 'Pay now' })` |
| Label | `page.getByLabel('Email')` |
| Visible text that is part of the contract | `page.getByText('Payment received')` |
| Test identifier | `page.getByTestId('order-total')` |

Avoid `page.locator('.btn.btn-primary:nth-child(2)')` and XPath tied to structure.

## Waiting

Locators wait for the element to be actionable, and `expect` assertions retry until their timeout. Lean on both.

```ts
// Wait for the specific response the next step depends on
const saved = page.waitForResponse(r => r.url().includes('/api/orders') && r.ok());
await page.getByRole('button', { name: 'Save' }).click();
await saved;

// Wait for a state, with an explicit budget where the default is too short
await expect(page.getByRole('status')).toHaveText('Saved', { timeout: 10_000 });
```

Start the wait before the action that triggers it. Do not use `page.waitForTimeout`, and treat `networkidle` as unreliable on pages that poll or stream.

## Data and sign-in

- A setup project signs in once and writes `storageState`; test projects depend on it and load that state. Use one saved state per role. Saved state files hold session tokens: keep them out of version control.
- Fixtures create per-test records through the API with a unique suffix, and delete them afterwards.
- `page.route` replaces third-party calls the browser makes. Calls the backend makes (payments, email) need a stub server or the provider's sandbox, set in the test environment's configuration. Leave the application's own API real.
- Fix `timezoneId`, `locale`, and `viewport` in the configuration, emulate reduced motion, and use the clock API for time-dependent journeys.

## Configuration points

```ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,          // a stray .only fails the build
  retries: process.env.CI ? 1 : 0,       // a pass on retry is reported as flaky
  reporter: [['html'], ['junit', { outputFile: 'results/e2e.xml' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: { command: 'npm run start:test', url: process.env.BASE_URL ?? 'http://localhost:3000', reuseExistingServer: !process.env.CI },
});
```

## Flake diagnosis

```bash
npx playwright test e2e/checkout.spec.ts --repeat-each=20      # does it fail alone?
npx playwright test --workers=4 --repeat-each=3                # does it fail beside others?
npx playwright show-trace test-results/<run>/trace.zip         # what happened in the failing run
```

The trace shows the DOM, network, and console at each step, which is usually enough to place the failure in one of the four causes. Throttling the processor or network in a local run can reproduce a failure that otherwise appears only in CI.

Quarantine, when justified:

```ts
test.fixme('search returns ranked results', async ({ page }) => {
  // Flaky under parallel workers; tracked in <issue link>, owner <name>, review by <date>
});
```

## CI

- Install browsers with the version pinned by the project's lockfile, and cache them.
- Build the application once and run the suite against that build.
- Split with `--shard=1/4` across jobs when runtime needs it, and merge the reports afterwards.
- Upload the report and `test-results/` with a step that runs even when tests fail.
- Surface flaky results (passed on retry) in the job summary; do not let them pass silently.
