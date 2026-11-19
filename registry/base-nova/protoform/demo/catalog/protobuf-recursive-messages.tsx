'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtobufRecursiveMessagesDemo() {
  return (
    <CatalogFormDemo
      description="Edit the bounded recursive node and submit without triggering an infinite render."
      schemaKey="recursive"
    />
  );
}

export default ProtobufRecursiveMessagesDemo;
