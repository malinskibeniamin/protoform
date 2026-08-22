import { describe, expect } from "@rstest/core";
import {
  MaskableProfileSchema,
  SubmitComplexFormRequestSchema,
} from "../../../../../examples/gen/protoform/examples/v1/forms_pb.js";
import { createFieldMask, createUpdateMask, dirtyFieldsFromValues } from "./field-mask.js";
import { AutoFormExampleSchema } from "./gen/auto-form-example_pb.js";

describe("createFieldMask", () => {
  test("normalizes and minimizes explicit read-mask paths", () => {
    const mask = createFieldMask(AutoFormExampleSchema, [
      "previousAddresses.city",
      "shippingAddress.postalCode",
      "primaryEmail",
      "shippingAddress",
    ]);

    expect(mask.paths).toEqual(["primary_email", "shipping_address", "previous_addresses"]);
  });

  test("collapses an explicit wildcard to the full projection", () => {
    const mask = createFieldMask(AutoFormExampleSchema, ["primaryEmail", "*"]);

    expect(mask.paths).toEqual(["*"]);
  });
});

describe("createUpdateMask", () => {
  test("includes only dirty protobuf fields and collapses collections", () => {
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
  });

  test("masks the initial oneof branch when an edit clears it", () => {
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
  });

  test("keeps a nested dirty leaf inside the active oneof branch", () => {
    const mask = createUpdateMask(
      SubmitComplexFormRequestSchema,
      { credentials: { value: { apiKey: true } } },
      {
        credentials: {
          case: "apiKey",
          value: { apiKey: "secret-reference" },
        },
      }
    );

    expect(mask.paths).toEqual(["api_key.api_key"]);
  });

  test("excludes AIP-owned fields from update masks", () => {
    const mask = createUpdateMask(
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

    expect(mask.paths).toEqual(["display_name"]);
  });
});

describe("dirtyFieldsFromValues", () => {
  test("builds a nested dirty tree and collapses changed collections", () => {
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
  });

  test("returns an empty tree for deeply equal values", () => {
    expect(
      dirtyFieldsFromValues(
        { profile: { name: "Ada" }, tags: ["forms"] },
        { profile: { name: "Ada" }, tags: ["forms"] }
      )
    ).toEqual({});
  });
});
