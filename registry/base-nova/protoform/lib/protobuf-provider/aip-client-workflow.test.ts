import { once } from 'node:events';
import {
  type Operation,
  OperationSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/longrunning/operations_pb.js';
import { RetryInfoSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js';
import { StatusSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb.js';
import { create } from '@bufbuild/protobuf';
import { AnySchema, MethodOptions_IdempotencyLevel } from '@bufbuild/protobuf/wkt';
import { Code, ConnectError } from '@connectrpc/connect';
import { FormExamplesService } from '../../../../../examples/gen/protoform/examples/v1/forms_pb.js';
import { captureRejection } from '../core/rejection.test-utils';
import {
  getProtoPartialResult,
  getProtoPolicyPreviewPlan,
  getProtoPurgePlan,
  getProtoRetryDecision,
  getProtoStability,
  ProtoOperationError,
  runProtoOperation,
} from './aip-client-workflow.js';

declare const { describe, expect, test }: typeof import('bun:test');

function operation(name: string, done = false, result: Operation['result'] = { case: undefined }) {
  return create(OperationSchema, { done, name, result });
}

function method(idempotency: MethodOptions_IdempotencyLevel) {
  return {
    ...FormExamplesService.method.submitBasicForm,
    idempotency,
  };
}

describe('runProtoOperation', () => {
  test('polls named AIP-151 operations until success or a terminal google.rpc.Status failure', async () => {
    const updates: boolean[] = [];
    const requests: Array<{ name: string; signal: AbortSignal }> = [];
    const result = await runProtoOperation({
      onProgress: (current) => {
        updates.push(current.done);
      },
      poll: (name, signal) => {
        requests.push({ name, signal });
        return Promise.resolve(operation(name, true, { case: 'response', value: create(AnySchema) }));
      },
      pollIntervalMs: 0,
      start: async () => operation('operations/123'),
    });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.name).toBe('operations/123');
    expect(requests[0]?.signal).toBeInstanceOf(AbortSignal);
    expect(updates).toEqual([false, true]);
    expect(result.done).toBe(true);

    const status = create(StatusSchema, {
      code: Code.FailedPrecondition,
      message: 'The import source is no longer available.',
    });

    expect(
      await captureRejection(
        runProtoOperation({
          poll: async () => operation('operations/unused'),
          start: async () => operation('operations/123', true, { case: 'error', value: status }),
        })
      )
    ).toBeInstanceOf(ProtoOperationError);
  });

  test('cancels the remote operation when the caller aborts', async () => {
    const controller = new AbortController();
    const pending = Promise.withResolvers<undefined>();
    const canceled: string[] = [];
    const result = runProtoOperation({
      cancel: (name) => {
        canceled.push(name);
        return Promise.resolve();
      },
      poll: async (name, signal) => {
        pending.resolve(undefined);
        await once(signal, 'abort');
        signal.throwIfAborted();
        return operation(name);
      },
      pollIntervalMs: 0,
      signal: controller.signal,
      start: async () => operation('operations/123'),
    });

    await pending.promise;
    controller.abort();
    expect(await captureRejection(result)).toMatchObject({ name: 'AbortError' });
    expect(canceled).toEqual(['operations/123']);
  });
});

describe('getProtoRetryDecision', () => {
  test('retries only idempotent unary UNAVAILABLE calls and respects RetryInfo', () => {
    const error = new ConnectError('try later', Code.Unavailable, {}, [
      {
        desc: RetryInfoSchema,
        value: { retryDelay: { nanos: 500_000_000, seconds: 2n } },
      },
    ]);

    expect(getProtoRetryDecision(method(MethodOptions_IdempotencyLevel.IDEMPOTENT), error)).toEqual({
      delayMs: 2500,
      reason: 'transient',
      retry: true,
    });
    expect(getProtoRetryDecision(method(MethodOptions_IdempotencyLevel.IDEMPOTENCY_UNKNOWN), error)).toEqual({
      reason: 'unsafe',
      retry: false,
    });
    expect(
      getProtoRetryDecision(
        method(MethodOptions_IdempotencyLevel.IDEMPOTENT),
        new ConnectError('invalid', Code.InvalidArgument)
      )
    ).toEqual({ reason: 'non-retryable-code', retry: false });
  });
});

describe('getProtoPartialResult', () => {
  test('turns AIP-217 unreachable resources into a warning and targeted recovery actions', () => {
    expect(
      getProtoPartialResult({
        unreachable: ['projects/example/locations/europe-west2', 'projects/example/locations/us-east1'],
      })
    ).toEqual({
      complete: false,
      recovery: [
        {
          label: 'Retry europe-west2',
          resourceName: 'projects/example/locations/europe-west2',
        },
        {
          label: 'Retry us-east1',
          resourceName: 'projects/example/locations/us-east1',
        },
      ],
      unreachable: ['projects/example/locations/europe-west2', 'projects/example/locations/us-east1'],
      warning: 'Some results are unavailable from 2 resources.',
    });
    expect(getProtoPartialResult({ unreachable: [] })).toEqual({
      complete: true,
      recovery: [],
      unreachable: [],
    });
  });
});

describe('destructive and preview workflow plans', () => {
  test('requires an AIP-165 purge preview and distinguishes AIP-236 non-enforcing preview from live commit', () => {
    expect(
      getProtoPurgePlan(
        { filter: 'state=DELETED', force: false },
        {
          purgeCount: 2,
          purgeSample: ['publishers/acme/books/old-1', 'publishers/acme/books/old-2'],
        }
      )
    ).toEqual({
      confirmationRequired: false,
      count: 2,
      mode: 'preview',
      sample: ['publishers/acme/books/old-1', 'publishers/acme/books/old-2'],
      warning: 'Preview only. No resources will be deleted.',
    });
    expect(
      getProtoPurgePlan({ filter: 'state=DELETED', force: true }, { purgeCount: 2, purgeSample: [] })
    ).toMatchObject({
      confirmationRequired: true,
      mode: 'execute',
      warning: 'This permanently deletes every resource matching the filter.',
    });

    expect(getProtoPolicyPreviewPlan('start-preview')).toEqual({
      action: 'start-preview',
      confirmationRequired: false,
      enforcesPolicy: false,
      notice: 'Preview compares the experiment with live traffic without enforcing it.',
    });
    expect(getProtoPolicyPreviewPlan('commit')).toEqual({
      action: 'commit',
      confirmationRequired: true,
      enforcesPolicy: true,
      notice: 'Commit replaces the live policy and deletes the experiment.',
    });
  });
});

describe('getProtoStability', () => {
  test('presents AIP-181 alpha, beta, stable, and deprecated guidance from generated descriptors', () => {
    expect(
      getProtoStability({
        deprecated: false,
        typeName: 'library.v1alpha1.Book',
      })
    ).toMatchObject({ level: 'alpha', preview: true });
    expect(getProtoStability({ deprecated: false, typeName: 'library.v1beta1.Book' })).toMatchObject({
      level: 'beta',
      preview: true,
    });
    expect(getProtoStability({ deprecated: false, typeName: 'library.v1.Book' })).toEqual({
      level: 'stable',
      preview: false,
    });
    expect(getProtoStability({ deprecated: true, typeName: 'library.v1.Book' })).toMatchObject({
      level: 'deprecated',
      preview: false,
    });
  });
});
