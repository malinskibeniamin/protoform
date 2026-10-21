import { defineConfig } from '@rstest/core';

export default defineConfig({
  pool: { maxWorkers: 4 },
  projects: ['./rstest.node.config.ts', './rstest.dom.config.ts'],
});
