import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from ".";

describe("Input icon controls", () => {
  it("uses Nova density and geometry by default", () => {
    render(<Input aria-label="Name" />);

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveClass("h-8", "rounded-lg");
  });

  it("names the password visibility control and updates its state", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="API token" type="password" />);

    const toggle = screen.getByRole("button", { name: "Show password" });
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Hide password" })).toBeVisible();
  });

  it("names number step controls", () => {
    render(<Input aria-label="Retries" showStepControls type="number" />);

    expect(screen.getByRole("button", { name: "Increase value" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Decrease value" })).toBeVisible();
  });
});
