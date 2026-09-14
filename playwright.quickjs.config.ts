import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  testDir: "./e2e",
  testMatch: "quickjs.spec.ts",
  use: { baseURL: "http://127.0.0.1:55124" },
  webServer: {
    command: "bun run quickjs:dev",
    reuseExistingServer: false,
    url: "http://127.0.0.1:55124/e2e/fixtures/quickjs.html",
  },
});
