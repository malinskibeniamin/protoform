import type { ParsedField, SchemaProvider, SchemaValidation } from "../core-types";

type ValidatorFn = (values: Record<string, unknown>) => SchemaValidation;

/**
 * Creates a mock SchemaProvider for testing purposes.
 *
 * @param fields - The parsed field definitions the provider will return
 * @param defaults - Optional default values returned by getDefaultValues
 * @param validator - Optional custom validation function; defaults to always-pass
 */
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
