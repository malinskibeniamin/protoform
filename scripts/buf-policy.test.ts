import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect } from "@rstest/core";

function runBufLint(input = ".") {
  return spawnSync("bunx", ["buf", "lint", input, "--error-format=json"], {
    encoding: "utf8",
  });
}

function runBufBreaking(input: string, against: string) {
  return spawnSync("bunx", ["buf", "breaking", input, "--against", against, "--error-format=json"], {
    encoding: "utf8",
  });
}

describe("Buf policy", () => {
  test("passes Buf STANDARD including the complete Protovalidate lint rule", () => {
    const result = runBufLint();

    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
    expect(`${result.stdout}${result.stderr}`).toBe("");
  });

  test("keeps intentional Protovalidate lint failures in an isolated module", () => {
    const result = runBufLint("conformance/expected-failures");
    const output = `${result.stdout}${result.stderr}`;
    const violations = output
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as { type: string });

    expect(result.status).not.toBe(0);
    expect(violations.length).toBeGreaterThan(0);
    expect(new Set(violations.map((violation) => violation.type))).toEqual(new Set(["PROTOVALIDATE"]));
  });

  test("runs the complete lint policy in CI", () => {
    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

    expect(workflow).toContain("bunx buf lint");
  });

  test("enforces target-branch compatibility and rejects an isolated fixture", () => {
    const result = runBufBreaking(
      "conformance/expected-failures/breaking/candidate",
      "conformance/expected-failures/breaking/baseline"
    );
    const output = `${result.stdout}${result.stderr}`;
    const violations = output
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as { type: string });

    expect(result.status).not.toBe(0);
    expect(violations.map((violation) => violation.type)).toContain("FIELD_SAME_TYPE");

    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
    const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(manifest.scripts?.["proto:breaking"]).toBe("bun run scripts/check-proto-breaking.ts");
    expect(workflow).toContain("fetch-depth: 0");
    expect(workflow).toContain("bun run proto:breaking");
    expect(workflow).toContain("github.event.pull_request.base.sha");
    expect(workflow).toContain("github.event.before");
  });
});
