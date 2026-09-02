"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Text } from "@/components/ui/typography";
import type { AutoFormFieldProps } from "../core-types";
import type { FieldTypeDefinition } from "../registry";
import {
  getControlLabel,
  getFlatOptions,
  getGroupedOptions,
  hasNumericOptions,
  renderOptionLabel,
  useFieldTestIds,
} from "./shared";

function RadioFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const numericOptions = hasNumericOptions(field);
  const value = inputProps["value"] === undefined || inputProps["value"] === null ? "" : String(inputProps["value"]);
  const optionGroups = getGroupedOptions(field);
  const flatOptions = getFlatOptions(field);

  return (
    <RadioGroup
      aria-invalid={Boolean(error)}
      aria-label={getControlLabel(label, field)}
      onValueChange={(nextValue) => inputProps["onValueChange"](numericOptions ? Number(nextValue) : nextValue)}
      testId={testIds.control}
      value={value}
    >
      {(optionGroups && optionGroups.length > 0 ? optionGroups : [{ label: undefined, options: flatOptions }]).map(
        (group) => (
          <div
            className="space-y-2"
            data-testid={testIds.group(String(group.label ?? group.options.map((option) => option.value).join("-")))}
            key={`${field.key}-group-${String(group.label ?? group.options.map((option) => option.value).join("-"))}`}
          >
            {group.label ? (
              <Text as="div" className="text-muted-foreground" variant="small">
                {group.label}
              </Text>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {group.options.map((option) => (
                <RadioGroupItem
                  data-selected={String(option.value === value)}
                  disabled={inputProps["disabled"]}
                  id={`${field.key}-${option.value}`}
                  key={option.value}
                  testId={testIds.option(option.value)}
                  value={option.value}
                  variant="card"
                >
                  {renderOptionLabel(option)}
                </RadioGroupItem>
              ))}
            </div>
          </div>
        )
      )}
    </RadioGroup>
  );
}

export { RadioFieldComponent };

export const radioFieldDefinition: FieldTypeDefinition = {
  component: RadioFieldComponent,
  match: (field) => {
    if (field.type !== "select") {
      return false;
    }
    const optionCount = field.options?.length ?? 0;
    return optionCount > 0 && optionCount <= 3;
  },
  name: "radio",
  priority: 15,
};
