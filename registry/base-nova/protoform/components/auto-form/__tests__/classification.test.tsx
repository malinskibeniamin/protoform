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
  test("simple mode shows required fields, honors customData.advanced, and advanced mode reveals the rest", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: "requiredName", required: true, type: "string" },
      { key: "optionalNote", required: false, type: "string" },
      { key: "requiredHidden", required: true, type: "string" },
      { key: "optionalPromoted", required: false, type: "string" },
    ]);

    render(
      <AutoForm
        defaultMode="simple"
        defaultValues={{
          optionalNote: "world",
          optionalPromoted: "visible",
          requiredHidden: "secret",
          requiredName: "hello",
        }}
        fieldConfig={{
          optionalPromoted: { customData: { advanced: false } },
          requiredHidden: { customData: { advanced: true } },
        }}
        modes={["simple", "advanced"]}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByLabelText(REQUIRED_NAME_LABEL)).toBeVisible();
    expect(screen.getByLabelText(OPTIONAL_PROMOTED_LABEL)).toBeVisible();
    expect(screen.queryByLabelText(OPTIONAL_NOTE_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(REQUIRED_HIDDEN_LABEL)).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /advanced/iu }));

    await waitFor(() => {
      expect(screen.getByLabelText(OPTIONAL_NOTE_LABEL)).toBeVisible();
    });
    expect(screen.getByLabelText(REQUIRED_HIDDEN_LABEL)).toBeVisible();
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

    expect(screen.getByLabelText(REQUIRED_NAME_LABEL)).toBeVisible();
    expect(screen.getByLabelText(OPTIONAL_NOTE_LABEL)).toBeVisible();
  });
});
