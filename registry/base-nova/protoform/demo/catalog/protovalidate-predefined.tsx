'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtovalidatePredefinedDemo() {
  return (
    <CatalogFormDemo
      description="Change the predefined-rule fields and submit to see reusable messages."
      schemaKey="validation"
    />
  );
}

export default ProtovalidatePredefinedDemo;
