import { defineConfig } from "@playwright/test";

export default defineConfig({
  outputDir: "test-results/host-registry",
  projects: [
    { name: "desktop", use: { viewport: { height: 800, width: 1100 } } },
    { name: "mobile", use: { viewport: { height: 844, width: 390 } } },
  ],
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}",
  testDir: "./scripts",
  testMatch: "host-consumer.browser.spec.ts",
  use: { baseURL: "http://127.0.0.1:55117", browserName: "chromium" },
  webServer: {
    command: "bunx --no-install vite --host 127.0.0.1 --port 55117",
    cwd: ".tmp/host-consumer-fixture",
    reuseExistingServer: false,
    url: "http://127.0.0.1:55117",
  },
});
