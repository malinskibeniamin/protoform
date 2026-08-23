import { create, createFileRegistry, type DescMessage, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FileDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import { describe, expect } from "@rstest/core";

import { formValuesToProto, protoToFormValues } from "./provider.js";

function createPreservationFixture(): {
  nested: DescMessage;
  root: DescMessage;
} {
  const file = create(FileDescriptorProtoSchema, {
    messageType: [
      {
        field: [
          {
            jsonName: "label",
            label: FieldDescriptorProto_Label.OPTIONAL,
            name: "label",
            number: 1,
            type: FieldDescriptorProto_Type.STRING,
          },
        ],
        name: "Nested",
      },
      {
        field: [
          {
            jsonName: "key",
            label: FieldDescriptorProto_Label.OPTIONAL,
            name: "key",
            number: 1,
            type: FieldDescriptorProto_Type.STRING,
          },
          {
            jsonName: "value",
            label: FieldDescriptorProto_Label.OPTIONAL,
            name: "value",
            number: 2,
            type: FieldDescriptorProto_Type.MESSAGE,
            typeName: ".test.Nested",
          },
        ],
        name: "NestedByKeyEntry",
        options: { mapEntry: true },
      },
      {
        field: [
          {
            jsonName: "nested",
            label: FieldDescriptorProto_Label.OPTIONAL,
            name: "nested",
            number: 1,
            type: FieldDescriptorProto_Type.MESSAGE,
            typeName: ".test.Nested",
          },
          {
            jsonName: "children",
            label: FieldDescriptorProto_Label.REPEATED,
            name: "children",
            number: 2,
            type: FieldDescriptorProto_Type.MESSAGE,
            typeName: ".test.Nested",
          },
          {
            jsonName: "nestedByKey",
            label: FieldDescriptorProto_Label.REPEATED,
            name: "nested_by_key",
            number: 3,
            type: FieldDescriptorProto_Type.MESSAGE,
            typeName: ".test.NestedByKeyEntry",
          },
          {
            jsonName: "nestedChoice",
            label: FieldDescriptorProto_Label.OPTIONAL,
            name: "nested_choice",
            number: 4,
            oneofIndex: 0,
            type: FieldDescriptorProto_Type.MESSAGE,
            typeName: ".test.Nested",
          },
          {
            jsonName: "textChoice",
            label: FieldDescriptorProto_Label.OPTIONAL,
            name: "text_choice",
            number: 5,
            oneofIndex: 0,
            type: FieldDescriptorProto_Type.STRING,
          },
        ],
        name: "Root",
        oneofDecl: [{ name: "choice" }],
      },
    ],
    name: "source_preservation.proto",
    package: "test",
    syntax: "proto3",
  });
  const registry = createFileRegistry(file, () => undefined);
  const nested = registry.getMessage("test.Nested");
  const root = registry.getMessage("test.Root");
  if (!(nested && root)) {
    throw new Error("Expected preservation fixture descriptors.");
  }
  return { nested, root };
}

const { nested: NestedSchema, root: RootSchema } = createPreservationFixture();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Expected ${label} to be an object.`);
  }
  return value;
}

function requireArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${label} to be an array.`);
  }
  return value;
}

function requireElement<T>(values: readonly T[], index: number, label: string): T {
  const value = values[index];
  if (value === undefined) {
    throw new Error(`Expected ${label} at index ${index}.`);
  }
  return value;
}

function unknownFields(value: unknown, label: string): unknown {
  return requireRecord(value, label)["$unknown"];
}

function unknownBytes(marker: number): number[] {
  return [0x98, 0x06, marker];
}

function nestedWithUnknown(label: string, marker: number) {
  const known = toBinary(NestedSchema, create(NestedSchema, { label }));
  return fromBinary(NestedSchema, Uint8Array.from([...known, ...unknownBytes(marker)]));
}

