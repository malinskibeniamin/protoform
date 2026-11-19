'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtobufUnknownFieldsDemo() {
  return (
    <CatalogFormDemo
      description="Edit the display name; the compatibility evidence verifies unknown wire data survives."
      schemaKey="book"
    />
  );
}

export default ProtobufUnknownFieldsDemo;
