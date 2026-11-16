interface LabelledOption {
  group?: string | undefined;
  groupTestId?: string | undefined;
  label: string;
  value: string;
}
interface GroupedOptions<Option> {
  readonly heading: string;
  readonly options: readonly Option[];
  readonly testId?: string | undefined;
}

export function resolveLabel<Option extends LabelledOption>(options: readonly Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function groupOptions<Option extends LabelledOption>(
  options: readonly Option[]
): GroupedOptions<Option>[] | undefined {
  if (options.every((option) => !option.group)) {
    return;
  }
  const groups = new Map<string, { heading: string; options: Option[]; testId?: string | undefined }>();
  for (const option of options) {
    const groupKey = option.group || '';
    const existing = groups.get(groupKey);
    if (existing) {
      existing.options.push(option);
    } else {
      groups.set(groupKey, { heading: groupKey, options: [option], testId: option.groupTestId });
    }
  }
  return Array.from(groups.values());
}
