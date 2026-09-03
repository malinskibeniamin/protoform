"use client";

import React from "react";
import type { AutoFormFieldProps } from "../core-types";
import { getFieldUiConfig } from "../helpers";
import type { FieldTypeDefinition } from "../registry";
import { Input, Slider } from "../ui-components";
import { normalizeNumberValue, parseNumericProp, resolveNumericStep, useFieldTestIds } from "./shared";

/**
 * Slider widget — renders the track alongside a companion numeric
 * input. The track is for quick coarse adjustments; the input
 * handles precise entry (including tiny step sizes beyond a drag's
 * resolution) and keeps the value readable when the track is tiny
 * on narrow columns. Both controls bind to the same form value.
 */
function SliderFieldComponent({ error, field, id, inputProps, label: fieldLabel }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const min = parseNumericProp(inputProps["min"]) ?? 0;
  const max = parseNumericProp(inputProps["max"]) ?? 100;
  const value = normalizeNumberValue(inputProps["value"]) ?? min;
  const step = resolveNumericStep(inputProps, value);
  const clamped = Math.min(max, Math.max(min, value));
  const label = typeof fieldLabel === "string" || typeof fieldLabel === "number" ? String(fieldLabel) : id;

  // Seed the form state with the slider's minimum on mount when the
  // field is undefined/null. Without this, the track renders at `min`
  // (thanks to the `?? min` fallback above) but the companion number
  // input shows as empty and the form value stays undefined — users
  // see a "blank" input even though the slider is clearly at zero.
  // Seeding once aligns both controls visually and makes 0 (or the
  // proto-declared min) an explicit starting value in the payload.
  const hasSeededRef = React.useRef(false);
  React.useEffect(() => {
    if (hasSeededRef.current) {
      return;
    }
    if (inputProps["value"] === undefined || inputProps["value"] === null) {
      hasSeededRef.current = true;
      inputProps["onValueChange"](min, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [inputProps, min]);
  const inputValue = inputProps["value"];
  const displayValue = typeof inputValue === "number" || typeof inputValue === "string" ? inputValue : clamped;

  return (
    <div className="flex items-center gap-4" data-testid={testIds.control}>
      <Slider
        aria-label={`${label} slider`}
        className="flex-1"
        disabled={inputProps["disabled"]}
        max={max}
        min={min}
        onValueChange={(nextValues) => inputProps["onValueChange"](nextValues[0] ?? min)}
        step={step}
        testId={testIds.controlPart("slider")}
        value={[clamped]}
      />
      <Input
        aria-invalid={Boolean(error)}
        className={`w-24 ${error ? "border-destructive" : ""}`}
        disabled={inputProps["disabled"]}
        id={id}
        inputMode="decimal"
        max={max}
        min={min}
        onBlur={inputProps["onBlur"]}
        onChange={(event) => {
          const nextValue = event.target.value;
          inputProps["onValueChange"](nextValue === "" ? min : Number(nextValue));
        }}
        placeholder={getFieldUiConfig(field).placeholder}
        step={step}
        testId={testIds.controlPart("input")}
        type="number"
        value={displayValue}
      />
    </div>
  );
}

export { SliderFieldComponent };

export const sliderFieldDefinition: FieldTypeDefinition = {
  component: SliderFieldComponent,
  /**
   * Slider is an opt-in widget — it renders only when the proto field
   * carries `field_ui.control = CONTROL_TYPE_SLIDER` (surfaced as
   * `customData.ui.control === 'slider'`). A numeric field with
   * `min`/`max` alone does NOT auto-promote to slider, because that
   * collides with the plain number renderer and produces the
   * "slider + standalone number input" double-render seen on
   * Max In Flight fields before this change. Proto drives the choice.
   */
  match: (field) => {
    if (field.type !== "number") {
      return false;
    }
    const customData = field.fieldConfig?.customData;
    if (!(customData && typeof customData === "object")) {
      return false;
    }
    const bag = customData as { control?: unknown; ui?: { control?: unknown } };
    if (bag.control === "slider") {
      return true;
    }
    if (bag.ui && typeof bag.ui === "object" && bag.ui.control === "slider") {
      return true;
    }
    return false;
  },
  name: "slider",
  priority: 15,
};
