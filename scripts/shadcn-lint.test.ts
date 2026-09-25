import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { expect, test } from "@rstest/core";
import { z } from "zod";

const lintReport = z.object({
  diagnostics: z.array(z.object({ code: z.string(), severity: z.literal("error") })),
});

const cases = [
  {
    name: "does not broaden the SVG property-list allowance to arbitrary transitions",
    prefix: ".tmp/shadcn-lint-",
    rules: ["no-arbitrary-values"],
    source: `export function InvalidMotion() { return <div className="transition-[all]" />; }`,
  },
  {
    name: "rejects all six design-system violations at usage sites",
    prefix: ".tmp/shadcn-lint-",
    rules: [
      "no-restyle",
      "no-raw-colors",
      "no-arbitrary-values",
      "no-inline-styles",
      "no-unknown-classes",
      "require-static-classes",
    ],
    source: `import { Button } from "@/components/ui/button";
export function Violations({ classes }: { classes: string }) {
  return <><Button className="p-4">Restyle</Button>
    <div className="bg-red-500 p-[13px] rounded-huge" style={{ padding: 16 }} />
    <Button className={classes}>Dynamic</Button></>;
}`,
  },
  {
    name: "accepts semantic tokens, static layout, and dynamic CSS variables",
    prefix: ".tmp/shadcn-lint-",
    rules: [],
    source: `import { Button } from "@/components/ui/button";
export function Valid({ width }: { width: number }) {
  return <div className="bg-background text-foreground w-(--panel-width)" style={{ "--panel-width": width }}>
    <Button className="w-full mt-4" type="button">Save</Button>
    <svg><path className="stroke-none fill-mode-forwards transition-[stroke-dashoffset,opacity]" /></svg>
  </div>;
}`,
  },
  {
    name: "rejects all six violations in authored component definitions",
    prefix: "registry/base-nova/protoform/components/shadcn-lint-test-",
    rules: [
      "no-restyle",
      "no-raw-colors",
      "no-arbitrary-values",
      "no-inline-styles",
      "no-unknown-classes",
      "require-static-classes",
    ],
    source: `import { Button } from "@/components/ui/button";
export function Definition({ classes }: { classes: string }) {
  return <><Button className="p-[13px]">Owned styling</Button>
    <Button className={classes}>Forwarded classes</Button>
    <div className="bg-red-500 rounded-huge" style={{ padding: 16 }} /></>;
}`,
  },
];

test.each(cases)("shadcn lint $name", ({ prefix, rules, source }) => {
  mkdirSync(".tmp", { recursive: true });
  const directory = mkdtempSync(resolve(prefix));
  try {
    const fixture = join(directory, "index.tsx");
    writeFileSync(fixture, source);
    const result = spawnSync(
      resolve("node_modules/.bin/oxlint"),
      ["--no-ignore", "--config", resolve("shadcn-lint.jsonc"), "--format", "json", fixture],
      { encoding: "utf8" }
    );
    expect(result.error).toBeUndefined();
    expect(result.stderr).toBe("");
    expect(result.status).toBe(rules.length > 0 ? 1 : 0);
    const report = lintReport.parse(JSON.parse(result.stdout));
    expect([...new Set(report.diagnostics.map((diagnostic) => diagnostic.code))].toSorted()).toEqual(
      rules.map((rule) => `shadcn(${rule})`).toSorted()
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
