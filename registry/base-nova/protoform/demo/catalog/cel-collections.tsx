'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function CelCollectionsDemo() {
  return (
    <CatalogFormDemo
      description="Add collection values that make each comprehension succeed or fail."
      schemaKey="cel"
    />
  );
}

export default CelCollectionsDemo;
