'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function CelBytesDemo() {
  return (
    <CatalogFormDemo
      description="Change the encoded payload and submit to exercise byte-aware rules."
      schemaKey="cel"
    />
  );
}

export default CelBytesDemo;
