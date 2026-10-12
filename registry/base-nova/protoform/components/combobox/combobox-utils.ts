import type { ComboboxOption } from '.';

export interface GroupedOptions {
  readonly heading: string;
  readonly options: readonly ComboboxOption[];
  readonly testId?: string | undefined;
}

export const resolveLabel = (options: readonly ComboboxOption[], value: string): string => {
  const opt = options.find((o) => o.value === value);
  return opt?.label ?? value;
};

export const groupOptions = (options: readonly ComboboxOption[]): GroupedOptions[] | undefined => {
  if (!options.some((option) => option.group)) {
    return;
  }

  const groups = new Map<string, { heading: string; options: ComboboxOption[]; testId?: string | undefined }>();
  for (const option of options) {
    const groupKey = option.group || '';
    const existing = groups.get(groupKey);
    if (existing) {
      existing.options.push(option);
    } else {
      groups.set(groupKey, {
        heading: groupKey,
        options: [option],
        testId: option.groupTestId,
      });
    }
  }
  return Array.from(groups.values());
};
