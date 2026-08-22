import { readFile } from "node:fs/promises";
import { describe, expect } from "@rstest/core";

import blumeConfig from "../blume.config";
import doctorConfig from "../doctor.config";
import packageJson from "../package.json" with { type: "json" };
import tsconfig from "../tsconfig.json" with { type: "json" };

describe("strict React tooling", () => {
  test("pins the latest analysis toolchain and exposes strict entrypoints", () => {
    expect(packageJson.devDependencies).toMatchObject({
      "@biomejs/biome": "2.5.10",
      "@rsbuild/plugin-react": "2.1.0",
      "babel-plugin-react-compiler": "1.0.0",
      "react-doctor": "0.9.12",
      "react-scan": "0.5.7",
      ultracite: "7.10.6",
    });
    expect(packageJson.scripts).toMatchObject({
      doctor: expect.stringContaining("react-doctor"),
      "doctor:strict": "bun run doctor",
      "scan:react": expect.stringContaining("react-scan"),
      "typecheck:source": "tsc --noEmit",
      "typecheck:tests": "tsc --project tsconfig.tests.json --noEmit",
    });
  });

  test("enables every stable and nursery Biome rule with formatting", async () => {
    const biomeConfig: unknown = JSON.parse((await readFile("biome.jsonc", "utf8")).replaceAll(/^\s*\/\/.*$/gmu, ""));

    expect(biomeConfig).toMatchObject({
      formatter: { enabled: true },
      linter: {
        enabled: true,
        rules: {
          nursery: "error",
          preset: "all",
        },
      },
    });
  });

  test("promotes every applicable React Doctor rule and design surface", () => {
    expect(doctorConfig.categories).toEqual({
      Accessibility: "error",
      Bugs: "error",
      Maintainability: "error",
      Performance: "error",
      Security: "error",
    });
    expect(doctorConfig.surfaces).toMatchObject({
      ciFailure: { includeTags: ["design"] },
      cli: { includeTags: ["design"] },
      prComment: { includeTags: ["design"] },
      score: { includeTags: ["design"] },
    });

    const configuredRules = Object.entries(doctorConfig.rules ?? {});
    expect(configuredRules.filter(([, severity]) => severity === "error")).toHaveLength(164);
    expect(configuredRules.filter(([, severity]) => severity === "off")).toEqual([
      ["react-doctor/react-in-jsx-scope", "off"],
    ]);
  });

  test("enables fail-fast React Compiler coverage for docs and every React test suite", async () => {
    expect(blumeConfig).toMatchObject({ react: { compiler: true } });

    const configPaths = [
      "rstest.browser.config.ts",
      "rstest.conformance.config.ts",
      "rstest.config.ts",
      "rstest.integration.config.ts",
      "rstest.unit.config.ts",
    ];
    const configSources = await Promise.all(configPaths.map((configPath) => readFile(configPath, "utf8")));
    for (const source of configSources) {
      expect(source).toContain("reactCompiler:");
      expect(source).toContain('panicThreshold: "all_errors"');
    }
  });

  test("keeps TypeScript stricter than the requested baseline", () => {
    expect(tsconfig.compilerOptions).toMatchObject({
      allowUnreachableCode: false,
      allowUnusedLabels: false,
      exactOptionalPropertyTypes: true,
      forceConsistentCasingInFileNames: true,
      isolatedModules: true,
      noFallthroughCasesInSwitch: true,
      noImplicitAny: true,
      noImplicitOverride: true,
      noImplicitReturns: true,
      noPropertyAccessFromIndexSignature: true,
      noUncheckedIndexedAccess: true,
      noUncheckedSideEffectImports: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      strict: true,
      strictNullChecks: true,
      useDefineForClassFields: true,
      verbatimModuleSyntax: true,
    });
  });
});
