import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { buildExampleServer } from "../server/server.js";
import ServerErrorFormExample from "./basic-form.js";

const displayNamePattern = /display name/i;
const emailPattern = /email/i;

let closeServer: (() => Promise<void>) | undefined;

afterEach(async () => {
  await closeServer?.();
  closeServer = undefined;
});

describe("server-error form example", () => {
  it("shows protobuf help in an accessible field tooltip", async () => {
    const user = userEvent.setup();

    render(<ServerErrorFormExample />);

    await user.hover(
      screen.getByRole("button", { name: "Help for Display Name" })
    );

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Use the name teammates will recognize in navigation and activity."
    );
  });

  it("submits a generated protobuf message to the local Connect server", async () => {
    const server = await buildExampleServer();
    const address = await server.listen({ host: "127.0.0.1", port: 0 });
    closeServer = () => server.close();
    const user = userEvent.setup();

    render(<ServerErrorFormExample baseUrl={address} />);

    await user.type(
      screen.getByRole("textbox", { name: displayNamePattern }),
      "Ada Lovelace"
    );
    await user.type(
      screen.getByRole("textbox", { name: emailPattern }),
      "ada@example.com"
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "profiles/ada-lovelace"
    );
  });

  it("maps structured server details back to the generated field", async () => {
    const server = await buildExampleServer();
    const address = await server.listen({ host: "127.0.0.1", port: 0 });
    closeServer = () => server.close();
    const user = userEvent.setup();

    render(<ServerErrorFormExample baseUrl={address} />);

    await user.type(
      screen.getByRole("textbox", { name: displayNamePattern }),
      "Ada Lovelace"
    );
    await user.type(
      screen.getByRole("textbox", { name: emailPattern }),
      "ada@blocked.example"
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("Use an email address from an approved domain.")
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: emailPattern })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
});
