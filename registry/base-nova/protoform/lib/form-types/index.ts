import type { ComponentType, ReactNode } from 'react';
import type {
  FieldConfig as CoreFieldConfig,
  ParsedField as CoreParsedField,
  ProviderCustomData,
  Renderable,
} from '../core';

export type {
  EmptyRepeatedStringPolicy,
  FieldRenderHints,
  FormValues,
  InputProps,
  OptionGroup,
  ProviderCustomData,
  Renderable,
  SchemaProvider,
  SchemaValidation,
  SchemaValidationContext,
  SchemaValidationError,
  UiRule,
} from '../core';
export { getFieldHints } from '../core';

export type UiRenderable = Renderable | ReactNode;

export interface FieldWrapperProps {
  children: ReactNode;
  error?: UiRenderable | undefined;
  field: ParsedField;
  id: string;
  label: UiRenderable;
}

export interface FieldConfig<FieldTypes = string, CustomData extends ProviderCustomData = ProviderCustomData>
  extends CoreFieldConfig<FieldTypes, CustomData> {
  fieldWrapper?: ComponentType<FieldWrapperProps> | undefined;
}

export interface ParsedField<FieldTypes = string> extends CoreParsedField<FieldTypes> {
  fieldConfig?: FieldConfig<FieldTypes> | undefined;
  schema?: ParsedField<FieldTypes>[] | undefined;
}

export interface ParsedSchema<FieldTypes = string> {
  fields: ParsedField<FieldTypes>[];
}
