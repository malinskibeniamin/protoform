'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtovalidateBytesAnyDemo() {
  return (
    <CatalogFormDemo
      description="Change the base64 and type URL inputs to trigger safe validation failures."
      schemaKey="any"
    />
  );
}

export default ProtovalidateBytesAnyDemo;
