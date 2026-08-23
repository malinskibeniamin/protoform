import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rstest/core";

export default defineConfig({
  exclude: ["registry/**/*.browser.test.tsx"],
  globals: true,
  include: ["components/**/*.test.tsx", "examples/**/*.test.tsx", "registry/**/*.test.tsx"],
  output: {
    // Preserve Zod's detailed validation messages instead of the bundled fallback.
    externals: [/^zod(?:\/|$)/u],
  },
  plugins: [
    pluginReact({
      reactCompiler: {
        compilationMode: "infer",
        panicThreshold: "all_errors",
        target: "19",
      },
    }),
  ],
  pool: {
    maxWorkers: 4,
  },
  setupFiles: ["./rstest.setup.ts"],
  testEnvironment: "happy-dom",
  testTimeout: 15_000,
});
