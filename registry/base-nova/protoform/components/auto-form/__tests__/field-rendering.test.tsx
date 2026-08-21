import { describe, expect, it } from "@rstest/core";
import { render, screen } from "@testing-library/react";

import "@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations";

import { AutoFormExampleSchema } from "@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb";
import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

const SWITCH_TO_FORM_BUTTON = /switch to form/i;

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
  it("groups root fields into section rows and anchors the submit action on the right", () => {
    const schema = createMockProvider([{ key: "name", required: true, type: "string" }]);

    render(<AutoForm schema={schema} withSubmit />);

    expect(screen.getByLabelText(/name/i).closest('[data-slot="auto-form-field-row"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Submit" }).parentElement).toHaveAttribute(
      "data-slot",
      "auto-form-actions"
    );
  });

  it("defaults bounded numeric fields to a slider plus number input", () => {
    const schema = createMockProvider([{ key: "latitude", required: true, type: "number" }]);

    render(
      <AutoForm
        defaultValues={{ latitude: 12 }}
        fieldConfig={{
          latitude: {
            inputProps: {
              max: 90,
              min: -90,
            },
          },
        }}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByRole("slider")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /latitude/i })).toBeInTheDocument();
  });

  it("drops redundant fallback helper copy", () => {
    render(<AutoForm defaultValues={buildValidProtoDefaults()} schema={AutoFormExampleSchema} withSubmit />);

    expect(screen.queryByText(/this field is required\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/use 2-40 characters\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/use 0-0 characters\./i)).not.toBeInTheDocument();
  });

  it("allows object fields to render with the JSONField via fieldType override", () => {
    const schema = createMockProvider([
      {
        key: "extraSettings",
        required: true,
        schema: [{ key: "retries", required: true, type: "number" }],
        type: "object",
      },
    ]);

    render(
      <AutoForm
        defaultValues={{
          extraSettings: {
            retries: 2,
          },
        }}
        fieldConfig={{
          extraSettings: {
            fieldType: "json",
          },
        }}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByRole("button", { name: SWITCH_TO_FORM_BUTTON })).toBeInTheDocument();
  });

  it("exposes the selected state on compact radio cards", () => {
    const schema = createMockProvider(
      [
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
      { environment: "production" }
    );

    render(<AutoForm schema={schema} />);

    const productionOption = screen.getByRole("radio", { name: "Production" });
    expect(productionOption.tagName).toBe("BUTTON");
    expect(productionOption.closest("label")).toBeNull();
    expect(productionOption).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("radio", { name: "Development" })).toHaveAttribute("data-selected", "false");
    expect(productionOption?.parentElement?.className).toContain("sm:grid-cols-2");
  });
});
