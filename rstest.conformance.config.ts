import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rstest/core";

export default defineConfig({
  globals: true,
  include: [
    "conformance/**/*.conformance.test.ts",
    "conformance/**/*.conformance.test.tsx",
    "examples/tanstack/tanstack-form.test.tsx",
    "examples/form-libraries/form-libraries.test.tsx",
  ],
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
  setupFiles: ["./rstest.setup.ts"],
  testEnvironment: "happy-dom",
});
