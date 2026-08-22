import { expect } from "@rstest/core";

import { BareBonesFormSchema } from "../gen/protoform/examples/v1/bare_bones_pb.js";
import { TwoStepFormSchema } from "../gen/protoform/examples/v1/two_step_pb.js";

test("keeps the bare-bones contract to one string field", () => {
  expect(
    BareBonesFormSchema.fields.map((field) => ({
      kind: field.fieldKind,
      name: field.name,
      scalar: field.scalar,
    }))
  ).toEqual([{ kind: "scalar", name: "name", scalar: 9 }]);
});

test("assigns one simple field to each step", () => {
  expect(TwoStepFormSchema.fields.map((field) => field.name)).toEqual(["name", "email"]);
});
