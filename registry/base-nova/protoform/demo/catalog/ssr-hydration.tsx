'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function SsrHydrationDemo() {
  return (
    <CatalogFormDemo
      description="Interact immediately after the page loads; the hydrated form retains server-rendered structure."
      schemaKey="validation"
    />
  );
}

export default SsrHydrationDemo;
