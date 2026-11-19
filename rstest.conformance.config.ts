import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

import { happyDom } from './scripts/dom-test-environment';
import { rsdoctorConfig } from './scripts/rsdoctor-config';

const base = defineConfig({
  extends: rsdoctorConfig('conformance'),
  globals: true,
  include: ['conformance/**/*.conformance.test.ts', 'conformance/**/*.conformance.test.tsx'],
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
  setupFiles: ['./rstest.setup.ts'],
  testEnvironment: happyDom,
});

const celEntryPointsTest = 'conformance/cel-entrypoints.conformance.test.tsx';

export default defineConfig({
  projects: [
    { ...base, name: 'conformance', exclude: [celEntryPointsTest] },
    {
      ...base,
      name: 'conformance-dom-interop',
      include: [celEntryPointsTest],
      testEnvironment: 'jsdom',
    },
  ],
});
