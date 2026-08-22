// @rstest-environment node

import { describe, expect } from "@rstest/core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fieldsForStep } from "../registry/base-nova/protoform/components/auto-form/stepper.js";
import type { ParsedField } from "../registry/base-nova/protoform/lib/form-types/index.js";
import {
  createProtoFormSchema,
  parseProtoSchema,
  protoFormValuesToPayload,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import { createPerformanceDescriptor } from "./performance-descriptor.js";

const matrix = [
  { change: 50, fields: 50, render: 100, step: 50, validation: 100 },
  { change: 100, fields: 200, render: 250, step: 100, validation: 250 },
  { change: 250, fields: 500, render: 750, step: 250, validation: 750 },
] as const;

function renderControls<FieldType extends string>(fields: ParsedField<FieldType>[], values: Record<string, unknown>) {
  return renderToStaticMarkup(
    createElement(
      "form",
      null,
      fields.map((field) =>
        createElement(
          "label",
          { key: field.key },
          field.fieldConfig?.label ?? field.key,
          createElement("input", {
            defaultValue: String(values[field.key] ?? ""),
            name: field.key,
          })
        )
      )
    )
  );
}

describe("large-form performance budget", () => {
  test.each(matrix)(
    "keeps render, validation, field change, and step transition within budgets for a $fields-field descriptor",
    async (budget) => {
      const descriptor = createPerformanceDescriptor(budget.fields);
      const values = Object.fromEntries(
        Array.from({ length: budget.fields }, (_, index) => [`field${index + 1}`, `value-${index + 1}`])
      );
      const { fields } = parseProtoSchema(descriptor);

      const renderStarted = performance.now();
      const markup = renderControls(fields, values);
      expect(markup).toContain(`name="field${budget.fields}"`);
      expect(performance.now() - renderStarted).toBeLessThan(budget.render);

      const validationStarted = performance.now();
      const validation = await createProtoFormSchema(descriptor)["~standard"].validate(values);
      expect(validation.issues).toBeUndefined();
      expect(performance.now() - validationStarted).toBeLessThan(budget.validation);

      const changeStarted = performance.now();
      const changedValues = { ...values, field1: "updated" };
      expect(protoFormValuesToPayload(descriptor, changedValues)).toMatchObject({
        field1: "updated",
      });
      expect(performance.now() - changeStarted).toBeLessThan(budget.change);

      const steppedFields = fields.map((field, index) => ({
        ...field,
        hints: {
          ...field.hints,
          step: index < budget.fields / 2 ? "first" : "second",
        },
      }));
      const steps = [
        { id: "first", title: "First" },
        { id: "second", title: "Second" },
      ];
      const stepStarted = performance.now();
      const secondStep = fieldsForStep(steppedFields, steps, "second");
      const stepMarkup = renderControls(secondStep, values);
      expect(secondStep).toHaveLength(budget.fields / 2);
      expect(stepMarkup).toContain(`name="field${budget.fields}"`);
      expect(performance.now() - stepStarted).toBeLessThan(budget.step);
    }
  );
});
