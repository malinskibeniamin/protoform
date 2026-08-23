import { afterEach, describe, expect, it } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { buildExampleServer } from "../server/server.js";
import { TanStackFormExample } from "./tanstack-form.js";

const displayNamePattern = /display name/i;
const emailPattern = /email/i;

let closeServer: (() => Promise<void>) | undefined;

afterEach(async () => {
  await closeServer?.();
  closeServer = undefined;
});

describe("TanStack Form example", () => {
  it("maps the protobuf Standard Schema issues to fields on submit", async () => {
    const user = userEvent.setup();

    render(<TanStackFormExample />);
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findAllByText("Enter a value.")).toHaveLength(2);
    expect(screen.getByLabelText(displayNamePattern)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(emailPattern)).toHaveAttribute("aria-invalid", "true");
  });

  it("submits the Standard Schema output as a typed protobuf message", async () => {
    const server = await buildExampleServer();
    const address = await server.listen({ host: "127.0.0.1", port: 0 });
    closeServer = () => server.close();
    const user = userEvent.setup();

    render(<TanStackFormExample baseUrl={address} />);

    await user.type(screen.getByLabelText(displayNamePattern), "Ada Lovelace");
    await user.type(screen.getByLabelText(emailPattern), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findByRole("status")).toHaveTextContent("profiles/ada-lovelace");
  });

  it("maps structured server details to the owning TanStack field", async () => {
    const server = await buildExampleServer();
    const address = await server.listen({ host: "127.0.0.1", port: 0 });
    closeServer = () => server.close();
    const user = userEvent.setup();

    render(<TanStackFormExample baseUrl={address} />);

    await user.type(screen.getByLabelText(displayNamePattern), "Ada Lovelace");
    await user.type(screen.getByLabelText(emailPattern), "ada@blocked.example");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findByText("Use an email address from an approved domain.")).toBeInTheDocument();
    expect(screen.getByLabelText(emailPattern)).toHaveAttribute("aria-invalid", "true");
  });
});
