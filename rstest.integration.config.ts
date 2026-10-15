import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

import { rsdoctorConfig } from './scripts/rsdoctor-config';

export default defineConfig({
  extends: rsdoctorConfig('integration'),
  exclude: ['registry/**/*.browser.test.tsx'],
  globals: true,
  include: ['components/**/*.test.tsx', 'examples/**/*.test.tsx', 'registry/**/*.test.tsx'],
  output: {
    externals: [/^zod(?:\/|$)/u],
  },
  plugins: [
    pluginReact({
      reactCompiler: {
        compilationMode: 'infer',
        panicThreshold: 'all_errors',
        target: '19',
      },
    }),
  ],
  pool: {
    maxWorkers: 4,
    type: 'vmThreads',
  },
  setupFiles: ['./rstest.setup.ts'],
  testEnvironment: 'happy-dom',
  testTimeout: 15_000,
});
