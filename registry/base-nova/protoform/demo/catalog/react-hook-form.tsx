'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ReactHookFormDemo() {
  return (
    <CatalogFormDemo
      description="Edit, blur, validate, and submit through the default React Hook Form adapter."
      schemaKey="validation"
    />
  );
}

export default ReactHookFormDemo;
