'use client';

import { CatalogFormDemo } from '@/registry/base-nova/protoform/demo/runtime/catalog-form-demo';

export const client = 'only';

export function ProtobufDynamicJsonAnyDemo() {
  return (
    <CatalogFormDemo
      description="Change object, scalar, list, and typed payload values, then submit their protobuf representation."
      schemaKey="dynamic-json"
    />
  );
}

export default ProtobufDynamicJsonAnyDemo;
