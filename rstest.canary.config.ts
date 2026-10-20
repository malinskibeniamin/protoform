import { defineConfig } from '@rstest/core';
import { definePlaywrightConfig } from '@rstest/playwright/config';

export default defineConfig({
  name: 'runner-compatibility',
  include: ['scripts/e2e-compatibility.spec.ts'],
  extends: definePlaywrightConfig({}),
  testEnvironment: 'node',
});
