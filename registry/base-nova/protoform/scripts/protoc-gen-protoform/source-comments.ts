import type { DescMessage } from "@bufbuild/protobuf";
import { getComments } from "@bufbuild/protoplugin";

export interface ProtoAnnotationEntry {
  key: string;
  value: string;
}

function sourceFileMessages(message: DescMessage): DescMessage[] {
  const messages: DescMessage[] = [];
  const visited = new Set<string>();

  function visit(current: DescMessage): void {
    if (current.file !== message.file || visited.has(current.typeName)) {
      return;
    }
    visited.add(current.typeName);
    messages.push(current);

    for (const nested of current.nestedMessages) {
      visit(nested);
    }
    for (const field of current.fields) {
      if (field.fieldKind === "message") {
        visit(field.message);
      } else if (field.fieldKind === "list" && field.listKind === "message") {
        visit(field.message);
      } else if (field.fieldKind === "map" && field.mapKind === "message") {
        visit(field.message);
      }
    }
  }

  visit(message);
  return messages;
}

function sourceComment(desc: Parameters<typeof getComments>[0]): string | undefined {
  const comment = getComments(desc).leading?.trim();
  return comment || undefined;
}

export function getProtoAnnotationEntries(message: DescMessage): {
  fields: ProtoAnnotationEntry[];
  messages: ProtoAnnotationEntry[];
  oneofs: ProtoAnnotationEntry[];
} {
  const messages = sourceFileMessages(message);
  return {
    fields: messages.flatMap((nested) =>
      nested.fields.flatMap((field) => {
        const comment = sourceComment(field);
        return comment
          ? [
              {
                key: `${field.parent.typeName}.${field.localName}`,
                value: comment,
              },
            ]
          : [];
      })
    ),
    messages: messages.flatMap((nested) => {
      const comment = sourceComment(nested);
      return comment ? [{ key: nested.typeName, value: comment }] : [];
    }),
    oneofs: messages.flatMap((nested) =>
      nested.oneofs.flatMap((oneof) => {
        const comment = sourceComment(oneof);
        return comment
          ? [
              {
                key: `${oneof.parent.typeName}.${oneof.localName}`,
                value: comment,
              },
            ]
          : [];
      })
    ),
  };
}
