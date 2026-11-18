'use client';

import { FormischEngine } from '../auto-form/adapters/formisch';
import { type FormischAutoFormApi, objectStorage } from '../auto-form/adapters/formisch-storage';
import { AutoFormCore } from '../auto-form/auto-form-core';
import { shadcnUIComponents } from '../auto-form/shadcn-ui-components';
import type { AutoFormProps as BaseAutoFormProps } from '../auto-form/types';

type FormValues = Record<string, unknown>;

export type AutoFormProps<T extends FormValues = FormValues, TCustomFieldType extends string = never> = Omit<
  BaseAutoFormProps<T, FormischAutoFormApi, never, never, TCustomFieldType>,
  'formOptions' | 'resolver'
>;

export type { FormischAutoFormApi } from '../auto-form/adapters/formisch-storage';
export { useAutoForm } from '../auto-form/context';
export type { AutoFormSubmitContext } from '../auto-form/types';

export function AutoForm<T extends FormValues = FormValues, TCustomFieldType extends string = never>({
  components = shadcnUIComponents,
  ...props
}: AutoFormProps<T, TCustomFieldType>) {
  return (
    <AutoFormCore<T, FormischAutoFormApi, TCustomFieldType>
      {...props}
      components={components}
      renderEngine={({ children, defaultValues, parsedSchema, values }) => {
        const storage = objectStorage(parsedSchema.fields);
        return (
          <FormischEngine
            defaultValues={defaultValues}
            key={JSON.stringify(storage)}
            onDirtyChange={props.onDirtyChange}
            storage={storage}
            values={values}
          >
            {children}
          </FormischEngine>
        );
      }}
    />
  );
}
