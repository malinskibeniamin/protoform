'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtovalidateStringRulesDemo() {
  return (
    <CatalogFormDemo
      description="Try short, long, and malformed strings to see each constraint stay attached to its field."
      schemaKey="string-network"
    />
  );
}

export default ProtovalidateStringRulesDemo;
