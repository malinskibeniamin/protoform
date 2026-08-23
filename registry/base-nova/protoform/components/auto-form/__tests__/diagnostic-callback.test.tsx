import { describe, expect, it } from "@rstest/core";
import { render, waitFor } from "@testing-library/react";

import type { AutoFormDiagnostic } from "../configuration";
import { AutoForm } from "../index";
import { createMockProvider } from "./test-utils";

describe("AutoForm diagnostic callback", () => {
  it("delivers structured configuration diagnostics without a logging dependency", async () => {
    const diagnostics: AutoFormDiagnostic[] = [];
    const schema = createMockProvider([
      {
        fieldConfig: { customData: { dataProvider: "regions" } },
        key: "region",
        required: false,
        type: "string",
      },
    ]);

    render(<AutoForm onDiagnostic={(diagnostic) => diagnostics.push(diagnostic)} schema={schema} />);

    await waitFor(() =>
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          code: "missing-data-provider",
          fieldPath: "region",
          severity: "error",
        })
      )
    );
  });

  it("reports a schema resolution cause through the same callback", async () => {
    const diagnostics: AutoFormDiagnostic[] = [];
    const brokenSchema = {
      getDefaultValues: () => ({}),
      parseSchema: () => {
        throw new TypeError("Unsupported schema shape.");
      },
      validateSchema: () => ({ data: {}, success: true as const }),
    };

    render(<AutoForm onDiagnostic={(diagnostic) => diagnostics.push(diagnostic)} schema={brokenSchema} />);

    await waitFor(() =>
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          cause: expect.any(TypeError),
          code: "render-error",
          fieldPath: "$",
          severity: "error",
        })
      )
    );
  });
});
