import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir: '.', testMatch: 'biome-upgrade.rpc.spec.ts',
 expect:{timeout:10000}, timeout:60000, workers:1,
 projects:[{name:'chromium',use:devices['Desktop Chrome']}],
 use:{baseURL:'http://127.0.0.1:55190'},
 webServer:[{command:'bun run .context/isolated-example-server.ts',url:'http://127.0.0.1:55193/health',reuseExistingServer:false,timeout:60000,cwd:'..'}],
});
