'use client';

import { hoverCard } from '@ui-sdk/core/hover-card';
import { createParts } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import {
  PopupContainerContext,
  PopupPortal,
  usePopupContainer,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/portal';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(hoverCard), { trigger: 'a', content: 'div', arrow: 'div' });
export function HoverCard({ container, children, ...props }: ComponentProps<typeof parts.Root>) {
  const target = usePopupContainer(container);
  return (
    <PopupContainerContext value={target}>
      {createElement(parts.Root, { ...props, container: target }, children)}
    </PopupContainerContext>
  );
}
export const HoverCardTrigger = parts.Trigger;
export function HoverCardContent({ container, ...props }: ComponentProps<typeof parts.Content>) {
  const target = usePopupContainer(container);
  return <PopupPortal container={target}>{createElement(parts.Content, props)}</PopupPortal>;
}
export const HoverCardArrow = parts.Arrow;
export type * from '@ui-sdk/core/hover-card';
