import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

const REQUIRED_NAME_LABEL = /required name/i;
const OPTIONAL_NOTE_LABEL = /optional note/i;
const REQUIRED_HIDDEN_LABEL = /required hidden/i;
const OPTIONAL_PROMOTED_LABEL = /optional promoted/i;

describe("AutoForm – simple/advanced field classification", () => {
  it("shows required fields in simple mode and hides optional fields", () => {
    const schema = createMockProvider([
      { key: "requiredName", required: true, type: "string" },
      { key: "optionalNote", required: false, type: "string" },
    ]);

    render(
      <AutoForm
        defaultMode="simple"
        defaultValues={{ optionalNote: "world", requiredName: "hello" }}
        modes={["simple", "advanced"]}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByLabelText(REQUIRED_NAME_LABEL)).toBeInTheDocument();
    expect(screen.queryByLabelText(OPTIONAL_NOTE_LABEL)).not.toBeInTheDocument();
  });

  it("hides a required field when customData.advanced is true", () => {
    const schema = createMockProvider([
      { key: "requiredName", required: true, type: "string" },
      { key: "requiredHidden", required: true, type: "string" },
    ]);

    render(
      <AutoForm
        defaultMode="simple"
        defaultValues={{ requiredHidden: "secret", requiredName: "hello" }}
        fieldConfig={{
          requiredHidden: {
            customData: { advanced: true },
          },
        }}
        modes={["simple", "advanced"]}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByLabelText(REQUIRED_NAME_LABEL)).toBeInTheDocument();
    expect(screen.queryByLabelText(REQUIRED_HIDDEN_LABEL)).not.toBeInTheDocument();
  });

  it("shows an optional field when customData.advanced is false", () => {
    const schema = createMockProvider([
      { key: "requiredName", required: true, type: "string" },
      { key: "optionalPromoted", required: false, type: "string" },
    ]);

    render(
      <AutoForm
        defaultMode="simple"
        defaultValues={{ optionalPromoted: "visible", requiredName: "hello" }}
        fieldConfig={{
          optionalPromoted: {
            customData: { advanced: false },
          },
        }}
        modes={["simple", "advanced"]}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByLabelText(REQUIRED_NAME_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(OPTIONAL_PROMOTED_LABEL)).toBeInTheDocument();
  });

  it("custom classifyField prop controls which fields appear in simple mode", () => {
    const schema = createMockProvider([
      { key: "requiredName", required: true, type: "string" },
      { key: "optionalNote", required: false, type: "string" },
    ]);

    render(
      <AutoForm
        classifyField={() => "simple"}
        defaultMode="simple"
        defaultValues={{ optionalNote: "also visible", requiredName: "hello" }}
        modes={["simple", "advanced"]}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByLabelText(REQUIRED_NAME_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(OPTIONAL_NOTE_LABEL)).toBeInTheDocument();
  });

  it("switching to advanced mode reveals all fields", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: "requiredName", required: true, type: "string" },
      { key: "optionalNote", required: false, type: "string" },
    ]);

    render(
      <AutoForm
        defaultMode="simple"
        defaultValues={{ optionalNote: "hidden initially", requiredName: "hello" }}
        modes={["simple", "advanced"]}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.queryByLabelText(OPTIONAL_NOTE_LABEL)).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /advanced/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(OPTIONAL_NOTE_LABEL)).toBeInTheDocument();
    });
  });
});
