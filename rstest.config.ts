import { defineConfig } from '@rstest/core';
import { domProjects } from './rstest.dom.config';

export default defineConfig({
  pool: { maxWorkers: 4 },
  projects: ['./rstest.node.config.ts', ...domProjects],
});
