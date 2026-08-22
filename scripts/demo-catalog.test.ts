import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "@rstest/core";

import { demoCatalog } from "../examples/catalog/demo-catalog.js";
import { demoHubCategoryFor, demoRedirects, getDemoHub } from "../examples/catalog/demo-docs.js";
import { readinessRequirements } from "../readiness/profile.js";

const repositoryRoot = new URL("../", import.meta.url);

function read(path: string): string {
  return readFileSync(new URL(path, repositoryRoot), "utf8");
}

describe("live demo catalog", () => {
  it("excludes test modules from the production demo glob", () => {
    const source = read("examples/catalog/demo-hub.tsx");

    expect(source).toContain('"!../../registry/base-nova/protoform/demo/catalog/*.test.tsx"');
  });

  it("maps every applicable readiness requirement to a live demo", () => {
    const applicableIds = readinessRequirements
      .filter((requirement) => requirement.status === "verified")
      .map((requirement) => requirement.id);
    const mappedIds = new Set(demoCatalog.flatMap((demo) => demo.requirementIds));

    expect(applicableIds.filter((requirementId) => !mappedIds.has(requirementId))).toEqual([]);
  });

  it("keeps an extensive, uniquely addressable visual feature catalog", () => {
    const featureDemos = demoCatalog.filter((demo) => demo.category !== "aip");
    const slugs = featureDemos.map((demo) => demo.slug);

    expect(featureDemos.length).toBeGreaterThanOrEqual(50);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "bufbuild-descriptors",
        "cel-re2",
        "credential-redaction",
        "protobuf-dynamic-json-any",
        "protobuf-well-known-types",
        "protovalidate-all-errors",
        "stepper",
      ])
    );
  });

  it("consolidates generated demos into five focused documentation hubs", () => {
    const applicableAips = readinessRequirements.filter(
      (requirement) => requirement.category === "aip" && requirement.status === "verified"
    );
    const aipDemos = demoCatalog.filter((demo) => demo.category === "aip");

    expect(aipDemos).toHaveLength(applicableAips.length);
    expect(new Set(aipDemos.map((demo) => demo.requirementIds[0]))).toEqual(
      new Set(applicableAips.map((requirement) => requirement.id))
    );

    for (const demo of aipDemos) {
      expect(demo.requirementIds).toHaveLength(1);
      expect(existsSync(new URL(`content/docs/(aip-examples)/${demo.slug}.mdx`, repositoryRoot)), demo.slug).toBe(
        false
      );
    }

    const hubs = [
      ["content/docs/(aip-examples)/aip-example-catalog.mdx", '<DemoHub category="aip" />', "aip"],
      [
        "content/docs/(feature-examples)/(protobuf)/protobuf-examples.mdx",
        '<DemoHub category="protobuf" />',
        "protobuf",
      ],
      [
        "content/docs/(feature-examples)/(protovalidate)/protovalidate-examples.mdx",
        '<DemoHub category="protovalidate" />',
        "protovalidate",
      ],
      ["content/docs/(feature-examples)/(cel)/cel-examples.mdx", '<DemoHub category="cel" />', "cel"],
      [
        "content/docs/(feature-examples)/(production)/production-examples.mdx",
        '<DemoHub category="production" />',
        "production",
      ],
    ] as const;

    for (const [path, island, category] of hubs) {
      const page = read(path);
      expect(page, path).toContain(island);
      expect(page.split(getDemoHub(category).description), path).toHaveLength(2);
    }

    const generatedMdx = [
      ...readdirSync(new URL("content/docs/(aip-examples)", repositoryRoot), {
        recursive: true,
      }),
      ...readdirSync(new URL("content/docs/(feature-examples)", repositoryRoot), { recursive: true }),
    ].filter((path) => path.toString().endsWith(".mdx"));
    expect(generatedMdx).toHaveLength(5);
  });

  it("keeps React Hook Form as the default while labeling interop demos", () => {
    for (const demo of demoCatalog) {
      expect(demo.engine === "react-hook-form" || demo.category === "interop", demo.id).toBe(true);
    }
  });

  it("ships registry interop demos backed by their named form libraries", () => {
    const interopImports = {
      "final-form": "react-final-form",
      formik: "formik",
      "tanstack-form": "use-proto-form-tanstack",
    } as const;

    for (const demo of demoCatalog.filter((candidate) => candidate.category === "interop")) {
      const source = read(`registry/base-nova/protoform/demo/catalog/${demo.slug}.tsx`);
      const expectedImport = Object.entries(interopImports).find(([engine]) => engine === demo.engine)?.[1];
      if (!expectedImport) {
        throw new Error(`Expected an interop import for ${demo.engine}.`);
      }
      expect(source, demo.id).toContain(expectedImport);
      expect(source, demo.id).not.toContain("RegistryCapabilityDemo");
      expect(source, demo.id).toContain("export default");
    }
  });

  it("publishes the actual form implementation for every catalog demo", () => {
    for (const demo of demoCatalog) {
      const source = read(`registry/base-nova/protoform/demo/catalog/${demo.slug}.tsx`);

      expect(source, demo.id).not.toContain("RegistryCapabilityDemo");
      if (demo.engine === "react-hook-form") {
        expect(source, demo.id).toContain("<AutoForm");
        expect(source, demo.id).toContain("onSubmit=");
        expect(source, demo.id).toContain("schema={schema}");
        expect(source, demo.id).toContain("getDemoSchema");
      }
    }
  });

  it("keeps submitted-value formatting inside Protoform", () => {
    for (const demo of demoCatalog) {
      const source = read(`registry/base-nova/protoform/demo/catalog/${demo.slug}.tsx`);

      expect(source, demo.id).toMatch(/from ["']\.\.\/\.\.\/lib\/protobuf-provider(?:\/index)?["']/);
      expect(source, demo.id).toContain("formatSubmittedValue(");
      expect(source, demo.id).not.toContain("function formatSubmittedValue");
      expect(source, demo.id).not.toContain("JSON.stringify(");
    }
  });

  it("keeps every registry demo renderable by the consolidated hub", () => {
    for (const demo of demoCatalog) {
      const source = read(`registry/base-nova/protoform/demo/catalog/${demo.slug}.tsx`);
      expect(source, demo.id).toContain("export default");
      expect(source, demo.id).toMatch(/export const client = ["']only["']/);
    }
  });

  it("redirects every retired demo page to its deep-linked hub selection", () => {
    expect(demoRedirects).toHaveLength(demoCatalog.length + 1);

    for (const demo of demoCatalog) {
      const from = demo.category === "aip" ? `/${demo.slug}` : `/example-${demo.slug}`;
      const hub = getDemoHub(demoHubCategoryFor(demo.category));

      expect(demoRedirects).toContainEqual({
        from,
        status: 308,
        to: `/${hub.slug}#${demo.slug}`,
      });
    }

    expect(demoRedirects).toContainEqual({
      from: "/feature-example-catalog",
      status: 308,
      to: "/protobuf-examples",
    });
  });

  it("makes every demo independently installable from the registry", () => {
    const registry = JSON.parse(read("registry.json")) as {
      items: Array<{
        files?: Array<{ target?: string }>;
        name: string;
        registryDependencies?: string[];
      }>;
    };
    const registryItems = new Map(registry.items.map((item) => [item.name, item]));

    for (const demo of demoCatalog) {
      const item = registryItems.get(demo.registryName);
      expect(item, demo.registryName).toBeDefined();
      expect(item?.registryDependencies).toContain("@protoform/protoform-demo-runtime");
      expect(item?.files?.[0]?.target).toBe(`~/components/protoform-examples/${demo.slug}.tsx`);
    }
  });

  it("keeps generated demo descriptors synchronized in the full generation pipeline", () => {
    const manifest = JSON.parse(read("package.json")) as {
      scripts: Record<string, string>;
    };
    const registry = JSON.parse(read("registry.json")) as {
      items: Array<{
        files?: Array<{ path: string }>;
        name: string;
      }>;
    };
    const runtimePrefix = "registry/base-nova/protoform/demo/runtime/gen/";
    const runtime = registry.items.find((item) => item.name === "protoform-demo-runtime");

    expect(manifest.scripts["proto:generate"]).toContain("bun run demos:generate && bun run registry:build");
    expect(runtime).toBeDefined();
    for (const file of runtime?.files ?? []) {
      if (file.path.startsWith(runtimePrefix)) {
        expect(read(file.path).trim(), file.path).toBe(
          read(`conformance/gen/${file.path.slice(runtimePrefix.length)}`).trim()
        );
      }
    }
  });
});
