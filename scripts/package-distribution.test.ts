import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect } from "@rstest/core";

const repositoryRoot = resolve(import.meta.dirname, "..");
const packageDirectories = ["core", "auto-form", "react"] as const;

interface PackageManifest {
  dependencies?: Record<string, string>;
  exports?: Record<string, unknown>;
  files?: string[];
  license?: string;
  name?: string;
  private?: boolean;
  publishConfig?: { access?: string; provenance?: boolean };
  scripts?: Record<string, string>;
  type?: string;
  version?: string;
}

function readManifest(path: string): PackageManifest {
  return JSON.parse(readFileSync(resolve(repositoryRoot, path, "package.json"), "utf8")) as PackageManifest;
}

describe("compiled package distribution", () => {
  test("ships 3 public workspaces with compiled ESM exports", () => {
    const rootManifest = readManifest(".") as PackageManifest & { workspaces?: string[] };

    // allow: test-declarative-metadata package.json is the public package-manager contract under test.
    expect(rootManifest.workspaces).toContain("packages/*");
    expect(rootManifest.scripts?.["typecheck"]).toMatch(/^bun run packages:build &&/u);

    for (const directory of packageDirectories) {
      const manifest = readManifest(`packages/${directory}`);

      // allow: test-declarative-metadata packed npm metadata is public consumer behavior.
      expect(manifest).toMatchObject({
        files: ["dist", "LICENSE", "README.md"],
        license: "MIT",
        private: false,
        publishConfig: { access: "public", provenance: true },
        type: "module",
        version: rootManifest.version,
      });
      expect(manifest.exports).toMatchObject({
        ".": {
          import: "./dist/index.js",
          types: "./dist/index.d.ts",
        },
      });
    }

    expect(readManifest("packages/core").name).toBe("@protoform/core");
    expect(readManifest("packages/auto-form").name).toBe("@protoform/auto-form");
    expect(readManifest("packages/react").name).toBe("@protoform/react");
  });

  test("keeps manual forms independent from AutoForm", () => {
    const core = readManifest("packages/core");

    // allow: test-declarative-metadata dependency closure determines what a core-only install receives.
    expect(core.dependencies).not.toHaveProperty("@protoform/auto-form");
    expect(core.dependencies).not.toHaveProperty("@protoform/react");
  });

  test("lets the React package update manual forms and AutoForm together", () => {
    const react = readManifest("packages/react");

    // allow: test-declarative-metadata dependency closure is the public umbrella-package contract.
    expect(react.dependencies).toMatchObject({
      "@protoform/auto-form": "workspace:^",
      "@protoform/core": "workspace:^",
    });
  });
});
