import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rstest/core";

export default defineConfig({
  globals: true,
  include: ["registry/**/*.test.{ts,tsx}"],
  output: {
    // Preserve Zod's detailed validation messages instead of the bundled fallback.
    externals: [/^zod(?:\/|$)/],
  },
  plugins: [pluginReact()],
  setupFiles: ["./rstest.setup.ts"],
  testEnvironment: "happy-dom",
});
