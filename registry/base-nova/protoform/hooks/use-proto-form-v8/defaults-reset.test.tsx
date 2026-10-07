import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { timestampFromDate } from '@bufbuild/protobuf/wkt';
import { describe, expect } from '@rstest/core';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { AutoFormExampleSchema } from '../../lib/protobuf-provider/gen/auto-form-example_pb.js';
import { useProtoForm, useProtoFormDefaults } from './index.js';

describe('protobuf defaults and reset', () => {
  test('normalizes asynchronously loaded native defaults', async () => {
    const createdAt = timestampFromDate(new Date('2026-10-03T12:00:37.123Z'));
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: async () => create(AutoFormExampleSchema, { createdAt }),
      })
    );
    await waitFor(() => expect(result.current.formState.isLoading).toBe(false));
    expect(result.current.createMessage()).toMatchObject({ createdAt });
  });
  test('normalizes native defaults without dropping well-known fields on an untouched edit', () => {
    const createdAt = timestampFromDate(new Date('2026-10-03T12:00:37.123Z'));
    createdAt.nanos = 123_456_789;
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: useProtoFormDefaults(AutoFormExampleSchema, {
          createdAt,
          reminderInterval: { seconds: 10n },
          writablePaths: { paths: ['username'] },
        }),
      })
    );
    expect(result.current.createMessage()).toMatchObject({
      createdAt,
      reminderInterval: { seconds: 10n, nanos: 0 },
      writablePaths: { paths: ['username'] },
    });
    expect(typeof result.current.getValues('createdAt')).toBe('string');
  });

  test("reset to a new protobuf message adopts its unknown fields, not the previous record's", () => {
    const source = (username: string, marker: number) =>
      fromBinary(
        AutoFormExampleSchema,
        Uint8Array.from([
          ...toBinary(AutoFormExampleSchema, create(AutoFormExampleSchema, { username })),
          0x98,
          0x06,
          marker,
        ])
      );
    const first = source('first', 11);
    const second = source('second', 22);
    const { result } = renderHook(() => useProtoForm(AutoFormExampleSchema, { defaultValues: first }));
    act(() => result.current.reset(second));
    expect(toBinary(AutoFormExampleSchema, result.current.createMessage())).toEqual(
      toBinary(AutoFormExampleSchema, second)
    );
    act(() => result.current.reset());
    expect(toBinary(AutoFormExampleSchema, result.current.createMessage())).toEqual(
      toBinary(AutoFormExampleSchema, second)
    );
  });

  test('resetField restores a nested message section that has no registered inputs', () => {
    const shippingAddress = { city: 'Lisbon', lineOne: '1 Rua Augusta', postalCode: '1100-048' };
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: useProtoFormDefaults(AutoFormExampleSchema, { shippingAddress }),
      })
    );
    act(() => result.current.setValue('shippingAddress.city', 'Porto', { shouldDirty: true }));
    expect(result.current.getFieldState('shippingAddress').isDirty).toBe(true);

    act(() => result.current.resetField('shippingAddress'));

    expect(result.current.getValues('shippingAddress.city')).toBe('Lisbon');
    expect(result.current.getFieldState('shippingAddress').isDirty).toBe(false);
    expect(result.current.createMessage().shippingAddress).toMatchObject(shippingAddress);
  });
});
