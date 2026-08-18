import { type DescMessage, isMessage, type MessageShape } from "@bufbuild/protobuf";
import { getFieldHints } from "../../../lib/core";

import type { ParsedField } from "../../../lib/form-types";
import { type ProtoMapFormEntry, protoToFormValues } from "../../../lib/protobuf-provider";

export {
  protoFormValuesToPayload,
  protoPayloadToFormValues,
  protoToFormValues,
} from "../../../lib/protobuf-provider";

export function getProtoJsonSchema(field: ParsedField): Record<string, unknown> {
  const hints = getFieldHints(field);

  switch (hints?.jsonKind) {
    case "listValue":
      return { type: "array" };
    case "any":
      return {
        properties: {
          typeUrl: { title: "Type URL", type: "string" },
          valueBase64: { title: "Base64 Payload", type: "string" },
        },
        type: "object",
      };
    default:
      return { type: "object" };
  }
}

export function isProtoMapEntries(value: unknown): value is ProtoMapFormEntry[] {
  return Array.isArray(value);
}

function isProtoMessageShape(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && "$typeName" in (value as Record<string, unknown>));
}

export function resolveProtoSourceMessage<Desc extends DescMessage>(
  desc: Desc,
  ...candidates: unknown[]
): MessageShape<Desc> | undefined {
  return candidates.find((candidate): candidate is MessageShape<Desc> => isMessage(candidate, desc));
}

export function normalizeProtoInitialValues(
  desc: DescMessage,
  values?: Partial<Record<string, unknown>>
): Record<string, unknown> | undefined {
  if (!values) {
    return;
  }

  if (isProtoMessageShape(values)) {
    return protoToFormValues(desc, values as never);
  }

  return values as Record<string, unknown>;
}
