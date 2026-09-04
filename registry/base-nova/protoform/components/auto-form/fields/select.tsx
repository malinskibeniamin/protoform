"use client";

import React from "react";
import { formatProtoformMessage } from "../../../lib/core/messages";
import { useAutoForm } from "../context";
import type { AutoFormFieldProps } from "../core-types";
import {
  type DataProviderOption,
  type DataProviderRequest,
  getStaleSelections,
  type ResolvedDataProvider,
  resolveDataProvider,
  useDataProviderSignal,
} from "../data-providers";
import { getPathInObject } from "../field-utils";
import type { FieldTypeDefinition } from "../registry";
import {
  Button,
  Combobox,
  type ComboboxOption,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui-components";
import { safeStringify } from "../utils/serialization";
import {
  getControlLabel,
  getFlatOptions,
  getGroupedOptions,
  hasNumericOptions,
  readDataProviderId,
  renderOptionLabel,
  useFieldTestIds,
} from "./shared";

function SelectFieldComponent({ error, field, id, inputProps, label, path }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const { dataProviders, formatMessage, formValues } = useAutoForm();
  const providerId = readDataProviderId(field);
  const provider = resolveDataProvider(dataProviders, providerId);
  const dependencyValues = Object.fromEntries(
    (provider?.dependencies ?? []).map((dependency) => [dependency, getPathInObject(formValues, dependency.split("."))])
  );
  const numericOptions = hasNumericOptions(field);
  const currentValue =
    inputProps["value"] === undefined || inputProps["value"] === null ? null : String(inputProps["value"]);
  const fieldLabel = getControlLabel(label, field);
  const optionGroups = getGroupedOptions(field);
  const flatOptions = getFlatOptions(field);

  if (provider) {
    return (
      <SelectFieldFromProvider
        currentValue={currentValue}
        dependencyValues={dependencyValues}
        error={error}
        field={field}
        id={id}
        inputProps={inputProps}
        key={safeStringify(dependencyValues)}
        path={path}
        provider={provider}
        testIds={testIds}
      />
    );
  }

  return (
    <Select
      items={[
        ...(field.required
          ? []
          : [
              {
                label: formatProtoformMessage(formatMessage, "auto_form.select.not_set", {}, "Not set"),
                value: null,
              },
            ]),
        ...flatOptions.map((option) => ({
          label: renderOptionLabel(option),
          value: option.value,
        })),
      ]}
      onValueChange={(value) => {
        if (value === null) {
          inputProps["onValueChange"](undefined);
          return;
        }
        inputProps["onValueChange"](numericOptions ? Number(value) : value);
      }}
      value={currentValue}
    >
      <SelectTrigger
        aria-label={fieldLabel}
        className={error ? "border-destructive" : ""}
        disabled={inputProps["disabled"]}
        id={id}
        testId={testIds.control}
      >
        <SelectValue
          placeholder={formatProtoformMessage(formatMessage, "auto_form.select.placeholder", {}, "Select an option")}
        />
      </SelectTrigger>
      <SelectContent>
        {field.required ? null : (
          <SelectItem testId={testIds.option("not-set")} value={null}>
            {formatProtoformMessage(formatMessage, "auto_form.select.not_set", {}, "Not set")}
          </SelectItem>
        )}
        {optionGroups && optionGroups.length > 0
          ? optionGroups.map((group) => (
              <SelectGroup
                key={`${field.key}-group-${String(group.label ?? group.options.map((option) => option.value).join("-"))}`}
                testId={testIds.group(String(group.label ?? group.options.map((option) => option.value).join("-")))}
              >
                {group.label ? <SelectLabel>{group.label}</SelectLabel> : null}
                {group.options.map((option) => (
                  <SelectItem key={option.value} testId={testIds.option(option.value)} value={option.value}>
                    {renderOptionLabel(option)}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          : flatOptions.map((option) => (
              <SelectItem key={option.value} testId={testIds.option(option.value)} value={option.value}>
                {renderOptionLabel(option)}
              </SelectItem>
            ))}
      </SelectContent>
    </Select>
  );
}

function SelectFieldFromProvider({
  currentValue,
  dependencyValues,
  error,
  field,
  id,
  inputProps,
  path,
  provider,
  testIds,
}: {
  currentValue: string | null;
  dependencyValues: DataProviderRequest["dependencyValues"];
  error: AutoFormFieldProps["error"];
  field: AutoFormFieldProps["field"];
  id: string;
  inputProps: AutoFormFieldProps["inputProps"];
  path: string[];
  provider: ResolvedDataProvider;
  testIds: ReturnType<typeof useFieldTestIds>;
}) {
  "use no memo";

  const { formatMessage } = useAutoForm();
  const [query, setQuery] = React.useState("");
  const [cursor, setCursor] = React.useState<string>();
  const [loadedOptions, setLoadedOptions] = React.useState<DataProviderOption[]>([]);
  const fieldPath = path.join(".");
  const selectedValues = currentValue === null ? [] : [currentValue];
  const requestKey = safeStringify({ cursor, dependencyValues, fieldPath, query, selectedValues });
  const signal = useDataProviderSignal(requestKey);
  const {
    options,
    isLoading,
    error: providerError,
    nextCursor,
  } = provider.useProvider({
    cursor,
    dependencyValues,
    fieldPath,
    query,
    selectedValues,
    signal,
  });
  const optionsKey = safeStringify(
    options.map(({ description, group, label, value }) => ({ description, group, label, value }))
  );
  const providerPageKey = requestKey.concat(":", optionsKey);
  const collectedPageKey = React.useRef<string | undefined>(undefined);
  const availableOptions =
    isLoading || providerError ? loadedOptions : mergeProviderOptions(cursor ? loadedOptions : [], options);
  const staleSelections = isLoading || providerError ? [] : getStaleSelections(availableOptions, selectedValues);
  const renderedOptions: DataProviderOption[] =
    provider.staleSelection === "clear"
      ? availableOptions
      : [...staleSelections.map((value) => ({ label: value, value })), ...availableOptions];

  React.useEffect(
    function collectProviderPageEffect() {
      if (isLoading || providerError || collectedPageKey.current === providerPageKey) {
        return;
      }
      collectedPageKey.current = providerPageKey;
      setLoadedOptions((currentOptions) => mergeProviderOptions(cursor ? currentOptions : [], options));
    },
    [cursor, isLoading, options, providerError, providerPageKey]
  );

  const applyUnavailableSelectionClear = React.useEffectEvent(() => inputProps["onValueChange"](undefined));
  const staleSelectionKey =
    provider.staleSelection === "clear" && staleSelections.length > 0 ? (currentValue ?? "") : undefined;

  React.useEffect(
    function clearUnavailableSelection() {
      if (staleSelectionKey !== undefined) {
        applyUnavailableSelectionClear();
      }
    },
    [staleSelectionKey]
  );

  if (providerError) {
    return (
      <Combobox
        disabled
        id={id}
        onChange={() => undefined}
        options={[]}
        placeholder={formatProtoformMessage(formatMessage, "auto_form.select.load_error", {}, "Failed to load options")}
        testId={testIds.control}
      />
    );
  }

  const comboboxOptions: ComboboxOption[] = renderedOptions.map((option) => ({
    data: option,
    group: option.group,
    label: option.label,
    testId: testIds.option(option.value),
    value: option.value,
  }));

  return (
    <div className="space-y-2">
      <Combobox
        className={error ? "[&_input]:border-destructive" : undefined}
        clearable={!field.required}
        disabled={Boolean(inputProps["disabled"])}
        emptyState={formatProtoformMessage(formatMessage, "auto_form.select.empty", {}, "No options found.")}
        id={id}
        loading={isLoading}
        onChange={(value) => {
          if (value === "") {
            inputProps["onValueChange"](undefined);
            return;
          }
          inputProps["onValueChange"](field.type === "number" ? Number(value) : value);
        }}
        onInputValueChange={(value) => {
          setQuery(value);
          setCursor(undefined);
        }}
        options={comboboxOptions}
        placeholder={formatProtoformMessage(
          formatMessage,
          isLoading ? "auto_form.select.loading" : "auto_form.select.placeholder",
          {},
          isLoading ? "Loading…" : "Select an option"
        )}
        renderOption={(option) => {
          const { data } = option;
          return isDataProviderOption(data) ? <ProviderOptionLabel option={data} /> : option.label;
        }}
        testId={testIds.control}
        value={currentValue ?? ""}
      />
      {provider.staleSelection === "error" && staleSelections.length > 0 ? (
        <p className="text-destructive text-sm" role="alert">
          {formatProtoformMessage(
            formatMessage,
            "auto_form.select.stale",
            { value: staleSelections.join(", ") },
            "Selected value is no longer available."
          )}
        </p>
      ) : null}
      {nextCursor ? (
        <Button onClick={() => setCursor(nextCursor)} type="button" variant="outline">
          {formatProtoformMessage(formatMessage, "auto_form.load_more", {}, "Load more")}
        </Button>
      ) : null}
    </div>
  );
}

function isDataProviderOption(value: unknown): value is DataProviderOption {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof Reflect.get(value, "label") === "string" &&
      typeof Reflect.get(value, "value") === "string"
  );
}

function mergeProviderOptions(
  currentOptions: DataProviderOption[],
  pageOptions: readonly DataProviderOption[]
): DataProviderOption[] {
  const merged = new Map(currentOptions.map((option) => [option.value, option]));
  for (const option of pageOptions) {
    merged.set(option.value, option);
  }
  const nextOptions = [...merged.values()];
  if (
    nextOptions.length === currentOptions.length &&
    nextOptions.every((option, index) => {
      const current = currentOptions[index];
      if (!current) {
        return false;
      }
      return (
        current.description === option.description &&
        current.group === option.group &&
        current.icon === option.icon &&
        current.label === option.label &&
        current.value === option.value
      );
    })
  ) {
    return currentOptions;
  }
  return nextOptions;
}

function ProviderOptionLabel({ option }: { option: DataProviderOption }) {
  const labelWithIcon = option.icon ? (
    <span className="flex items-center gap-2">
      <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-full">{option.icon}</span>
      <span>{option.label}</span>
    </span>
  ) : (
    <span>{option.label}</span>
  );

  if (!option.description) {
    return labelWithIcon;
  }
  return (
    <span className="flex items-center justify-between gap-3">
      {labelWithIcon}
      <span className="text-muted-foreground text-xs">{option.description}</span>
    </span>
  );
}

export { SelectFieldComponent };

export const selectFieldDefinition: FieldTypeDefinition = {
  component: SelectFieldComponent,
  match: (field) => {
    if (field.type !== "select") {
      return false;
    }
    const optionCount = field.options?.length ?? 0;
    return optionCount > 3 && optionCount <= 8;
  },
  name: "select",
  priority: 12,
};

/**
 * Second routing rule for the same `SelectFieldComponent`. Matches any
 * field annotated with `data_provider`, regardless of its underlying
 * proto type — a string field with `data_provider = AWS_REGIONS`
 * becomes a select populated from the hosting app's data-provider
 * registry. High priority so the annotation wins over the default
 * `string` / `password` / `email` matchers.
 *
 * The same component handles both rules; the routing split exists only
 * because static proto-enum selects and annotation-driven selects
 * match under different conditions.
 */
export const dataProviderSelectFieldDefinition: FieldTypeDefinition = {
  component: SelectFieldComponent,
  match: (field) => {
    // Arrays / maps / objects keep their native renderers even when the
    // parent field is annotated with a data provider. Support for
    // array-of-strings multi-select from a data provider is a follow-up.
    if (field.type !== "string" && field.type !== "number") {
      return false;
    }
    return readDataProviderId(field) !== undefined;
  },
  name: "dataProviderSelect",
  priority: 120,
};
