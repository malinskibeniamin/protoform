import { describe, expect } from "@rstest/core";
import {
  MaskableProfileSchema,
  SubmitComplexFormRequestSchema,
} from "../../../../../examples/gen/protoform/examples/v1/forms_pb.js";
import { createFieldMask, createUpdateMask, dirtyFieldsFromValues } from "./field-mask.js";
import { AutoFormExampleSchema } from "./gen/auto-form-example_pb.js";

describe("createFieldMask", () => {
  test("normalizes and minimizes explicit read-mask paths and collapses a wildcard", () => {
    const mask = createFieldMask(AutoFormExampleSchema, [
      "previousAddresses.city",
      "shippingAddress.postalCode",
      "primaryEmail",
      "shippingAddress",
    ]);

    expect(mask.paths).toEqual(["primary_email", "shipping_address", "previous_addresses"]);
    expect(createFieldMask(AutoFormExampleSchema, ["primaryEmail", "*"]).paths).toEqual(["*"]);
  });
});

describe("createUpdateMask", () => {
  test("includes only dirty, client-owned protobuf fields and collapses collections", () => {
    const mask = createUpdateMask(
      AutoFormExampleSchema,
      {
        "*": true,
        labels: { owner: true },
        preferredContact: { case: true, value: true },
        previousAddresses: [{ city: true }],
        primaryEmail: true,
        shippingAddress: { postalCode: true },
        unknownField: true,
      },
      {
        preferredContact: {
          case: "preferredPhone",
          value: "+48123456789",
        },
      }
    );

    expect(mask.paths).toEqual([
      "primary_email",
      "shipping_address.postal_code",
      "previous_addresses",
      "labels",
      "preferred_phone",
    ]);

    const maskWithAipFields = createUpdateMask(
      MaskableProfileSchema,
      {
        displayName: true,
        homeRegion: true,
        lifecycleState: true,
        name: true,
      },
      {
        displayName: "New name",
        homeRegion: "eu-central1",
        lifecycleState: "ACTIVE",
        name: "profiles/123",
      }
    );

    expect(maskWithAipFields.paths).toEqual(["display_name"]);
  });

  test("masks the cleared initial oneof branch and nested dirty leaves in the active branch", () => {
    const mask = createUpdateMask(
      AutoFormExampleSchema,
      { preferredContact: { case: true, value: true } },
      { preferredContact: { case: undefined } },
      {
        preferredContact: {
          case: "preferredEmail",
          value: "owner@example.com",
        },
      }
    );

    expect(mask.paths).toEqual(["preferred_email"]);

    const nestedMask = createUpdateMask(
      SubmitComplexFormRequestSchema,
      { credentials: { value: { apiKey: true } } },
      {
        credentials: {
          case: "apiKey",
          value: { apiKey: "secret-reference" },
        },
      }
    );

    expect(nestedMask.paths).toEqual(["api_key.api_key"]);
  });
});

describe("dirtyFieldsFromValues", () => {
  test("builds a nested dirty tree, collapses changed collections, and ignores equal values", () => {
    expect(
      dirtyFieldsFromValues(
        {
          profile: { city: "Warsaw", name: "Ada" },
          tags: ["forms", "protobuf"],
          username: "ada",
        },
        {
          profile: { city: "Krakow", name: "Ada" },
          tags: ["forms"],
          username: "ada",
        }
      )
    ).toEqual({
      profile: { city: true },
      tags: true,
    });
    expect(
      dirtyFieldsFromValues(
        { profile: { name: "Ada" }, tags: ["forms"] },
        { profile: { name: "Ada" }, tags: ["forms"] }
      )
    ).toEqual({});
  });
});
