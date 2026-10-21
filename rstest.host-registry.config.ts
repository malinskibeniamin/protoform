import { defineConfig } from '@rstest/core';
import { definePlaywrightConfig } from '@rstest/playwright/config';
import { hostBaseURL } from './scripts/e2e-context';

export default defineConfig({
  expect: { poll: { timeout: 5000 } },
  projects: [
    { name: 'desktop', viewport: { height: 800, width: 1100 } },
    { name: 'mobile', viewport: { height: 844, width: 390 } },
  ].map(({ name, viewport }) => ({
    name,
    env: { PROTOFORM_SCREENSHOT_PROJECT: name, PROTOFORM_SCREENSHOT_STYLE: 'consumer' },
    include: ['scripts/host-consumer.browser.spec.ts', 'scripts/reliability-consumer.browser.spec.ts'],
    extends: definePlaywrightConfig({
      contextOptions: { baseURL: hostBaseURL, viewport, locale: 'en-US', timezoneId: 'UTC' },
    }),
    testEnvironment: 'node',
    testTimeout: 30_000,
  })),
});
