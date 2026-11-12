import { Loader2Icon } from 'lucide-react';

import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Spinner({ className, testId, ...props }: React.ComponentProps<'svg'> & SharedProps) {
  return (
    <Loader2Icon
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      data-testid={testId}
      role="status"
      {...props}
    />
  );
}

export { Spinner };
