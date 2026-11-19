'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function AutoFormDemo() {
  return (
    <CatalogFormDemo
      description="Edit the generated controls and submit without writing a field tree."
      schemaKey="validation"
    />
  );
}

export default AutoFormDemo;
