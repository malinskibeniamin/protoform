import { describe, expect, rs } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";

import type { AutoFormDiagnostic } from "../configuration";
import { AutoForm } from "../index";
import { createMockProvider } from "./test-utils";

describe("AutoForm diagnostic callback", () => {
  test("delivers configuration diagnostics and schema resolution causes without a logging dependency", async () => {
    const diagnostics: AutoFormDiagnostic[] = [];
    const onDiagnostic = (diagnostic: AutoFormDiagnostic) => diagnostics.push(diagnostic);
    const schema = createMockProvider([
      {
        fieldConfig: { customData: { dataProvider: "regions" } },
        key: "region",
        required: false,
        type: "string",
      },
    ]);
    const brokenSchema = {
      getDefaultValues: () => ({}),
      parseSchema: () => {
        throw new TypeError("Unsupported schema shape.");
      },
      validateSchema: () => ({ data: {}, success: true as const }),
    };

    render(<AutoForm onDiagnostic={onDiagnostic} schema={schema} />);
    await waitFor(() =>
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          code: "missing-data-provider",
          fieldPath: "region",
          severity: "error",
        })
      )
    );

    // Suppress React's expected error-boundary console noise.
    const consoleError = rs.spyOn(console, "error").mockImplementation(() => undefined);
    render(<AutoForm onDiagnostic={onDiagnostic} schema={brokenSchema} />);
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
    // The error boundary replaces the broken form with an alert.
    expect(screen.getByText(/autoform failed to render/iu)).toBeVisible();
    consoleError.mockRestore();
  });
});
