'use client';

import React from 'react';
import type { ParsedField } from '../core-types';

export interface NestedFieldRendererProps {
  field: ParsedField;
  inheritedDisabled?: boolean | undefined;
  path: string[];
}

export const NestedFieldRendererContext = React.createContext<React.ComponentType<NestedFieldRendererProps> | null>(
  null
);

export function NestedFieldRenderer(props: NestedFieldRendererProps) {
  const Renderer = React.useContext(NestedFieldRendererContext);
  if (Renderer === null) {
    throw new Error('NestedFieldRenderer must render inside AutoFormFieldRenderer.');
  }
  return <Renderer {...props} />;
}
