import { describe, expect, it } from 'vitest';

import '@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations';

import { AutoFormExampleSchema } from '@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb';

import { createMockProvider } from './test-utils';
import { protoConversionOptionsFromFieldConfig, resolveSchema } from '../schema';

describe('resolveSchema', () => {
  it('maps per-field repeated-string policies to descriptor paths', () => {
    expect(
      protoConversionOptionsFromFieldConfig({
        aliases: { emptyRepeatedStringPolicy: 'preserve' },
        name: {},
        'settings.labels': { emptyRepeatedStringPolicy: 'discard' },
      })
    ).toEqual({
      emptyRepeatedStringPolicies: {
        aliases: 'preserve',
        'settings.labels': 'discard',
      },
    });
  });
  it('throws for unsupported input types', () => {
    expect(() => resolveSchema('not a schema' as never)).toThrow('Unsupported AutoForm schema input');
    expect(() => resolveSchema(42 as never)).toThrow('Unsupported');
    expect(() => resolveSchema({ random: 'object' } as never)).toThrow('Unsupported');
  });

  it('resolves a SchemaProvider', () => {
    const provider = createMockProvider([{ key: 'name', type: 'string', required: true }]);

    const resolved = resolveSchema(provider);
    expect(resolved.provider).toBe(provider);
    expect(resolved.parsedSchema.fields).toHaveLength(1);
    expect(resolved.isProto).toBe(false);
    expect(resolved.protoDesc).toBeUndefined();
  });

  it('resolves a proto descriptor without coupling the shared schema seam to an engine', () => {
    const resolved = resolveSchema(AutoFormExampleSchema);
    expect(resolved.isProto).toBe(true);
    expect(resolved.protoDesc).toBe(AutoFormExampleSchema);
    expect(resolved).not.toHaveProperty('resolver');
    expect(resolved.parsedSchema.fields.length).toBeGreaterThan(0);
  });
});
