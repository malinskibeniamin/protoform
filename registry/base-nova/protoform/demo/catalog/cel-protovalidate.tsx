'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function CelProtovalidateDemo() {
  return (
    <CatalogFormDemo description="Trigger both a field-local rule and a cross-field message rule." schemaKey="cel" />
  );
}

export default CelProtovalidateDemo;
