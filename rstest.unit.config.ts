import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rstest/core";

export default defineConfig({
  exclude: [
    "registry/base-nova/protoform/hooks/use-proto-form/proto-paths.test.ts",
    "registry/base-nova/protoform/hooks/use-proto-form/use-proto-form.test.ts",
    "registry/base-nova/protoform/lib/protobuf-v1-bridge/**",
  ],
  globals: true,
  include: ["registry/**/*.test.ts", "examples/**/*.test.ts", "scripts/**/*.test.ts"],
  plugins: [
    pluginReact({
      reactCompiler: {
        compilationMode: "infer",
        panicThreshold: "all_errors",
        target: "19",
      },
    }),
  ],
  testEnvironment: "node",
});
