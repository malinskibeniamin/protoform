import React from 'react';

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

  React.useEffect(
    function replaceProviderSignal() {
      if (state.key === requestKey) {
        return;
      }
      state.controller.abort();
      setState({ controller: new AbortController(), key: requestKey });
    },
    [requestKey, state]
  );

  React.useEffect(
    function abortProviderSignal() {
      return () => state.controller.abort();
    },
    [state.controller]
  );

  return state.controller.signal;
}
