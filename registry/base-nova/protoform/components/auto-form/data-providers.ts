/**
 * Data-provider registry for AutoForm dropdowns.
 *
 * AutoForm is RPC-agnostic: the registry only knows about option requests and results.
 * Each provider is a React component (or a hook) that receives search, pagination,
 * dependency, selection, and cancellation context.
 * Whether the options are a static array or backed by an RPC is a concern
 * of the hosting app's wiring layer, not AutoForm.
 *
 * The registry is keyed by a string id that mirrors a proto `DataProviderId`
 * enum. The hosting app registers one implementation per id.
 */

import React from "react";

export interface DataProviderOption {
  /** Optional helper line shown beneath the label. */
  description?: string;
  /** Optional group heading so related options cluster visually. */
  group?: string;
  /**
   * Optional glyph rendered before the label. Most useful when a dropdown
   * combines options from multiple sources and a visual mark helps users
   * distinguish them. Lists from one source should usually omit a repeated
   * icon because it adds noise without new information.
   */
  icon?: React.ReactNode;
  /** Display label shown in the dropdown. */
  label: string;
  /** Wire value stored in form state. */
  value: string;
}

export interface DataProviderResult {
  /** Non-null when the provider failed to load. */
  error?: unknown;
  /** True while an async source is loading. Static providers may omit this. */
  isLoading?: boolean;
  /** Opaque cursor passed to the next provider request when the user asks for more options. */
  nextCursor?: string;
  options: DataProviderOption[];
}

export interface DataProviderDependencyValues {
  readonly [path: string]: unknown;
}

export interface DataProviderRequest {
  /** Opaque provider-owned cursor for the requested page. */
  cursor?: string | undefined;
  /** Values for the dependency paths declared by the provider registration. */
  dependencyValues: DataProviderDependencyValues;
  fieldPath: string;
  query: string;
  selectedValues: readonly string[];
  /** Aborted when the request context is replaced or the field unmounts. */
  signal: AbortSignal;
}

export type DataProviderStaleSelectionPolicy = "clear" | "error" | "preserve";

/**
 * A hook data provider. Implementations may call `useQuery`, return a
 * memoised constant array, or anything in between — AutoForm never
 * inspects the internals.
 *
 * AutoForm renders each hook inside its own component keyed by function
 * identity, so pass a stable function: an inline arrow remounts the
 * provider on every render.
 */
export type DataProvider = (request: DataProviderRequest) => DataProviderResult;

export interface DataProviderProps {
  children: (result: DataProviderResult) => React.ReactNode;
  request: DataProviderRequest;
}

/**
 * A component data provider. It may call any hooks and renders `children`
 * with the current result. Swapping the component remounts the provider,
 * so implementations never share hook state.
 */
export type DataProviderComponent = React.ComponentType<DataProviderProps>;

interface DataProviderOptions {
  /** Form paths whose current values are included in each provider request. */
  dependencies?: readonly string[];
  /** Defaults to `preserve`. */
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

/**
 * Resolve a data provider by id. Returns `undefined` when the id is not
 * registered; the caller is responsible for rendering a graceful fallback.
 */
export function resolveDataProvider(
  registry: DataProviderRegistry | undefined,
  id: string | undefined
): ResolvedDataProvider | undefined {
  if (!(registry && id)) {
    return;
  }
  const registration = registry[id];
  if (!registration) {
    return;
  }
  if (typeof registration === "function") {
    return {
      component: getHookProviderComponent(registration),
      dependencies: [],
      staleSelection: "preserve",
    };
  }
  return {
    component: registration.component ?? getHookProviderComponent(registration.useProvider),
    dependencies: registration.dependencies ?? [],
    staleSelection: registration.staleSelection ?? "preserve",
  };
}

const hookProviderComponents = new WeakMap<DataProvider, DataProviderComponent>();

function getHookProviderComponent(useProvider: DataProvider): DataProviderComponent {
  const cached = hookProviderComponents.get(useProvider);
  if (cached) {
    return cached;
  }
  function HookDataProvider({ children, request }: DataProviderProps) {
    // The hook is a closure value, which the compiler cannot prove stable.
    // The WeakMap gives each hook its own component, so it never changes here.
    "use no memo";
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
