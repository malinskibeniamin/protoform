'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtobufPresenceDemo() {
  return (
    <CatalogFormDemo
      description="Toggle populated values and submit to compare explicit presence with an unset field."
      schemaKey="presence"
    />
  );
}

export default ProtobufPresenceDemo;
