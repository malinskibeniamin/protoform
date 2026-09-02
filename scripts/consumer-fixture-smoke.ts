#!/usr/bin/env bun

import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "bun";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixture = join(root, ".tmp", "consumer-fixture");
const coreFixture = join(root, ".tmp", "core-consumer-fixture");
const publicDir = join(root, "public");
const leadingSlashes = /^\/+/u;
const registryOrigin = "http://127.0.0.1:48741";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".proto": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

async function createFixture() {
  await rm(fixture, { force: true, recursive: true });
  await mkdir(join(fixture, "app"), { recursive: true });
  await writeFile(join(fixture, ".npmrc"), "@buf:registry=https://buf.build/gen/npm/v1/\n");
  await writeFile(
    join(fixture, "package.json"),
    `${JSON.stringify(
      {
        dependencies: {
          "@vitejs/plugin-react": "latest",
          react: "latest",
          "react-dom": "latest",
          typescript: "latest",
          vite: "latest",
        },
        devDependencies: {
          "@types/node": "latest",
          "@types/react": "latest",
          "@types/react-dom": "latest",
        },
        name: "protoform-consumer-fixture",
        private: true,
        scripts: { typecheck: "tsc --noEmit" },
        type: "module",
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    join(fixture, "components.json"),
    `${JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        aliases: {
          components: "@/components",
          hooks: "@/hooks",
          lib: "@/lib",
          ui: "@/components/ui",
          utils: "@/lib/utils",
        },
        iconLibrary: "lucide",
        registries: {
          "@protoform": `${registryOrigin}/r/{name}.json`,
        },
        rsc: false,
        style: "base-nova",
        tailwind: {
          baseColor: "neutral",
          config: "",
          css: "app/globals.css",
          cssVariables: true,
          prefix: "",
        },
        tsx: true,
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    join(fixture, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          ignoreDeprecations: "6.0",
          jsx: "react-jsx",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          paths: { "@/*": ["./*"] },
          skipLibCheck: true,
          strict: true,
          target: "ES2022",
          types: ["node"],
        },
        include: ["**/*.ts", "**/*.tsx"],
      },
      null,
      2
    )}\n`
  );
  await writeFile(join(fixture, "app", "globals.css"), "@import 'tailwindcss';\n");
}

function servePublic() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", registryOrigin);
    const pathname = decodeURIComponent(url.pathname.replace(leadingSlashes, ""));
    const filePath = resolve(publicDir, pathname);
    if (!filePath.startsWith(publicDir)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    try {
      const text = await readFile(filePath, "utf8");
      response.writeHead(200, {
        "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      });
      response.end(text);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
  return new Promise<import("node:http").Server>((resolveServer) => {
    server.listen(48_741, "127.0.0.1", () => resolveServer(server));
  });
}

async function assertInstalled() {
  const expected = [
    "components/protoform-bookstore/bookstore-demo.tsx",
    "components/protoform-bookstore/create-book-form.tsx",
    "components/protoform-bookstore/update-book-form.tsx",
    "components/protoform-bookstore/delete-book-form.tsx",
    "components/protoform-bookstore/library-service.ts",
    "components/protoform-examples/runtime/gen/protoform/conformance/v1/aip_pb.ts",
    "components/protoform-examples/runtime/gen/protoform/conformance/v1/aip_form.ts",
    "hooks/use-proto-form/index.ts",
    "components/auto-form/index.tsx",
    "components/auto-form-react-hook-form-v8/index.tsx",
    "components/auto-form/adapters/react-hook-form-v8.tsx",
    "components/auto-form-tanstack/index.tsx",
    "components/auto-form-tanstack-v2/index.tsx",
    "components/auto-form/adapters/tanstack-v2.tsx",
    "hooks/use-proto-form-tanstack-v2/index.ts",
    "hooks/use-proto-form-v8/index.ts",
    "lib/core/index.ts",
    "lib/protobuf-provider/index.ts",
    "components/ui/button/index.tsx",
    "components/ui/select/index.tsx",
    "LICENSES/Apache-2.0.txt",
    "LICENSES/protoform-MIT.txt",
    "LICENSES/shadcn-MIT.txt",
    "proto/protoform/conformance/v1/aip.proto",
    "THIRD_PARTY_NOTICES.md",
  ];
  const checks = await Promise.allSettled(expected.map((relativePath) => access(join(fixture, relativePath))));
  for (const [index, check] of checks.entries()) {
    if (check.status === "rejected") {
      throw new Error(`Expected shadcn to install ${expected[index]}`, {
        cause: check.reason,
      });
    }
  }
  const notices = [
    ["LICENSES/protoform-MIT.txt", "LICENSE"],
    ["LICENSES/Apache-2.0.txt", "LICENSES/Apache-2.0.txt"],
    ["LICENSES/shadcn-MIT.txt", "LICENSES/shadcn-MIT.txt"],
    ["THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"],
  ] as const;
  await Promise.all(
    notices.map(async ([installedPath, repositoryPath]) => {
      const [installedNotice, repositoryNotice] = await Promise.all([
        readFile(join(fixture, installedPath), "utf8"),
        readFile(join(root, repositoryPath), "utf8"),
      ]);
      if (installedNotice !== repositoryNotice) {
        throw new Error(`Installed notice does not match ${repositoryPath}`);
      }
    })
  );
  await writeFile(
    join(fixture, "consumer-smoke.tsx"),
    [
      "import { AutoForm, defaultRegistry, type AutoFormProps, type FieldTypes } from './components/auto-form';",
      "import { AutoForm as ReactHookFormV8AutoForm } from './components/auto-form-react-hook-form-v8';",
      "import { AutoForm as TanStackAutoForm } from './components/auto-form-tanstack';",
      "import { AutoForm as TanStackV2AutoForm } from './components/auto-form-tanstack-v2';",
      "import { BookstoreDemo } from './components/protoform-bookstore/bookstore-demo';",
      "import { createLibraryService } from './components/protoform-bookstore/library-service';",
      "import { BookSchema } from './components/protoform-examples/runtime/gen/protoform/conformance/v1/aip_pb';",
      "import { useProtoForm } from './hooks/use-proto-form';",
      "import { useProtoForm as useProtoFormV8 } from './hooks/use-proto-form-v8';",
      "import { useProtoForm as useProtoFormV2 } from './hooks/use-proto-form-tanstack-v2';",
      "import type { SchemaProvider } from './lib/core';",
      "import { createProtoFormSchema } from './lib/protobuf-provider';",
      "",
      "const CodeField = () => <div>Code</div>;",
      "const schema: SchemaProvider<{ code: string }> = {",
      "  getDefaultValues: () => ({ code: '' }),",
      "  parseSchema: () => ({ fields: [{ key: 'code', required: true, type: 'string' }] }),",
      "  validateSchema: (values) => ({ data: values, success: true }),",
      "};",
      "const registry = defaultRegistry.clone().register({",
      "  component: CodeField,",
      "  match: (field) => field.key === 'code',",
      "  name: 'code',",
      "  priority: 100,",
      "});",
      "const classifyCustomField: NonNullable<AutoFormProps<{ code: string }, 'code'>['classifyField']> =",
      "  (field) => field.fieldConfig?.fieldType === 'code' ? 'simple' : 'advanced';",
      "const customForm = (",
      "  <AutoForm",
      "    fieldConfig={{ code: { fieldType: 'code' } }}",
      "    fieldRegistry={registry}",
      "    formComponents={{ code: CodeField }}",
      "    classifyField={classifyCustomField}",
      "    schema={schema}",
      "  />",
      ");",
      "const customTanStackForm = (",
      "  <TanStackAutoForm",
      "    fieldConfig={{ code: { fieldType: 'code' } }}",
      "    fieldRegistry={registry}",
      "    formComponents={{ code: CodeField }}",
      "    schema={schema}",
      "  />",
      ");",
      "const customReactHookFormV8 = (",
      "  <ReactHookFormV8AutoForm",
      "    fieldConfig={{ code: { fieldType: 'code' } }}",
      "    fieldRegistry={registry}",
      "    formComponents={{ code: CodeField }}",
      "    schema={schema}",
      "  />",
      ");",
      "const customTanStackV2Form = (",
      "  <TanStackV2AutoForm",
      "    fieldConfig={{ code: { fieldType: 'code' } }}",
      "    fieldRegistry={registry}",
      "    formComponents={{ code: CodeField }}",
      "    formOptions={{ validators: [{ run: () => undefined, triggers: [] }] }}",
      "    schema={schema}",
      "  />",
      ");",
      "function TanStackV2HookSmoke() {",
      "  const form = useProtoFormV2(BookSchema, {",
      "    defaultValues: { displayName: '', isbn: '', note: '' },",
      "    validators: [{ run: () => undefined, triggers: [] }],",
      "  });",
      "  return <form.Field name='displayName'>{(field) => <input onChange={(event) => field.handleChange(event.target.value)} value={String(field.value)} />}</form.Field>;",
      "}",
      "const builtInFieldType: FieldTypes = 'textarea';",
      "",
      "void AutoForm;",
      "void ReactHookFormV8AutoForm;",
      "void TanStackAutoForm;",
      "void TanStackV2AutoForm;",
      "void TanStackV2HookSmoke;",
      "void BookstoreDemo;",
      "void createLibraryService;",
      "void useProtoForm;",
      "void useProtoFormV8;",
      "void createProtoFormSchema;",
      "void customForm;",
      "void customReactHookFormV8;",
      "void customTanStackForm;",
      "void customTanStackV2Form;",
      "void builtInFieldType;",
      "",
    ].join("\n")
  );
}

async function assertCoreInstalled() {
  const expected = [
    "hooks/use-proto-form/index.ts",
    "lib/core/index.ts",
    "lib/protobuf-provider/descriptor-utils.ts",
    "lib/protobuf-provider/form-schema.ts",
    "lib/protobuf-provider/hook-runtime.ts",
  ];
  const unexpected = [
    "components/auto-form/index.tsx",
    "lib/protobuf-provider/aip-client-workflow.ts",
    "lib/protobuf-provider/aip.ts",
    "lib/protobuf-provider/annotations.ts",
    "lib/protobuf-provider/gen/auto-form-example_pb.ts",
    "lib/protobuf-provider/gen/buf/validate/validate_pb.ts",
    "lib/protobuf-provider/gen/protoform/v1/auto_form_ui_pb.ts",
    "lib/protobuf-provider/index.ts",
    "lib/protobuf-provider/provider.ts",
    "lib/protobuf-provider/ui-options.ts",
  ];

  await Promise.all(expected.map((relativePath) => access(join(coreFixture, relativePath))));
  const unexpectedChecks = await Promise.allSettled(
    unexpected.map((relativePath) => access(join(coreFixture, relativePath)))
  );
  for (const [index, check] of unexpectedChecks.entries()) {
    if (check.status === "fulfilled") {
      throw new Error(`Core-only shadcn install unexpectedly copied ${unexpected[index]}`);
    }
  }

  await writeFile(
    join(coreFixture, "consumer-smoke.ts"),
    ["import { useProtoForm } from './hooks/use-proto-form';", "", "void useProtoForm;", ""].join("\n")
  );
}

await createFixture();
await rm(coreFixture, { force: true, recursive: true });
await cp(fixture, coreFixture, { recursive: true });
const server = await servePublic();
try {
  await $`bun install --cwd ${coreFixture}`;
  await $`bunx shadcn@latest add @protoform/protoform-core --cwd ${coreFixture} --yes --overwrite`;
  await assertCoreInstalled();
  await $`bun run --cwd ${coreFixture} typecheck`;
  console.log(`Core-only consumer fixture passed: ${coreFixture}`);

  await $`bun install --cwd ${fixture}`;
  await $`bunx shadcn@latest add @protoform/bookstore --cwd ${fixture} --yes --overwrite`;
  await $`bunx shadcn@latest add @protoform/auto-form-react-hook-form-v8 --cwd ${fixture} --yes --overwrite`;
  await $`bunx shadcn@latest add @protoform/auto-form-tanstack --cwd ${fixture} --yes --overwrite`;
  await $`bunx shadcn@latest add @protoform/auto-form-tanstack-v2 --cwd ${fixture} --yes --overwrite`;
  await assertInstalled();
  await $`bun run --cwd ${fixture} typecheck`;
  console.log(`Registry-only consumer fixture passed: ${fixture}`);
} finally {
  await new Promise<void>((resolveClose, rejectClose) => {
    server.close((error) => (error ? rejectClose(error) : resolveClose()));
  });
}
