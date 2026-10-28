import React from 'react';

const FormDepthContext = React.createContext(0);

export function useFormDepth(): number {
  return React.useContext(FormDepthContext);
}

export function FormDepthProvider({ depth, children }: { depth: number; children: React.ReactNode }) {
  return <FormDepthContext.Provider value={depth}>{children}</FormDepthContext.Provider>;
}

export function headingLevelForDepth(depth: number): 2 | 3 | 4 | 5 {
  if (depth < 1 || Number.isNaN(depth)) {
    return 2;
  }
  if (depth < 2) {
    return 3;
  }
  if (depth < 3) {
    return 4;
  }
  return 5;
}

export interface AutoFormAppearance {
  arrayItems?: 'cards' | 'separated' | undefined;
  layout?: 'split' | 'stacked' | undefined;
  sections?: 'divided' | 'indented' | undefined;
}

export type ResolvedAutoFormAppearance = Required<{
  [Key in keyof AutoFormAppearance]: NonNullable<AutoFormAppearance[Key]>;
}>;

const DEFAULT_APPEARANCE: ResolvedAutoFormAppearance = { arrayItems: 'cards', layout: 'split', sections: 'divided' };

const AppearanceContext = React.createContext<ResolvedAutoFormAppearance>(DEFAULT_APPEARANCE);

export function useAutoFormAppearance(): ResolvedAutoFormAppearance {
  return React.useContext(AppearanceContext);
}

export function AutoFormAppearanceProvider({
  appearance,
  children,
}: {
  appearance: AutoFormAppearance | undefined;
  children: React.ReactNode;
}) {
  const arrayItems = appearance?.arrayItems ?? DEFAULT_APPEARANCE.arrayItems;
  const layout = appearance?.layout ?? DEFAULT_APPEARANCE.layout;
  const sections = appearance?.sections ?? DEFAULT_APPEARANCE.sections;
  const value = React.useMemo<ResolvedAutoFormAppearance>(
    () => ({ arrayItems, layout, sections }),
    [arrayItems, layout, sections]
  );
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}
