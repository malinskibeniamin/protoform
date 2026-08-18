import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CapabilityDemo } from "./capability-demo.js";
import { demoCatalog } from "./demo-catalog.js";

const FOCUSED_REQUEST_TEXT = /Edit the focused request/;

describe("CapabilityDemo", () => {
  it("renders a focused React Hook Form AIP demo and submits its protobuf value", async () => {
    const user = userEvent.setup();

    render(<CapabilityDemo demoId="aip.131" />);

    expect(screen.getByText("React Hook Form", { exact: true })).toBeInTheDocument();
    expect(screen.getByText(FOCUSED_REQUEST_TEXT)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("status")).toHaveTextContent("publishers/acme/books/protoform-guide");
  });

  it("renders an explicit not-found state for an unknown demo", () => {
    render(<CapabilityDemo demoId="missing" />);

    expect(screen.getByRole("alert")).toHaveTextContent("This demo is unavailable.");
  });

  it("redacts sensitive values from submitted previews", async () => {
    const user = userEvent.setup();
    render(<CapabilityDemo demoId="aip.147" />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    const result = await screen.findByRole("status");
    expect(result).toHaveTextContent("[redacted]");
    expect(result).not.toHaveTextContent("draft-token");
  });

  it("normalizes well-known type defaults for form controls", () => {
    render(<CapabilityDemo demoId="aip.133" />);

    expect(screen.getByRole("textbox", { name: "Ttl" })).toHaveValue("86400s");
  });

  it("stacks bounded recursive array items inside their collection", () => {
    render(<CapabilityDemo demoId="demo.protobuf-recursive-messages" />);

    expect(screen.getByTestId("demo-protobuf-recursive-messages-field-children-0")).toHaveAttribute(
      "data-layout",
      "stacked"
    );
  });

  it("renders repeated enum defaults with their protobuf labels", () => {
    render(<CapabilityDemo demoId="demo.protobuf-maps" />);

    expect(screen.getByTestId("demo-protobuf-maps-field-statuses-selected-1")).toHaveTextContent("Active");
    expect(screen.getByTestId("demo-protobuf-maps-field-statuses-selected-2")).toHaveTextContent("Paused");
  });

  it.each([
    ...new Map(
      demoCatalog.filter((demo) => demo.engine === "react-hook-form").map((demo) => [demo.schemaKey, demo])
    ).values(),
  ])("renders the $schemaKey contract", (demo) => {
    render(<CapabilityDemo demoId={demo.id} />);

    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();

    cleanup();
  });
});
