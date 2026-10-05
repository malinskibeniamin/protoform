import { afterEach, describe, expect, rs } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { formatSubmittedValue } from "../../lib/protobuf-provider/format-submitted-value";
import { TanstackFormDemo } from "./tanstack-form";

rs.mock("../../lib/protobuf-provider/format-submitted-value", { spy: true });

afterEach(() => {
  rs.restoreAllMocks();
});

describe("TanStack Form registry demo", () => {
  test.each([
    {
      label: "a detailed",
      error: new Error("Could not format the submitted message."),
      message: "Could not format the submitted message.",
    },
    {
      label: "an empty-message",
      // Model a dependency failure whose Error instance has no useful message.
      error: Object.assign(new Error("Unspecified submission failure"), { message: "" }),
      message: "Submission failed. Try again.",
    },
  ])("shows $label submission failure and clears it after a successful retry", async ({ error, message }) => {
    const user = userEvent.setup();
    rs.mocked(formatSubmittedValue).mockImplementationOnce(() => {
      throw error;
    });
    render(<TanstackFormDemo />);

    await user.click(screen.getByRole("textbox", { name: "Email" }));
    await user.paste("ada@example.com");
    await user.click(screen.getByRole("button", { name: "Validate with TanStack Form" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByRole("status")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Validate with TanStack Form" }));

    expect(await screen.findByRole("status")).toHaveTextContent("ada@example.com");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
