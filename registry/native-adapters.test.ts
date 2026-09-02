import { readFileSync } from "node:fs";
import { describe, expect } from "@rstest/core";
import ts from "typescript";

interface RegistryItem {
  dependencies?: string[];
  files?: Array<{ path: string; target?: string }>;
  name: string;
  registryDependencies?: string[];
}

const registry = JSON.parse(readFileSync("registry.json", "utf8")) as {
  items: RegistryItem[];
};

const defaultUiModules = [
  "alert",
  "badge",
  "button",
  "calendar",
  "card",
  "checkbox",
  "choicebox",
  "collapsible",
  "combobox",
  "command",
  "copy-button",
  "dialog",
  "field",
  "group",
  "input",
  "input-group",
  "json-field",
  "key-value-field",
  "label",
  "multi-select",
  "popover",
  "radio-group",
  "select",
  "separator",
  "slider",
  "spinner",
  "switch",
  "tabs",
  "tags",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "tooltip",
  "typography",
];
const defaultUiModuleRoots = defaultUiModules.map(
  (moduleName) => `registry/base-nova/protoform/components/${moduleName}/`
);
const defaultUiModulePaths = defaultUiModuleRoots.map((moduleRoot) => `${moduleRoot}index.tsx`);

function item(name: string): RegistryItem {
  const match = registry.items.find((candidate) => candidate.name === name);
  if (!match) {
    throw new Error(`Missing registry item: ${name}`);
  }
  return match;
}

function filePaths(registryItem: RegistryItem): string[] {
  return registryItem.files?.map((file) => file.path) ?? [];
}

function dependencyClosure(name: string, names = new Set<string>()): Set<string> {
  if (names.has(name)) {
    return names;
  }

  names.add(name);
  for (const dependency of item(name).registryDependencies ?? []) {
    dependencyClosure(dependency.replace("@protoform/", ""), names);
  }
  return names;
}

function closureFilePaths(name: string): string[] {
  return [...dependencyClosure(name)].flatMap((dependency) => filePaths(item(dependency)));
}

function uiImports(path: string): string[] {
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
  const imports: string[] = [];

  for (const statement of source.statements) {
    if (
      !(
        ts.isImportDeclaration(statement) &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text.startsWith("@/components/ui/")
      )
    ) {
      continue;
    }

    const moduleName = statement.moduleSpecifier.text;
    const { importClause } = statement;
    if (importClause?.name) {
      imports.push(`${moduleName}:default`);
    }
    if (importClause?.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
      for (const element of importClause.namedBindings.elements) {
        imports.push(`${moduleName}:${element.propertyName?.text ?? element.name.text}`);
      }
    }
  }

  return imports;
}

