import { create, createFileRegistry, type DescMessage, fromBinary, toBinary } from '@bufbuild/protobuf';
import {
  FieldMaskSchema,
  FileDescriptorProtoSchema,
  FieldDescriptorProto_Label as Label,
  FieldDescriptorProto_Type as Type,
} from '@bufbuild/protobuf/wkt';
import { preserveProtoMessageSource, validateFormValuesAgainstProtoSchema } from './hook-runtime.js';
import { ProtoEditCompatibilityError } from './index.js';
import { formValuesToProto, protoToFormValues } from './provider.js';
import { createDescriptorAwareStandardSchema } from './validation-schema.js';

declare const { describe, expect, test }: typeof import('bun:test');

function evolutionSchema(future: boolean, name = 'Choice'): DescMessage {
  const registry = createFileRegistry(
    create(FileDescriptorProtoSchema, {
      name: 'oneof_evolution.proto',
      package: 'evolution',
      syntax: 'proto3',
      messageType: [
        {
          name: 'Choice',
          oneofDecl: [{ name: 'selection' }],
          field: [
            { name: 'label', number: 1, type: Type.STRING },
            { name: 'text', number: 2, type: Type.STRING, oneofIndex: 0 },
            { name: 'count', number: 3, type: Type.INT32, oneofIndex: 0 },
            ...(future
              ? [
                  { name: 'future_text', number: 4, type: Type.STRING, oneofIndex: 0 },
                  { name: 'future_note', number: 5, type: Type.STRING },
                ]
              : []),
          ],
        },
        {
          name: 'ChoiceEntry',
          options: { mapEntry: true },
          field: [
            { name: 'key', number: 1, type: Type.STRING },
            { name: 'value', number: 2, type: Type.MESSAGE, typeName: '.evolution.Choice' },
          ],
        },
        {
          name: 'Envelope',
          oneofDecl: [{ name: 'branch' }],
          field: [
            { name: 'nested', number: 1, type: Type.MESSAGE, typeName: '.evolution.Choice' },
            { name: 'items', number: 2, type: Type.MESSAGE, typeName: '.evolution.Choice', label: Label.REPEATED },
            {
              name: 'by_key',
              jsonName: 'byKey',
              number: 3,
              type: Type.MESSAGE,
              typeName: '.evolution.ChoiceEntry',
              label: Label.REPEATED,
            },
            { name: 'child', number: 4, type: Type.MESSAGE, typeName: '.evolution.Choice', oneofIndex: 0 },
            { name: 'text', number: 5, type: Type.STRING, oneofIndex: 0 },
          ],
        },
      ],
    }),
    () => undefined
  );
  const schema = registry.getMessage(`evolution.${name}`);
  if (!schema) {
    throw new Error('Missing oneof evolution schema');
  }
  return schema;
}

const oldSchema = evolutionSchema(false);
const newSchema = evolutionSchema(true);

function readOld(values: Record<string, unknown>) {
  return fromBinary(oldSchema, toBinary(newSchema, create(newSchema, values)));
}

const selected = { case: 'text', value: 'chosen' };

describe('oneof schema evolution', () => {
  for (const convert of [
    {
      name: 'form conversion',
      run: (source: ReturnType<typeof readOld>, selection: { case: string; value: string | number }) =>
        formValuesToProto(oldSchema, { ...protoToFormValues(oldSchema, source), selection }, source),
    },
    {
      name: 'validated native preservation',
      run: (source: ReturnType<typeof readOld>, selection: { case: string; value: string | number }) =>
        preserveProtoMessageSource(oldSchema, create(oldSchema, { selection }), source),
    },
  ]) {
    for (const selection of [selected, { case: 'text', value: '' }, { case: 'count', value: 0 }]) {
      test(`${convert.name} rejects selecting ${selection.case}=${JSON.stringify(selection.value)} over an unrecognized stored branch`, () => {
        const source = readOld({ selection: { case: 'futureText', value: 'stored' } });
        expect(protoToFormValues(oldSchema, source)['selection']).toEqual({ case: undefined, value: undefined });
        expect(() => convert.run(source, selection)).toThrow(ProtoEditCompatibilityError);
        expect(protoToFormValues(newSchema, fromBinary(newSchema, toBinary(oldSchema, source)))['selection']).toEqual({
          case: 'futureText',
          value: 'stored',
        });
      });
    }
  }

  test('unrelated edits preserve the future branch on a newer reader', () => {
    const source = readOld({ label: 'before', selection: { case: 'futureText', value: 'stored' } });
    const edited = formValuesToProto(oldSchema, { ...protoToFormValues(oldSchema, source), label: 'after' }, source);
    expect(protoToFormValues(newSchema, fromBinary(newSchema, toBinary(oldSchema, edited)))).toMatchObject({
      label: 'after',
      selection: { case: 'futureText', value: 'stored' },
    });
  });

  test('known branch switches and clears retain unrelated additive fields', () => {
    const source = readOld({ selection: { case: 'text', value: '' }, futureNote: 'retain' });
    for (const selection of [
      { case: 'count', value: 0 },
      { case: undefined, value: undefined },
    ]) {
      const edited = formValuesToProto(oldSchema, { ...protoToFormValues(oldSchema, source), selection }, source);
      expect(protoToFormValues(newSchema, fromBinary(newSchema, toBinary(oldSchema, edited)))).toMatchObject({
        selection,
        futureNote: 'retain',
      });
    }
  });
});

