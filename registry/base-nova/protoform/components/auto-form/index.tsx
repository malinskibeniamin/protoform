'use client';

import { createProtoResolver } from '../../hooks/use-proto-form';
import type { Resolver, UseFormProps, UseFormReturn } from 'react-hook-form';

import { ReactHookFormEngine } from './adapters/react-hook-form';
import { AutoFormCore } from './auto-form-core';
import { isProtoMessageDescriptor, isProtoProvider } from './proto';
import type { AutoFormProps as BaseAutoFormProps } from './types';

type FormValues = Record<string, unknown>;

export type AutoFormProps<T extends FormValues = FormValues> = BaseAutoFormProps<
  T,
  UseFormReturn<FormValues, unknown, T>,
  UseFormProps<FormValues, unknown, T>,
  Resolver<FormValues, unknown, T>
>;

export {
  compileCelExpression,
  DEFAULT_CEL_MAX_COST,
  type CelEvaluation,
  type CompileCelExpressionOptions,
  type CompiledCelExpression,
} from './cel-runtime';
export { useAutoForm } from './context';
export { defaultRegistry } from './fields';
export { defaultClassifyField } from './helpers';
export { type FieldMatchContext, type FieldTypeDefinition, FieldTypeRegistry } from './registry';
export { AutoFormSlot } from './slot';
export type {
  AutoFormMode,
  AutoFormRevalidationMode,
  AutoFormStep,
  AutoFormStepperConfig,
  AutoFormStepperOrientation,
  AutoFormSubmitContext,
  AutoFormValidationMode,
  FieldTypes,
} from './types';
export { ShadcnAutoFormFieldComponents } from './auto-form-core';

export function AutoForm<T extends FormValues = FormValues>({
  formOptions,
  resolver,
  ...props
}: AutoFormProps<T>) {
  const protoDescriptor = isProtoMessageDescriptor(props.schema)
    ? props.schema
    : isProtoProvider(props.schema)
      ? props.schema.getMessageDescriptor()
      : undefined;
  const resolvedResolver =
    resolver ??
    (protoDescriptor
      ? (createProtoResolver(protoDescriptor) as unknown as Resolver<FormValues, unknown, T>)
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
    <AutoFormCore<T, UseFormReturn<FormValues, unknown, T>>
      {...props}
      renderEngine={({ children, defaultValues, values }) => (
        <ReactHookFormEngine<T>
          defaultValues={defaultValues}
          formOptions={engineOptions}
          resolver={resolvedResolver}
          values={values}
        >
          {children}
        </ReactHookFormEngine>
      )}
    />
  );
}
