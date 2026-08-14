import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as { scripts: Record<string, string> };
const runner = readFileSync(
  new URL("./check-api-linter.ts", import.meta.url),
  "utf8"
);
const ciWorkflow = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8"
);

describe("Google API Linter gate", () => {
  it("pins the linter and verifies the AIP service contract in CI and release gates", () => {
    expect(manifest.scripts["aip:lint"]).toBe(
      "bun run scripts/check-api-linter.ts"
    );
    expect(manifest.scripts["ci:gate"]).toContain("bun run aip:lint");
    expect(manifest.scripts["quality:gate"]).toContain("bun run aip:lint");
    expect(runner).toContain(
      "github.com/googleapis/api-linter/v2/cmd/api-linter@v2.3.1"
    );
    expect(runner).toContain('const GO_TOOLCHAIN = "go1.26.6"');
    expect(runner).toContain("`GOTOOLCHAIN=");
    for (const aip of [127, 131, 132, 133, 134, 135, 164, 203]) {
      expect(runner).toContain(`core::0${aip}`);
    }
    expect(ciWorkflow).toContain(
      "actions/setup-go@924ae3a1cded613372ab5595356fb5720e22ba16"
    );
    expect(ciWorkflow).toContain("go-version: 1.26.6");
  });
});
