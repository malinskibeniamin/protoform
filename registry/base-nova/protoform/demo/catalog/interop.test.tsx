import { afterEach, describe, expect } from "@rstest/core";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FinalFormDemo } from "./final-form.js";
import { FormikDemo } from "./formik.js";
import { TanstackFormDemo } from "./tanstack-form.js";

afterEach(cleanup);

describe.each([
  ["TanStack Form", TanstackFormDemo],
  ["Formik", FormikDemo],
  ["Final Form", FinalFormDemo],
] as const)("%s registry demo", (engine, Demo) => {
  test("validates and submits a typed protobuf value", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    expect(screen.getByText(`${engine} interop`)).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await user.click(screen.getByRole("button", { name: new RegExp(`Validate with ${engine}`, "iu") }));

    expect(await screen.findByRole("status")).toHaveTextContent("ada@example.com");
  });
});
