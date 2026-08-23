import { describe, expect } from "@rstest/core";
import { render, screen } from "@testing-library/react";

import DeeplyNestedFormExample from "./deeply-nested-form.js";

describe("DeeplyNestedFormExample", () => {
  test("renders a six-level protobuf contract from one AutoForm", () => {
    render(<DeeplyNestedFormExample />);

    expect(screen.getByRole("heading", { name: "Configure a platform blueprint" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Organization Slug *" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Help for Organization Slug" })).toBeInTheDocument();
    expect(screen.getByLabelText("Destination CIDR", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("Next Hop", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("Container Image", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("Health Check", { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Required Approvers" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Routes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Containers" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Approvals" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Network 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Route 1" })).toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { name: "Value" })).toHaveLength(0);
  });
});
