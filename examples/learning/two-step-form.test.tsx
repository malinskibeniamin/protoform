import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import TwoStepFormExample from "./two-step-form.js";

it("reveals one simple field per step", async () => {
  const user = userEvent.setup();
  render(<TwoStepFormExample />);

  expect(screen.getByRole("navigation", { name: "Form progress" })).toHaveAttribute("data-orientation", "vertical");
  expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
  expect(screen.queryByRole("textbox", { name: "Email" })).not.toBeInTheDocument();

  await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
  await user.click(screen.getByRole("button", { name: "Continue" }));

  expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
  await user.type(screen.getByRole("textbox", { name: "Email" }), "ada@example.com");
  await user.click(screen.getByRole("button", { name: "Submit" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Submitted: Ada, ada@example.com");
});
