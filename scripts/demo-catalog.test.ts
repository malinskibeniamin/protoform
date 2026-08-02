import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { demoCatalog } from "../examples/catalog/demo-catalog.js";
import { readinessRequirements } from "../readiness/profile.js";

const repositoryRoot = new URL("../", import.meta.url);

function read(path: string): string {
  return readFileSync(new URL(path, repositoryRoot), "utf8");
}

function docsSlug(demo: (typeof demoCatalog)[number]): string {
  return demo.category === "aip" ? demo.slug : `example-${demo.slug}`;
}

describe("live demo catalog", () => {
  it("maps every applicable readiness requirement to a live demo", () => {
    const applicableIds = readinessRequirements
      .filter((requirement) => requirement.status === "verified")
      .map((requirement) => requirement.id);
    const mappedIds = new Set(
      demoCatalog.flatMap((demo) => demo.requirementIds)
    );

    expect(
      applicableIds.filter((requirementId) => !mappedIds.has(requirementId))
    ).toEqual([]);
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

  it("gives every applicable AIP its own focused page and registry item", () => {
    const applicableAips = readinessRequirements.filter(
      (requirement) =>
        requirement.category === "aip" && requirement.status === "verified"
    );
    const aipDemos = demoCatalog.filter((demo) => demo.category === "aip");

    expect(aipDemos).toHaveLength(applicableAips.length);
    expect(new Set(aipDemos.map((demo) => demo.requirementIds[0]))).toEqual(
      new Set(applicableAips.map((requirement) => requirement.id))
    );

    for (const demo of aipDemos) {
      expect(demo.requirementIds).toHaveLength(1);
      expect(
        existsSync(
          new URL(
            `content/docs/(aip-examples)/${demo.slug}.mdx`,
            repositoryRoot
          )
        ),
        demo.slug
      ).toBe(true);
      const page = read(`content/docs/(aip-examples)/${demo.slug}.mdx`);
      expect(page).toContain("<Component path=");
      expect(page).not.toContain("<CapabilityDemo");
    }
  });

  it("keeps React Hook Form as the default while labeling interop demos", () => {
    for (const demo of demoCatalog) {
      expect(
        demo.engine === "react-hook-form" || demo.category === "interop",
        demo.id
      ).toBe(true);
    }
  });

  it("ships registry interop demos backed by their named form libraries", () => {
    const interopImports = {
      "final-form": "react-final-form",
      formik: "formik",
      "tanstack-form": "use-proto-form-tanstack",
    } as const;

    for (const demo of demoCatalog.filter(
      (candidate) => candidate.category === "interop"
    )) {
      const source = read(
        `registry/base-nova/protoform/demo/catalog/${demo.slug}.tsx`
      );
      expect(source, demo.id).toContain(interopImports[demo.engine]);
      expect(source, demo.id).not.toContain("RegistryCapabilityDemo");
      expect(source, demo.id).toContain("export default");
    }
  });

  it("publishes the actual form implementation for every catalog demo", () => {
    for (const demo of demoCatalog) {
      const source = read(
        `registry/base-nova/protoform/demo/catalog/${demo.slug}.tsx`
      );

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
      const source = read(
        `registry/base-nova/protoform/demo/catalog/${demo.slug}.tsx`
      );

      expect(source, demo.id).toContain("from '../../lib/protobuf-provider'");
      expect(source, demo.id).toContain("formatSubmittedValue(");
      expect(source, demo.id).not.toContain("function formatSubmittedValue");
      expect(source, demo.id).not.toContain("JSON.stringify(");
    }
  });

  it("points focused visual pages at their full implementations", () => {
    const focusedSources = {
      "cel-re2": "examples/learning/cel-re2-form",
      "credential-redaction": "examples/complex/complex-form",
      "performance-bundle": "examples/kitchen-sink/kitchen-sink-form",
      "protobuf-nested-collections": "examples/nested/deeply-nested-form",
      "protobuf-oneof": "examples/learning/oneof-form",
      "responsive-cross-browser": "examples/kitchen-sink/kitchen-sink-form",
      "server-errors": "examples/basic/basic-form",
      stepper: "examples/learning/two-step-form",
    } as const;

    for (const [slug, sourcePath] of Object.entries(focusedSources)) {
      let category = "production";
      if (slug === "cel-re2") {
        category = "cel";
      } else if (slug.startsWith("protobuf-")) {
        category = "protobuf";
      }
      const page = read(
        `content/docs/(feature-examples)/(${category})/example-${slug}.mdx`
      );
      const source = read(`${sourcePath}.tsx`);

      expect(page, slug).toContain(`<Component path="${sourcePath}" />`);
      expect(source, slug).toContain("<AutoForm");
      expect(source, slug).not.toContain("lazy(");
    }
  });

  it("makes every registry demo renderable by Blume Component previews", () => {
    for (const demo of demoCatalog) {
      const source = read(
        `registry/base-nova/protoform/demo/catalog/${demo.slug}.tsx`
      );
      expect(source, demo.id).toContain("export default");
      expect(source, demo.id).toContain("export const client = 'only'");

      const directory =
        demo.category === "aip"
          ? "content/docs/(aip-examples)"
          : `content/docs/(feature-examples)/(${
              demo.category === "interop" ? "production" : demo.category
            })`;
      const page = read(`${directory}/${docsSlug(demo)}.mdx`);
      expect(page, demo.id).toContain("<Component path=");
      expect(page, demo.id).not.toContain("<CapabilityDemo");
    }
  });

  it("makes every demo independently installable from the registry", () => {
    const registry = JSON.parse(read("registry.json")) as {
      items: Array<{
        files?: Array<{ target?: string }>;
        name: string;
        registryDependencies?: string[];
      }>;
    };
    const registryItems = new Map(
      registry.items.map((item) => [item.name, item])
    );

    for (const demo of demoCatalog) {
      const item = registryItems.get(demo.registryName);
      expect(item, demo.registryName).toBeDefined();
      expect(item?.registryDependencies).toContain(
        "@protoform/protoform-demo-runtime"
      );
      expect(item?.files?.[0]?.target).toBe(
        `~/components/protoform-examples/${demo.slug}.tsx`
      );
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
    const runtime = registry.items.find(
      (item) => item.name === "protoform-demo-runtime"
    );

    expect(manifest.scripts["proto:generate"]).toContain(
      "bun run demos:generate && bun run registry:build"
    );
    expect(runtime).toBeDefined();
    for (const file of runtime?.files ?? []) {
      if (file.path.startsWith(runtimePrefix)) {
        expect(read(file.path).trim(), file.path).toBe(
          read(
            `conformance/gen/${file.path.slice(runtimePrefix.length)}`
          ).trim()
        );
      }
    }
  });
});
