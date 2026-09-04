import { defineConfig } from "@rslib/core";

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
  source: {
    entry: { index: "./src/index.ts" },
    tsconfigPath: "./tsconfig.build.json",
  },
});
