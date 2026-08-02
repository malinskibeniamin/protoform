import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: [
      "conformance/**/*.conformance.test.ts",
      "conformance/**/*.conformance.test.tsx",
      "examples/tanstack/tanstack-form.test.tsx",
      "examples/form-libraries/form-libraries.test.tsx",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
