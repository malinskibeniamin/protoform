"use client";

import { Combobox } from "@/components/ui/combobox";
import type { AutoFormFieldProps } from "../core-types";
import { getFieldUiConfig } from "../helpers";
import type { FieldTypeDefinition } from "../registry";
import { getFlatOptions, getGroupedOptions, hasNumericOptions, useFieldTestIds } from "./shared";

function ComboboxFieldComponent({ field, id, inputProps }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const numericOptions = hasNumericOptions(field);
  const optionGroups = getGroupedOptions(field);
  const options =
    optionGroups && optionGroups.length > 0
      ? optionGroups.flatMap((group) =>
          group.options.map((option) => ({
            group: String(group.label ?? ""),
            groupTestId: testIds.group(String(group.label ?? option.value)),
            label: `${group.label ? `${group.label} · ` : ""}${String(option.label ?? option.value)}`,
            testId: testIds.option(option.value),
            value: option.value,
          }))
        )
      : getFlatOptions(field).map((option) => ({
          label: String(option.label ?? option.value),
          testId: testIds.option(option.value),
          value: option.value,
        }));

  return (
    <Combobox
      disabled={inputProps["disabled"]}
      inputTestId={testIds.control}
      onChange={(value) => inputProps["onValueChange"](numericOptions ? Number(value) : value)}
      options={options}
      placeholder={getFieldUiConfig(field).placeholder || "Search options"}
      value={inputProps["value"] === undefined || inputProps["value"] === null ? "" : String(inputProps["value"])}
    />
  );
}

export { ComboboxFieldComponent };

export const comboboxFieldDefinition: FieldTypeDefinition = {
  component: ComboboxFieldComponent,
  match: (field) => {
    if (field.type !== "select") {
      return false;
    }
    const optionCount = field.options?.length ?? 0;
    return optionCount > 8;
  },
  name: "combobox",
  priority: 18,
};
