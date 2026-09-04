import { defineConfig } from "tsdown";

const coreBridge = `${import.meta.dirname}/src/core-bridge.ts`;

export default defineConfig({
  alias: {
    "../../../lib/core": coreBridge,
    "../../../lib/core/messages": coreBridge,
    "../../../lib/protobuf-provider": coreBridge,
    "../../lib/core": coreBridge,
    "../../lib/core/messages": coreBridge,
    "../../lib/protobuf-provider": coreBridge,
    "../core": coreBridge,
  },
  clean: true,
  deps: { neverBundle: true },
  dts: { resolver: "tsc", sourcemap: false },
  entry: ["src/index.ts"],
  exports: false,
  failOnWarn: true,
  format: "esm",
  outDir: "dist",
  platform: "neutral",
  sourcemap: false,
  target: "es2022",
  tsconfig: "../../tsconfig.json",
});
