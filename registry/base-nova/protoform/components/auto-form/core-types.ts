import type React from 'react';
import type { ReactNode } from 'react';

// Re-export schema contract types from shared lib so existing consumers
// can continue importing from './core-types' without changes.
export type {
  FieldConfig,
  FieldWrapperProps,
  ParsedField,
  ParsedSchema,
  Renderable,
  SchemaProvider,
  SchemaValidation,
  SchemaValidationContext,
  SchemaValidationError,
  UiRenderable,
} from '../../lib/form-types';

import type { FieldWrapperProps, ParsedField, UiRenderable } from '../../lib/form-types';
export { getFieldHints } from '../../lib/form-types';

// ---------------------------------------------------------------------------
// UI component contracts — AutoForm-specific wrapper and field props.
// ---------------------------------------------------------------------------

export type ObjectWrapperProps = {
  label: UiRenderable;
  children: ReactNode;
  field: ParsedField;
  hasError?: boolean;
};

export type ArrayWrapperProps = {
  label: UiRenderable;
  children: ReactNode;
  field: ParsedField;
  onAddItem: () => void;
};

export type ArrayElementWrapperProps = {
  children: ReactNode;
  onRemove: () => void;
  index: number;
};

export type AutoFormUIComponents = {
  Form: React.ComponentType<React.ComponentProps<'form'>>;
  FieldWrapper: React.ComponentType<FieldWrapperProps>;
  ErrorMessage: React.ComponentType<{ error: string }>;
  SubmitButton: React.ComponentType<{ children: ReactNode; disabled?: boolean; testId?: string }>;
  ObjectWrapper: React.ComponentType<ObjectWrapperProps>;
  ArrayWrapper: React.ComponentType<ArrayWrapperProps>;
  ArrayElementWrapper: React.ComponentType<ArrayElementWrapperProps>;
};

export type AutoFormFieldProps = {
  label: UiRenderable;
  field: ParsedField;
  value: any;
  error?: string;
  id: string;
  path: string[];
  inputProps: Record<string, any>;
};

export type AutoFormFieldComponents<TFieldType extends string = string> = {
  fallback: React.ComponentType<AutoFormFieldProps>;
} & Partial<Record<TFieldType, React.ComponentType<AutoFormFieldProps>>>;
