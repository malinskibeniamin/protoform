import { describe, expect, it } from "vitest";
import {
  MaskableProfileSchema,
  SubmitComplexFormRequestSchema,
} from "../../../../../examples/gen/protoform/examples/v1/forms_pb.js";
import { AutoFormExampleSchema } from "./gen/auto-form-example_pb.js";

import { createFieldMask, createUpdateMask } from "./field-mask.js";

describe("createFieldMask", () => {
  it("normalizes and minimizes explicit read-mask paths", () => {
    const mask = createFieldMask(AutoFormExampleSchema, [
      "previousAddresses.city",
      "shippingAddress.postalCode",
      "primaryEmail",
      "shippingAddress",
    ]);

    expect(mask.paths).toEqual([
      "primary_email",
      "shipping_address",
      "previous_addresses",
    ]);
  });

  it("collapses an explicit wildcard to the full projection", () => {
    const mask = createFieldMask(AutoFormExampleSchema, ["primaryEmail", "*"]);

    expect(mask.paths).toEqual(["*"]);
  });
});

describe("createUpdateMask", () => {
  it("includes only dirty protobuf fields and collapses collections", () => {
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

  it("masks the initial oneof branch when an edit clears it", () => {
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

  it("keeps a nested dirty leaf inside the active oneof branch", () => {
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

  it("excludes AIP-owned fields from update masks", () => {
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
