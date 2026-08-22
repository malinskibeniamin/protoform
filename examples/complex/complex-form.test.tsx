import { afterEach, describe, expect } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { buildExampleServer } from "../server/server.js";
import ComplexFormExample from "./complex-form.js";

const rawApiKeyPattern = /example-api-key/u;
const redactedPattern = /\[redacted\]/u;
const projectIdPattern = /project id/iu;
const regionPattern = /region/iu;
const approvalTicketPattern = /approval ticket/iu;

let closeServer: (() => Promise<void>) | undefined;

afterEach(async () => {
  await closeServer?.();
  closeServer = undefined;
});

describe("complex form example", () => {
  test("redacts credentials from the final review summary", async () => {
    const user = userEvent.setup();
    render(<ComplexFormExample />);

    expect(screen.getByRole("textbox", { name: projectIdPattern })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Help for Project ID" })).toBeInTheDocument();
    expect(screen.queryByLabelText(regionPattern)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(approvalTicketPattern)).not.toBeInTheDocument();
    expect(screen.queryByText(rawApiKeyPattern)).not.toBeInTheDocument();
    expect(screen.queryByText(redactedPattern)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText(redactedPattern)).toBeInTheDocument();
  });

  test("routes a structured submit error back to the step that owns the field", async () => {
    const server = buildExampleServer();
    const address = await server.listen({ host: "127.0.0.1", port: 0 });
    closeServer = () => server.close();
    const user = userEvent.setup();

    render(<ComplexFormExample baseUrl={address} initialProjectId="taken-project" />);

    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Step 1 of 4", {}, { timeout: 1000 })).toBeInTheDocument();
    expect(screen.getByText("Choose a different project id.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("textbox", { name: projectIdPattern })).toHaveFocus());
  });
});
