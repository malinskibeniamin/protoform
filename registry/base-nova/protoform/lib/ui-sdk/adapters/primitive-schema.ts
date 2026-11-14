import type { PropSpec } from '@ui-sdk/core';

export function withOptionSchema<P extends { options?: Record<string, PropSpec> | undefined }>(primitive: P) {
  return Object.assign(primitive, { options: primitive.options ?? {} });
}
