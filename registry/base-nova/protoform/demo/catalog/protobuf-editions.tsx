'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtobufEditionsDemo() {
  return (
    <CatalogFormDemo
      description="Edit edition-backed fields and submit them through the standard AutoForm surface."
      schemaKey="editions"
    />
  );
}

export default ProtobufEditionsDemo;
