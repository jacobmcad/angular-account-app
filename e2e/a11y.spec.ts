import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4600';

const routes = [
  { path: '/', label: 'User Details' },
  { path: '/password/reset', label: 'Reset Password' },
  { path: '/password/questions', label: 'Password Questions' },
  { path: '/password/shared-secret', label: 'Set Shared Secret' },
  { path: '/password/prevent-phone', label: 'Prevent Phone Resets' },
];

for (const { path, label } of routes) {
  test(`${label} page has no axe violations`, async ({ page }) => {
    await page.goto(`${baseUrl}${path}`);

    // Give the page a moment to render the top-level heading before running axe
    await page.getByRole('heading', { level: 1 }).first().waitFor({ state: 'visible' });

    const results = await new AxeBuilder({ page }).analyze();

    if (results.violations.length) {
      console.log(`${label} (${path}) violations`, results.violations);
    }

    expect(results.violations).toEqual([]);
  });
}
