import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    exclude: [
      "registry/base-nova/protoform/hooks/use-proto-form/proto-paths.test.ts",
      "registry/base-nova/protoform/hooks/use-proto-form/use-proto-form.test.ts",
      "registry/base-nova/protoform/lib/protobuf-v1-bridge/**",
    ],
    globals: true,
    include: ["registry/**/*.test.ts", "examples/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
