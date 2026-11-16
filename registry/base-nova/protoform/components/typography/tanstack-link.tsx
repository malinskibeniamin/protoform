'use client';

import { createLink } from '@tanstack/react-router';
import type { ComponentPropsWithRef } from 'react';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils';
import { Link } from '.';

function LinkAnchor({ children, ...props }: ComponentPropsWithRef<'a'> & SharedProps) {
  return (
    <Link as="a" {...props}>
      {children}
    </Link>
  );
}

export const TanStackLink = createLink(LinkAnchor);
