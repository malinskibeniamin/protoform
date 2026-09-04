import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

const coreBridge = `${import.meta.dirname}/src/core-bridge.ts`;

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
      "../../../lib/core": coreBridge,
      "../../../lib/core/messages": coreBridge,
      "../../../lib/protobuf-provider": coreBridge,
      "../../lib/core": coreBridge,
      "../../lib/core/messages": coreBridge,
      "../../lib/protobuf-provider": coreBridge,
      "../core": coreBridge,
    },
  },
  source: {
    entry: { index: "./src/index.ts" },
    tsconfigPath: "./tsconfig.build.json",
  },
});
