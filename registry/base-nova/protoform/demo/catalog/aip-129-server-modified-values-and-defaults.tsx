'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function Aip129ServerModifiedValuesAndDefaultsDemo() {
  return (
    <CatalogFormDemo
      description="Edit the focused request, submit it, and compare the live behavior with the executable compatibility evidence below."
      schemaKey="book"
    />
  );
}

export default Aip129ServerModifiedValuesAndDefaultsDemo;
