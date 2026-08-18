import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import OneofFormExample from "./oneof-form.js";

async function selectContact(label: "Email" | "Phone") {
  fireEvent.click(screen.getByRole("combobox", { name: "Contact" }));
  const option = await screen.findByRole("option", { name: label });
  fireEvent.pointerEnter(option, { pointerType: "touch" });
  fireEvent.pointerDown(option, { pointerType: "touch" });
  fireEvent.click(option);
}

it("shows oneof placeholders and labels instead of internal values", async () => {
  render(<OneofFormExample />);

  const contact = screen.getByRole("combobox", { name: "Contact" });
  expect(contact).toHaveTextContent("Choose a field");
  expect(document.body).not.toHaveTextContent("__autoform_unset__");

  await selectContact("Email");
  await waitFor(() => {
    expect(contact).toHaveTextContent("Email");
  });
});

it("clears the previous oneof branch before submitting the new one", async () => {
  const user = userEvent.setup();
  render(<OneofFormExample />);

  await selectContact("Email");
  await user.type(await screen.findByRole("textbox", { name: "Email" }), "ada@example.com");

  await selectContact("Phone");
  expect(screen.queryByRole("textbox", { name: "Email" })).not.toBeInTheDocument();
  const phone = await screen.findByRole("textbox", { name: "Phone" });
  expect(phone).toHaveValue("");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();

  await user.type(phone, "+442079460000");
  await user.click(screen.getByRole("button", { name: "Submit" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Submitted phone: +442079460000");
});
