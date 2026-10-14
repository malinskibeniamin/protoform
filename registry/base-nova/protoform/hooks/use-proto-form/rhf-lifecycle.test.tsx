import { create, createFileRegistry } from '@bufbuild/protobuf';
import { FieldDescriptorProto_Type, FileDescriptorProtoSchema } from '@bufbuild/protobuf/wkt';
import { describe, expect } from '@rstest/core';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useFieldArray } from 'react-hook-form';
import { AutoFormExampleSchema } from '../../lib/protobuf-provider/gen/auto-form-example_pb.js';
import { useProtoForm } from './index.js';

describe('React Hook Form lifecycle through useProtoForm', () => {
  test('reset without values keeps the original defaults clean with keepDefaultValues', () => {
    const { result } = renderHook(() => {
      const form = useProtoForm(AutoFormExampleSchema, { defaultValues: { username: 'Ada' } });
      return { form, isDirty: form.formState.isDirty };
    });

    act(() => result.current.form.setValue('username', 'Grace', { shouldDirty: true }));
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.form.reset(undefined, { keepDefaultValues: true }));
    expect(result.current.form.getValues('username')).toBe('Ada');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.form.createUpdateMask().paths).toEqual([]);
  });

  test('setting and clearing errors publishes new references for subscribers', () => {
    const { result } = renderHook(() => {
      const form = useProtoForm(AutoFormExampleSchema);
      return { errors: form.formState.errors, form };
    });
    const initialErrors = result.current.errors;

    act(() => result.current.form.setError('username', { message: 'Name already taken', type: 'server' }));
    const serverErrors = result.current.errors;
    expect(serverErrors).not.toBe(initialErrors);
    expect(initialErrors.username).toBeUndefined();
    expect(serverErrors.username?.message).toBe('Name already taken');

    act(() => result.current.form.clearErrors('username'));
    expect(result.current.errors).not.toBe(serverErrors);
    expect(result.current.errors.username).toBeUndefined();
  });

  test.each(['hasOwnProperty', 'isPrototypeOf'])(
    'tracks touched and dirty values for the protobuf field %s',
    (name) => {
      const registry = createFileRegistry(
        create(FileDescriptorProtoSchema, {
          messageType: [{ field: [{ name, number: 1, type: FieldDescriptorProto_Type.STRING }], name: 'Profile' }],
          name: 'rhf_lifecycle.proto',
          package: 'test',
          syntax: 'proto3',
        }),
        () => undefined
      );
      const schema = registry.getMessage('test.Profile');
      if (!schema) {
        throw new Error('Missing lifecycle fixture descriptor');
      }
      const { result } = renderHook(() => {
        const form = useProtoForm(schema, { defaultValues: { [name]: '' } });
        form.register(name);
        return { dirtyFields: form.formState.dirtyFields, form, touchedFields: form.formState.touchedFields };
      });

      act(() => result.current.form.setValue(name, 'Ada', { shouldDirty: true, shouldTouch: true }));
      expect(result.current.touchedFields[name]).toBe(true);
      expect(result.current.dirtyFields[name]).toBe(true);
      expect(result.current.form.getValues(undefined, { dirtyFields: true })).toEqual({ [name]: 'Ada' });
      expect(result.current.form.createMessage()).toMatchObject({ [name]: 'Ada' });
    }
  );

  test('removing duplicate array indexes preserves remaining protobuf values and the caller indexes', () => {
    const previousAddresses = ['Ada', 'Grace', 'Linus', 'Margaret'].map((city) => ({ city }));
    const { result } = renderHook(() => {
      const form = useProtoForm(AutoFormExampleSchema, { defaultValues: { previousAddresses } });
      const array = useFieldArray({ control: form.control, name: 'previousAddresses' });
      return { array, form };
    });
    const indexes = [2, 0, 0];

    act(() => result.current.array.remove(indexes));

    expect(indexes).toEqual([2, 0, 0]);
    expect(result.current.form.getValues('previousAddresses')).toEqual([{ city: 'Grace' }, { city: 'Margaret' }]);
    expect(result.current.form.createMessage().previousAddresses.map(({ city }) => city)).toEqual([
      'Grace',
      'Margaret',
    ]);
  });
});
