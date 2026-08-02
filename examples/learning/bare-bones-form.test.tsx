import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import { BareBonesFormExample } from "./bare-bones-form.js";

it("submits the simplest generated form without a server", async () => {
  const user = userEvent.setup();
  render(<BareBonesFormExample />);

  await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
  await user.click(screen.getByRole("button", { name: "Submit" }));

  expect(screen.getByRole("status")).toHaveTextContent("Submitted: Ada");
});
