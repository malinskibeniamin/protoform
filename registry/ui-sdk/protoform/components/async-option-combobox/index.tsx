'use client';

import { type AsyncOptionsContext, useAsyncOptions } from '@ui-sdk/react/async-options';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox, type ComboboxOption, type ComboboxProps } from '@/components/ui/combobox';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';

export interface AsyncOptionComboboxProps extends Omit<ComboboxProps, 'options' | 'loading' | 'filter' | 'footer'> {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const options = useAsyncOptions(load, definedProps({ debounce, immediate }));
  function focusSearch() {
    containerRef.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus();
  }
  return (
    <div className="space-y-2" ref={containerRef}>
      <Combobox
        {...props}
        filter={false}
        footer={
          <>
            {options.status === 'error' ? (
              <div className="space-y-2 p-2">
                <p role="alert">Could not load options.</p>
                <Button
                  onClick={() => {
                    focusSearch();
                    options.reload();
                  }}
                  type="button"
                  variant="outline"
                >
                  Retry options
                </Button>
              </div>
            ) : null}
            {options.hasMore && options.status === 'idle' ? (
              <div className="p-2">
                <Button
                  onClick={() => {
                    focusSearch();
                    options.loadMore();
                  }}
                  type="button"
                  variant="outline"
                >
                  Load more options
                </Button>
              </div>
            ) : null}
          </>
        }
        loading={options.status === 'loading'}
        onInputValueChange={(query) => {
          if (query !== options.query) {
            options.setQuery(query);
          }
          onInputValueChange?.(query);
        }}
        options={options.items}
      />
    </div>
  );
}
