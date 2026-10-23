import React from 'react';

import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<'label'> & SharedProps & { variant?: 'field' | 'strong' }
>(({ className, variant, testId, ...props }, ref) => (
  <label
    className={cn(
      'text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      variant === 'strong' && 'font-sans leading-5 font-semibold tracking-normal',
      variant === 'field' &&
        'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border dark:has-data-[state=checked]:bg-primary/10 [&>*]:data-[slot=field]:p-4',
      className
    )}
    data-slot="label"
    data-testid={testId}
    ref={ref}
    {...props}
  />
));

Label.displayName = 'Label';

export { Label };
