'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function CelTimeDemo() {
  return (
    <CatalogFormDemo
      description="Set an end before the start, then correct the half-open time range."
      schemaKey="time-range"
    />
  );
}

export default CelTimeDemo;
