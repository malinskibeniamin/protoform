import type { DescMessage } from "@bufbuild/protobuf";
import {
  createEcmaScriptPlugin,
  type GeneratedFile,
  type Schema,
} from "@bufbuild/protoplugin";
import { generateMessageAnnotations } from "./generate-annotations.js";

const DEFAULT_RUNTIME_IMPORT = "@/lib/protobuf-provider";
export const pluginVersion = "1.0.0";

interface ProtoformPluginOptions {
  runtimeImport: string;
}

function parseOptions(
  rawOptions: { key: string; value: string }[]
): ProtoformPluginOptions {
  const runtimeImports = rawOptions.filter(
    (option) => option.key === "runtime_import"
  );
  if (runtimeImports.length > 1) {
    throw new Error("runtime_import can only be specified once");
  }
  const unknown = rawOptions.find(
    (option) => option.key !== "runtime_import"
  );
  if (unknown) {
    throw new Error(`unknown option ${unknown.key}`);
  }
  return {
    runtimeImport: runtimeImports[0]?.value || DEFAULT_RUNTIME_IMPORT,
  };
}

function generateMessageBinding(
  f: GeneratedFile,
  message: DescMessage,
  runtimeImport: string
): void {
  const createProtoFormSchema = f.import(
    "createProtoFormSchema",
    runtimeImport
  );
  const parseProtoSchema = f.import("parseProtoSchema", runtimeImport);
  const protoToFormValues = f.import("protoToFormValues", runtimeImport);
  const messageSchema = f.importSchema(message);
  const annotationsName = generateMessageAnnotations(
    f,
    message,
    runtimeImport
  );

  f.print(f.jsDoc(`Form binding for message ${message.typeName}.`));
  f.print(f.export("const", `${message.name}FormBinding`), " = {");
  f.print("  annotations: ", annotationsName, ",");
  f.print(
    "  createFormSchema: (options?: Parameters<typeof ",
    createProtoFormSchema,
    ">[1]) => ",
    createProtoFormSchema,
    "(",
    messageSchema,
    ", options),"
  );
  f.print(
    "  defaultValues: () => ",
    protoToFormValues,
    "(",
    messageSchema,
    "),"
  );
  f.print("  descriptor: ", messageSchema, ",");
  f.print("  parseSchema: () => ", parseProtoSchema, "(", messageSchema, "),");
  f.print("} as const;");
}

function generateTs(schema: Schema<ProtoformPluginOptions>): void {
  for (const file of schema.files) {
    if (file.messages.length === 0) {
      continue;
    }
    const f = schema.generateFile(`${file.name}_form.ts`);
    f.preamble(file);
    for (const [index, message] of file.messages.entries()) {
      if (index > 0) {
        f.print();
      }
      generateMessageBinding(f, message, schema.options.runtimeImport);
    }
  }
}

export const protocGenProtoform = createEcmaScriptPlugin({
  generateTs,
  name: "protoc-gen-protoform",
  parseOptions,
  version: `v${pluginVersion}`,
});
