import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rstest/core";

export default defineConfig({
  browser: {
    browser: "chromium",
    enabled: true,
    headless: true,
    provider: "playwright",
  },
  include: ["registry/**/*.browser.test.tsx"],
  plugins: [pluginReact()],
  setupFiles: ["./rstest.browser.setup.ts"],
});
