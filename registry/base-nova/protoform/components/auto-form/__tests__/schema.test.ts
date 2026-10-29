import '@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations';

import { AutoFormExampleSchema } from '@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb';
import { protoConversionOptionsFromFieldConfig, resolveSchema } from '../schema';
import { createMockProvider } from './test-utils';

declare const { describe, expect, test }: typeof import('bun:test');

describe('resolveSchema', () => {
  test('maps per-field repeated-string policies to descriptor paths', () => {
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
  test('throws for unsupported input types', () => {
    expect(() => {
      Reflect.apply(resolveSchema, undefined, ['not a schema']);
    }).toThrow('Unsupported AutoForm schema input');
    expect(() => {
      Reflect.apply(resolveSchema, undefined, [42]);
    }).toThrow('Unsupported');
    expect(() => {
      Reflect.apply(resolveSchema, undefined, [{ random: 'object' }]);
    }).toThrow('Unsupported');
  });

  test('resolves a SchemaProvider and a proto descriptor', () => {
    const provider = createMockProvider([{ key: 'name', required: true, type: 'string' }]);

    const resolved = resolveSchema(provider);
    expect(resolved.provider).toBe(provider);
    expect(resolved.parsedSchema.fields).toHaveLength(1);
    expect(resolved.isProto).toBe(false);
    expect(resolved.protoDesc).toBeUndefined();

    const proto = resolveSchema(AutoFormExampleSchema);
    expect(proto.isProto).toBe(true);
    expect(proto.protoDesc).toBe(AutoFormExampleSchema);
    expect(proto).not.toHaveProperty('resolver');
    expect(proto.parsedSchema.fields.length).toBeGreaterThan(0);
  });
});
