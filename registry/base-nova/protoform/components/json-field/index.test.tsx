import { afterEach, describe, expect, it, rs } from "@rstest/core";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Toaster, toast } from "@/registry/base-nova/protoform/components/toast";

import { JSONField } from ".";

afterEach(() => {
  act(() => toast.close());
});

describe("JSONField accessibility", () => {
  it("labels the fallback editor for deeply nested JSON", () => {
    render(
      <JSONField
        maxDepth={1}
        onChange={rs.fn()}
        schema={{
          properties: {
            audit: {
              properties: { retentionDays: { type: "number" } },
              type: "object",
            },
          },
          type: "object",
        }}
        value={{ audit: { retentionDays: 30 } }}
      />
    );

    expect(screen.getByRole("textbox", { name: "Audit JSON" })).toBeVisible();
  });

  it("opens an unconstrained array in JSON mode", async () => {
    render(<JSONField onChange={rs.fn()} schema={{ type: "array" }} value={["overview", 3, true]} />);

    expect(await screen.findByRole("textbox", { name: "JSON value" })).toHaveValue('[\n  "overview",\n  3,\n  true\n]');
  });

  it("shows a success toast after copying JSON", async () => {
    const user = userEvent.setup();

    render(
      <Toaster>
        <JSONField onChange={rs.fn()} schema={{ type: "object" }} value={{ region: "us-east1" }} />
      </Toaster>
    );

    await user.click(screen.getByRole("button", { name: "Copy JSON" }));

    expect(await screen.findByText("JSON copied")).toBeVisible();
  });
});
