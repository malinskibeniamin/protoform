import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

import { rsdoctorConfig } from './scripts/rsdoctor-config';

export default defineConfig({
  extends: rsdoctorConfig('browser'),
  browser: {
    browser: 'chromium',
    enabled: true,
    headless: true,
    provider: 'playwright',
  },
  include: ['registry/**/*.browser.test.tsx'],
  plugins: [
    pluginReact({
      reactCompiler: {
        compilationMode: 'infer',
        panicThreshold: 'all_errors',
        target: '19',
      },
    }),
  ],
  setupFiles: ['./rstest.browser.setup.ts'],
});
