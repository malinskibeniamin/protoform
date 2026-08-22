import "@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations";

import { describe, expect } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AutoFormExampleSchema } from "@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb";
import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

if (!HTMLElement.prototype.hasPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
    value: () => false,
  });
}

if (!HTMLElement.prototype.setPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    value: () => undefined,
  });
}

if (!HTMLElement.prototype.releasePointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    value: () => undefined,
  });
}

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

describe("AutoForm – test IDs", () => {
  test("defaults the root test id prefix to autoform", () => {
    const schema = createMockProvider([{ key: "username", required: true, type: "string" }]);

    render(<AutoForm schema={schema} withSubmit />);

    expect(screen.getByTestId("autoform")).toBeInTheDocument();
    expect(screen.getByTestId("autoform-field-username")).toBeInTheDocument();
    expect(screen.getByTestId("autoform-field-username-control")).toBeInTheDocument();
  });

  test("emits stable field, help, and option test ids for zod forms", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: "username", required: true, type: "string" },
      {
        key: "provider",
        options: [
          ["aws", "Aws"],
          ["gcp", "Gcp"],
          ["azure", "Azure"],
        ],
        required: true,
        type: "select",
      },
      {
        key: "region",
        options: [
          ["us-east-1", "Us East 1"],
          ["us-west-2", "Us West 2"],
          ["eu-west-1", "Eu West 1"],
        ],
        required: true,
        type: "select",
      },
      {
        key: "channels",
        required: false,
        schema: [
          {
            key: "0",
            options: [
              ["email", "Email"],
              ["slack", "Slack"],
              ["pagerduty", "Pagerduty"],
            ],
            required: true,
            type: "select",
          },
        ],
        type: "array",
      },
    ]);

    render(
      <AutoForm
        defaultValues={{
          channels: ["email"],
          provider: "aws",
          region: "us-east-1",
          username: "registry-user",
        }}
        fieldConfig={{
          provider: {
            customData: {
              ui: {
                help: "Choose a provider.",
                optionGroups: [
                  {
                    label: "Cloud",
                    options: [
                      { label: "AWS", value: "aws" },
                      { label: "GCP", value: "gcp" },
                      { label: "Azure", value: "azure" },
                    ],
                  },
                ],
              },
            },
            description: "Used to scope cloud resources.",
          },
          region: {
            customData: {
              ui: {
                optionGroups: [
                  {
                    label: "AWS",
                    options: [
                      { label: "us-east-1", value: "us-east-1" },
                      { label: "us-west-2", value: "us-west-2" },
                    ],
                  },
                ],
              },
            },
            fieldType: "combobox",
          },
        }}
        schema={schema}
        testId="deploy-form"
        withSubmit
      />
    );

    expect(screen.getByTestId("deploy-form")).toBeInTheDocument();
    expect(screen.getByTestId("deploy-form-field-provider")).toBeInTheDocument();
    expect(screen.getByTestId("deploy-form-field-provider-help")).toBeInTheDocument();
    expect(screen.getByTestId("deploy-form-field-provider-description")).toBeInTheDocument();

    await user.click(screen.getByTestId("deploy-form-field-provider-control"));

    expect(await screen.findByTestId("deploy-form-field-provider-group-cloud")).toBeInTheDocument();
    expect(await screen.findByTestId("deploy-form-field-provider-option-aws")).toBeInTheDocument();

    await user.click(screen.getByTestId("deploy-form-field-region-control"));
    await user.clear(screen.getByTestId("deploy-form-field-region-control"));

    expect(await screen.findByTestId("deploy-form-field-region-group-aws")).toBeInTheDocument();
    expect(await screen.findByTestId("deploy-form-field-region-option-us-west-2")).toBeInTheDocument();

    await user.click(screen.getByTestId("deploy-form-field-channels-control"));
    await user.click(screen.getByTestId("deploy-form-field-channels-option-slack"));

    expect(screen.getByTestId("deploy-form-field-channels-selected-slack")).toBeInTheDocument();
  });

  test("emits stable ids for collections and modes", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: "accountName", required: true, type: "string" },
      {
        key: "tags",
        required: false,
        schema: [{ key: "0", required: true, type: "string" }],
        type: "array",
      },
      {
        key: "extraSettings",
        required: true,
        schema: [{ key: "retries", required: true, type: "number" }],
        type: "object",
      },
      { key: "targetRegion", required: true, type: "string" },
    ]);

    render(
      <AutoForm
        defaultValues={{
          accountName: "registry-ui",
          extraSettings: { retries: 2 },
          tags: ["primary"],
          targetRegion: "us-west-2",
        }}
        fieldConfig={{
          extraSettings: {
            fieldType: "json",
          },
        }}
        modes={["advanced", "json"]}
        schema={schema}
        showSummary
        testId="wizard-form"
        withSubmit
      />
    );

    expect(screen.getByTestId("wizard-form-summary")).toBeInTheDocument();
    expect(screen.getByTestId("wizard-form-field-account-name-control")).toBeInTheDocument();

    await user.click(screen.getByTestId("wizard-form-field-tags-add"));

    expect(screen.getByTestId("wizard-form-field-tags-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("wizard-form-field-tags-remove-1")).toBeInTheDocument();
    expect(screen.getByTestId("wizard-form-field-extra-settings-control")).toBeInTheDocument();

    await user.click(screen.getByTestId("wizard-form-tab-json"));

    expect(screen.getByTestId("wizard-form-panel-json")).toBeInTheDocument();
    expect(screen.getByTestId("wizard-form-json-editor")).toBeInTheDocument();
  });

  test("emits the same path-based ids for protobuf descriptors", () => {
    render(
      <AutoForm
        defaultValues={buildValidProtoDefaults()}
        schema={AutoFormExampleSchema}
        testId="proto-form"
        withSubmit
      />
    );

    expect(screen.getByTestId("proto-form-field-username-control")).toBeInTheDocument();
    expect(screen.getByTestId("proto-form-field-primary-email-control")).toBeInTheDocument();
    expect(screen.getByTestId("proto-form-field-preferred-contact-control")).toBeInTheDocument();
  });
});
