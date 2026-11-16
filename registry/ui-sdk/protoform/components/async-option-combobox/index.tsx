'use client';

import { createComboboxController } from '@ui-sdk/core/combobox';
import { type AsyncOptionsContext, useAsyncOptions } from '@ui-sdk/react/async-options';
import { useMemo } from 'react';
import { Button } from '@/components/ui/sdk/button';
import { type ComboboxOption, OptionCombobox, type OptionComboboxProps } from '@/components/ui/sdk/combobox';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';

export interface AsyncOptionComboboxProps
  extends Omit<
    OptionComboboxProps,
    'options' | 'loading' | 'filter' | 'modal' | 'onLoadMore' | 'controller' | 'footer' | 'status'
  > {
  debounce?: number;
  immediate?: boolean;
  load: (
    query: string,
    context: AsyncOptionsContext
  ) => Promise<ComboboxOption[] | { items: ComboboxOption[]; hasMore?: boolean }>;
}
export function AsyncOptionCombobox({
  load,
  debounce,
  immediate,
  onInputValueChange,
  ...props
}: AsyncOptionComboboxProps) {
  const controller = useMemo(() => createComboboxController(), []);
  const options = useAsyncOptions(load, definedProps({ debounce, immediate }));
  return (
    <div className="space-y-2">
      <OptionCombobox
        {...props}
        controller={controller}
        filter={false}
        footer={
          options.status === 'error' ? (
            <Button
              onClick={() => {
                controller.focus();
                options.reload();
              }}
              type="button"
              variant="outline"
            >
              Retry options
            </Button>
          ) : null
        }
        loading={options.status === 'loading'}
        modal={false}
        onInputValueChange={(query) => {
          options.setQuery(query);
          onInputValueChange?.(query);
        }}
        onLoadMore={options.hasMore && options.status === 'idle' ? options.loadMore : undefined}
        options={options.items}
        status={options.status}
      />
      {options.status === 'error' ? (
        <div role="alert">
          <p>Could not load options.</p>
        </div>
      ) : null}
    </div>
  );
}
