import { defineConfig } from "tsdown";

const autoFormBridge = `${import.meta.dirname}/src/auto-form-bridge.ts`;

export default defineConfig({
  alias: {
    "../engine": autoFormBridge,
    "../field-utils": autoFormBridge,
    "../helpers": autoFormBridge,
    "../proto": autoFormBridge,
  },
  clean: true,
  deps: { neverBundle: true },
  dts: { resolver: "tsc", sourcemap: false },
  entry: ["src/index.tsx"],
  exports: false,
  failOnWarn: true,
  format: "esm",
  outDir: "dist",
  platform: "neutral",
  sourcemap: false,
  target: "es2022",
  tsconfig: "../../tsconfig.json",
});
