import { defineConfig } from '@rstest/core';
import { definePlaywrightConfig } from '@rstest/playwright/config';
import { docsBaseURL, docsContextOptions } from './scripts/e2e-context';

export default defineConfig({
  name: 'chromium',
  include: ['e2e/**/*.spec.ts'],
  exclude: ['e2e/quickjs.spec.ts'],
  extends: definePlaywrightConfig({
    contextOptions: docsContextOptions,
    requestOptions: { baseURL: docsBaseURL },
    trace: 'retain-on-failure',
  }),
  env: { PROTOFORM_SCREENSHOT_PROJECT: 'chromium' },
  expect: { poll: { timeout: 10_000 } },
  pool: { maxWorkers: 4 },
  testEnvironment: 'node',
  testTimeout: 60_000,
});
