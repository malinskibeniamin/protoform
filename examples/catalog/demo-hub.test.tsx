import { beforeEach, describe, expect } from "@rstest/core";
import { fireEvent, render, screen } from "@testing-library/react";

import { DemoHub } from "./demo-hub";

const autoFormSource = /AutoForm/u;
const demoSchemaSource = /getDemoSchema/u;

describe("DemoHub", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/docs/protobuf-examples");
  });

  test("opens a directly linked demo and keeps selection in the URL", async () => {
    window.history.replaceState(null, "", "/docs/protobuf-examples#protobuf-oneof");

    render(<DemoHub category="protobuf" />);

    expect(screen.getByRole("heading", { name: "Oneof branch selection" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading selected demo" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("combobox", { name: "Choose a demo" }));
    const option = await screen.findByRole("option", {
      name: "Protobuf maps",
    });
    fireEvent.pointerEnter(option, { pointerType: "touch" });
    fireEvent.pointerDown(option, { pointerType: "touch" });
    fireEvent.click(option);

    expect(window.location.hash).toBe("#protobuf-maps");
    expect(screen.getByRole("heading", { name: "Protobuf maps" })).toBeInTheDocument();
  });

  test("keeps the selected demo source available without a wrapper page", async () => {
    window.history.replaceState(null, "", "/docs/cel-examples#cel-safe-evaluation");

    render(<DemoHub category="cel" />);

    fireEvent.click(screen.getByRole("tab", { name: "Code" }));

    expect(await screen.findByText(demoSchemaSource, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(autoFormSource)).toBeInTheDocument();
  });
});
