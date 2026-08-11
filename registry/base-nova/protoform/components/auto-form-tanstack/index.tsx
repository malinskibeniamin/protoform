'use client';

import {
  type TanStackAutoFormApi,
  TanStackEngine,
  type TanStackFormOptions,
} from '../auto-form/adapters/tanstack';
import { AutoFormCore } from '../auto-form/auto-form-core';
import type { AutoFormProps as BaseAutoFormProps } from '../auto-form/types';

type FormValues = Record<string, unknown>;

export type AutoFormProps<
  T extends FormValues = FormValues,
  TCustomFieldType extends string = never,
> = Omit<
  BaseAutoFormProps<T, TanStackAutoFormApi, TanStackFormOptions, never, TCustomFieldType>,
  'resolver'
>;

export {
  compileCelExpression,
  DEFAULT_CEL_MAX_COST,
  type CelEvaluation,
  type CompileCelExpressionOptions,
  type CompiledCelExpression,
} from '../auto-form/cel-runtime';
export {
  inspectAutoFormConfiguration,
  type AutoFormConfigurationDiagnostic,
  type AutoFormConfigurationDiagnosticCode,
  type InspectAutoFormConfigurationInput,
} from '../auto-form/configuration';
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
  AutoFormRootHeaderMetadata,
  AutoFormRootHeaderMode,
  AutoFormStep,
  AutoFormStepperConfig,
  AutoFormStepperOrientation,
  AutoFormSubmitContext,
  AutoFormValidationMode,
  BuiltInFieldType,
  DeprecatedFieldPolicy,
  FieldTypes,
} from '../auto-form/types';
export { ShadcnAutoFormFieldComponents } from '../auto-form/auto-form-core';
export type { AutoFormFieldComponents, AutoFormFieldProps } from '../auto-form/core-types';
export type { AutoFormEngineHandle } from '../auto-form/engine';
export type { TanStackAutoFormApi, TanStackFormOptions };

export function AutoForm<
  T extends FormValues = FormValues,
  TCustomFieldType extends string = never,
>({
  formOptions,
  ...props
}: AutoFormProps<T, TCustomFieldType>) {
  return (
    <AutoFormCore<T, TanStackAutoFormApi, TCustomFieldType>
      {...props}
      renderEngine={({ children, defaultValues, values }) => (
        <TanStackEngine
          defaultValues={defaultValues}
          formOptions={formOptions}
          onDirtyChange={props.onDirtyChange}
          values={values}
        >
          {children}
        </TanStackEngine>
      )}
    />
  );
}
