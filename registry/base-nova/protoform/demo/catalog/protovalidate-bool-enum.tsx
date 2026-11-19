'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtovalidateBoolEnumDemo() {
  return (
    <CatalogFormDemo
      description="Change the boolean and enum selections, then submit to exercise allowed values."
      schemaKey="validation"
    />
  );
}

export default ProtovalidateBoolEnumDemo;
