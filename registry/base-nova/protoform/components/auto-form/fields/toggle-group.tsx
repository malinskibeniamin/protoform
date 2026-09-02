"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AutoFormFieldProps } from "../core-types";
import { getFieldUiConfig } from "../helpers";
import type { FieldTypeDefinition } from "../registry";
import { getControlLabel, getFlatOptions, hasNumericOptions, renderOptionLabel, useFieldTestIds } from "./shared";

function ToggleGroupFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const numericOptions = hasNumericOptions(field);
  const value = inputProps["value"] === undefined || inputProps["value"] === null ? "" : String(inputProps["value"]);
  const options = getFlatOptions(field);

  return (
    <ToggleGroup
      aria-invalid={Boolean(error)}
      aria-label={getControlLabel(label, field)}
      onValueChange={(nextValue) => inputProps["onValueChange"](numericOptions ? Number(nextValue) : nextValue)}
      testId={testIds.control}
      type="single" // Multi-select not supported yet — use multiselect field type instead
      value={value}
      variant="outline"
    >
      {options.map((option) => (
        <ToggleGroupItem
          disabled={inputProps["disabled"]}
          key={option.value}
          testId={testIds.option(option.value)}
          value={option.value}
        >
          {renderOptionLabel(option)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export { ToggleGroupFieldComponent };

export const toggleGroupFieldDefinition: FieldTypeDefinition = {
  component: ToggleGroupFieldComponent,
  match: (field) => {
    if (field.type !== "select") {
      return false;
    }
    return getFieldUiConfig(field).control === "toggleGroup";
  },
  name: "toggleGroup",
  priority: 25,
};
