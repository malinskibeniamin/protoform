'use client';

import { useRender } from '@base-ui/react/use-render';
import { ChevronDownIcon } from 'lucide-react';
import type React from 'react';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

type NativeSelectProps = Omit<useRender.ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'default';
};
function NativeSelect({ render, className, size = 'default', ...props }: NativeSelectProps) {
  const select = useRender({
    defaultTagName: 'select',
    render,
    props: {
      ...props,
      className:
        'h-8 w-full min-w-0 select-none appearance-none rounded-lg border border-input bg-transparent py-1 pr-8 pl-2.5 text-sm outline-none transition-colors selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-[size=sm]:py-0.5 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50',
    },
    state: {
      slot: 'native-select',
      size,
    },
  });
  return (
    <div
      className={cn('group/native-select relative w-fit has-[select:disabled]:opacity-50', className)}
      data-size={size}
      data-slot="native-select-wrapper"
    >
      {select}
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 select-none text-muted-foreground"
        data-slot="native-select-icon"
      />
    </div>
  );
}
function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return <option className={cn('bg-canvas text-canvas-text', className)} data-slot="native-select-option" {...props} />;
}
function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup className={cn('bg-canvas text-canvas-text', className)} data-slot="native-select-optgroup" {...props} />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
