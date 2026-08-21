import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const repositoryDirectory = new URL("../", import.meta.url);
const domConfigs = ["vitest.config.ts", "vitest.conformance.config.ts", "vitest.integration.config.ts"] as const;

describe("simulated DOM test environment", () => {
  it("uses happy-dom without retaining jsdom", () => {
    for (const config of domConfigs) {
      expect(readFileSync(new URL(config, repositoryDirectory), "utf8")).toContain('environment: "happy-dom"');
    }

    const manifest = JSON.parse(readFileSync(new URL("package.json", repositoryDirectory), "utf8")) as {
      devDependencies?: Record<string, string>;
    };

    expect(manifest.devDependencies?.["happy-dom"]).toBeDefined();
    expect(manifest.devDependencies?.["jsdom"]).toBeUndefined();

    const lockfile = readFileSync(new URL("bun.lock", repositoryDirectory), "utf8");
    expect(lockfile).not.toContain('\n    "jsdom": [');
  });
});
