import { defineConfig } from "tsdown";

export default defineConfig({
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
