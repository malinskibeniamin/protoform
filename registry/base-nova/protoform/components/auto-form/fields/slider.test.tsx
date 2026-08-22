import { describe, expect, it } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import { AutoForm } from "..";
import type { SchemaProvider } from "../core-types";

describe("SliderFieldComponent", () => {
  it("labels the range input independently from its number input", () => {
    const provider: SchemaProvider = {
      getDefaultValues: () => ({ replicas: 2 }),
      parseSchema: () => ({
        fields: [
          {
            fieldConfig: { customData: { control: "slider" }, label: "Replicas" },
            key: "replicas",
            required: true,
            type: "number",
          },
        ],
      }),
      validateSchema: (values) => ({ data: values, success: true }),
    };
    render(<AutoForm fieldConfig={{ replicas: { inputProps: { max: 10, min: 1 } } }} schema={provider} />);

    expect(screen.getByRole("slider", { name: "Replicas slider" })).toBeVisible();
  });
});
