"use client";

import type { AutoFormFieldProps } from "../core-types";
import { CONSENT_FIELD_PATTERN } from "../helpers";
import { getProtoFieldCustomData } from "../proto";
import type { FieldTypeDefinition } from "../registry";
import {
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Toggle,
} from "../ui-components";
import { getControlLabel, useFieldTestIds } from "./shared";

// ---------------------------------------------------------------------------
// BooleanFieldComponent — tri-state select (true / false / unset)
// ---------------------------------------------------------------------------

function BooleanFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const fieldLabel = getControlLabel(label, field);

  return (
    <Select
      items={[
        { label: "Not set", value: null },
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ]}
      onValueChange={(value) => {
        if (value === null) {
          inputProps["onValueChange"](undefined);
          return;
        }
        inputProps["onValueChange"](value === "true");
      }}
      value={inputProps["value"] === undefined ? null : String(Boolean(inputProps["value"]))}
    >
      <SelectTrigger
        aria-invalid={Boolean(error)}
        aria-label={fieldLabel}
        className={error ? "border-destructive" : ""}
        disabled={inputProps["disabled"]}
        id={id}
        testId={testIds.control}
      >
        <SelectValue placeholder="Choose a value" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem testId={testIds.option("not-set")} value={null}>
          Not set
        </SelectItem>
        <SelectItem testId={testIds.option("true")} value="true">
          True
        </SelectItem>
        <SelectItem testId={testIds.option("false")} value="false">
          False
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

// ---------------------------------------------------------------------------
// CheckboxFieldComponent
// ---------------------------------------------------------------------------

function CheckboxFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);

  return (
    <div className="flex min-h-9 items-center">
      <Checkbox
        aria-invalid={Boolean(error)}
        aria-label={getControlLabel(label, field)}
        checked={Boolean(inputProps["value"])}
        disabled={inputProps["disabled"]}
        id={id}
        onCheckedChange={(checked) => inputProps["onValueChange"](Boolean(checked))}
        testId={testIds.control}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SwitchFieldComponent
// ---------------------------------------------------------------------------

function SwitchFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);

  return (
    <div className="flex min-h-9 items-center">
      <Switch
        aria-invalid={Boolean(error)}
        aria-label={getControlLabel(label, field)}
        checked={Boolean(inputProps["value"])}
        disabled={inputProps["disabled"]}
        id={id}
        onCheckedChange={(checked) => inputProps["onValueChange"](Boolean(checked))}
        testId={testIds.control}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToggleFieldComponent — not registered by default (available as override)
// ---------------------------------------------------------------------------

function ToggleFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);

  return (
    <div className="flex min-h-9 items-center gap-3" data-testid={testIds.control}>
      <Switch
        aria-invalid={Boolean(error)}
        aria-label={getControlLabel(label, field)}
        checked={Boolean(inputProps["value"])}
        disabled={inputProps["disabled"]}
        id={id}
        onCheckedChange={(checked) => inputProps["onValueChange"](Boolean(checked))}
        testId={testIds.controlPart("switch")}
      />
      <Toggle
        aria-hidden
        className="pointer-events-none rounded-full px-3"
        pressed={Boolean(inputProps["value"])}
        size="sm"
        variant="outline"
      >
        {inputProps["value"] ? "On" : "Off"}
      </Toggle>
    </div>
  );
}

export { BooleanFieldComponent, CheckboxFieldComponent, SwitchFieldComponent, ToggleFieldComponent };

export const booleanFieldDefinition: FieldTypeDefinition = {
  component: BooleanFieldComponent,
  match: (field) => {
    if (field.type !== "boolean") {
      return false;
    }
    const protoData = getProtoFieldCustomData(field);
    return Boolean(protoData?.supportsUnset) && !field.required;
  },
  name: "boolean",
  priority: 15,
};

export const checkboxFieldDefinition: FieldTypeDefinition = {
  component: CheckboxFieldComponent,
  match: (field, context) => field.type === "boolean" && CONSENT_FIELD_PATTERN.test(context.identity),
  name: "checkbox",
  priority: 14,
};

export const switchFieldDefinition: FieldTypeDefinition = {
  component: SwitchFieldComponent,
  match: (field) => field.type === "boolean",
  name: "switch",
  priority: 10,
};
