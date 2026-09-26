"use client";

import React from "react";
import { formatProtoformMessage } from "@/registry/base-nova/protoform/lib/core/messages";
import { useAutoForm } from "../context";
import type { AutoFormFieldProps } from "../core-types";
import {
  type DataProviderOption,
  type DataProviderResult,
  getStaleSelections,
  type ResolvedDataProvider,
  resolveDataProvider,
  useDataProviderSignal,
} from "../data-providers";
import { getPathInObject } from "../field-utils";
import { getFieldUiConfig, NUMERIC_OPTION_PATTERN } from "../helpers";
import type { FieldTypeDefinition } from "../registry";
import { SimpleMultiSelect } from "../ui-components";
import { safeStringify } from "../utils/serialization";
import { getGroupedOptions, readDataProviderId, renderOptionLabel, useFieldTestIds } from "./shared";

function MultiSelectFieldComponent({ field, id, inputProps }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const { formatMessage } = useAutoForm();
  const itemField = field.schema?.[0];
  const numericOptions = Boolean(itemField?.options?.every(([value]) => NUMERIC_OPTION_PATTERN.test(value)));
  const optionGroups = itemField ? getGroupedOptions(itemField) : undefined;
  const options =
    optionGroups && optionGroups.length > 0
      ? optionGroups.map((group) => ({
          children: group.options.map((option) => ({
            label: renderOptionLabel(option),
            selectedTestId: testIds.selected(option.value),
            testId: testIds.option(option.value),
            value: option.value,
          })),
          heading: group.label,
          testId: testIds.group(String(group.label ?? "group")),
        }))
      : (itemField?.options ?? []).map(([value, optionLabel]) => ({
          label: optionLabel,
          selectedTestId: testIds.selected(value),
          testId: testIds.option(value),
          value,
        }));

  return (
    <SimpleMultiSelect
      {...(inputProps["disabled"] === undefined ? {} : { disabled: inputProps["disabled"] })}
      id={id}
      onValueChange={(values) =>
        inputProps["onValueChange"](numericOptions ? values.map((value) => Number(value)) : values)
      }
      options={options}
      placeholder={
        getFieldUiConfig(field).placeholder ||
        formatProtoformMessage(formatMessage, "auto_form.multiselect.placeholder", {}, "Select one or more options")
      }
      testId={testIds.field}
      value={Array.isArray(inputProps["value"]) ? inputProps["value"].map((value: unknown) => String(value)) : []}
      width="full"
    />
  );
}

export { MultiSelectFieldComponent };

export const multiselectFieldDefinition: FieldTypeDefinition = {
  component: MultiSelectFieldComponent,
  match: (field) => {
    if (field.type !== "array") {
      return false;
    }
    const itemField = field.schema?.[0];
    return itemField?.type === "select" && itemField.options !== undefined && itemField.options.length > 0;
  },
  name: "multiselect",
  priority: 20,
};

// ── Data-provider-backed multi-select ─────────────────────────────────
// Matches `repeated string` whose item carries a `data_provider`
// annotation, e.g. OpenAPI `include_methods` / `exclude_methods`. The
// previous behavior rendered a list of single dropdowns with an "Add"
// button — one row per method. A multi-select collapses that to a single
// control that holds every picked method as a chip.

const NO_PROVIDER_RESULT: DataProviderResult = { options: [] };

function DataProviderMultiSelectComponent({ field, id, inputProps, path }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const itemField = field.schema?.[0];
  const providerId = readDataProviderId(itemField);
  const { dataProviders, formValues } = useAutoForm();
  const provider = resolveDataProvider(dataProviders, providerId);
  const currentValue = Array.isArray(inputProps["value"])
    ? inputProps["value"].map((value: unknown) => String(value))
    : [];
  const fieldPath = path.join(".");
  const dependencyValues = Object.fromEntries(
    (provider?.dependencies ?? []).map((dependency) => [dependency, getPathInObject(formValues, dependency.split("."))])
  );
  const signal = useDataProviderSignal(safeStringify({ dependencyValues, fieldPath, selectedValues: currentValue }));

  if (!provider) {
    return (
      <DataProviderMultiSelectResult
        currentValue={currentValue}
        field={field}
        id={id}
        inputProps={inputProps}
        result={NO_PROVIDER_RESULT}
        testIds={testIds}
      />
    );
  }

  const Provider = provider.component;
  return (
    <Provider
      request={{ cursor: undefined, dependencyValues, fieldPath, query: "", selectedValues: currentValue, signal }}
    >
      {(result) => (
        <DataProviderMultiSelectResult
          currentValue={currentValue}
          field={field}
          id={id}
          inputProps={inputProps}
          provider={provider}
          result={result}
          testIds={testIds}
        />
      )}
    </Provider>
  );
}

