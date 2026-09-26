import { describe, expect } from "@rstest/core";

import { shadcnAutoFormControls } from "../shadcn-controls";

describe("shadcn AutoForm coverage manifest", () => {
  test("keeps proto control annotations unique and explicit", () => {
    const controls = shadcnAutoFormControls.map((entry) => entry.control);
    expect(new Set(controls).size).toBe(controls.length);
    expect(shadcnAutoFormControls.every((entry) => entry.protoAnnotation.startsWith("CONTROL_TYPE_"))).toBe(true);
  });
});
