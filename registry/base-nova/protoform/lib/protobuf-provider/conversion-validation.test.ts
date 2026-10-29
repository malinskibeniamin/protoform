import { create, createFileRegistry } from '@bufbuild/protobuf';
import {
  FieldMaskSchema,
  FileDescriptorProtoSchema,
  FieldDescriptorProto_Label as Label,
  FieldDescriptorProto_Type as Type,
} from '@bufbuild/protobuf/wkt';
import { createProtoFormSchema } from './form-schema.js';
import { protoToFormValues } from './hook-runtime.js';

declare const { describe, expect, test }: typeof import('bun:test');

const registry = createFileRegistry(
  create(FileDescriptorProtoSchema, {
    name: 'conversion_validation.proto',
    package: 'conversion',
    syntax: 'proto3',
    dependency: ['google/protobuf/field_mask.proto'],
    messageType: [
      {
        name: 'LabelsEntry',
        options: { mapEntry: true },
        field: [
          { name: 'key', number: 1, type: Type.STRING },
          { name: 'value', number: 2, type: Type.STRING },
        ],
      },
      {
        name: 'Child',
        field: [
          { name: 'labels', number: 1, type: Type.MESSAGE, typeName: '.conversion.LabelsEntry', label: Label.REPEATED },
          { name: 'quota', number: 2, type: Type.UINT64 },
        ],
      },
      {
        name: 'ChildrenEntry',
        options: { mapEntry: true },
        field: [
          { name: 'key', number: 1, type: Type.STRING },
          { name: 'value', number: 2, type: Type.MESSAGE, typeName: '.conversion.Child' },
        ],
      },
      {
        name: 'Root',
        oneofDecl: [{ name: 'choice' }],
        field: [
          { name: 'child', number: 1, type: Type.MESSAGE, typeName: '.conversion.Child' },
          { name: 'children', number: 2, type: Type.MESSAGE, typeName: '.conversion.Child', label: Label.REPEATED },
          {
            name: 'by_key',
            jsonName: 'byKey',
            number: 3,
            type: Type.MESSAGE,
            typeName: '.conversion.ChildrenEntry',
            label: Label.REPEATED,
          },
          {
            name: 'selected_child',
            jsonName: 'selectedChild',
            number: 4,
            type: Type.MESSAGE,
            typeName: '.conversion.Child',
            oneofIndex: 0,
          },
          { name: 'selected_quota', jsonName: 'selectedQuota', number: 5, type: Type.UINT64, oneofIndex: 0 },
          { name: 'quotas', number: 6, type: Type.UINT64, label: Label.REPEATED },
          { name: 'mask', number: 7, type: Type.MESSAGE, typeName: '.google.protobuf.FieldMask' },
        ],
      },
    ],
  }),
  () => FieldMaskSchema.file
);
const root = registry.getMessage('conversion.Root');
if (!root) {
  throw new Error('Missing conversion fixture');
}
const schema = createProtoFormSchema(root);
const duplicate = {
  labels: [
    { key: 'same', value: 'first' },
    { key: 'same', value: 'second' },
  ],
};
const overflow = '18446744073709551616';

describe('raw conversion validation', () => {
  test('rejects malformed native FieldMask paths instead of exposing unchecked values', () => {
    const message = create(root);
    Reflect.set(message, 'mask', { paths: ['display_name', 17] });
    expect(() => protoToFormValues(root, message)).toThrow('FieldMask');
    expect(protoToFormValues(root, create(root, { mask: { paths: ['display_name'] } }))['mask']).toEqual([
      'display_name',
    ]);
  });

  test.each([
    { values: { child: duplicate }, path: ['child', 'labels'] },
    { values: { children: [duplicate] }, path: ['children', 0, 'labels'] },
    { values: { byKey: [{ key: 'entry', value: duplicate }] }, path: ['byKey', 0, 'value', 'labels'] },
    { values: { choice: { case: 'selectedChild', value: duplicate } }, path: ['choice', 'value', 'labels'] },
    { values: { child: { quota: overflow } }, path: ['child', 'quota'] },
    { values: { children: [{ quota: overflow }] }, path: ['children', 0, 'quota'] },
    { values: { choice: { case: 'selectedQuota', value: overflow } }, path: ['choice', 'value'] },
    { values: { quotas: [overflow] }, path: ['quotas', 0] },
    { values: { mask: [17] }, path: ['mask'] },
    { values: { mask: ['display_name', 17] }, path: ['mask'] },
    { values: { choice: 42 }, path: ['choice'] },
    { values: { choice: { case: 42, value: 'lost' } }, path: ['choice'] },
    { values: { choice: { case: 'missingCase', value: 'lost' } }, path: ['choice'] },
  ])('rejects lossy input at $path before protobuf conversion', async ({ values, path }) => {
    const result = await schema['~standard'].validate(values);
    expect(result.issues).toEqual<unknown>(expect.arrayContaining([expect.objectContaining({ path })]));
  });

  test('retains valid field masks and known oneof selections', async () => {
    const result = await schema['~standard'].validate({
      mask: ['display_name'],
      choice: { case: 'selectedQuota', value: '7' },
    });
    expect(result.issues).toBeUndefined();
    if (!('value' in result)) {
      throw new Error('Expected validated protobuf values.');
    }
    expect(result.value).toMatchObject({
      mask: { paths: ['display_name'] },
      choice: { case: 'selectedQuota', value: 7n },
    });
  });
});
