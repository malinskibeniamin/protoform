import type React from 'react';

type UIComponent = React.ElementType;

export interface ComboboxOption {
  data?: unknown;
  disabled?: boolean | undefined;
  group?: string | undefined;
  groupTestId?: string | undefined;
  label: string;
  testId?: string | undefined;
  value: string;
}

export type ProtoformUIComponentMap = Partial<Record<keyof import('./ui-props').ProtoformUIProps, UIComponent>>;
