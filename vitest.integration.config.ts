import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
    },
  },
  test: {
    environment: "happy-dom",
    exclude: ["registry/**/*.browser.test.tsx"],
    globals: true,
    include: ["components/**/*.test.tsx", "examples/**/*.test.tsx", "registry/**/*.test.tsx"],
    maxWorkers: 4,
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 15_000,
  },
});
