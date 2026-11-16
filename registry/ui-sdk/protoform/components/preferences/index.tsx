'use client';

import type { Preference } from '@ui-sdk/core';
import { withSource } from '@ui-sdk/core/observe';
import { usePreference } from '@ui-sdk/react/preferences';
import type { ComponentProps } from 'react';
import { Select, SelectContent, SelectItem, SelectList, SelectTrigger, SelectValue } from '@/components/ui/sdk/select';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';

export type { Preference, PreferenceOptions } from '@ui-sdk/core';
export { createLocalStorage, createPreference } from '@ui-sdk/core';
export { Preferences } from '@ui-sdk/react/preferences';
export function PreferenceSelect<Value extends string>({
  preference,
  label,
  ...props
}: {
  preference: Preference<Value>;
  label: string;
  'data-agent-confirm'?: string;
  'data-agent-hidden'?: boolean;
  'data-agent-secret'?: boolean;
} & Omit<ComponentProps<typeof SelectTrigger>, 'children' | 'aria-label'>) {
  const state = usePreference(preference);
  return (
    <Select
      items={[...preference.values]}
      onValueChange={(value, details) => {
        if (value !== null) {
          const accepted = withSource(details.source, () =>
            preference.set(value, definedProps({ event: details.event, reason: details.reason }))
          );
          if (!accepted && preference.get().value !== value) {
            details.cancel();
          }
        }
      }}
      value={state.value}
    >
      <SelectTrigger {...props} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectList>
          {preference.values.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}
