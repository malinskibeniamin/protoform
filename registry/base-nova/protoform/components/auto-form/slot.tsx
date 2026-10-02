'use client';

import type React from 'react';

interface AutoFormSlotProps {
  after?: string;
  before?: string;
  children: React.ReactNode;
}

function AutoFormSlot({ children }: AutoFormSlotProps) {
  return children;
}

AutoFormSlot.displayName = 'AutoFormSlot';

export { AutoFormSlot, type AutoFormSlotProps };
