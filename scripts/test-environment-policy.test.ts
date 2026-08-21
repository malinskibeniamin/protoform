import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "@rstest/core";

const repositoryDirectory = new URL("../", import.meta.url);
const domConfigs = ["rstest.config.ts", "rstest.conformance.config.ts", "rstest.integration.config.ts"] as const;
const rstestScripts = [
  "test:browser",
  "test:browser:update",
  "test:browser:watch",
  "test:conformance",
  "test:integration",
  "test:integration:smoke",
  "test:integration:watch",
  "test:unit",
  "test:unit:ci",
  "test:unit:watch",
] as const;

describe("simulated DOM test environment", () => {
  it("uses Rstest 0.11.9 with happy-dom and no Vitest wiring", () => {
    for (const config of domConfigs) {
      expect(readFileSync(new URL(config, repositoryDirectory), "utf8")).toContain('testEnvironment: "happy-dom"');
    }

    const manifest = JSON.parse(readFileSync(new URL("package.json", repositoryDirectory), "utf8")) as {
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };

    expect(manifest.devDependencies?.["@rstest/browser"]).toBe("0.11.9");
    expect(manifest.devDependencies?.["@rstest/browser-react"]).toBe("0.11.9");
    expect(manifest.devDependencies?.["@rstest/core"]).toBe("0.11.9");
    expect(manifest.devDependencies?.["happy-dom"]).toBeDefined();
    expect(manifest.devDependencies?.["undici"]).toBe("8.9.0");
    expect(manifest.devDependencies?.["jsdom"]).toBeUndefined();
    expect(manifest.devDependencies?.["vitest"]).toBeUndefined();
    expect(Object.values(manifest.scripts ?? {}).join("\n")).not.toContain("vitest");
    for (const script of rstestScripts) {
      expect(manifest.scripts?.[script]).toMatch(/^node scripts\/run-tests\.mjs /);
      expect(manifest.scripts?.[script]).not.toContain("rstest");
    }
    expect(existsSync(new URL("scripts/run-tests.mjs", repositoryDirectory))).toBe(true);
    expect(existsSync(new URL("vitest.unit.config.ts", repositoryDirectory))).toBe(false);
    expect(existsSync(new URL("vitest.integration.config.ts", repositoryDirectory))).toBe(false);
    expect(existsSync(new URL("vitest.conformance.config.ts", repositoryDirectory))).toBe(false);
    expect(existsSync(new URL("vitest.browser.config.ts", repositoryDirectory))).toBe(false);

    const lockfile = readFileSync(new URL("bun.lock", repositoryDirectory), "utf8");
    expect(lockfile).not.toContain('\n    "jsdom": [');
  });
});
