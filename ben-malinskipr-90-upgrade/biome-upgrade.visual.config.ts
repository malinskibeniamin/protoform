import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: '.',
 testMatch: 'biome-upgrade.visual.spec.ts',
 snapshotPathTemplate: '{testDir}/{arg}{ext}',
 workers: 1,
 use: { viewport: {width:720,height:500}, baseURL: 'http://127.0.0.1:55190' },
});
