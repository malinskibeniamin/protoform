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
  include: ['registry/**/*.browser.test.tsx', 'components/**/*.browser.test.tsx', 'examples/**/*.browser.test.tsx'],
  plugins: [
    pluginReact({
      reactCompiler: {
        compilationMode: 'infer',
        panicThreshold: 'all_errors',
        target: '19',
      },
    }),
  ],
  setupFiles: ['./rstest.setup.ts'],
});
