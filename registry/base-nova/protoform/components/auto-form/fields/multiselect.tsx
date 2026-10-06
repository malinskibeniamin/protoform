'use client';

import React from 'react';
import { formatProtoformMessage } from '@/registry/base-nova/protoform/lib/core/messages';
import { useAutoForm } from '../context';
import type { AutoFormFieldProps } from '../core-types';
import {
  type DataProviderOption,
  type DataProviderResult,
  type ResolvedDataProvider,
  resolveDataProvider,
  useDataProviderSignal,
  useProviderOptions,
} from '../data-providers';
import { getPathInObject } from '../field-utils';
import { getFieldUiConfig, NUMERIC_OPTION_PATTERN } from '../helpers';
import type { FieldTypeDefinition } from '../registry';
import { Button, SimpleMultiSelect } from '../ui-components';
import { safeStringify } from '../utils/serialization';
import { getGroupedOptions, readDataProviderId, renderOptionLabel, useFieldTestIds } from './shared';

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
          testId: testIds.group(String(group.label ?? 'group')),
        }))
      : (itemField?.options ?? []).map(([value, optionLabel]) => ({
          label: optionLabel,
          selectedTestId: testIds.selected(value),
          testId: testIds.option(value),
          value,
        }));

  const { placeholder } = getFieldUiConfig(field);

  return (
    <SimpleMultiSelect
      {...(inputProps['disabled'] === undefined ? {} : { disabled: inputProps['disabled'] })}
      id={id}
      onValueChange={(values) =>
        inputProps['onValueChange'](numericOptions ? values.map((value) => Number(value)) : values)
      }
      options={options}
      placeholder={
        placeholder !== undefined && placeholder !== ''
          ? placeholder
          : formatProtoformMessage(formatMessage, 'auto_form.multiselect.placeholder', {}, 'Select one or more options')
      }
      testId={testIds.field}
      value={Array.isArray(inputProps['value']) ? inputProps['value'].map((value: unknown) => String(value)) : []}
      width="full"
    />
  );
}

export { MultiSelectFieldComponent };

export const multiselectFieldDefinition: FieldTypeDefinition = {
  component: MultiSelectFieldComponent,
  match: (field) => {
    if (field.type !== 'array') {
      return false;
    }
    const itemField = field.schema?.[0];
    return itemField?.type === 'select' && itemField.options !== undefined && itemField.options.length > 0;
  },
  name: 'multiselect',
  priority: 20,
};

const NO_PROVIDER_RESULT: DataProviderResult = { options: [] };

function DataProviderMultiSelectComponent({ field, id, inputProps, path }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const itemField = field.schema?.[0];
  const providerId = readDataProviderId(itemField);
  const { dataProviders, formValues } = useAutoForm();
  const provider = resolveDataProvider(dataProviders, providerId);
  const currentValue = Array.isArray(inputProps['value'])
    ? inputProps['value'].map((value: unknown) => String(value))
    : [];
  const fieldPath = path.join('.');
  const dependencyValues = Object.fromEntries(
    (provider?.dependencies ?? []).map((dependency) => [dependency, getPathInObject(formValues, dependency.split('.'))])
  );

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

  return (
    <PagedMultiSelect
      key={safeStringify(dependencyValues)}
      {...{ provider, dependencyValues, currentValue, field, fieldPath, id, inputProps, testIds }}
    />
  );
}

function PagedMultiSelect({
  provider,
  dependencyValues,
  currentValue,
  field,
  fieldPath,
  id,
  inputProps,
  testIds,
}: {
  provider: ResolvedDataProvider;
  dependencyValues: Record<string, unknown>;
  currentValue: string[];
  field: AutoFormFieldProps['field'];
  fieldPath: string;
  id: string;
  inputProps: AutoFormFieldProps['inputProps'];
  testIds: ReturnType<typeof useFieldTestIds>;
}) {
  const [query, setQuery] = React.useState('');
  const [cursor, setCursor] = React.useState<string | undefined>();
  const requestKey = safeStringify({ dependencyValues, fieldPath, query, cursor, selectedValues: currentValue });
  const signal = useDataProviderSignal(requestKey);
  const Provider = provider.component;
  return (
    <Provider request={{ cursor, dependencyValues, fieldPath, query, selectedValues: currentValue, signal }}>
      {(result) => (
        <DataProviderMultiSelectResult
          {...{ currentValue, field, id, inputProps, provider, result, testIds, cursor, query, requestKey }}
          onCursorChange={setCursor}
          onQueryChange={(value) => {
            setQuery(value);
            setCursor(undefined);
          }}
        />
      )}
    </Provider>
  );
}

