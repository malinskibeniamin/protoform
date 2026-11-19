'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtobufJsonOptionsDemo() {
  return (
    <CatalogFormDemo
      description="Edit annotated fields and submit to inspect the JSON-safe message shape."
      schemaKey="validation"
    />
  );
}

export default ProtobufJsonOptionsDemo;
