import {
  create,
  createFileRegistry,
  type DescMessage,
} from "@bufbuild/protobuf";
import {
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FileDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";

export function createPerformanceDescriptor(fieldCount: number): DescMessage {
  const suffix = String(fieldCount);
  const file = create(FileDescriptorProtoSchema, {
    messageType: [
      {
        field: Array.from({ length: fieldCount }, (_, index) => ({
          jsonName: `field${index + 1}`,
          label: FieldDescriptorProto_Label.OPTIONAL,
          name: `field_${index + 1}`,
          number: index + 1,
          type: FieldDescriptorProto_Type.STRING,
        })),
        name: `Form${suffix}`,
      },
    ],
    name: `protoform/performance/form_${suffix}.proto`,
    package: "protoform.performance",
    syntax: "proto3",
  });
  const descriptor = createFileRegistry(file, () => undefined).getMessage(
    `protoform.performance.Form${suffix}`
  );
  if (!descriptor) {
    throw new Error(
      `Failed to create ${fieldCount}-field performance descriptor.`
    );
  }
  return descriptor;
}
