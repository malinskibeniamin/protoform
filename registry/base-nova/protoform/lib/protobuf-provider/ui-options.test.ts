import { ControlTypeSchema } from './gen/auto_form_ui_pb.js';

declare const { expect, test }: typeof import('bun:test');

test('control type value 18 remains available', () => {
  expect(ControlTypeSchema.proto.reservedRange).not.toContainEqual({
    $typeName: 'google.protobuf.EnumDescriptorProto.EnumReservedRange',
    end: 18,
    start: 18,
  });
});
