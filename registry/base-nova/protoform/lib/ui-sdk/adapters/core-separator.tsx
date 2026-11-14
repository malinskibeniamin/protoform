'use client';

import { separator } from '@ui-sdk/core/separator';
import { createParts } from '@ui-sdk/react/primitive';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(separator), { root: 'div' });
export const Separator = parts.Root;
export type * from '@ui-sdk/core/separator';
