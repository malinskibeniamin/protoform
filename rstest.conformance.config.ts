import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

import { rsdoctorConfig } from './scripts/rsdoctor-config';

export default defineConfig({
  extends: rsdoctorConfig('conformance'),
  globals: true,
  include: [
    'conformance/**/*.conformance.test.ts',
    'conformance/**/*.conformance.test.tsx',
    'examples/tanstack/tanstack-form.test.tsx',
    'examples/form-libraries/form-libraries.test.tsx',
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
  setupFiles: ['./rstest.setup.ts'],
  testEnvironment: {
    name: 'happy-dom',
    options: { settings: { disableCSSFileLoading: true, disableIframePageLoading: true } },
  },
});
