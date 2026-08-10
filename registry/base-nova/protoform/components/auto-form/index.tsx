'use client';

import { createProtoResolver } from '../../hooks/use-proto-form';
import type { Resolver, UseFormProps, UseFormReturn } from 'react-hook-form';

import { ReactHookFormEngine } from './adapters/react-hook-form';
import { AutoFormCore } from './auto-form-core';
import { isProtoMessageDescriptor, isProtoProvider } from './proto';
import { protoConversionOptionsFromFieldConfig } from './schema';
import type { AutoFormProps as BaseAutoFormProps } from './types';

type FormValues = Record<string, unknown>;

export type AutoFormProps<
  T extends FormValues = FormValues,
  TCustomFieldType extends string = never,
> = BaseAutoFormProps<
  T,
  UseFormReturn<FormValues, unknown, T>,
  UseFormProps<FormValues, unknown, T>,
  Resolver<FormValues, unknown, T>,
  TCustomFieldType
>;

export {
  compileCelExpression,
  DEFAULT_CEL_MAX_COST,
  type CelEvaluation,
  type CompileCelExpressionOptions,
  type CompiledCelExpression,
} from './cel-runtime';
export { useAutoForm } from './context';
export {
  inspectAutoFormConfiguration,
  type AutoFormConfigurationDiagnostic,
  type AutoFormConfigurationDiagnosticCode,
  type InspectAutoFormConfigurationInput,
} from './configuration';
export { defaultRegistry } from './fields';
export { defaultClassifyField } from './helpers';
export { type FieldMatchContext, type FieldTypeDefinition, FieldTypeRegistry } from './registry';
export { AutoFormSlot } from './slot';
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
} from './types';
export { ShadcnAutoFormFieldComponents } from './auto-form-core';
export type { AutoFormFieldComponents, AutoFormFieldProps } from './core-types';
export type { AutoFormEngineHandle } from './engine';

export function AutoForm<
  T extends FormValues = FormValues,
  TCustomFieldType extends string = never,
>({
  formOptions,
  resolver,
  ...props
}: AutoFormProps<T, TCustomFieldType>) {
  const protoDescriptor = isProtoMessageDescriptor(props.schema)
    ? props.schema
    : isProtoProvider(props.schema)
      ? props.schema.getMessageDescriptor()
      : undefined;
  const conversionOptions = protoConversionOptionsFromFieldConfig(props.fieldConfig);
  const resolvedResolver =
    resolver ??
    (protoDescriptor
      ? (createProtoResolver(protoDescriptor, conversionOptions) as unknown as Resolver<FormValues, unknown, T>)
      : undefined);
  const engineOptions: UseFormProps<FormValues, unknown, T> = {
    ...(formOptions ?? {}),
    ...(props.validationMode
      ? {
          mode:
            props.validationMode === 'change'
              ? 'onChange'
              : props.validationMode === 'blur'
                ? 'onBlur'
                : 'onSubmit',
        }
      : {}),
    ...(props.revalidationMode
      ? {
          reValidateMode:
            props.revalidationMode === 'change' ? 'onChange' : 'onBlur',
        }
      : {}),
  };

  return (
    <AutoFormCore<T, UseFormReturn<FormValues, unknown, T>, TCustomFieldType>
      {...props}
      renderEngine={({ children, defaultValues, values }) => (
        <ReactHookFormEngine<T>
          defaultValues={defaultValues}
          formOptions={engineOptions}
          onDirtyChange={props.onDirtyChange}
          resolver={resolvedResolver}
          values={values}
        >
          {children}
        </ReactHookFormEngine>
      )}
    />
  );
}
