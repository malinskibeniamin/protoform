import { afterEach, describe, expect } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { buildExampleServer } from "../server/server.js";
import { FinalFormExample } from "./final-form.js";
import { FormikExample } from "./formik-form.js";

const displayNamePattern = /display name/iu;
const emailPattern = /email/iu;

let closeServer: (() => Promise<void>) | undefined;

afterEach(async () => {
  await closeServer?.();
  closeServer = undefined;
});

async function startServer() {
  const server = buildExampleServer();
  const address = await server.listen({ host: "127.0.0.1", port: 0 });
  closeServer = () => server.close();
  return address;
}

async function fillProfile(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(displayNamePattern), "Ada Lovelace");
  await user.type(screen.getByLabelText(emailPattern), "ada@example.com");
}

describe("Formik example", () => {
  test("validates with Formik and submits a typed protobuf message", async () => {
    const address = await startServer();
    const user = userEvent.setup();
    render(<FormikExample baseUrl={address} />);

    await user.click(screen.getByRole("button", { name: "Create profile" }));
    expect(await screen.findAllByText("Enter a value.")).toHaveLength(2);

    await fillProfile(user);
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findByRole("status")).toHaveTextContent("profiles/ada-lovelace");
  });

  test("maps structured server errors into Formik", async () => {
    const address = await startServer();
    const user = userEvent.setup();
    render(<FormikExample baseUrl={address} />);

    await user.type(screen.getByLabelText(displayNamePattern), "Ada Lovelace");
    await user.type(screen.getByLabelText(emailPattern), "ada@blocked.example");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findByText("Use an email address from an approved domain.")).toBeInTheDocument();
    expect(screen.getByLabelText(emailPattern)).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Final Form example", () => {
  test("validates with Final Form and submits a typed protobuf message", async () => {
    const address = await startServer();
    const user = userEvent.setup();
    render(<FinalFormExample baseUrl={address} />);

    expect(screen.queryByText("Enter a value.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create profile" }));
    expect(await screen.findAllByText("Enter a value.")).toHaveLength(2);

    await fillProfile(user);
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findByRole("status")).toHaveTextContent("profiles/ada-lovelace");
  });

  test("maps structured server errors into Final Form", async () => {
    const address = await startServer();
    const user = userEvent.setup();
    render(<FinalFormExample baseUrl={address} />);

    await user.type(screen.getByLabelText(displayNamePattern), "Ada Lovelace");
    await user.type(screen.getByLabelText(emailPattern), "ada@blocked.example");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findByText("Use an email address from an approved domain.")).toBeInTheDocument();
    expect(screen.getByLabelText(emailPattern)).toHaveAttribute("aria-invalid", "true");
  });
});
