import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { shouldRunVisualRegression } from "./scripts/visual-regression-policy";

export default defineConfig({
  define: {
    // The checked-in reference is Darwin-specific. Linux CI still runs every
    // structural assertion; the macOS lane owns the pixel comparison.
    "import.meta.env.VISUAL_REGRESSION": JSON.stringify(
      shouldRunVisualRegression(process.platform)
    ),
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
    },
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium" }],
      provider: playwright(),
    },
    include: ["registry/**/*.browser.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
