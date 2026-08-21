import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("Protoform registry style", () => {
  it("targets the Base UI Nova style", () => {
    const config = JSON.parse(readFileSync("components.json", "utf8")) as {
      style?: string;
    };

    expect(config.style).toBe("base-nova");
  });

  it("publishes runtime source and the documented proto contract", () => {
    const registry = JSON.parse(readFileSync("registry.json", "utf8")) as {
      items: Array<{
        files?: Array<{ path: string; target?: string; type: string }>;
      }>;
    };
    const files = registry.items.flatMap((item) => item.files ?? []);
    const externalFiles = files.filter((file) => !file.path.startsWith("registry/base-nova/protoform/"));

    expect(files.length).toBeGreaterThan(0);
    expect(externalFiles).toEqual([
      {
        path: "LICENSE",
        target: "~/LICENSES/protoform-MIT.txt",
        type: "registry:file",
      },
      {
        path: "LICENSES/Apache-2.0.txt",
        target: "~/LICENSES/Apache-2.0.txt",
        type: "registry:file",
      },
      {
        path: "LICENSES/shadcn-MIT.txt",
        target: "~/LICENSES/shadcn-MIT.txt",
        type: "registry:file",
      },
      {
        path: "THIRD_PARTY_NOTICES.md",
        target: "~/THIRD_PARTY_NOTICES.md",
        type: "registry:file",
      },
      {
        path: "conformance/proto/protoform/conformance/v1/aip.proto",
        target: "~/proto/protoform/conformance/v1/aip.proto",
        type: "registry:file",
      },
    ]);
  });

  it("points shadcn at the actual non-RSC stylesheet", () => {
    const config = JSON.parse(readFileSync("components.json", "utf8")) as {
      rsc?: boolean;
      tailwind?: { css?: string };
    };

    expect(config.rsc).toBe(false);
    expect(config.tailwind?.css).toBe("theme.css");
  });

  it("creates smoke-test consumers with the same Base Nova style", () => {
    const fixtureScript = readFileSync("scripts/consumer-fixture-smoke.ts", "utf8");

    expect(fixtureScript).toContain('style: "base-nova"');
    expect(fixtureScript).not.toContain('style: "new-york"');
  });

  it("never publishes the internal unset sentinel", () => {
    const autoFormCore = readFileSync("public/r/auto-form-core.json", "utf8");

    expect(autoFormCore).not.toContain("__autoform_unset__");
  });

  it("uses semantic card colors in light and dark hosts", () => {
    const card = readFileSync("registry/base-nova/protoform/components/card/index.tsx", "utf8");

    expect(card).toContain("border-border");
    expect(card).toContain("bg-card");
    expect(card).toContain("text-card-foreground");
    expect(card).not.toContain("bg-white dark:bg-base-900");
  });
});
