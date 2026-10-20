import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';
import { rsdoctorConfig } from './scripts/rsdoctor-config';

export default defineConfig({
  name: 'node',
  extends: rsdoctorConfig('node'),
  globals: true,
  include: [
    'registry/**/*.integration.test.ts',
    'examples/**/*.integration.test.ts',
    'scripts/**/*.integration.test.ts',
  ],
  plugins: [pluginReact({ reactCompiler: { compilationMode: 'infer', panicThreshold: 'all_errors', target: '19' } })],
  testEnvironment: 'node',
});
