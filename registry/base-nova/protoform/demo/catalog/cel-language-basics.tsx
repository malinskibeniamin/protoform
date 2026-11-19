'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function CelLanguageBasicsDemo() {
  return (
    <CatalogFormDemo
      description="Change scalar values so the cross-field expression moves between valid and invalid states."
      schemaKey="cel"
    />
  );
}

export default CelLanguageBasicsDemo;
