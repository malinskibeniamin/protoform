'use client';

import { avatar } from '@ui-sdk/core/avatar';
import { createParts } from '@ui-sdk/react/primitive';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(avatar), { root: 'span', image: 'img', fallback: 'span' });
export const Avatar = parts.Root;
export const AvatarImage = parts.Image;
export const AvatarFallback = parts.Fallback;
export type * from '@ui-sdk/core/avatar';
