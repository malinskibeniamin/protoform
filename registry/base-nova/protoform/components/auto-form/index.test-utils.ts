import type { ParsedField, SchemaProvider, SchemaValidation } from './core-types';

type ValidatorFn = (values: Record<string, unknown>) => SchemaValidation;

export function createMockProvider(
  fields: ParsedField[],
  defaults: Record<string, unknown> = {},
  validator?: ValidatorFn
) {
  const defaultValidator: ValidatorFn = (values) => ({ data: values, success: true });

  const schema: SchemaProvider = {
    getDefaultValues: () => defaults,
    parseSchema: () => ({ fields }),
    validateSchema: (values) => (validator ?? defaultValidator)(values),
  };
  return schema;
}

export function observeCallback<Args extends unknown[], Value>(
  observer: ((...args: Args) => Value) & { mock: { calls: readonly unknown[] } }
) {
  const pending = new Map<number, PromiseWithResolvers<undefined>>();
  function handleCall(...args: Args) {
    const result = observer(...args);
    const count = observer.mock.calls.length;
    pending.get(count)?.resolve(undefined);
    pending.delete(count);
    return result;
  }
  function after(count: number) {
    if (observer.mock.calls.length >= count) {
      return Promise.resolve();
    }
    const reached = pending.get(count) ?? Promise.withResolvers<undefined>();
    pending.set(count, reached);
    return reached.promise;
  }
  return { after, handleCall };
}