describe("build-time UI adapter registry", () => {
  test("splits core, React, and optional shadcn capabilities", () => {
    const core = item("protoform-core");
    const react = item("protoform-react");
    const shadcn = item("protoform-shadcn");

    expect(core.registryDependencies).toEqual(["@protoform/use-proto-form"]);
    expect(filePaths(core).some((path) => path.includes("/components/"))).toBe(false);

    expect(react.registryDependencies).toEqual(["@protoform/auto-form-core", "@protoform/protoform-core"]);
    expect(filePaths(react)).toContain("registry/base-nova/protoform/components/auto-form/index.tsx");
    expect(filePaths(react)).toContain(
      "registry/base-nova/protoform/components/auto-form/adapters/react-hook-form.tsx"
    );
    expect(
      filePaths(react).some((path) => defaultUiModuleRoots.some((moduleRoot) => path.startsWith(moduleRoot)))
    ).toBe(false);

    expect(shadcn.registryDependencies).toEqual(["@protoform/protoform-react"]);
    expect(filePaths(shadcn)).toEqual(expect.arrayContaining(defaultUiModulePaths));
    for (const moduleName of defaultUiModules) {
      const moduleRoot = `registry/base-nova/protoform/components/${moduleName}/`;
      const moduleFiles = shadcn.files?.filter((file) => file.path.startsWith(moduleRoot)) ?? [];
      expect(moduleFiles.length, moduleName).toBeGreaterThan(0);
      for (const file of moduleFiles) {
        expect(file.target, file.path).toBe(`~/components/ui/${moduleName}/${file.path.slice(moduleRoot.length)}`);
      }
    }
  });

  test("keeps hook installs on the focused runtime instead of the complete provider", () => {
    const runtime = item("hook-runtime");
    const hookNames = ["use-proto-form", "use-proto-form-tanstack", "use-proto-form-tanstack-v2", "use-proto-form-v8"];

    expect(runtime.registryDependencies).toEqual(["@protoform/protoform-foundation"]);
    expect(filePaths(runtime)).toEqual([
      "registry/base-nova/protoform/lib/protobuf-provider/descriptor-utils.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/field-mask.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/form-schema.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/format-error.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/hook-runtime.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/humanize-validation-error.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/proto-error-path.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/validation-schema.ts",
    ]);
    for (const hookName of hookNames) {
      expect(item(hookName).registryDependencies, hookName).toContain("@protoform/hook-runtime");
      expect(dependencyClosure(hookName), hookName).not.toContain("protobuf-provider");
    }

    const coreFiles = closureFilePaths("protoform-core").filter((path) => path.startsWith("registry/"));
    const coreLines = new Set(coreFiles)
      .values()
      .reduce((total, path) => total + readFileSync(path, "utf8").split("\n").length, 0);
    expect(new Set(coreFiles).size).toBeLessThanOrEqual(18);
    expect(coreLines).toBeLessThan(3500);
  });

  test("keeps generated fixtures in the examples item", () => {
    const providerPaths = filePaths(item("protobuf-provider"));
    const examplePaths = filePaths(item("protoform-examples"));
    const fixturePaths = [
      "registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_form.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/gen/protoform/v1/auto_form_example_form.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/gen/protoform/v1/auto_form_example_pb.ts",
      "registry/base-nova/protoform/lib/protobuf-provider/gen/protoform/v1/auto_form_ui_form.ts",
    ];

    for (const fixturePath of fixturePaths) {
      expect(providerPaths, fixturePath).not.toContain(fixturePath);
      expect(examplePaths, fixturePath).toContain(fixturePath);
    }
  });

  test("keeps primitive implementations out of the shared AutoForm renderer", () => {
    const renderer = item("auto-form-core");

    expect(
      filePaths(renderer).some((path) => defaultUiModuleRoots.some((moduleRoot) => path.startsWith(moduleRoot)))
    ).toBe(false);
    expect(filePaths(renderer)).toContain("registry/base-nova/protoform/components/auto-form/ui-adapter.compile.ts");
  });

  test("keeps the compile-only UI contract synchronized with renderer imports", () => {
    const contractPath = "registry/base-nova/protoform/components/auto-form/ui-adapter.compile.ts";
    const rendererImports = filePaths(item("auto-form-core"))
      .filter((path) => path !== contractPath)
      .flatMap(uiImports);
    const contractImports = uiImports(contractPath);

    expect([...new Set(contractImports)].sort()).toEqual([...new Set(rendererImports)].sort());
  });

  test("keeps the complete core capability free of UI source", () => {
    const coreItems = [
      item("protoform-foundation"),
      item("protobuf-provider"),
      item("use-proto-form"),
      item("protoform-core"),
    ];

    for (const coreItem of coreItems) {
      expect(
        filePaths(coreItem).some((path) => path.includes("/components/")),
        coreItem.name
      ).toBe(false);
      for (const path of filePaths(coreItem)) {
        expect(readFileSync(path, "utf8"), path).not.toMatch(/@\/components\//u);
      }
    }
  });
});

describe("native form adapter registry entries", () => {
  test("keeps the shared AutoForm core independent from form engines", () => {
    const core = item("auto-form-core");

    expect(core.dependencies).not.toContain("react-hook-form");
    expect(core.dependencies).not.toContain("@tanstack/react-form");
    expect(filePaths(core)).not.toContain(
      "registry/base-nova/protoform/components/auto-form/adapters/react-hook-form.tsx"
    );
    expect(filePaths(core)).not.toContain("registry/base-nova/protoform/components/auto-form/adapters/tanstack.tsx");
    expect(filePaths(core)).not.toContain("registry/base-nova/protoform/components/auto-form/adapters/tanstack-v2.tsx");
  });

  test("ships React Hook Form as the default AutoForm adapter", () => {
    const reactHookForm = item("protoform-react");

    expect(reactHookForm.registryDependencies).toEqual(["@protoform/auto-form-core", "@protoform/protoform-core"]);
    expect(reactHookForm.dependencies).toContain("react-hook-form");
    expect(filePaths(reactHookForm)).toContain(
      "registry/base-nova/protoform/components/auto-form/adapters/react-hook-form.tsx"
    );
  });

  test("ships TanStack Form without pulling React Hook Form", () => {
    const tanstackHook = item("use-proto-form-tanstack");
    const tanstackAutoForm = item("auto-form-tanstack");

    expect(tanstackHook.dependencies).toContain("@tanstack/react-form");
    expect(tanstackHook.dependencies).not.toContain("react-hook-form");
    expect(tanstackAutoForm.registryDependencies).toEqual([
      "@protoform/auto-form-core",
      "@protoform/use-proto-form-tanstack",
    ]);
    expect(tanstackAutoForm.dependencies).toContain("@tanstack/react-form");
    expect(tanstackAutoForm.dependencies).not.toContain("react-hook-form");
    expect(filePaths(tanstackAutoForm)).toContain(
      "registry/base-nova/protoform/components/auto-form/adapters/tanstack.tsx"
    );
  });

  test("ships TanStack Form v2 as separate experimental registry items", () => {
    const packageAlias = "@tanstack/react-form-v2@npm:@tanstack/react-form@2.0.0-alpha.2";
    const tanstackHook = item("use-proto-form-tanstack-v2");
    const tanstackAutoForm = item("auto-form-tanstack-v2");

    expect(tanstackHook.dependencies).toContain(packageAlias);
    expect(tanstackHook.dependencies).not.toContain("react-hook-form");
    expect(tanstackAutoForm.registryDependencies).toEqual([
      "@protoform/auto-form-core",
      "@protoform/use-proto-form-tanstack-v2",
    ]);
    expect(tanstackAutoForm.dependencies).toContain(packageAlias);
    expect(tanstackAutoForm.dependencies).not.toContain("react-hook-form");
    expect(filePaths(tanstackAutoForm)).toContain(
      "registry/base-nova/protoform/components/auto-form/adapters/tanstack-v2.tsx"
    );
  });

  test("ships React Hook Form v8 as separate experimental registry items", () => {
    const packageAlias = "react-hook-form-v8@npm:react-hook-form@8.0.0-beta.3";
    const reactHookFormHook = item("use-proto-form-v8");
    const reactHookFormAutoForm = item("auto-form-react-hook-form-v8");

    expect(reactHookFormHook.dependencies).toContain(packageAlias);
    expect(reactHookFormHook.dependencies).not.toContain("react-hook-form");
    expect(reactHookFormHook.dependencies).not.toContain("@hookform/resolvers");
    expect(reactHookFormAutoForm.registryDependencies).toEqual([
      "@protoform/auto-form-core",
      "@protoform/use-proto-form-v8",
    ]);
    expect(reactHookFormAutoForm.dependencies).toContain(packageAlias);
    expect(reactHookFormAutoForm.dependencies).not.toContain("react-hook-form");
    expect(filePaths(reactHookFormAutoForm)).toContain(
      "registry/base-nova/protoform/components/auto-form/adapters/react-hook-form-v8.tsx"
    );
  });
});
