import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import '../../lib/protobuf-provider/auto-form-example-annotations';
import { AutoFormExampleSchema } from '../../lib/protobuf-provider/gen/auto-form-example_pb';
import { useProtoForm } from '.';

describe('TanStack useProtoForm', () => {
  it('preserves the native form API and adds protobuf helpers', () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 0,
          username: '',
        },
      })
    );

    expect(result.current.Field).toBeTypeOf('function');
    expect(result.current.Subscribe).toBeTypeOf('function');
    expect(result.current.store).toBeDefined();
    expect(result.current.createMessage).toBeTypeOf('function');
    expect(result.current.createUpdateMask).toBeTypeOf('function');

    act(() => {
      result.current.setFieldValue('username', 'ada_user');
    });

    expect(result.current.createMessage().username).toBe('ada_user');
    expect(result.current.createUpdateMask().paths).toEqual(['username']);
  });

  it('validates the generated protobuf contract before submission', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 0,
          username: 'ab',
        },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.getAllErrors().fields.username?.errors).not.toHaveLength(0);
  });

  it('composes the caller onSubmit validator instead of replacing it', async () => {
    const onSubmit = vi.fn();
    const nativeValidator = vi.fn(() => 'Native validation failed.');
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 25,
          username: 'valid_user',
        },
        onSubmit,
        validators: {
          onSubmit: nativeValidator,
        },
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(nativeValidator).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('maps Connect field violations onto native TanStack field errors', () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 25,
          primaryEmail: '',
          username: 'valid_user',
        },
      })
    );
    const error = new ConnectError('Review the highlighted fields.', Code.InvalidArgument, {}, [
      {
        desc: BadRequestSchema,
        value: {
          fieldViolations: [
            {
              description: 'Use an approved email address.',
              field: 'primary_email',
            },
          ],
        },
      },
    ]);

    let mapped: ReturnType<typeof result.current.setServerErrors> | undefined;
    act(() => {
      mapped = result.current.setServerErrors(error);
    });

    expect(mapped?.handled).toBe(true);
    expect(mapped?.unmapped).toEqual([]);
    expect(result.current.getAllErrors().fields.primaryEmail?.errors).toContain(
      'Use an approved email address.'
    );
  });

  it('switches oneof branches without retaining the previous branch value', () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 25,
          preferredContact: {
            case: 'preferredEmail',
            value: 'ada@example.com',
          },
          username: 'valid_user',
        },
      })
    );

    act(() => {
      result.current.setOneofValue(
        'preferredContact',
        'preferredPhone',
        '+48123456789'
      );
    });

    expect(result.current.createMessage().preferredContact).toEqual({
      case: 'preferredPhone',
      value: '+48123456789',
    });
  });

  it('drills into nested native errors with the Protoform helper', () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 25,
          shippingAddress: { city: '', lineOne: '' },
          username: 'valid_user',
        },
      })
    );
    const error = new ConnectError('Review the highlighted fields.', Code.InvalidArgument, {}, [
      {
        desc: BadRequestSchema,
        value: {
          fieldViolations: [
            {
              description: 'Choose a supported city.',
              field: 'shipping_address.city',
            },
          ],
        },
      },
    ]);

    act(() => {
      result.current.setServerErrors(error);
    });

    expect(result.current.getNestedErrors('shippingAddress')).toEqual({
      city: { message: 'Choose a supported city.' },
    });
  });
});
import { BadRequestSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js';
import { Code, ConnectError } from '@connectrpc/connect';
