import { describe, expect } from "@rstest/core";

import {
  AutoFormExampleSchema,
  AutoFormUiMetadataExampleSchema,
} from "../../lib/protobuf-provider/gen/auto-form-example_pb.js";

import { protoPathToFormPath } from "./proto-error-path.js";

describe("protoPathToFormPath", () => {
  test("maps scalar and nested message paths to camelCase and returns null for empty or unknown paths", () => {
    expect(protoPathToFormPath(AutoFormExampleSchema, "primary_email")).toBe("primaryEmail");
    expect(protoPathToFormPath(AutoFormExampleSchema, "homepage_url")).toBe("homepageUrl");
    expect(protoPathToFormPath(AutoFormExampleSchema, "resource_id")).toBe("resourceId");
    expect(protoPathToFormPath(AutoFormExampleSchema, "shipping_address.postal_code")).toBe(
      "shippingAddress.postalCode"
    );

    expect(protoPathToFormPath(AutoFormExampleSchema, "")).toBeNull();
    expect(protoPathToFormPath(AutoFormExampleSchema, "totally_made_up")).toBeNull();
    expect(protoPathToFormPath(AutoFormExampleSchema, "shipping_address.not_a_field")).toBeNull();
  });

  test("flattens oneof branches into {oneof.localName}.value and the group into {oneof.localName}", () => {
    expect(protoPathToFormPath(AutoFormExampleSchema, "preferred_email")).toBe("preferredContact.value");
    expect(protoPathToFormPath(AutoFormExampleSchema, "preferred_phone")).toBe("preferredContact.value");
    expect(protoPathToFormPath(AutoFormUiMetadataExampleSchema, "support_email")).toBe("supportContact.value");
    expect(protoPathToFormPath(AutoFormUiMetadataExampleSchema, "slack_channel")).toBe("supportContact.value");
    expect(protoPathToFormPath(AutoFormExampleSchema, "preferred_contact")).toBe("preferredContact");
    expect(protoPathToFormPath(AutoFormUiMetadataExampleSchema, "support_contact")).toBe("supportContact");
  });
});
