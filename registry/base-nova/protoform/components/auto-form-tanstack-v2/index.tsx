'use client';

import {
  type TanStackFormV2Options,
  type TanStackV2AutoFormApi,
  TanStackV2Engine,
} from '../auto-form/adapters/tanstack-v2';
import { AutoFormCore } from '../auto-form/auto-form-core';
import type { AutoFormProps as BaseAutoFormProps } from '../auto-form/types';

type FormValues = Record<string, unknown>;

export type AutoFormProps<
  T extends FormValues = FormValues,
  TCustomFieldType extends string = never,
> = Omit<
  BaseAutoFormProps<
    T,
    TanStackV2AutoFormApi,
    TanStackFormV2Options,
    never,
    TCustomFieldType
  >,
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
export type {
  AutoFormFieldComponents,
  AutoFormFieldProps,
} from '../auto-form/core-types';
export type { AutoFormEngineHandle } from '../auto-form/engine';
export type { TanStackFormV2Options, TanStackV2AutoFormApi };

export function AutoForm<
  T extends FormValues = FormValues,
  TCustomFieldType extends string = never,
>({
  formOptions,
  ...props
}: AutoFormProps<T, TCustomFieldType>) {
  return (
    <AutoFormCore<T, TanStackV2AutoFormApi, TCustomFieldType>
      {...props}
      renderEngine={({
        children,
        defaultValues,
        validateSchema,
        values,
      }) => (
        <TanStackV2Engine
          defaultValues={defaultValues}
          formOptions={formOptions}
          onDirtyChange={props.onDirtyChange}
          revalidationMode={props.revalidationMode}
          validateSchema={validateSchema}
          validationMode={props.validationMode}
          values={values}
        >
          {children}
        </TanStackV2Engine>
      )}
    />
  );
}