function DataProviderMultiSelectResult({
  cursor,
  query = '',
  requestKey = '',
  onCursorChange,
  onQueryChange,
  currentValue,
  field,
  id,
  inputProps,
  provider,
  result,
  testIds,
}: {
  currentValue: string[];
  field: AutoFormFieldProps['field'];
  id: string;
  inputProps: AutoFormFieldProps['inputProps'];
  cursor?: string | undefined;
  query?: string;
  requestKey?: string;
  onCursorChange?: (cursor: string) => void;
  onQueryChange?: (query: string) => void;
  provider?: ResolvedDataProvider | undefined;
  result: DataProviderResult;
  testIds: ReturnType<typeof useFieldTestIds>;
}) {
  const { formatMessage } = useAutoForm();
  const { emptyState, isLoading, error: providerError } = result;
  const { placeholder } = getFieldUiConfig(field);
  const { renderedOptions: renderedProviderOptions, staleSelections } = useProviderOptions({
    cursor,
    query,
    requestKey,
    result,
    selectedValues: currentValue,
    staleSelection: provider?.staleSelection ?? 'preserve',
  });
  const staleSelectionSet = new Set(staleSelections);
  const retainedSelections = currentValue.filter((value) => !staleSelectionSet.has(value));
  const applyUnavailableSelectionClear = React.useEffectEvent((values: string[]) => {
    inputProps['onValueChange'](values);
  });

  const shouldClearUnavailableSelections = provider?.staleSelection === 'clear' && staleSelections.length > 0;

  React.useEffect(
    function clearUnavailableSelections() {
      if (shouldClearUnavailableSelections) {
        applyUnavailableSelectionClear(retainedSelections);
      }
    },
    [shouldClearUnavailableSelections, retainedSelections]
  );

  const options = renderedProviderOptions.map((option) => ({
    label: <ProviderOptionLabel option={option} />,
    selectedTestId: testIds.selected(option.value),
    testId: testIds.option(option.value),
    value: option.value,
  }));

  return (
    <div className="space-y-2">
      <SimpleMultiSelect
        disabled={Boolean(inputProps['disabled'] || isLoading === true || providerError)}
        emptyState={emptyState}
        id={id}
        onSearch={onQueryChange}
        onValueChange={(values) => inputProps['onValueChange'](values)}
        options={options}
        placeholder={
          [placeholder].find(Boolean) ??
          formatProtoformMessage(
            formatMessage,
            isLoading === true ? 'auto_form.select.loading' : 'auto_form.multiselect.placeholder',
            {},
            isLoading === true ? 'Loading…' : 'Select one or more options'
          )
        }
        testId={testIds.field}
        value={currentValue}
        width="full"
      />
      <ProviderResultStatus
        onCursorChange={onCursorChange}
        result={result}
        staleSelection={provider?.staleSelection}
        staleSelections={staleSelections}
      />
    </div>
  );
}

function ProviderResultStatus({
  onCursorChange,
  result,
  staleSelection,
  staleSelections,
}: {
  onCursorChange: ((cursor: string) => void) | undefined;
  result: DataProviderResult;
  staleSelection: ResolvedDataProvider['staleSelection'] | undefined;
  staleSelections: string[];
}) {
  const { formatMessage } = useAutoForm();
  const { isLoading, error: providerError, nextCursor } = result;
  const hasProviderError = Boolean(providerError);
  return (
    <>
      {nextCursor !== undefined && nextCursor !== '' && onCursorChange ? (
        <Button
          disabled={Boolean(isLoading === true || providerError)}
          onClick={() => onCursorChange(nextCursor)}
          type="button"
          variant="outline"
        >
          {formatProtoformMessage(formatMessage, 'auto_form.load_more', {}, 'Load more')}
        </Button>
      ) : null}
      {hasProviderError ? (
        <p className="text-destructive text-sm" role="alert">
          {formatProtoformMessage(formatMessage, 'auto_form.select.load_error', {}, 'Failed to load options')}
        </p>
      ) : null}
      {staleSelection === 'error' && staleSelections.length > 0 ? (
        <p className="text-destructive text-sm" role="alert">
          {formatProtoformMessage(
            formatMessage,
            'auto_form.select.stale',
            { value: staleSelections.join(', ') },
            'Selected values are no longer available.'
          )}
        </p>
      ) : null}
    </>
  );
}

function ProviderOptionLabel({ option }: { option: DataProviderOption }) {
  return (
    <span className="flex items-center gap-2">
      {option.icon ? (
        <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-full">{option.icon}</span>
      ) : null}
      <span>{option.label}</span>
      {option.description !== undefined && option.description !== '' ? (
        <span className="text-muted-foreground text-xs">— {option.description}</span>
      ) : null}
    </span>
  );
}

export const dataProviderMultiselectFieldDefinition: FieldTypeDefinition = {
  component: DataProviderMultiSelectComponent,
  match: (field) => {
    if (field.type !== 'array') {
      return false;
    }
    const itemField = field.schema?.[0];
    if (!itemField || (itemField.type !== 'string' && itemField.type !== 'number')) {
      return false;
    }
    return readDataProviderId(itemField) !== undefined;
  },
  name: 'dataProviderMultiSelect',
  priority: 120,
};
