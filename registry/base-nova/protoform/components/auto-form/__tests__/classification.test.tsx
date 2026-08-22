import { describe, expect } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

const REQUIRED_NAME_LABEL = /required name/iu;
const OPTIONAL_NOTE_LABEL = /optional note/iu;
const REQUIRED_HIDDEN_LABEL = /required hidden/iu;
const OPTIONAL_PROMOTED_LABEL = /optional promoted/iu;

describe("AutoForm – simple/advanced field classification", () => {
  test("shows required fields in simple mode and hides optional fields", () => {
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

  test("hides a required field when customData.advanced is true", () => {
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

  test("shows an optional field when customData.advanced is false", () => {
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

  test("custom classifyField prop controls which fields appear in simple mode", () => {
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

  test("switching to advanced mode reveals all fields", async () => {
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

    await user.click(screen.getByRole("tab", { name: /advanced/iu }));

    await waitFor(() => {
      expect(screen.getByLabelText(OPTIONAL_NOTE_LABEL)).toBeInTheDocument();
    });
  });
});
