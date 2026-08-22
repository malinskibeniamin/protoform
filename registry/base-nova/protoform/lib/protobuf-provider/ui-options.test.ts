import { expect } from "@rstest/core";

import { ControlTypeSchema } from "./gen/auto_form_ui_pb.js";

test("control type value 18 remains available", () => {
  expect(ControlTypeSchema.proto.reservedRange).not.toContainEqual({
    $typeName: "google.protobuf.EnumDescriptorProto.EnumReservedRange",
    end: 18,
    start: 18,
  });
});
