import type React from 'react';

export interface ComboboxOption {
  label: string;
  value: string;
}

type InputProps = Pick<
  React.ComponentProps<'input'>,
  | 'aria-label'
  | 'id'
  | 'maxLength'
  | 'minLength'
  | 'onChange'
  | 'pattern'
  | 'placeholder'
  | 'required'
  | 'type'
  | 'max'
  | 'min'
  | 'step'
  | 'checked'
  | 'className'
> & { value?: string | undefined };
type TextareaProps = Pick<
  React.ComponentProps<'textarea'>,
  'aria-hidden' | 'className' | 'id' | 'onChange' | 'onFocus' | 'onInvalid' | 'tabIndex' | 'value'
>;
export interface JSONFieldControls {
  Badge: React.ComponentType<React.PropsWithChildren<{ size: 'sm'; variant: 'outline' }>>;
  Button: React.ComponentType<
    Pick<React.ComponentProps<'button'>, 'aria-label' | 'className' | 'disabled' | 'type' | 'children'> & {
      onClick?: React.MouseEventHandler<HTMLElement> | undefined;
      size: 'sm';
      variant: 'outline' | 'dashed';
    }
  >;
  Combobox: React.ComponentType<{
    'aria-label': string;
    creatable?: boolean;
    id: string;
    onChange: (value: string) => void;
    onCreateOption?: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string | undefined;
    value: string;
  }>;
  Input: React.ComponentType<InputProps>;
  Label: React.ComponentType<React.PropsWithChildren<{ htmlFor: string; variant: 'strong' }>>;
  notify: (options: { description: string; title: string; type: 'success' }) => unknown;
  Textarea: React.ComponentType<TextareaProps>;
}
