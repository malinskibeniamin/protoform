import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect } from "@rstest/core";

import blumeConfig from "../blume.config";
import doctorConfig from "../doctor.config";
import packageJson from "../package.json" with { type: "json" };
import tsconfig from "../tsconfig.json" with { type: "json" };

const biomeRuleGroups = {
  a11y: "A11y",
  complexity: "Complexity",
  correctness: "Correctness",
  nursery: "Nursery",
  performance: "Performance",
  security: "Security",
  style: "Style",
  suspicious: "Suspicious",
} as const;

type JsonObject = Record<string, unknown>;

function getJsonObject(value: unknown, label: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Expected ${label} to be an object.`);
  }

  return value as JsonObject;
}

function parseJson(value: string, label: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Expected ${label} to contain valid JSON.`, { cause: error });
  }
}

function parseJsonc(value: string, label: string): unknown {
  return parseJson(value.replaceAll(/^\s*\/\/.*$/gmu, ""), label);
}

describe("strict React tooling", () => {
  test("pins the latest analysis toolchain and exposes strict entrypoints", () => {
    expect(packageJson.devDependencies).toMatchObject({
      "@biomejs/biome": "2.5.10",
      "@rsbuild/plugin-react": "2.1.0",
      "react-doctor": "0.9.12",
      "react-scan": "0.5.7",
      ultracite: "7.10.6",
    });
    expect("babel-plugin-react-compiler" in packageJson.devDependencies).toBe(false);
    expect(packageJson.scripts).toMatchObject({
      doctor: expect.stringContaining("react-doctor"),
      "doctor:strict": "bun run doctor",
      "scan:react": expect.stringContaining("react-scan"),
      "typecheck:source": "tsc --noEmit",
      "typecheck:tests": "tsc --project tsconfig.tests.json --noEmit",
    });
  });

  test("explicitly configures every stable and nursery Biome rule", async () => {
    const [biomeConfigSource, biomeSchemaSource] = await Promise.all([
      readFile("biome.jsonc", "utf8"),
      readFile("node_modules/@biomejs/biome/configuration_schema.json", "utf8"),
    ]);
    const biomeConfig = getJsonObject(parseJsonc(biomeConfigSource, "biome.jsonc"), "biome.jsonc");
    const biomeSchema = getJsonObject(parseJson(biomeSchemaSource, "Biome's schema"), "Biome's schema");
    const linter = getJsonObject(biomeConfig["linter"], "biome.jsonc linter");
    const configuredRuleGroups = getJsonObject(linter["rules"], "biome.jsonc linter rules");
    const schemaDefinitions = getJsonObject(biomeSchema["$defs"], "Biome's schema definitions");

    expect(biomeConfig).toMatchObject({ formatter: { enabled: true }, linter: { enabled: true } });
    expect(configuredRuleGroups["preset"]).toBeUndefined();
    expect(configuredRuleGroups["recommended"]).toBeUndefined();

    for (const [configGroupName, schemaGroupName] of Object.entries(biomeRuleGroups)) {
      const configuredRules = getJsonObject(
        configuredRuleGroups[configGroupName],
        `biome.jsonc ${configGroupName} rules`
      );
      const schemaGroup = getJsonObject(schemaDefinitions[schemaGroupName], `Biome's ${schemaGroupName} schema`);
      const schemaProperties = getJsonObject(schemaGroup["properties"], `Biome's ${schemaGroupName} rule properties`);
      const expectedRuleNames = Object.keys(schemaProperties)
        .filter((ruleName) => ruleName !== "preset" && ruleName !== "recommended")
        .toSorted();

      expect(Object.keys(configuredRules).toSorted()).toEqual(expectedRuleNames);
      expect(configuredRules["preset"]).toBeUndefined();
      expect(configuredRules["recommended"]).toBeUndefined();
      for (const [ruleName, ruleConfig] of Object.entries(configuredRules)) {
        const severity =
          typeof ruleConfig === "string"
            ? ruleConfig
            : getJsonObject(ruleConfig, `biome.jsonc ${configGroupName}/${ruleName}`)["level"];
        expect(["error", "off"]).toContain(severity);
      }
    }
  });

  test("explicitly promotes every applicable React Doctor rule and design surface", () => {
    const doctorConfigObject = getJsonObject(doctorConfig, "doctor.config.ts");
    const configuredRules = getJsonObject(doctorConfigObject["rules"], "React Doctor rules");
    const ruleCatalog = parseJson(
      execFileSync(
        process.execPath,
        [resolve("node_modules/react-doctor/bin/react-doctor.js"), "rules", "list", "--json", "--cwd", "."],
        { encoding: "utf8" }
      ),
      "React Doctor's rule catalog"
    );
    if (!Array.isArray(ruleCatalog)) {
      throw new Error("Expected React Doctor's rule catalog to be an array.");
    }
    const availableRuleNames = ruleCatalog.map((rule, index) => {
      const ruleObject = getJsonObject(rule, `React Doctor rule ${index}`);
      if (typeof ruleObject["key"] !== "string") {
        throw new Error(`Expected React Doctor rule ${index} to have a key.`);
      }
      return ruleObject["key"];
    });

    expect(doctorConfigObject["categories"]).toBeUndefined();
    expect(doctorConfigObject["buckets"]).toBeUndefined();
    expect(Object.keys(configuredRules).toSorted()).toEqual(availableRuleNames.toSorted());
    expect(doctorConfig.surfaces).toMatchObject({
      ciFailure: { includeTags: ["design"] },
      cli: { includeTags: ["design"] },
      prComment: { includeTags: ["design"] },
      score: { includeTags: ["design"] },
    });

    const configuredRuleEntries = Object.entries(configuredRules);
    expect(configuredRuleEntries.filter(([, severity]) => severity === "error")).toHaveLength(
      availableRuleNames.length - 1
    );
    expect(configuredRuleEntries.filter(([, severity]) => severity === "off")).toEqual([
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
