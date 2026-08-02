import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: { timeout: 10_000 },
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:55013",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "bun run docs:blume:e2e",
      reuseExistingServer: false,
      timeout: 120_000,
      url: "http://127.0.0.1:55013/docs",
    },
    {
      command: "bun run examples:server",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://127.0.0.1:55012/health",
    },
  ],
});
