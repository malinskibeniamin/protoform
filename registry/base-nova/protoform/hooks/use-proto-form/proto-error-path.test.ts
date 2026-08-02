import { describe, expect, test } from "vitest";

import {
  AutoFormExampleSchema,
  AutoFormUiMetadataExampleSchema,
} from "../../lib/protobuf-provider/gen/auto-form-example_pb.js";

import { protoPathToFormPath } from "./proto-error-path.js";

describe("protoPathToFormPath", () => {
  test("maps scalar field snake_case → camelCase", () => {
    expect(protoPathToFormPath(AutoFormExampleSchema, "primary_email")).toBe(
      "primaryEmail"
    );
    expect(protoPathToFormPath(AutoFormExampleSchema, "homepage_url")).toBe(
      "homepageUrl"
    );
    expect(protoPathToFormPath(AutoFormExampleSchema, "resource_id")).toBe(
      "resourceId"
    );
  });

  test("flattens a oneof branch into {oneof.localName}.value", () => {
    expect(protoPathToFormPath(AutoFormExampleSchema, "preferred_email")).toBe(
      "preferredContact.value"
    );
    expect(protoPathToFormPath(AutoFormExampleSchema, "preferred_phone")).toBe(
      "preferredContact.value"
    );
  });

  test("walks from a oneof branch into nested fields", () => {
    expect(
      protoPathToFormPath(AutoFormUiMetadataExampleSchema, "support_email")
    ).toBe("supportContact.value");
    expect(
      protoPathToFormPath(AutoFormUiMetadataExampleSchema, "slack_channel")
    ).toBe("supportContact.value");
  });

  test("error on oneof group itself resolves to {oneof.localName}", () => {
    expect(
      protoPathToFormPath(AutoFormExampleSchema, "preferred_contact")
    ).toBe("preferredContact");
    expect(
      protoPathToFormPath(AutoFormUiMetadataExampleSchema, "support_contact")
    ).toBe("supportContact");
  });

  test("returns null for unknown segment", () => {
    expect(
      protoPathToFormPath(AutoFormExampleSchema, "totally_made_up")
    ).toBeNull();
    expect(
      protoPathToFormPath(AutoFormExampleSchema, "shipping_address.not_a_field")
    ).toBeNull();
  });

  test("returns null for empty input", () => {
    expect(protoPathToFormPath(AutoFormExampleSchema, "")).toBeNull();
  });

  test("walks nested message fields", () => {
    expect(
      protoPathToFormPath(AutoFormExampleSchema, "shipping_address.postal_code")
    ).toBe("shippingAddress.postalCode");
  });
});