function DataProviderMultiSelectResult({
  currentValue,
  field,
  id,
  inputProps,
  provider,
  result,
  testIds,
}: {
  currentValue: string[];
  field: AutoFormFieldProps["field"];
  id: string;
  inputProps: AutoFormFieldProps["inputProps"];
  provider?: ResolvedDataProvider | undefined;
  result: DataProviderResult;
  testIds: ReturnType<typeof useFieldTestIds>;
}) {
  const { formatMessage } = useAutoForm();
  const { options: providerOptions, isLoading, error: providerError } = result;
  // A failed load says nothing about which selections still exist, so keep them as they are.
  const staleSelections = isLoading || providerError ? [] : getStaleSelections(providerOptions, currentValue);
  const staleSelectionSet = new Set(staleSelections);
  let renderedProviderOptions: DataProviderOption[] = [
    ...staleSelections.map((value) => ({ label: value, value })),
    ...providerOptions,
  ];
  if (providerError) {
    renderedProviderOptions = currentValue.map((value) => ({ label: value, value }));
  } else if (provider?.staleSelection === "clear") {
    renderedProviderOptions = providerOptions;
  }

  const applyUnavailableSelectionClear = React.useEffectEvent(() => {
    inputProps["onValueChange"](currentValue.filter((value) => !staleSelectionSet.has(value)));
  });
  const unavailableSelectionKey =
    provider?.staleSelection === "clear" && staleSelections.length > 0
      ? safeStringify({ currentValue, staleSelections })
      : undefined;

  React.useEffect(
    function clearUnavailableSelections() {
      if (unavailableSelectionKey !== undefined) {
        applyUnavailableSelectionClear();
      }
    },
    [unavailableSelectionKey]
  );

  const options = renderedProviderOptions.map((option) => {
    // `label` is typed as ReactNode on MultiSelectOptionItem, so we can
    // render icon + text + description inline instead of stringifying.
    const labelNode = (
      <span className="flex items-center gap-2" key={option.value}>
        {option.icon ? (
          <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-full">{option.icon}</span>
        ) : null}
        <span>{option.label}</span>
        {option.description ? <span className="text-muted-foreground text-xs">— {option.description}</span> : null}
      </span>
    );
    return {
      label: labelNode,
      selectedTestId: testIds.selected(option.value),
      testId: testIds.option(option.value),
      value: option.value,
    };
  });

  return (
    <div className="space-y-2">
      <SimpleMultiSelect
        disabled={Boolean(inputProps["disabled"] || isLoading || providerError)}
        id={id}
        onValueChange={(values) => inputProps["onValueChange"](values)}
        options={options}
        placeholder={
          getFieldUiConfig(field).placeholder ||
          formatProtoformMessage(
            formatMessage,
            isLoading ? "auto_form.select.loading" : "auto_form.multiselect.placeholder",
            {},
            isLoading ? "Loading…" : "Select one or more options"
          )
        }
        testId={testIds.field}
        value={currentValue}
        width="full"
      />
      {providerError ? (
        <p className="text-destructive text-sm" role="alert">
          {formatProtoformMessage(formatMessage, "auto_form.select.load_error", {}, "Failed to load options")}
        </p>
      ) : null}
      {provider?.staleSelection === "error" && staleSelections.length > 0 ? (
        <p className="text-destructive text-sm" role="alert">
          {formatProtoformMessage(
            formatMessage,
            "auto_form.select.stale",
            { value: staleSelections.join(", ") },
            "Selected values are no longer available."
          )}
        </p>
      ) : null}
    </div>
  );
}

export const dataProviderMultiselectFieldDefinition: FieldTypeDefinition = {
  component: DataProviderMultiSelectComponent,
  match: (field) => {
    if (field.type !== "array") {
      return false;
    }
    const itemField = field.schema?.[0];
    if (!itemField || (itemField.type !== "string" && itemField.type !== "number")) {
      return false;
    }
    return readDataProviderId(itemField) !== undefined;
  },
  name: "dataProviderMultiSelect",
  // Higher than the default `multiselect` (20) so an annotated item wins
  // over the legacy "array-of-select-enum" branch even when both match.
  priority: 120,
};
