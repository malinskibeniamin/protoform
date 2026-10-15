import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

import { rsdoctorConfig } from './scripts/rsdoctor-config';

export default defineConfig({
  extends: rsdoctorConfig('default'),
  globals: true,
  include: ['registry/**/*.test.{ts,tsx}'],
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
  testEnvironment: 'happy-dom',
});
