'use client';

import {
  type TanStackAutoFormApi,
  TanStackEngine,
  type TanStackFormOptions,
} from '../auto-form/adapters/tanstack';
import { AutoFormCore } from '../auto-form/auto-form-core';
import type { AutoFormProps as BaseAutoFormProps } from '../auto-form/types';

type FormValues = Record<string, unknown>;

export type AutoFormProps<T extends FormValues = FormValues> = Omit<
  BaseAutoFormProps<T, TanStackAutoFormApi, TanStackFormOptions, never>,
  'resolver'
>;

export {
  compileCelExpression,
  DEFAULT_CEL_MAX_COST,
  type CelEvaluation,
  type CompileCelExpressionOptions,
  type CompiledCelExpression,
} from '../auto-form/cel-runtime';
export { useAutoForm } from '../auto-form/context';
export { defaultRegistry } from '../auto-form/fields';
export { defaultClassifyField } from '../auto-form/helpers';
export {
  type FieldMatchContext,
  type FieldTypeDefinition,
  FieldTypeRegistry,
} from '../auto-form/registry';
export { AutoFormSlot } from '../auto-form/slot';
export type {
  AutoFormMode,
  AutoFormRevalidationMode,
  AutoFormStep,
  AutoFormStepperConfig,
  AutoFormStepperOrientation,
  AutoFormSubmitContext,
  AutoFormValidationMode,
  FieldTypes,
} from '../auto-form/types';
export { ShadcnAutoFormFieldComponents } from '../auto-form/auto-form-core';
export type { TanStackAutoFormApi, TanStackFormOptions };

export function AutoForm<T extends FormValues = FormValues>({
  formOptions,
  ...props
}: AutoFormProps<T>) {
  return (
    <AutoFormCore<T, TanStackAutoFormApi>
      {...props}
      renderEngine={({ children, defaultValues, values }) => (
        <TanStackEngine
          defaultValues={defaultValues}
          formOptions={formOptions}
          values={values}
        >
          {children}
        </TanStackEngine>
      )}
    />
  );
}
