import type { ParsedField, SchemaProvider, SchemaValidation } from '../core-types';

type ValidatorFn = (values: Record<string, unknown>) => SchemaValidation;

export function createMockProvider(
  fields: ParsedField[],
  defaults: Record<string, unknown> = {},
  validator?: ValidatorFn
): SchemaProvider {
  const defaultValidator: ValidatorFn = (values) => ({ data: values, success: true });

  return {
    getDefaultValues: () => defaults,
    parseSchema: () => ({ fields }),
    validateSchema: (values) => (validator ?? defaultValidator)(values as Record<string, unknown>),
  };
}
