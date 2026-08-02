import type { DescMessage } from "@bufbuild/protobuf";
import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  getProtoAnnotationEntries,
  type ProtoAnnotationEntry,
} from "./source-comments.js";

function printAnnotationMap(
  f: GeneratedFile,
  name: string,
  entries: readonly ProtoAnnotationEntry[]
): void {
  if (entries.length === 0) {
    return;
  }
  f.print(`  ${name}: {`);
  for (const entry of entries) {
    f.print("    ", f.string(entry.key), ": ", f.string(entry.value), ",");
  }
  f.print("  },");
}

export function generateMessageAnnotations(
  f: GeneratedFile,
  message: DescMessage,
  runtimeImport: string
): string {
  const registerProtoAnnotations = f.import(
    "registerProtoAnnotations",
    runtimeImport
  );
  const messageSchema = f.importSchema(message);
  const annotationsName = `${message.name}FormAnnotations`;
  const annotations = getProtoAnnotationEntries(message);

  f.print(f.jsDoc(`Source documentation for ${message.typeName}.`));
  f.print(f.export("const", annotationsName), " = {");
  printAnnotationMap(f, "fields", annotations.fields);
  printAnnotationMap(f, "messages", annotations.messages);
  printAnnotationMap(f, "oneofs", annotations.oneofs);
  f.print("} as const;");
  f.print(
    registerProtoAnnotations,
    "(",
    messageSchema,
    ", ",
    annotationsName,
    ");"
  );
  f.print();

  return annotationsName;
}
