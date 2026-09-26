import { create, setExtension } from "@bufbuild/protobuf";
import { MessageOptionsSchema } from "@bufbuild/protobuf/wkt";
import { afterEach, beforeEach, describe, expect, rs } from "@rstest/core";
import { render, screen } from "@testing-library/react";

import { AutoFormExampleSchema } from "../../../lib/protobuf-provider/gen/auto-form-example_pb";
import { MessageUiOptionsSchema, message_ui } from "../../../lib/protobuf-provider/gen/protoform/v1/auto_form_ui_pb";

import { AutoForm } from "..";

const originalOptions = AutoFormExampleSchema.proto.options;

describe("AutoForm root header", () => {
  beforeEach(() => {
    const options = create(MessageOptionsSchema);
    setExtension(
      options,
      message_ui,
      create(MessageUiOptionsSchema, {
        description: "Configure the request.",
        title: "Request settings",
      })
    );
    AutoFormExampleSchema.proto.options = options;
  });

  afterEach(() => {
    AutoFormExampleSchema.proto.options = originalOptions;
  });

  test("renders schema metadata by default", () => {
    render(<AutoForm schema={AutoFormExampleSchema} />);

    expect(screen.getByRole("heading", { name: "Request settings" })).toBeInTheDocument();
    expect(screen.getByText("Configure the request.")).toBeInTheDocument();
  });

  test("uses a host renderer with the resolved root metadata and skips it when hidden", () => {
    const renderRootHeader = rs.fn(({ title, description }) => (
      <aside aria-label="Form introduction">
        {title ?? "Untitled"}: {description ?? "No description"}
      </aside>
    ));

    const { rerender } = render(<AutoForm renderRootHeader={renderRootHeader} schema={AutoFormExampleSchema} />);

    expect(renderRootHeader).toHaveBeenCalledWith({
      description: "Configure the request.",
      title: "Request settings",
    });
    expect(screen.getByRole("complementary", { name: "Form introduction" })).toHaveTextContent(
      "Request settings: Configure the request."
    );

    renderRootHeader.mockClear();
    rerender(<AutoForm renderRootHeader={renderRootHeader} rootHeader="hidden" schema={AutoFormExampleSchema} />);

    expect(renderRootHeader).not.toHaveBeenCalled();
    expect(screen.queryByRole("complementary", { name: "Form introduction" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /username/iu })).toBeVisible();
  });
});
