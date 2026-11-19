'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function DependencyMatrixDemo() {
  return (
    <CatalogFormDemo
      description="Use the live form while the consumer fixture proves the registry-only install boundary."
      schemaKey="validation"
    />
  );
}

export default DependencyMatrixDemo;
