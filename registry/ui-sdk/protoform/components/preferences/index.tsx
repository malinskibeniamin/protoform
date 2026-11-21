'use client';

import type { Preference } from '@ui-sdk/core';
import { usePreference } from '@ui-sdk/react/preferences';
import type { ComponentProps } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      items={preference.values.map((value) => ({ label: value, value }))}
      onValueChange={(value, details) => {
        if (value !== null) {
          const accepted = preference.set(
            value,
            definedProps({
              event: details.event,
              reason: 'item-press' as const,
            })
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
        {preference.values.map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
