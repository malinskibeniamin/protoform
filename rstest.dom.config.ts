import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig, defineInlineProject } from '@rstest/core';

import { happyDom, jsdomIntegrationTests } from './scripts/dom-test-environment';
import { rsdoctorConfig } from './scripts/rsdoctor-config';

const domConfig = defineConfig({
  extends: rsdoctorConfig('dom'),
  exclude: [
    'registry/**/*.browser.test.tsx',
    'components/**/*.browser.test.tsx',
    'examples/**/*.browser.test.tsx',
    ...jsdomIntegrationTests,
  ],
  globals: true,
  include: [
    'registry/base-nova/protoform/hooks/use-proto-form/use-proto-form.test.ts',
    'components/**/*.test.tsx',
    'examples/**/*.test.tsx',
    'islands/**/*.dom.test.ts',
    'registry/**/*.test.tsx',
    'scripts/**/*.test.tsx',
  ],
  output: {
    externals: [/^(?:msw|zod)(?:\/|$)/u],
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
  testEnvironment: happyDom,
  testTimeout: 15_000,
});

export const domProjects = [
  defineInlineProject({ ...domConfig, name: 'dom' }),
  defineInlineProject({
    ...domConfig,
    name: 'dom-interop',
    include: jsdomIntegrationTests,
    exclude: [],
    testEnvironment: 'jsdom',
  }),
];

export default defineConfig({ projects: domProjects });
