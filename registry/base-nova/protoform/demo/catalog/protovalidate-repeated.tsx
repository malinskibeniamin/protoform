'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtovalidateRepeatedDemo() {
  return (
    <CatalogFormDemo
      description="Add duplicate and invalid rows, then remove one and confirm indexed errors follow the data."
      schemaKey="collections"
    />
  );
}

export default ProtovalidateRepeatedDemo;
