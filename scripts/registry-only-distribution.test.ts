import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "@rstest/core";

const repositoryRoot = resolve(import.meta.dirname, "..");
const MIT_LICENSE_PATTERN = /^MIT License/;
const PRIVATE_REGISTRY_PATTERN = /npm\.pkg\.github\.com|read:packages/;
const PACKAGE_RELEASE_PATTERN = /changeset|npm publish|npm\.pkg\.github/i;
const PACKAGE_ARTIFACT_PATTERN = /package-artifacts|tarball|packWorkspacePackages/i;
const STABLE_REGISTRY_URL = "https://raw.githubusercontent.com/malinskibeniamin/protoform/v1.0.0/public/r/{name}.json";
const PROTOFORM_LICENSE_DEPENDENCY = "@protoform/protoform-license";
const PROTOFORM_LICENSE_TARGET = "~/LICENSES/protoform-MIT.txt";
const APACHE_LICENSE_TARGET = "~/LICENSES/Apache-2.0.txt";
const SHADCN_LICENSE_TARGET = "~/LICENSES/shadcn-MIT.txt";
const THIRD_PARTY_NOTICES_TARGET = "~/THIRD_PARTY_NOTICES.md";

interface RegistryItem {
  files?: Array<{ path: string; target?: string; type: string }>;
  name: string;
  registryDependencies?: string[];
  type: string;
}

function sourceFiles(path: string): string[] {
  return readdirSync(path).flatMap((entry) => {
    const child = resolve(path, entry);
    return statSync(child).isDirectory() ? sourceFiles(child) : [child];
  });
}

describe("registry-only distribution", () => {
  it("ships Protoform under MIT without private package workspaces", () => {
    const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      scripts?: Record<string, string>;
      workspaces?: string[];
    };

    expect(readFileSync(resolve(repositoryRoot, "LICENSE"), "utf8")).toMatch(MIT_LICENSE_PATTERN);
    expect(manifest.workspaces).toBeUndefined();
    expect(existsSync(resolve(repositoryRoot, "packages"))).toBe(false);
    expect(
      Object.keys(manifest.dependencies ?? {}).filter((dependency) => dependency.startsWith("@malinskibeniamin/"))
    ).toEqual([]);
    expect(
      Object.keys(manifest.scripts ?? {}).filter(
        (script) => script.startsWith("packages:") || script.startsWith("changeset")
      )
    ).toEqual([]);
  });

  it("copies license notices with every installable registry item", () => {
    const registry = JSON.parse(readFileSync(resolve(repositoryRoot, "registry.json"), "utf8")) as {
      items: RegistryItem[];
    };
    const itemsByName = new Map(registry.items.map((item) => [item.name, item]));
    const license = itemsByName.get("protoform-license");

    expect(license).toMatchObject({
      files: [
        {
          path: "LICENSE",
          target: PROTOFORM_LICENSE_TARGET,
          type: "registry:file",
        },
        {
          path: "LICENSES/Apache-2.0.txt",
          target: APACHE_LICENSE_TARGET,
          type: "registry:file",
        },
        {
          path: "LICENSES/shadcn-MIT.txt",
          target: SHADCN_LICENSE_TARGET,
          type: "registry:file",
        },
        {
          path: "THIRD_PARTY_NOTICES.md",
          target: THIRD_PARTY_NOTICES_TARGET,
          type: "registry:file",
        },
      ],
      type: "registry:file",
    });

    function installsLicense(item: RegistryItem, visited = new Set<string>()): boolean {
      if (item.name === "protoform-license") {
        return true;
      }
      if (visited.has(item.name)) {
        return false;
      }
      visited.add(item.name);

      return (item.registryDependencies ?? []).some((dependency) => {
        if (dependency === PROTOFORM_LICENSE_DEPENDENCY) {
          return true;
        }
        const dependencyName = dependency.startsWith("@protoform/")
          ? dependency.slice("@protoform/".length)
          : undefined;
        const dependencyItem = dependencyName ? itemsByName.get(dependencyName) : undefined;
        return dependencyItem ? installsLicense(dependencyItem, new Set(visited)) : false;
      });
    }

    for (const item of registry.items) {
      expect(installsLicense(item), item.name).toBe(true);
    }
  });

  it("does not ask consumers for private Protoform packages", () => {
    const consumerContent = [
      resolve(repositoryRoot, "README.md"),
      resolve(repositoryRoot, "registry.json"),
      resolve(repositoryRoot, ".npmrc"),
      ...sourceFiles(resolve(repositoryRoot, "content", "docs")),
      ...sourceFiles(resolve(repositoryRoot, ".github", "workflows")),
    ]
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(consumerContent).not.toContain("@malinskibeniamin/");
    expect(consumerContent).not.toMatch(PRIVATE_REGISTRY_PATTERN);
    expect(consumerContent).not.toContain("packages:");
  });

  it("documents the public Buf registry and portable bookstore install", () => {
    const gettingStarted = readFileSync(
      resolve(repositoryRoot, "content/docs/(start-here)/getting-started.mdx"),
      "utf8"
    );
    const bookstore = readFileSync(resolve(repositoryRoot, "content/docs/(start-here)/bookstore.mdx"), "utf8");

    expect(gettingStarted).toContain("@buf:registry=https://buf.build/gen/npm/v1/");
    expect(gettingStarted).toContain("No token");
    expect(bookstore).toContain("@protoform/bookstore");
    expect(bookstore).not.toContain("protoform.dev");
  });

  it("uses the public registry and Git tags as the distribution boundary", () => {
    const readme = readFileSync(resolve(repositoryRoot, "README.md"), "utf8");
    const release = readFileSync(resolve(repositoryRoot, ".github/workflows/release.yml"), "utf8");

    expect(readme).toContain("shadcn");
    expect(readme).toContain("Git tags");
    expect(readme).toContain(STABLE_REGISTRY_URL);
    expect(readme).toContain("add @protoform/protoform");
    expect(release).toContain("tags:");
    expect(release).toContain("public/r LICENSE LICENSES THIRD_PARTY_NOTICES.md");
    expect(release).not.toMatch(PACKAGE_RELEASE_PATTERN);
    expect(existsSync(resolve(repositoryRoot, ".changeset"))).toBe(false);
  });

  it("tests consumers through registry source only", () => {
    const smoke = readFileSync(resolve(repositoryRoot, "scripts/consumer-fixture-smoke.ts"), "utf8");

    expect(smoke).toContain("@protoform/bookstore");
    expect(smoke).not.toMatch(PACKAGE_ARTIFACT_PATTERN);
  });

  it("keeps the source generator explicit and runnable", () => {
    const registry = JSON.parse(readFileSync(resolve(repositoryRoot, "registry.json"), "utf8")) as {
      items: Array<{
        files?: Array<{ target?: string }>;
        name: string;
        registryDependencies?: string[];
      }>;
    };
    const generator = registry.items.find((item) => item.name === "protoc-gen-protoform");
    const protoform = registry.items.find((item) => item.name === "protoform");

    for (const item of registry.items) {
      expect(item.registryDependencies?.every((dependency) => dependency.startsWith("@protoform/")) ?? true).toBe(true);
    }
    expect(generator?.files?.every((file) => file.target?.startsWith("~/scripts/protoc-gen-protoform/"))).toBe(true);
    expect(protoform?.registryDependencies).not.toContain("@protoform/protoc-gen-protoform");
  });
});
