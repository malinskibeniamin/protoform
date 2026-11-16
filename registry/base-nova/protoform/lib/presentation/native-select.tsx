'use client';
import type React from 'react';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return <option className={cn('bg-canvas text-canvas-text', className)} data-slot="native-select-option" {...props} />;
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup className={cn('bg-canvas text-canvas-text', className)} data-slot="native-select-optgroup" {...props} />
  );
}

export { NativeSelectOptGroup, NativeSelectOption };
