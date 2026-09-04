import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

const autoFormBridge = `${import.meta.dirname}/src/auto-form-bridge.ts`;

export default defineConfig({
  lib: [
    {
      bundle: true,
      dts: { bundle: true },
      format: "esm",
      syntax: "es2022",
    },
  ],
  output: {
    cleanDistPath: true,
    sourceMap: false,
    target: "web",
  },
  plugins: [pluginReact()],
  resolve: {
    alias: {
      "../engine": autoFormBridge,
      "../field-utils": autoFormBridge,
      "../helpers": autoFormBridge,
      "../proto": autoFormBridge,
    },
  },
  source: {
    entry: { index: "./src/index.tsx" },
    tsconfigPath: "./tsconfig.build.json",
  },
});
