'use client';

import { label } from '@ui-sdk/core/label';
import { createParts } from '@ui-sdk/react/primitive';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(label), { root: 'label' });
export const Label = parts.Root;
export type * from '@ui-sdk/core/label';
