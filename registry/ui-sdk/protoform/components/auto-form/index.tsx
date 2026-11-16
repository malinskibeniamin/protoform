'use client';

import {
  AutoForm as HostAutoForm,
  type AutoFormProps as HostAutoFormProps,
} from '@/registry/base-nova/protoform/components/auto-form/host';
import { uiSdkComponents } from '@/registry/base-nova/protoform/components/auto-form/sdk-components';

export { ShadcnAutoFormFieldComponents } from '@/registry/base-nova/protoform/components/auto-form/auto-form-core';
export {
  type CelEvaluation,
  type CompileCelExpressionOptions,
  type CompiledCelExpression,
  compileCelExpression,
  DEFAULT_CEL_MAX_COST,
} from '@/registry/base-nova/protoform/components/auto-form/cel-runtime';
export {
  type AutoFormConfigurationDiagnostic,
  type AutoFormConfigurationDiagnosticCode,
  type AutoFormDiagnostic,
  type InspectAutoFormConfigurationInput,
  inspectAutoFormConfiguration,
} from '@/registry/base-nova/protoform/components/auto-form/configuration';
export { useAutoForm } from '@/registry/base-nova/protoform/components/auto-form/context';
export type {
  AutoFormFieldComponents,
  AutoFormFieldProps,
  OneofVariant,
  OneofWrapperProps,
} from '@/registry/base-nova/protoform/components/auto-form/core-types';
export type {
  DataProvider,
  DataProviderComponent,
  DataProviderDefinition,
  DataProviderDependencyValues,
  DataProviderOption,
  DataProviderProps,
  DataProviderRegistration,
  DataProviderRegistry,
  DataProviderRequest,
  DataProviderResult,
  DataProviderStaleSelectionPolicy,
} from '@/registry/base-nova/protoform/components/auto-form/data-providers';
export type { AutoFormEngineHandle } from '@/registry/base-nova/protoform/components/auto-form/engine';
export { defaultRegistry } from '@/registry/base-nova/protoform/components/auto-form/fields';
export { defaultClassifyField } from '@/registry/base-nova/protoform/components/auto-form/helpers';
export type { AutoFormSubmissionProps } from '@/registry/base-nova/protoform/components/auto-form/host';
export type { AutoFormAppearance } from '@/registry/base-nova/protoform/components/auto-form/layout-context';
export {
  type FieldMatchContext,
  type FieldTypeDefinition,
  FieldTypeRegistry,
} from '@/registry/base-nova/protoform/components/auto-form/registry';
export type { ProtoformUIComponentMap } from '@/registry/base-nova/protoform/components/auto-form/sdk-components';
export { uiSdkComponents } from '@/registry/base-nova/protoform/components/auto-form/sdk-components';
export { AutoFormSlot } from '@/registry/base-nova/protoform/components/auto-form/slot';
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
} from '@/registry/base-nova/protoform/components/auto-form/types';
export type {
  ProtoformMessageCode,
  ProtoformMessageFormatter,
  ProtoformMessageParams,
} from '@/registry/base-nova/protoform/lib/core/messages';

export type AutoFormProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  TCustomFieldType extends string = never,
> = Omit<HostAutoFormProps<T, TCustomFieldType>, 'components'> & {
  components?: HostAutoFormProps<T, TCustomFieldType>['components'];
};

export function AutoForm<
  T extends Record<string, unknown> = Record<string, unknown>,
  TCustomFieldType extends string = never,
>({ components = uiSdkComponents, ...props }: AutoFormProps<T, TCustomFieldType>) {
  return <HostAutoForm<T, TCustomFieldType> {...props} components={components} />;
}
