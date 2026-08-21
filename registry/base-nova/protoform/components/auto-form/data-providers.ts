/**
 * Data-provider registry for AutoForm dropdowns.
 *
 * AutoForm is RPC-agnostic: the registry only knows about option lists.
 * Each provider is a React hook that returns `{ options, isLoading?, error? }`.
 * Whether the options are a static array or backed by an RPC is a concern
 * of the hosting app's wiring layer, not AutoForm.
 *
 * The registry is keyed by a string id that mirrors a proto `DataProviderId`
 * enum. The hosting app registers one implementation per id; a CI test
 * enumerates the proto descriptors and asserts completeness.
 */

import type React from "react";

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
  options: DataProviderOption[];
}

/**
 * A data provider is a React hook. Implementations may call `useQuery`,
 * return a memoised constant array, or anything in between — AutoForm
 * never inspects the internals.
 */
export type DataProvider = () => DataProviderResult;

export type DataProviderRegistry = Record<string, DataProvider>;

/**
 * Resolve a data provider by id. Returns `undefined` when the id is not
 * registered; the caller is responsible for rendering a graceful fallback
 * (and, in dev, logging a warning).
 */
export function resolveDataProvider(
  registry: DataProviderRegistry | undefined,
  id: string | undefined
): DataProvider | undefined {
  if (!(registry && id)) {
    return;
  }
  return registry[id];
}
