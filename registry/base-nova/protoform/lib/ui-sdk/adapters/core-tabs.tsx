'use client';

import { tabs } from '@ui-sdk/core/tabs';
import { createParts } from '@ui-sdk/react/primitive';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(tabs), {
  root: 'div',
  list: 'div',
  tab: 'button',
  'tab-icon': 'span',
  indicator: 'span',
  panel: 'div',
});
export const Tabs = parts.Root;
export const TabsList = parts.List;
export const TabsTab = parts.Tab;
export const TabsTabIcon = parts.TabIcon;
export const TabsIndicator = parts.Indicator;
export const TabsPanel = parts.Panel;
export type * from '@ui-sdk/core/tabs';
