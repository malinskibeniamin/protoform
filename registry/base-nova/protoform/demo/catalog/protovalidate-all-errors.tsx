'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtovalidateAllErrorsDemo() {
  return (
    <CatalogFormDemo
      description="Submit the intentionally invalid defaults and fix errors in any order."
      schemaKey="validation"
    />
  );
}

export default ProtovalidateAllErrorsDemo;
