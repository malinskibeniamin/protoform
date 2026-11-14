'use client';

import { resizable } from '@ui-sdk/core/resizable';
import { createParts } from '@ui-sdk/react/primitive';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(resizable), { root: 'div', panel: 'div', handle: 'div' });
export const Resizable = parts.Root;
export const ResizablePanel = parts.Panel;
export const ResizableHandle = parts.Handle;
export type * from '@ui-sdk/core/resizable';
