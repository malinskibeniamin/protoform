'use client';

import { accordion } from '@ui-sdk/core/accordion';
import { createParts } from '@ui-sdk/react/primitive';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(accordion), {
  root: 'div',
  item: 'div',
  header: 'h3',
  trigger: 'button',
  panel: 'div',
});
export const Accordion = parts.Root;
export const AccordionItem = parts.Item;
export const AccordionHeader = parts.Header;
export const AccordionTrigger = parts.Trigger;
export const AccordionPanel = parts.Panel;
export type * from '@ui-sdk/core/accordion';
