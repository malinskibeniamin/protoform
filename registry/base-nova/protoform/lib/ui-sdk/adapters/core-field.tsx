'use client';

import { field } from '@ui-sdk/core/field';
import { Field as ConnectedField } from '@ui-sdk/react/field';
import { createParts } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(field), { label: 'label', description: 'div', error: 'div' });
export function Field(props: UIProps<ComponentProps<typeof ConnectedField>>) {
  return createElement(ConnectedField, definedProps(props));
}
export function FieldLabel(props: UIProps<ComponentProps<typeof parts.Label>>) {
  return createElement(parts.Label, definedProps(props));
}
export function FieldDescription(props: UIProps<ComponentProps<typeof parts.Description>>) {
  return createElement(parts.Description, definedProps(props));
}
export function FieldError(props: UIProps<ComponentProps<typeof parts.Error>>) {
  return createElement(parts.Error, definedProps(props));
}
