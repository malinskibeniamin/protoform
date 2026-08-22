import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect } from "@rstest/core";

const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
};
const tsconfig = JSON.parse(readFileSync("tsconfig.json", "utf8")) as {
  compilerOptions: Record<string, unknown>;
  exclude?: string[];
};
const testTsconfig = JSON.parse(readFileSync("tsconfig.tests.json", "utf8")) as {
  exclude?: string[];
  include?: string[];
};
const biomeConfig = readFileSync("biome.jsonc", "utf8");

describe("frontend quality policy", () => {
  test("uses the native compiler with every practical strictness flag", () => {
    expect(manifest.devDependencies["@typescript/native"]).toBeDefined();
    expect(manifest.scripts["typecheck:source"]).toBe("tsc --noEmit");
    expect(tsconfig.compilerOptions).toMatchObject({
      allowUnreachableCode: false,
      allowUnusedLabels: false,
      exactOptionalPropertyTypes: true,
      noPropertyAccessFromIndexSignature: true,
      noUncheckedIndexedAccess: true,
      noUncheckedSideEffectImports: true,
      skipLibCheck: true,
      strict: true,
    });
  });

  test("typechecks every authored test with the strict project settings", () => {
    expect(manifest.scripts["typecheck:tests"]).toBe("tsc --project tsconfig.tests.json --noEmit");
    expect(manifest.scripts["typecheck"]).toContain("bun run typecheck:tests");
    expect(existsSync("tsconfig.tests.json")).toBe(true);
    expect(testTsconfig.include).toEqual(
      expect.arrayContaining(["conformance/**/*.ts", "e2e/**/*.ts", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"])
    );
    expect(testTsconfig.exclude ?? []).not.toEqual(
      expect.arrayContaining(["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"])
    );
  });

  test("typechecks every tracked authored TypeScript file", () => {
    expect(manifest.scripts["typecheck:coverage"]).toBe("bun run scripts/check-typescript-coverage.ts");
    expect(manifest.scripts["typecheck"]).toContain("bun run typecheck:coverage");

    const result = spawnSync("bun", ["run", "typecheck:coverage"], { encoding: "utf8" });
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
  });

  test("fails documentation typechecks on every diagnostic severity", () => {
    expect(manifest.scripts["docs:blume:check"]).toBe("bun run scripts/check-docs-types.ts");
    expect(manifest.scripts["typecheck"]).toContain("bun run docs:blume:check");
    expect(existsSync("scripts/check-docs-types.ts")).toBe(true);
  });

  test("checks authored installable registry source", () => {
    expect(tsconfig.exclude ?? []).not.toContain("registry/base-nova");
    expect(biomeConfig).not.toContain('"!registry"');
    expect(biomeConfig).not.toMatch(/"includes": \["registry\/\*\*"\][\s\S]*?"enabled": false/u);
    expect(biomeConfig).toContain('"ultracite/biome/type-aware"');
    expect(biomeConfig).toContain('"ultracite/biome/jest"');
  });

  test("fails on warnings, formatting drift, and inline suppressions", () => {
    expect(manifest.scripts["lint"]).toContain("--error-on-warnings");
    expect(manifest.scripts["format:check"]).toBe("biome format .");
    expect(manifest.scripts["lint:no-suppressions"]).toBe("bun run scripts/check-no-suppressions.ts");
    expect(existsSync("scripts/check-no-suppressions.ts")).toBe(true);
    expect(manifest.scripts["ci:gate"]).toContain("bun run lint:no-suppressions");
    expect(manifest.scripts["quality:gate"]).toContain("bun run lint:no-suppressions");
  });

  test("runs a full warning-blocking React Doctor gate", () => {
    expect(manifest.devDependencies["react-doctor"]).toBeDefined();
    expect(manifest.scripts["doctor"]).toContain("--scope full");
    expect(manifest.scripts["doctor"]).toContain("--blocking warning");
    expect(manifest.scripts["doctor:strict"]).toBe("bun run doctor");
    expect(manifest.scripts["ci:gate"]).toContain("bun run doctor:strict");
    expect(manifest.scripts["quality:gate"]).toContain("bun run doctor:strict");
    expect(existsSync("doctor.config.ts")).toBe(true);
  });
});
