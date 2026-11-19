'use client';

import { useRef, useSyncExternalStore } from 'react';
import { Form, type FormProps, useFormContext } from 'react-hook-form';
import type { AutoFormFormRenderProps } from '../auto-form-core';

type FormValues = Record<string, unknown>;

export type AutoFormSubmissionProps = Omit<FormProps<FormValues>, 'children' | 'control' | 'render'> &
  Record<`data-${string}`, string | number | boolean | undefined>;

class RejectedAutoFormSubmissionError extends Error {
  override name = 'RejectedAutoFormSubmissionError';
}

function subscribeToHydration() {
  return () => undefined;
}

export function ReactHookFormSubmission({
  children,
  FormComponent,
  formProps,
  onSubmit,
  options,
}: AutoFormFormRenderProps & { options: AutoFormSubmissionProps }) {
  const form = useFormContext<FormValues, unknown, FormValues>();
  const inFlightRef = useRef<boolean>(false);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  function reportSubmissionError(error: unknown) {
    if (error instanceof RejectedAutoFormSubmissionError) {
      return;
    }
    form.setError('root', {
      message: error instanceof Error ? error.message : 'Submission failed.',
      type: 'submit',
    });
  }

  return (
    <Form
      {...options}
      control={form.control}
      onError={(error) => {
        reportSubmissionError(error.error ?? new Error('Submission failed.'));
        options.onError?.(error);
      }}
      onSubmit={async (payload) => {
        if (!(await onSubmit(payload.data)) || Object.keys(form.getErrors()).length > 0) {
          throw new RejectedAutoFormSubmissionError();
        }
        await options.onSubmit?.(payload);
        if (Object.keys(form.getErrors()).length > 0) {
          throw new RejectedAutoFormSubmissionError();
        }
      }}
      render={({ submit }) => (
        <FormComponent
          {...formProps}
          action={options.action}
          {...(typeof options.action === 'function'
            ? {}
            : { encType: options.encType, method: options.method ?? 'post' })}
          noValidate={options.noValidate ?? mounted}
          onSubmit={async (event) => {
            event.preventDefault();
            if (inFlightRef.current) {
              return;
            }
            inFlightRef.current = true;
            const requestSubmit: (...args: Parameters<typeof submit>) => unknown = submit;
            await Promise.resolve(requestSubmit(event))
              .catch(reportSubmissionError)
              .finally(() => {
                inFlightRef.current = false;
              });
          }}
        >
          {children}
        </FormComponent>
      )}
    />
  );
}
