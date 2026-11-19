'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function CelErrorPathsDemo() {
  return (
    <CatalogFormDemo
      description="Submit several invalid nested values to see every precise path and dynamic message."
      schemaKey="cel"
    />
  );
}

export default CelErrorPathsDemo;
