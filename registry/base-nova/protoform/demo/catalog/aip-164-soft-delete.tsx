'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function Aip164SoftDeleteDemo() {
  return (
    <CatalogFormDemo
      description="Edit the focused request, submit it, and compare the live behavior with the executable compatibility evidence below."
      schemaKey="undelete-book"
    />
  );
}

export default Aip164SoftDeleteDemo;
