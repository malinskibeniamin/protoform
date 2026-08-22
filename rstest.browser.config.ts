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
  plugins: [
    pluginReact({
      reactCompiler: {
        compilationMode: "infer",
        panicThreshold: "all_errors",
        target: "19",
      },
    }),
  ],
  setupFiles: ["./rstest.browser.setup.ts"],
});
