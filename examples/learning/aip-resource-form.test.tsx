import { expect } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AipResourceFormExample } from "./aip-resource-form.js";

test("shows the AIP-safe update mask produced by editable changes", async () => {
  const user = userEvent.setup();
  render(<AipResourceFormExample />);

  const displayName = screen.getByRole("textbox", { name: "Display Name" });
  await user.clear(displayName);
  await user.type(displayName, "Grace Hopper");
  await user.type(screen.getByRole("textbox", { name: "Biography" }), "Compiler pioneer");
  await user.click(screen.getByRole("button", { name: "Submit" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Update mask: display_name, biography");
});
