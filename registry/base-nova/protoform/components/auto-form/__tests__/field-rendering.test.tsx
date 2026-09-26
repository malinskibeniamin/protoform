import { describe, expect } from "@rstest/core";
import { render, screen } from "@testing-library/react";

import "@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations";

import { AutoFormExampleSchema } from "@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb";
import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

const SWITCH_TO_FORM_BUTTON = /switch to form/iu;

const buildValidProtoDefaults = () => ({
  accessTier: 3,
  age: 34,
  avatarBytes: "AQIDBA==",
  bio: "A protobuf-backed form with Buf reflection and Protovalidate.",
  createdAt: "2026-03-17T09:00",
  employeeNumber: "4001",
  homepageUrl: "https://protoform.com",
  labels: [{ key: "team", value: "frontend" }],
  maximumThreshold: 10,
  minimumThreshold: 5,
  officeLocations: [
    {
      key: "hq",
      value: {
        city: "San Francisco",
        country: 1,
        lineOne: "500 Harbor Way",
        postalCode: "94107",
        state: "CA",
      },
    },
  ],
  preferredContact: {
    case: "preferredEmail",
    value: "forms@protoform.com",
  },
  primaryEmail: "forms@protoform.com",
  reminderInterval: "300s",
  resourceId: "123e4567-e89b-12d3-a456-426614174000",
  shippingAddress: {
    city: "San Francisco",
    country: 1,
    lineOne: "500 Harbor Way",
    postalCode: "94107",
    state: "CA",
  },
  storageQuotaBytes: "4096",
  tags: ["forms"],
  username: "protoform_admin",
  writablePaths: ["profile"],
});

describe("AutoForm – field rendering", () => {
  test("selects built-in renderers and anchors root rows and the submit action", () => {
    const schema = createMockProvider(
      [
        { key: "name", required: true, type: "string" },
        { key: "latitude", required: true, type: "number" },
        {
          key: "extraSettings",
          required: true,
          schema: [{ key: "retries", required: true, type: "number" }],
          type: "object",
        },
        {
          key: "environment",
          options: [
            ["development", "Development"],
            ["staging", "Staging"],
            ["production", "Production"],
          ],
          required: true,
          type: "select",
        },
      ],
      { environment: "production", extraSettings: { retries: 2 }, latitude: 12 }
    );

    render(
      <AutoForm
        fieldConfig={{
          extraSettings: { fieldType: "json" },
          latitude: { inputProps: { max: 90, min: -90 } },
        }}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByRole("textbox", { name: /name/iu }).closest('[data-slot="auto-form-field-row"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Submit" }).parentElement).toHaveAttribute(
      "data-slot",
      "auto-form-actions"
    );
    // Bounded numeric fields default to a slider plus number input.
    expect(screen.getByRole("slider")).toBeVisible();
    expect(screen.getByRole("spinbutton", { name: /latitude/iu })).toBeVisible();
    // Object fields can render with the JSONField through a fieldType override.
    expect(screen.getByRole("button", { name: SWITCH_TO_FORM_BUTTON })).toBeVisible();
    // Small enums render as compact radio cards that expose the selected state.
    const productionOption = screen.getByRole("radio", { name: "Production" });
    expect(productionOption.tagName).toBe("BUTTON");
    expect(productionOption.closest("label")).toBeNull();
    expect(productionOption).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("radio", { name: "Development" })).toHaveAttribute("data-selected", "false");
    expect(productionOption?.parentElement?.className).toContain("sm:grid-cols-2");
  });

  test("drops redundant fallback helper copy", () => {
    render(<AutoForm defaultValues={buildValidProtoDefaults()} schema={AutoFormExampleSchema} withSubmit />);

    expect(screen.queryByText(/this field is required\./iu)).not.toBeInTheDocument();
    expect(screen.queryByText(/use 2-40 characters\./iu)).not.toBeInTheDocument();
    expect(screen.queryByText(/use 0-0 characters\./iu)).not.toBeInTheDocument();
  });
});
