'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtovalidateRequiredDemo() {
  return (
    <CatalogFormDemo
      description="Clear required fields and submit to see every missing value, then select a oneof branch."
      schemaKey="validation"
    />
  );
}

export default ProtovalidateRequiredDemo;
