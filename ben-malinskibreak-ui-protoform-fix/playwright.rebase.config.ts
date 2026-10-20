import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  testMatch: 'form-resilience.visual.spec.ts',
  outputDir: './results',
  workers: 3,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
  use: { baseURL: 'http://127.0.0.1:55130', locale: 'en-US', timezoneId: 'UTC' },
});
