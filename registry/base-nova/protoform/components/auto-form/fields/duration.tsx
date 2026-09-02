"use client";

import { Input } from "@/components/ui/input";
import type { AutoFormFieldProps } from "../core-types";
import { getFieldUiConfig } from "../helpers";
import type { FieldTypeDefinition } from "../registry";
import { useFieldTestIds } from "./shared";

function DurationFieldComponent({ error, field, id, inputProps }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);

  return (
    <Input
      aria-invalid={Boolean(error)}
      className={error ? "border-destructive font-mono" : "font-mono"}
      disabled={inputProps["disabled"]}
      id={id}
      onBlur={inputProps["onBlur"]}
      onChange={(event) => inputProps["onValueChange"](event.target.value)}
      placeholder={getFieldUiConfig(field).placeholder || "300s"}
      testId={testIds.control}
      value={(inputProps["value"] as string | undefined) ?? ""}
    />
  );
}

export { DurationFieldComponent };

export const durationFieldDefinition: FieldTypeDefinition = {
  component: DurationFieldComponent,
  match: (field) => field.type === "duration",
  name: "duration",
  priority: 10,
};
