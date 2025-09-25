import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',   // 👈 Only run tests inside the e2e folder
  timeout: 30 * 1000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    ignoreHTTPSErrors: true,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
