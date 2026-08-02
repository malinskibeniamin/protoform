import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const external = [
  "@bufbuild/*",
  "@connectrpc/*",
  "@hookform/*",
  "@standard-schema/*",
  "@tanstack/*",
  "@/registry/*",
  "lucide-react",
  "react",
  "react-dom",
  "react-hook-form",
];

const entries = [
  {
    budget: 2500,
    entry: "registry/base-nova/protoform/lib/core/index.ts",
    name: "core",
  },
  {
    budget: 125_000,
    entry: "registry/base-nova/protoform/lib/protobuf-provider/index.ts",
    name: "protobuf",
  },
  {
    budget: 30_000,
    entry: "registry/base-nova/protoform/hooks/use-proto-form/index.ts",
    name: "react",
  },
  {
    budget: 130_000,
    entry: "islands/ServerErrorFormExample.tsx",
    name: "server-error example",
  },
] as const;

describe("bundle budgets", () => {
  it("enforces registry runtime and example budgets", () => {
    const outputDirectory = ".tmp/bundle-budget";
    rmSync(outputDirectory, { force: true, recursive: true });
    mkdirSync(outputDirectory, { recursive: true });
    const bundles = entries.map(({ entry, ...definition }) => {
      const output = `${outputDirectory}/${definition.name.replaceAll(" ", "-")}.js`;
      execFileSync("bun", [
        "build",
        entry,
        "--target=browser",
        "--format=esm",
        "--minify",
        `--outfile=${output}`,
        ...external.map((dependency) => `--external=${dependency}`),
      ]);
      return {
        ...definition,
        size: statSync(output).size,
        text: readFileSync(output, "utf8"),
      };
    });

    for (const bundle of bundles) {
      expect(
        bundle.size,
        `${bundle.name} exceeded ${bundle.budget} bytes`
      ).toBeLessThanOrEqual(bundle.budget);
    }
    for (const name of ["core", "protobuf"]) {
      const text = bundles.find((bundle) => bundle.name === name)?.text ?? "";
      expect(text).not.toContain("react-hook-form");
      expect(text).not.toContain("@tanstack/react-form");
    }
    expect(
      bundles.find((bundle) => bundle.name === "react")?.text
    ).not.toContain("@tanstack/react-form");
  });
});
