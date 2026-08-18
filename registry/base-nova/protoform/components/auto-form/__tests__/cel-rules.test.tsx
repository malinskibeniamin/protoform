import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import "@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations";

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

import { AutoFormUiMetadataExampleSchema } from "@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb";

import { AutoForm } from "..";

const buildProtoUiMetadataDefaults = () => ({
  approvalTicket: "OPS-142",
  clusterName: "scarlet-forest-dolphin",
  enableDryRun: true,
  enableSupportMode: false,
  provider: 1,
  region: "us-east-2",
  supportTier: 0,
});

describe("AutoForm – CEL rules", () => {
  it("supports proto UI CEL for field visibility and disabled state", async () => {
    const user = userEvent.setup();

    render(
      <AutoForm
        defaultValues={{
          ...buildProtoUiMetadataDefaults(),
          enableSupportMode: true,
          provider: 0,
          region: "",
        }}
        formOptions={{ mode: "all" }}
        schema={AutoFormUiMetadataExampleSchema}
        testId="proto-ui-fields-form"
        withSubmit
      />
    );

    const regionInput = screen.getByTestId("proto-ui-fields-form-field-region-control") as HTMLInputElement;
    const maintenanceDateInput = screen.getByTestId(
      "proto-ui-fields-form-field-maintenance-window-control-date-input"
    ) as HTMLInputElement;

    expect(regionInput).toBeDisabled();
    expect(maintenanceDateInput).toBeDisabled();
    expect(screen.queryByTestId("proto-ui-fields-form-field-escalation-reason-control")).not.toBeInTheDocument();
    expect(screen.queryByTestId("proto-ui-fields-form-field-support-contact-control")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("proto-ui-fields-form-field-provider-option-1"));
    expect(regionInput).not.toBeDisabled();

    await user.click(screen.getByTestId("proto-ui-fields-form-field-support-tier-option-3"));

    expect(maintenanceDateInput).not.toBeDisabled();
    expect(screen.getByTestId("proto-ui-fields-form-field-escalation-reason-control")).toBeInTheDocument();
    expect(screen.getByTestId("proto-ui-fields-form-field-support-contact-control")).toBeInTheDocument();
  });
});
