import React from 'react';
import { safeStringify } from './utils/serialization';

export interface DataProviderOption {
  description?: string;
  group?: string;
  icon?: React.ReactNode;
  label: string;
  value: string;
}

export interface DataProviderResult {
  emptyState?: React.ReactNode;
  error?: unknown;
  isLoading?: boolean;
  nextCursor?: string;
  options: DataProviderOption[];
}

export interface DataProviderDependencyValues {
  readonly [path: string]: unknown;
}

export interface DataProviderRequest {
  cursor?: string | undefined;
  dependencyValues: DataProviderDependencyValues;
  fieldPath: string;
  query: string;
  selectedValues: readonly string[];
  signal: AbortSignal;
}

export type DataProviderStaleSelectionPolicy = 'clear' | 'error' | 'preserve';

export type DataProvider = (request: DataProviderRequest) => DataProviderResult;

export interface DataProviderProps {
  children: (result: DataProviderResult) => React.ReactNode;
  request: DataProviderRequest;
}

export type DataProviderComponent = React.ComponentType<DataProviderProps>;

interface DataProviderOptions {
  dependencies?: readonly string[];
  staleSelection?: DataProviderStaleSelectionPolicy;
}

export type DataProviderDefinition = DataProviderOptions &
  ({ component: DataProviderComponent; useProvider?: never } | { component?: never; useProvider: DataProvider });

export interface ResolvedDataProvider {
  component: DataProviderComponent;
  dependencies: readonly string[];
  staleSelection: DataProviderStaleSelectionPolicy;
}

export type DataProviderRegistration = DataProvider | DataProviderDefinition;
export type DataProviderRegistry = Record<string, DataProviderRegistration>;

export function resolveDataProvider(
  registry: DataProviderRegistry | undefined,
  id: string | undefined
): ResolvedDataProvider | undefined {
  if (!(registry && id !== undefined && id !== '')) {
    return;
  }
  const registration = registry[id];
  if (!registration) {
    return;
  }
  if (typeof registration === 'function') {
    return {
      component: getHookProviderComponent(registration),
      dependencies: [],
      staleSelection: 'preserve',
    };
  }
  return {
    component: registration.component ?? getHookProviderComponent(registration.useProvider),
    dependencies: registration.dependencies ?? [],
    staleSelection: registration.staleSelection ?? 'preserve',
  };
}

const hookProviderComponents = new WeakMap<DataProvider, DataProviderComponent>();

function getHookProviderComponent(useProvider: DataProvider): DataProviderComponent {
  const cached = hookProviderComponents.get(useProvider);
  if (cached) {
    return cached;
  }
  function HookDataProvider({ children, request }: DataProviderProps) {
    'use no memo';
    return children(useProvider(request));
  }
  hookProviderComponents.set(useProvider, HookDataProvider);
  return HookDataProvider;
}

export function getStaleSelections(
  options: readonly DataProviderOption[],
  selectedValues: readonly string[]
): string[] {
  const availableValues = new Set(options.map((option) => option.value));
  return selectedValues.filter((value) => !availableValues.has(value));
}

export function useDataProviderSignal(requestKey: string): AbortSignal {
  const [state, setState] = React.useState(() => ({ controller: new AbortController(), key: requestKey }));

  const replaceProviderSignal = React.useEffectEvent((key: string) => {
    if (state.key === key && !state.controller.signal.aborted) {
      return;
    }
    state.controller.abort();
    setState({ controller: new AbortController(), key });
  });

  React.useEffect(
    function replaceProviderSignalEffect() {
      replaceProviderSignal(requestKey);
    },
    [requestKey]
  );

  React.useEffect(
    function abortProviderSignal() {
      return () => state.controller.abort();
    },
    [state.controller]
  );

  return state.controller.signal;
}

export function useProviderOptions({
  result,
  query,
  cursor,
  requestKey,
  selectedValues,
  staleSelection,
}: {
  result: DataProviderResult;
  query: string;
  cursor: string | undefined;
  requestKey: string;
  selectedValues: string[];
  staleSelection: ResolvedDataProvider['staleSelection'];
}) {
  const [loadedOptions, setLoadedOptions] = React.useState<DataProviderOption[]>([]);
  const { options, isLoading, error: providerError } = result;
  const hasProviderError = Boolean(providerError);
  const hasCursor = cursor !== undefined && cursor !== '';
  const hasNextPage = result.nextCursor !== undefined && result.nextCursor !== '';
  const optionsKey = safeStringify(
    options.map(({ description, group, label, value }) => ({ description, group, label, value }))
  );
  const providerPageKey = requestKey.concat(':', optionsKey);
  const collectedPageKey = React.useRef<string | undefined>(undefined);
  const availableOptions =
    isLoading === true || hasProviderError
      ? loadedOptions
      : mergeProviderOptions(hasCursor ? loadedOptions : [], options);
  const staleSelections =
    isLoading === true || hasProviderError || hasNextPage || query !== ''
      ? []
      : getStaleSelections(availableOptions, selectedValues);
  const missingSelections = getStaleSelections(availableOptions, selectedValues);
  const staleSelectionSet = new Set(staleSelections);
  const placeholders =
    staleSelection === 'clear' ? missingSelections.filter((value) => !staleSelectionSet.has(value)) : missingSelections;
  const renderedOptions: DataProviderOption[] = [
    ...placeholders.map((value) => ({ label: value, value })),
    ...availableOptions,
  ];

  React.useEffect(
    function collectProviderPageEffect() {
      if (isLoading === true || hasProviderError || collectedPageKey.current === providerPageKey) {
        return;
      }
      collectedPageKey.current = providerPageKey;
      setLoadedOptions((currentOptions) => mergeProviderOptions(hasCursor ? currentOptions : [], options));
    },
    [hasCursor, isLoading, options, hasProviderError, providerPageKey]
  );

  return { renderedOptions, staleSelections };
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