function sourceMessage() {
  const known = create(RootSchema, {
    children: [nestedWithUnknown("first", 2), nestedWithUnknown("second", 3)],
    choice: {
      case: "nestedChoice",
      value: nestedWithUnknown("choice", 6),
    },
    nested: nestedWithUnknown("nested", 1),
    nestedByKey: {
      first: nestedWithUnknown("map first", 4),
      second: nestedWithUnknown("map second", 5),
    },
  });
  return fromBinary(RootSchema, Uint8Array.from([...toBinary(RootSchema, known), ...unknownBytes(7)]));
}

describe("source-message preservation", () => {
  test("preserves unknown fields on every surviving message node", () => {
    const source = sourceMessage();
    const sourceRecord = requireRecord(source, "source message");
    const sourceChildren = requireArray(sourceRecord["children"], "source children");
    const sourceMap = requireRecord(sourceRecord["nestedByKey"], "source map");
    const sourceChoice = requireRecord(sourceRecord["choice"], "source choice");
    const values = protoToFormValues(RootSchema, source);
    const children = values["children"] as Record<string, unknown>[];
    const entries = values["nestedByKey"] as Array<{
      key: string;
      value: Record<string, unknown>;
    }>;
    const choice = values["choice"] as {
      case: string;
      value: Record<string, unknown>;
    };

    requireRecord(values["nested"], "nested form value")["label"] = "edited nested";
    requireElement(children, 0, "child form value")["label"] = "edited first";
    requireElement(entries, 0, "map form entry").value["label"] = "edited map first";
    choice.value["label"] = "edited choice";

    const edited = formValuesToProto(RootSchema, values, source) as Record<string, unknown>;
    const editedChildren = edited["children"] as Array<{
      $unknown?: unknown;
    }>;
    const editedMap = edited["nestedByKey"] as Record<string, { $unknown?: unknown }>;
    const editedChoice = edited["choice"] as {
      case: string;
      value: { $unknown?: unknown };
    };

    expect(edited["$unknown"]).toEqual(source.$unknown);
    expect(unknownFields(edited["nested"], "edited nested message")).toEqual(
      unknownFields(sourceRecord["nested"], "source nested message")
    );
    expect(unknownFields(requireElement(editedChildren, 0, "edited child"), "edited child")).toEqual(
      unknownFields(requireElement(sourceChildren, 0, "source child"), "source child")
    );
    expect(unknownFields(editedMap["first"], "edited first map value")).toEqual(
      unknownFields(sourceMap["first"], "source first map value")
    );
    expect(unknownFields(editedChoice.value, "edited choice value")).toEqual(
      unknownFields(sourceChoice["value"], "source choice value")
    );
  });

  test("does not resurrect unknown fields from removed messages or changed oneofs", () => {
    const source = sourceMessage();
    const sourceRecord = requireRecord(source, "source message");
    const sourceChildren = requireArray(sourceRecord["children"], "source children");
    const sourceMap = requireRecord(sourceRecord["nestedByKey"], "source map");
    const values = protoToFormValues(RootSchema, source);
    const children = values["children"] as Record<string, unknown>[];
    const entries = values["nestedByKey"] as Array<{
      key: string;
      value: Record<string, unknown>;
    }>;

    values["nested"] = undefined;
    values["children"] = [requireElement(children, 1, "second child form value")];
    values["nestedByKey"] = entries.filter((entry) => entry.key === "second");
    values["choice"] = { case: "textChoice", value: "replacement" };

    const edited = formValuesToProto(RootSchema, values, source) as Record<string, unknown>;
    const editedChildren = edited["children"] as Array<{
      $unknown?: unknown;
    }>;
    const editedMap = edited["nestedByKey"] as Record<string, { $unknown?: unknown }>;

    expect(edited["nested"]).toBeUndefined();
    expect(editedChildren).toHaveLength(1);
    expect(unknownFields(requireElement(editedChildren, 0, "edited child"), "edited child")).toEqual(
      unknownFields(requireElement(sourceChildren, 1, "second source child"), "second source child")
    );
    expect(editedMap).not.toHaveProperty("first");
    expect(unknownFields(editedMap["second"], "edited second map value")).toEqual(
      unknownFields(sourceMap["second"], "source second map value")
    );
    expect(edited["choice"]).toEqual({ case: "textChoice", value: "replacement" });
  });
});
