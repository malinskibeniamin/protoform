import {
  create,
  createFileRegistry,
  type DescMessage,
  fromBinary,
  toBinary,
} from "@bufbuild/protobuf";
import {
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FileDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";

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

function unknownBytes(marker: number): number[] {
  return [0x98, 0x06, marker];
}

function nestedWithUnknown(label: string, marker: number) {
  const known = toBinary(NestedSchema, create(NestedSchema, { label }));
  return fromBinary(
    NestedSchema,
    Uint8Array.from([...known, ...unknownBytes(marker)])
  );
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
  return fromBinary(
    RootSchema,
    Uint8Array.from([...toBinary(RootSchema, known), ...unknownBytes(7)])
  );
}

describe("source-message preservation", () => {
  it("preserves unknown fields on every surviving message node", () => {
    const source = sourceMessage();
    const values = protoToFormValues(RootSchema, source);
    const children = values.children as Record<string, unknown>[];
    const entries = values.nestedByKey as Array<{
      key: string;
      value: Record<string, unknown>;
    }>;
    const choice = values.choice as {
      case: string;
      value: Record<string, unknown>;
    };

    (values.nested as Record<string, unknown>).label = "edited nested";
    children[0].label = "edited first";
    entries[0].value.label = "edited map first";
    choice.value.label = "edited choice";

    const edited = formValuesToProto(RootSchema, values, source) as Record<
      string,
      unknown
    >;
    const editedChildren = edited.children as Array<{
      $unknown?: unknown;
    }>;
    const editedMap = edited.nestedByKey as Record<
      string,
      { $unknown?: unknown }
    >;
    const editedChoice = edited.choice as {
      case: string;
      value: { $unknown?: unknown };
    };

    expect(edited.$unknown).toEqual(source.$unknown);
    expect((edited.nested as { $unknown?: unknown }).$unknown).toEqual(
      source.nested.$unknown
    );
    expect(editedChildren[0].$unknown).toEqual(source.children[0].$unknown);
    expect(editedMap.first.$unknown).toEqual(
      source.nestedByKey.first.$unknown
    );
    expect(editedChoice.value.$unknown).toEqual(source.choice.value.$unknown);
  });

  it("does not resurrect unknown fields from removed messages or changed oneofs", () => {
    const source = sourceMessage();
    const values = protoToFormValues(RootSchema, source);
    const children = values.children as Record<string, unknown>[];
    const entries = values.nestedByKey as Array<{
      key: string;
      value: Record<string, unknown>;
    }>;

    values.nested = undefined;
    values.children = [children[1]];
    values.nestedByKey = entries.filter((entry) => entry.key === "second");
    values.choice = { case: "textChoice", value: "replacement" };

    const edited = formValuesToProto(RootSchema, values, source) as Record<
      string,
      unknown
    >;
    const editedChildren = edited.children as Array<{
      $unknown?: unknown;
    }>;
    const editedMap = edited.nestedByKey as Record<
      string,
      { $unknown?: unknown }
    >;

    expect(edited.nested).toBeUndefined();
    expect(editedChildren).toHaveLength(1);
    expect(editedChildren[0].$unknown).toEqual(source.children[1].$unknown);
    expect(editedMap).not.toHaveProperty("first");
    expect(editedMap.second.$unknown).toEqual(
      source.nestedByKey.second.$unknown
    );
    expect(edited.choice).toEqual({ case: "textChoice", value: "replacement" });
  });
});
