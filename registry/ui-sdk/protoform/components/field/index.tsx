'use client';

import type { VariantProps } from 'class-variance-authority';
import { createContext, createElement, useContext, useId, useMemo } from 'react';

import { Label } from '@/components/ui/sdk/label/index';
import { Separator } from '@/components/ui/sdk/separator/index';
import { fieldVariants } from '@/components/ui/shared/field-variants';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  Field as SDKField,
  FieldDescription as SDKFieldDescription,
  FieldError as SDKFieldError,
  FieldLabel as SDKFieldLabel,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-field';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

interface FieldContextValue {
  errorId: string | undefined;
  invalid: boolean;
  managed: boolean;
  within: boolean;
}

const FieldContext = createContext<FieldContextValue>({
  within: false,
  managed: false,
  errorId: undefined,
  invalid: false,
});

export function useFieldContext() {
  return useContext(FieldContext);
}

function Field(
  allProps: React.ComponentProps<'div'> &
    VariantProps<typeof fieldVariants> &
    SharedProps & {
      invalid?: boolean;
      disabled?: boolean;
      name?: string;
      validation?: 'native' | 'external';
      'data-invalid'?: boolean | 'true' | 'false';
    }
) {
  const {
    className,
    orientation = 'vertical',
    invalid: invalidProp,
    disabled,
    name,
    'data-invalid': dataInvalid,
    testId,
    validation,
    ...props
  } = allProps;
  const invalid = invalidProp ?? (dataInvalid === true || dataInvalid === 'true');
  const errorId = useId();
  const managed = validation === 'native';
  const ctx = useMemo(
    () => ({ within: true, managed, errorId: !managed && invalid ? errorId : undefined, invalid }),
    [invalid, errorId, managed]
  );

  const fieldProps = {
    className: cn(fieldVariants({ orientation }), invalid ? 'text-destructive' : null, className),
    'data-invalid': dataInvalid,
    'data-orientation': orientation,
    'data-slot': 'field',
    'data-testid': testId,
    ...props,
  };
  const nativeProps: React.ComponentProps<typeof SDKField> = {
    ...fieldProps,
    ...definedProps({ disabled, name, invalid: invalidProp }),
    className: (state) => cn(fieldVariants({ orientation }), state.invalid ? 'text-destructive' : null, className),
  };
  return (
    <FieldContext.Provider value={ctx}>
      {managed ? createElement(SDKField, nativeProps) : createElement('div', fieldProps)}
    </FieldContext.Provider>
  );
}

function FieldLabel({
  className,
  children,
  htmlFor,
  required,
  ...props
}: Omit<React.ComponentProps<typeof Label>, 'children'> & { children?: React.ReactNode } & { required?: boolean }) {
  const field = useContext(FieldContext);
  const renderedProps = {
    ...props,
    ...definedProps({ htmlFor }),
    className: cn('text-sm leading-none font-medium', className),
    'data-slot': 'field-label',
    children: (
      <>
        {children}
        {required === true ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </>
    ),
  };
  if (field.within && field.managed && htmlFor === undefined) {
    return createElement(SDKFieldLabel, renderedProps);
  }
  return (
    <Label className={className} data-slot="field-label" htmlFor={htmlFor} variant="field" {...props}>
      {children}
      {required === true ? (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      ) : null}
    </Label>
  );
}

function FieldDescription({ className, testId, ...props }: React.ComponentProps<'div'> & SharedProps) {
  const field = useContext(FieldContext);
  const Component = field.within && field.managed ? SDKFieldDescription : 'div';
  return (
    <Component
      className={cn(
        'text-sm leading-normal font-normal text-muted-foreground group-has-data-[orientation=horizontal]/field:text-balance',
        'last:mt-0 nth-last-2:-mt-1 [&:is([data-variant=legend]+*)]:-mt-1.5',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className
      )}
      data-slot="field-description"
      data-testid={testId}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn('relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2', className)}
      data-content={Boolean(children)}
      data-slot="field-separator"
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children ? (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      ) : null}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  testId,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>;
} & SharedProps) {
  const { errorId, within, managed } = useContext(FieldContext);
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors || errors.length === 0) {
      return null;
    }

    if (errors?.length === 1) {
      return errors[0]?.message;
    }

    const messages = [...new Set(errors.flatMap((error) => (error?.message ? [error.message] : [])))];
    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  const Component = within && managed ? SDKFieldError : 'div';
  return (
    <Component
      {...(within && managed ? { match: true } : {})}
      className={cn('text-sm font-normal text-destructive', className)}
      data-slot="field-error"
      data-testid={testId}
      id={errorId}
      role="alert"
      {...props}
    >
      {content}
    </Component>
  );
}

export {
  FieldContent,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/shared/field';
export { Field, FieldDescription, FieldError, FieldLabel, FieldSeparator };
