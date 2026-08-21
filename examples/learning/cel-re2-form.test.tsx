import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import CelRe2FormExample from "./cel-re2-form.js";

it("explains and accepts a focused RE2-backed CEL rule", async () => {
  const user = userEvent.setup();
  render(<CelRe2FormExample />);

  const projectId = screen.getByRole("textbox", { name: "Project ID" });
  await user.type(projectId, "Not valid");
  await user.click(screen.getByRole("button", { name: "Submit" }));

  expect(await screen.findByText("Use lowercase letters, digits, and hyphens.")).toBeInTheDocument();

  await user.clear(projectId);
  await user.type(projectId, "payments-prod");
  await user.click(screen.getByRole("button", { name: "Submit" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Accepted: payments-prod");
});
