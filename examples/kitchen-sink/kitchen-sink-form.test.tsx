import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import KitchenSinkFormExample from "./kitchen-sink-form.js";

const ORGANIZATION_SLUG_LABEL = /organization slug/i;

describe("KitchenSinkFormExample", () => {
  it("presents the large contract as a linear source-owned shadcn flow", async () => {
    const user = userEvent.setup();

    render(<KitchenSinkFormExample />);

    expect(
      screen.getByRole("heading", {
        name: "Production deployment kitchen sink",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Form progress" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    expect(screen.getByLabelText(ORGANIZATION_SLUG_LABEL)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Help for Estimated Events Per Day",
      })
    ).toBeInTheDocument();
    expect(screen.queryByTestId("kitchen-sink-form-field-regions-items")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Step 2 of 5")).toBeInTheDocument();
    expect(screen.getByTestId("kitchen-sink-form-field-regions-items")).toBeInTheDocument();
    expect(screen.queryByLabelText(ORGANIZATION_SLUG_LABEL)).not.toBeInTheDocument();
  });
});
