import { defineConfig } from '@rstest/core';
import { definePlaywrightConfig } from '@rstest/playwright/config';

export default defineConfig({
  name: 'quickjs',
  include: ['e2e/quickjs.spec.ts'],
  extends: definePlaywrightConfig({
    contextOptions: { baseURL: 'http://127.0.0.1:55124' },
    trace: 'retain-on-failure',
  }),
  pool: { maxWorkers: 1 },
  testEnvironment: 'node',
});
