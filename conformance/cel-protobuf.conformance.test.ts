import { create } from '@bufbuild/protobuf';
import { createValidator } from '@bufbuild/protovalidate';
import { describe, expect } from '@rstest/core';

import { createProtoFormSchema } from '../registry/base-nova/protoform/lib/protobuf-provider/index.js';
import { CelProtoLanguageMatrixSchema, MatrixStatus } from './gen/protoform/conformance/v1/conformance_pb.js';

describe('cel protobuf conformance', () => {
  test('evaluates protobuf messages, enums, presence, collections, bytes, and temporal values', async () => {
    const schema = createProtoFormSchema(CelProtoLanguageMatrixSchema);
    const valid = await schema['~standard'].validate({
      child: { name: 'child-primary' },
      numbers: [1, 2, 3],
      optionalValue: 'present',
      payload: 'cHJvdG8=',
      scores: [{ key: 'primary', value: 3 }],
      start: '2025-01-01T00:00:00Z',
      status: MatrixStatus.ACTIVE,
      window: '3600s',
    });

    expect(valid).toMatchObject({ value: { status: MatrixStatus.ACTIVE } });
    const invalid = await schema['~standard'].validate({});
    expect(invalid.issues).toEqual(
      expect.arrayContaining([
        { message: 'Protobuf message, enum, and presence operations failed.', path: [] },
        { message: 'Protobuf list and map operations failed.', path: [] },
        { message: 'Protobuf bytes operations failed.', path: [] },
        { message: 'Protobuf timestamp and duration operations failed.', path: [] },
      ])
    );
    expect(invalid.issues).toHaveLength(4);
  });

  test('reports every protobuf CEL capability failure by stable rule id', () => {
    const result = createValidator().validate(CelProtoLanguageMatrixSchema, create(CelProtoLanguageMatrixSchema));

    expect(result.kind).toBe('invalid');
    if (result.kind !== 'invalid') {
      throw new Error('Expected protobuf CEL fixture to fail.');
    }
    expect(result.violations.map((violation) => violation.ruleId)).toEqual(
      expect.arrayContaining([
        'cel.proto.messages_enums_presence',
        'cel.proto.collections',
        'cel.proto.bytes',
        'cel.proto.temporal',
      ])
    );
  });
});
