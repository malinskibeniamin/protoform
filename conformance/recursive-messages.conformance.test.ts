// @vitest-environment node

import { describe, expect, it } from "vitest";

import { parseProtoSchema } from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import { RecursiveLeftSchema, RecursiveNodeSchema } from "./gen/protoform/conformance/v1/conformance_pb.js";

describe("recursive protobuf descriptor conformance", () => {
  it("bounds self-referential message and repeated-message expansion with a JSON leaf", () => {
    const parsed = parseProtoSchema(RecursiveNodeSchema);
    const child = parsed.fields.find((field) => field.key === "child");
    const children = parsed.fields.find((field) => field.key === "children");

    expect(child).toMatchObject({ key: "child", type: "json" });
    expect(children).toMatchObject({
      key: "children",
      schema: [{ key: "value", type: "json" }],
      type: "array",
    });
  });

  it("bounds mutually recursive descriptors after one discoverable object level", () => {
    const parsed = parseProtoSchema(RecursiveLeftSchema);
    const right = parsed.fields.find((field) => field.key === "right");
    const left = right?.schema?.find((field) => field.key === "left");

    expect(right).toMatchObject({ key: "right", type: "object" });
    expect(left).toMatchObject({ key: "left", type: "json" });
  });
});
