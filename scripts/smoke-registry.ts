#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs";

import { demoCatalog } from "../examples/catalog/demo-catalog.js";

const expectedItems = [
  "protoform-license",
  "bookstore",
  "protoform-core",
  "protobuf-provider",
  "protoc-gen-protoform",
  "protobuf-v1-bridge",
  "use-proto-form",
  "use-proto-form-tanstack",
  "use-proto-form-tanstack-v2",
  "auto-form-core",
  "auto-form",
  "auto-form-tanstack",
  "auto-form-tanstack-v2",
  "protoform",
  "protoform-examples",
  "protoform-demo-runtime",
  ...demoCatalog.map((demo) => demo.registryName),
];
const registry = JSON.parse(readFileSync("public/r/registry.json", "utf8")) as {
  items?: { name: string }[];
};
const names = new Set((registry.items ?? []).map((item) => item.name));

for (const name of expectedItems) {
  if (!names.has(name)) {
    throw new Error(`registry index is missing ${name}`);
  }
  const path = `public/r/${name}.json`;
  if (!existsSync(path)) {
    throw new Error(`registry item file is missing: ${path}`);
  }
  const item = JSON.parse(readFileSync(path, "utf8")) as {
    dependencies?: string[];
    files?: { path: string }[];
    name?: string;
    registryDependencies?: string[];
  };
  if (item.name !== name) {
    throw new Error(`${path} has name ${item.name}, expected ${name}`);
  }
  if (name !== "protoform" && (!item.files || item.files.length === 0)) {
    throw new Error(`${path} should include installable files`);
  }
}

const hook = JSON.parse(
  readFileSync("public/r/use-proto-form.json", "utf8")
) as {
  files: { path: string }[];
};
if (
  !hook.files.some((file) =>
    file.path.endsWith("hooks/use-proto-form/index.ts")
  )
) {
  throw new Error(
    "use-proto-form registry item must include the hook entrypoint"
  );
}
if (hook.files.some((file) => file.path.includes("/components/auto-form/"))) {
  throw new Error(
    "use-proto-form registry item must not install AutoForm components"
  );
}

const license = JSON.parse(
  readFileSync("public/r/protoform-license.json", "utf8")
) as {
  files?: Array<{ content?: string; target?: string }>;
};
const expectedNotices = [
  ["~/LICENSES/protoform-MIT.txt", "LICENSE"],
  ["~/LICENSES/Apache-2.0.txt", "LICENSES/Apache-2.0.txt"],
  ["~/LICENSES/shadcn-MIT.txt", "LICENSES/shadcn-MIT.txt"],
  ["~/THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"],
] as const;
for (const [target, source] of expectedNotices) {
  if (
    !license.files?.some(
      (file) =>
        file.target === target && file.content === readFileSync(source, "utf8")
    )
  ) {
    throw new Error(`protoform-license must distribute ${source}`);
  }
}

const autoForm = JSON.parse(
  readFileSync("public/r/auto-form.json", "utf8")
) as {
  registryDependencies?: string[];
};
if (
  !(
    autoForm.registryDependencies?.includes("@protoform/auto-form-core") &&
    autoForm.registryDependencies.includes("@protoform/use-proto-form")
  )
) {
  throw new Error("auto-form must depend on the shared core and RHF hook");
}

const tanstackAutoForm = JSON.parse(
  readFileSync("public/r/auto-form-tanstack.json", "utf8")
) as {
  dependencies?: string[];
  registryDependencies?: string[];
};
if (
  !(
    tanstackAutoForm.registryDependencies?.includes(
      "@protoform/auto-form-core"
    ) &&
    tanstackAutoForm.registryDependencies.includes(
      "@protoform/use-proto-form-tanstack"
    )
  )
) {
  throw new Error(
    "auto-form-tanstack must depend on the shared core and TanStack hook"
  );
}
if (tanstackAutoForm.dependencies?.includes("react-hook-form")) {
  throw new Error("auto-form-tanstack must not install React Hook Form");
}

const tanstackV2Alias =
  "@tanstack/react-form-v2@npm:@tanstack/react-form@2.0.0-alpha.0";
const tanstackV2Hook = JSON.parse(
  readFileSync("public/r/use-proto-form-tanstack-v2.json", "utf8")
) as { dependencies?: string[] };
const tanstackV2AutoForm = JSON.parse(
  readFileSync("public/r/auto-form-tanstack-v2.json", "utf8")
) as {
  dependencies?: string[];
  registryDependencies?: string[];
};
if (!tanstackV2Hook.dependencies?.includes(tanstackV2Alias)) {
  throw new Error(
    "use-proto-form-tanstack-v2 must install the pinned v2 alias"
  );
}
if (
  !(
    tanstackV2AutoForm.dependencies?.includes(tanstackV2Alias) &&
    tanstackV2AutoForm.registryDependencies?.includes(
      "@protoform/auto-form-core"
    ) &&
    tanstackV2AutoForm.registryDependencies.includes(
      "@protoform/use-proto-form-tanstack-v2"
    )
  )
) {
  throw new Error(
    "auto-form-tanstack-v2 must install the shared core, v2 hook, and pinned v2 alias"
  );
}

console.log(`Registry smoke passed: ${expectedItems.join(", ")}`);
