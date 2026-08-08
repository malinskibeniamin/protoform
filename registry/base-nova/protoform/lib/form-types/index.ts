/**
 * Schema-agnostic form contract types.
 *
 * Canonical definitions live in the registry-native core module. This file
 * widens the framework-free field model for the React renderer.
 *
 * `FieldConfig`/`ParsedField` are widened here with the React-only
 * `fieldWrapper` override; the core package stays framework-free, and the
 * extra optional property keeps both directions structurally assignable.
 */

import type {
  FieldConfig as CoreFieldConfig,
  ParsedField as CoreParsedField,
  ProviderCustomData,
  Renderable,
} from '../core';
import type { ComponentType, ReactNode } from 'react';
export { getFieldHints } from '../core';

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

/** Core's schema-layer Renderable widened with ReactNode for the React layer. */
export type UiRenderable = Renderable | ReactNode;

export interface FieldWrapperProps {
  label: UiRenderable;
  error?: UiRenderable;
  children: ReactNode;
  id: string;
  field: ParsedField;
}

export interface FieldConfig<FieldTypes = string, CustomData extends ProviderCustomData = ProviderCustomData>
  extends CoreFieldConfig<FieldTypes, CustomData> {
  /** Per-field React wrapper override; React-layer concern, absent from the core IR. */
  fieldWrapper?: ComponentType<FieldWrapperProps>;
}

export interface ParsedField<FieldTypes = string> extends CoreParsedField<FieldTypes> {
  fieldConfig?: FieldConfig<FieldTypes>;
  schema?: ParsedField<FieldTypes>[];
}

export interface ParsedSchema<FieldTypes = string> {
  fields: ParsedField<FieldTypes>[];
}
