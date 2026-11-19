'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function CelProtobufValuesDemo() {
  return (
    <CatalogFormDemo
      description="Change nested, enum, and optional fields to exercise descriptor-aware CEL access."
      schemaKey="cel"
    />
  );
}

export default CelProtobufValuesDemo;
