'use client';

import { collapsible } from '@ui-sdk/core/collapsible';
import { createParts } from '@ui-sdk/react/primitive';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(collapsible), { root: 'div', trigger: 'button', panel: 'div' });
export const Collapsible = parts.Root;
export const CollapsibleTrigger = parts.Trigger;
export const CollapsiblePanel = parts.Panel;
export type * from '@ui-sdk/core/collapsible';
