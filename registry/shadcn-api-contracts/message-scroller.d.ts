import { MessageScroller as MessageScrollerPrimitive } from '@shadcn/react/message-scroller';
import type * as React from 'react';
import { Button } from './button';

declare function MessageScrollerProvider(
  props: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>
): React.JSX.Element;
declare function MessageScroller({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Root>): React.JSX.Element;
declare function MessageScrollerViewport({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Viewport>): React.JSX.Element;
declare function MessageScrollerContent({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Content>): React.JSX.Element;
declare function MessageScrollerItem({
  className,
  scrollAnchor,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Item>): React.JSX.Element;
declare function MessageScrollerButton({
  direction,
  className,
  children,
  render,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Button> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>): React.JSX.Element;

export {
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from '@shadcn/react/message-scroller';
export {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
};
