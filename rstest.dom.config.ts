import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

import { rsdoctorConfig } from './scripts/rsdoctor-config';

export default defineConfig({
  name: 'dom',
  extends: rsdoctorConfig('dom'),
  exclude: ['registry/**/*.browser.test.tsx'],
  globals: true,
  include: [
    'registry/base-nova/protoform/hooks/use-proto-form/use-proto-form.test.ts',
    'components/**/*.test.tsx',
    'examples/**/*.test.tsx',
    'registry/**/*.test.tsx',
    'scripts/**/*.test.tsx',
  ],
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
  testEnvironment: {
    name: 'happy-dom',
    options: { settings: { disableCSSFileLoading: true, disableIframePageLoading: true } },
  },
  testTimeout: 15_000,
});
