import { create, createFileRegistry, type DescMessage } from "@bufbuild/protobuf";
import {
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FileDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";

import { formValuesToProtoInit } from "./provider.js";

function createConversionFixture(): DescMessage {
  const file = create(FileDescriptorProtoSchema, {
    enumType: [
      {
        name: "State",
        value: [
          { name: "STATE_UNSPECIFIED", number: 0 },
          { name: "STATE_READY", number: 1 },
        ],
      },
    ],
    messageType: [
      {
        field: [
          {
            jsonName: "labels",
            label: FieldDescriptorProto_Label.REPEATED,
            name: "labels",
            number: 1,
            type: FieldDescriptorProto_Type.STRING,
          },
        ],
        name: "Nested",
      },
      {
        field: [
          {
            jsonName: "labels",
            label: FieldDescriptorProto_Label.REPEATED,
            name: "labels",
            number: 1,
            type: FieldDescriptorProto_Type.STRING,
          },
          {
            jsonName: "numbers",
            label: FieldDescriptorProto_Label.REPEATED,
            name: "numbers",
            number: 2,
            type: FieldDescriptorProto_Type.INT32,
          },
          {
            jsonName: "payloads",
            label: FieldDescriptorProto_Label.REPEATED,
            name: "payloads",
            number: 3,
            type: FieldDescriptorProto_Type.BYTES,
          },
          {
            jsonName: "states",
            label: FieldDescriptorProto_Label.REPEATED,
            name: "states",
            number: 4,
            type: FieldDescriptorProto_Type.ENUM,
            typeName: ".test.State",
          },
          {
            jsonName: "children",
            label: FieldDescriptorProto_Label.REPEATED,
            name: "children",
            number: 5,
            type: FieldDescriptorProto_Type.MESSAGE,
            typeName: ".test.Nested",
          },
          {
            jsonName: "nested",
            label: FieldDescriptorProto_Label.OPTIONAL,
            name: "nested",
            number: 6,
            type: FieldDescriptorProto_Type.MESSAGE,
            typeName: ".test.Nested",
          },
          {
            jsonName: "nestedChoice",
            label: FieldDescriptorProto_Label.OPTIONAL,
            name: "nested_choice",
            number: 7,
            oneofIndex: 0,
            type: FieldDescriptorProto_Type.MESSAGE,
            typeName: ".test.Nested",
          },
        ],
        name: "Root",
        oneofDecl: [{ name: "choice" }],
      },
    ],
    name: "conversion_fixture.proto",
    package: "test",
    syntax: "proto3",
  });
  const descriptor = createFileRegistry(file, () => undefined).getMessage("test.Root");
  if (!descriptor) {
    throw new Error("Expected the conversion fixture descriptor.");
  }
  return descriptor;
}

const ConversionFixtureSchema = createConversionFixture();

describe("empty repeated string conversion", () => {
  it("discards empty and whitespace-only strings by default without changing other list types", () => {
    const converted = formValuesToProtoInit(ConversionFixtureSchema, {
      children: [{ labels: [""] }, { labels: ["child"] }],
      labels: ["foo", "", "   ", "bar"],
      numbers: [0, 2],
      payloads: ["", "AQ=="],
      states: [0, 1],
    }) as Record<string, unknown>;

    expect(converted["labels"]).toEqual(["foo", "bar"]);
    expect(converted["numbers"]).toEqual([0, 2]);
    expect(converted["payloads"]).toEqual([new Uint8Array(), new Uint8Array([1])]);
    expect(converted["states"]).toEqual([0, 1]);
    expect(converted["children"]).toEqual([{ labels: [] }, { labels: ["child"] }]);
  });

  it("preserves empty strings for configured root, nested, and oneof-message fields", () => {
    const converted = formValuesToProtoInit(
      ConversionFixtureSchema,
      {
        choice: {
          case: "nestedChoice",
          value: { labels: ["oneof", "", "   "] },
        },
        labels: ["root", "", "   "],
        nested: { labels: ["nested", "", "   "] },
      },
      {
        emptyRepeatedStringPolicies: {
          "choice.nestedChoice.labels": "preserve",
          labels: "preserve",
          "nested.labels": "preserve",
        },
      }
    ) as Record<string, unknown>;

    expect(converted["labels"]).toEqual(["root", "", "   "]);
    expect(converted["nested"]).toEqual({ labels: ["nested", "", "   "] });
    expect(converted["choice"]).toEqual({
      case: "nestedChoice",
      value: { labels: ["oneof", "", "   "] },
    });
  });
});
