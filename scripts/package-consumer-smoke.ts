#!/usr/bin/env bun

import { access, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { $ } from "bun";
import { z } from "zod";

const rootManifestSchema = z.object({ version: z.string().regex(/^\d+\.\d+\.\d+$/u) });
const repositoryRoot = resolve(import.meta.dirname, "..");
const artifactDirectory = join(repositoryRoot, ".tmp", "package-artifacts");
const fixtureRoot = join(repositoryRoot, ".tmp", "package-consumers");
const packageVersion = rootManifestSchema.parse(
  JSON.parse(await readFile(join(repositoryRoot, "package.json"), "utf8"))
).version;

const packageArtifact = (name: string) => join(artifactDirectory, `protoform-${name}-${packageVersion}.tgz`);

async function createFixture(
  name: string,
  dependencies: Record<string, string>,
  protoformOverrides: Record<string, string>,
  source: string
) {
  const directory = join(fixtureRoot, name);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, ".npmrc"), "@buf:registry=https://buf.build/gen/npm/v1/\n");
  await writeFile(
    join(directory, "package.json"),
    `${JSON.stringify(
      {
        dependencies: {
          ...dependencies,
          react: "^19.2.0",
          "react-dom": "^19.2.0",
          "react-hook-form": "^7.81.0",
        },
        devDependencies: {
          "@types/react": "^19.2.0",
          "@types/react-dom": "^19.2.0",
          typescript: "^6.0.0",
        },
        name: `protoform-${name}-consumer`,
        overrides: protoformOverrides,
        private: true,
        scripts: { typecheck: "tsc --noEmit" },
        type: "module",
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    join(directory, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          jsx: "react-jsx",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: "ES2022",
        },
        include: ["index.ts"],
      },
      null,
      2
    )}\n`
  );
  await writeFile(join(directory, "index.ts"), source);
  return directory;
}

await rm(fixtureRoot, { force: true, recursive: true });

const coreFixture = await createFixture(
  "core-only",
  { "@protoform/core": `file:${packageArtifact("core")}` },
  { "@protoform/core": `file:${packageArtifact("core")}` },
  'import { useProtoForm } from "@protoform/core";\n\nvoid useProtoForm;\n'
);
await $`bun install`.cwd(coreFixture);
await $`bun run typecheck`.cwd(coreFixture);
await access(join(coreFixture, "node_modules", "@protoform", "core", "dist", "index.js"));
const coreRuntimeSmoke =
  'const pkg = await import("@protoform/core"); if (!(pkg.useProtoForm) || "AutoForm" in pkg) process.exit(1);';
await $`bun -e ${coreRuntimeSmoke}`.cwd(coreFixture);
const coreScopeEntries = await readdir(join(coreFixture, "node_modules", "@protoform"));
if (coreScopeEntries.some((entry) => entry !== "core")) {
  throw new Error(`Core-only install unexpectedly included: ${coreScopeEntries.join(", ")}`);
}

const reactFixture = await createFixture(
  "react",
  { "@protoform/react": `file:${packageArtifact("react")}` },
  {
    "@protoform/auto-form": `file:${packageArtifact("auto-form")}`,
    "@protoform/core": `file:${packageArtifact("core")}`,
    "@protoform/react": `file:${packageArtifact("react")}`,
  },
  [
    'import { AutoForm, AutoFormCore as UmbrellaAutoFormCore, type AutoFormProps, composeCreateRequest, type FormValues, type ProtoformUIComponentMap, useProtoForm } from "@protoform/react";',
    'import { AutoFormCore } from "@protoform/auto-form";',
    "",
    "declare const components: ProtoformUIComponentMap;",
    'const props = { components } satisfies Pick<AutoFormProps, "components">;',
    'type ComponentsAreRequired = {} extends Pick<AutoFormProps, "components"> ? false : true;',
    "const componentsAreRequired: ComponentsAreRequired = true;",
    "",
    "void AutoForm;",
    "void AutoFormCore;",
    "void UmbrellaAutoFormCore;",
    "void componentsAreRequired;",
    "void composeCreateRequest;",
    "void ({} satisfies FormValues);",
    "void props;",
    "void useProtoForm;",
    "",
  ].join("\n")
);
await $`bun install`.cwd(reactFixture);
await $`bun run typecheck`.cwd(reactFixture);
const runtimeSmoke =
  'const [pkg, core, autoForm] = await Promise.all([import("@protoform/react"), import("@protoform/core"), import("@protoform/auto-form")]); const missing = [...Object.keys(core), ...Object.keys(autoForm)].filter((name) => !(name in pkg)); if (!(pkg.AutoForm && pkg.useProtoForm) || missing.length > 0) { console.error("Missing umbrella exports: " + missing.join(", ")); process.exit(1); }';
await $`bun -e ${runtimeSmoke}`.cwd(reactFixture);

console.info(`Compiled package consumers passed: ${fixtureRoot}`);
