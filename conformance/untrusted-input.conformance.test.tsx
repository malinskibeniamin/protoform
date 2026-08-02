import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SchemaProvider } from "../registry/base-nova/protoform/components/auto-form/core-types.js";
import { AutoForm } from "../registry/base-nova/protoform/components/auto-form/index.js";
import { protoPathToFormPath } from "../registry/base-nova/protoform/hooks/use-proto-form/index.js";
import { AutoFormExampleSchema } from "../registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb.js";
import {
  createProtoFormSchema,
  isProtoMessageDescriptor,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";

describe("untrusted input hardening", () => {
  it("rejects malformed descriptors, conversion values, and server paths without throwing", async () => {
    for (const candidate of [
      null,
      [],
      {},
      { fields: null },
      { kind: "message" },
      Object.create(null),
    ]) {
      expect(isProtoMessageDescriptor(candidate)).toBe(false);
    }

    const schema = createProtoFormSchema(AutoFormExampleSchema);
    await Promise.all(
      [
        null,
        [],
        "not-an-object",
        { avatarBytes: "%%%" },
        { createdAt: "not-a-date" },
        { labels: { key: "wrong-shape" } },
        { reminderInterval: "forever" },
        { writablePaths: ["", "__proto__", "[999999999]"] },
      ].map((value) =>
        expect(
          Promise.resolve(schema["~standard"].validate(value))
        ).resolves.toHaveProperty("issues")
      )
    );

    for (const path of [
      "",
      "__proto__.polluted",
      "constructor.prototype.polluted",
      "shipping_address[-1]",
      "shipping_address[999999999999999999999]",
      "shipping_address.<script>",
    ]) {
      expect(protoPathToFormPath(AutoFormExampleSchema, path)).toBeNull();
    }
    expect({}).not.toHaveProperty("polluted");
  });

  it("renders user-controlled error text as text rather than executable HTML", async () => {
    const hostileText =
      '<img src=x onerror="globalThis.polluted=true"> submission failed';
    const provider: SchemaProvider = {
      getDefaultValues: () => ({ value: "safe" }),
      parseSchema: () => ({
        fields: [{ key: "value", label: "Value", type: "string" }],
      }),
      validateSchema: (values) => ({ data: values, success: true }),
    };
    const submitHostileText = () => {
      throw new Error(hostileText);
    };
    const view = render(
      <AutoForm onSubmit={submitHostileText} schema={provider} withSubmit />
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(screen.getByText(hostileText)).toBeInTheDocument()
    );
    expect(view.container.querySelector("img")).toBeNull();
    expect(globalThis).not.toHaveProperty("polluted");
  });
});