const oldEnvelope = evolutionSchema(false, 'Envelope');
const newEnvelope = evolutionSchema(true, 'Envelope');
const futureChild = create(newSchema, { selection: { case: 'futureText', value: 'stored' } });
const selectedChild = { label: '', selection: selected };

for (const operation of ['delete', 'reorder'] as const) {
  test(`${operation} does not validate an unrelated repeated-message candidate as an edit`, () => {
    const source = fromBinary(
      oldEnvelope,
      toBinary(newEnvelope, create(newEnvelope, { items: [futureChild, selectedChild] }))
    );
    const values = protoToFormValues(oldEnvelope, source);
    const { items } = values;
    if (!Array.isArray(items)) {
      throw new TypeError('Expected repeated message values');
    }
    if (operation === 'delete') {
      items.shift();
    } else {
      items.reverse();
    }
    const edited = formValuesToProto(oldEnvelope, values, source);
    const decoded = protoToFormValues(newEnvelope, fromBinary(newEnvelope, toBinary(oldEnvelope, edited)));
    expect(decoded['items']).toEqual(
      operation === 'delete'
        ? [{ ...selectedChild, futureNote: '' }]
        : [
            { ...selectedChild, futureNote: '' },
            { label: '', futureNote: '', selection: { case: 'futureText', value: 'stored' } },
          ]
    );
  });
}

for (const container of [
  { name: 'singular', initial: { nested: futureChild }, edited: { nested: selectedChild } },
  { name: 'repeated', initial: { items: [futureChild] }, edited: { items: [selectedChild] } },
  {
    name: 'map',
    initial: { byKey: { entry: futureChild } },
    edited: { byKey: [{ key: 'entry', value: selectedChild }] },
  },
  {
    name: 'oneof message',
    initial: { branch: { case: 'child', value: futureChild } },
    edited: { branch: { case: 'child', value: selectedChild } },
  },
]) {
  test(`protects a surviving ${container.name} node when its unknown branch is replaced`, () => {
    const source = fromBinary(oldEnvelope, toBinary(newEnvelope, create(newEnvelope, container.initial)));
    const values = { ...protoToFormValues(oldEnvelope, source), ...container.edited };
    expect(() => formValuesToProto(oldEnvelope, values, source)).toThrow(/unknown wire fields/u);
  });
}

test('schema validation reports the incompatible edit as a root issue even with a partial validation mask', async () => {
  const source = readOld({ selection: { case: 'futureText', value: 'stored' } });
  const result = await validateFormValuesAgainstProtoSchema(
    oldSchema,
    { ...protoToFormValues(oldSchema, source), selection: selected },
    createDescriptorAwareStandardSchema(oldSchema),
    {},
    source,
    { validationMask: create(FieldMaskSchema, { paths: ['label'] }) }
  );
  expect(result.issues).toHaveLength(1);
  expect(result.issues?.[0]?.path).toEqual([]);
  expect(result.issues?.[0]?.message).toContain('unknown wire fields');
});

test('empty unknown-field metadata does not prevent an ordinary initial selection', () => {
  const source = create(oldSchema);
  source.$unknown = [];
  expect(() =>
    formValuesToProto(
      oldSchema,
      { ...protoToFormValues(oldSchema, source), selection: { case: 'count', value: 0 } },
      source
    )
  ).not.toThrow();
});
