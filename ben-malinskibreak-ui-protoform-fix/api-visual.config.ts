import { defineConfig } from '@rstest/core';
import { definePlaywrightConfig } from '@rstest/playwright/config';
export default defineConfig({include:['.context/shadcn-api/visual/*.spec.ts'],extends:definePlaywrightConfig({contextOptions:{baseURL:'http://127.0.0.1:55013',locale:'en-US',timezoneId:'UTC',reducedMotion:'no-preference',viewport:{width:1280,height:720}}}),expect:{poll:{timeout:10000}},pool:{maxWorkers:6},testEnvironment:'node',testTimeout:60000});
