import type React from 'react';
import type { ReactNode } from 'react';
import type { FieldWrapperProps, ParsedField, UiRenderable } from '@/registry/base-nova/protoform/lib/form-types';

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
} from '@/registry/base-nova/protoform/lib/form-types';

export { getFieldHints } from '@/registry/base-nova/protoform/lib/form-types';

export interface ObjectWrapperProps {
  children: ReactNode;
  field: ParsedField;
  hasError?: boolean | undefined;
  label: UiRenderable;
}

export interface ArrayWrapperProps {
  children: ReactNode;
  field: ParsedField;
  label: UiRenderable;
  onAddItem: () => void;
}

export interface ArrayElementWrapperProps {
  children: ReactNode;
  index: number;
  onRemove: () => void;
}

export interface OneofVariant {
  disabled: boolean;
  field: ParsedField;
  key: string;
  label: string;
}

export interface OneofWrapperProps {
  disabled: boolean;
  error?: string | undefined;
  field: ParsedField;
  id: string;
  label: string;
  onSelect: (key: string | undefined) => void;
  renderVariant: (variant: ParsedField) => ReactNode;
  selected?: ParsedField | undefined;
  selectedKey?: string | undefined;
  testId: string;
  variants: OneofVariant[];
}

export interface AutoFormUIComponents {
  ArrayElementWrapper: React.ComponentType<ArrayElementWrapperProps>;
  ArrayWrapper: React.ComponentType<ArrayWrapperProps>;
  ErrorMessage: React.ComponentType<{ error: string }>;
  FieldWrapper: React.ComponentType<FieldWrapperProps>;
  Form: React.ComponentType<React.ComponentProps<'form'>>;
  ObjectWrapper: React.ComponentType<ObjectWrapperProps>;
  OneofWrapper: React.ComponentType<OneofWrapperProps>;
  SubmitButton: React.ComponentType<{
    children: ReactNode;
    disabled?: boolean | undefined;
    testId?: string | undefined;
  }>;
}

export interface AutoFormInputProps {
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  max?: number | string;
  min?: number | string;
  name?: string;
  onBlur: () => void;
  onChange: AutoFormValueHandler;
  onCheckedChange: AutoFormCheckedHandler;
  onValueChange: AutoFormValueHandler;
  placeholder?: string;
  ref?: React.Ref<HTMLInputElement>;
  required?: boolean;
  step?: number | string;
  testId?: string;
  value?: unknown;
  [name: string]: unknown;
}

interface AutoFormSetValueOptions {
  shouldDirty?: boolean;
  shouldTouch?: boolean;
  shouldValidate?: boolean;
}

type AutoFormValueHandler = {
  bivarianceHack(value: unknown, options?: AutoFormSetValueOptions): void;
}['bivarianceHack'];

type AutoFormCheckedHandler = {
  bivarianceHack(value: boolean): void;
}['bivarianceHack'];

export interface AutoFormFieldProps {
  error?: string | undefined;
  field: ParsedField;
  id: string;
  inputProps: AutoFormInputProps;
  label: UiRenderable;
  path: string[];
  value: unknown;
}

export type AutoFormFieldComponents<TFieldType extends string = string> = {
  fallback: React.ComponentType<AutoFormFieldProps>;
} & Partial<Record<TFieldType, React.ComponentType<AutoFormFieldProps>>>;
