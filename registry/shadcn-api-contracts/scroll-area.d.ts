import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import type * as React from 'react';

declare function ScrollArea({ className, children, ...props }: ScrollAreaPrimitive.Root.Props): React.JSX.Element;
declare function ScrollBar({
  className,
  orientation,
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props): React.JSX.Element;

export { ScrollArea, ScrollBar };
