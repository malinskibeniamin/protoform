import { describe, expect } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutoForm, type AutoFormSubmitContext } from '.';
import type { SchemaProvider } from './core-types';
import { createMockProvider } from './index.test-utils';

const SUBMIT_BUTTON = /submit/iu;
const USERNAME_LABEL = /username/iu;

const usernameProvider = createMockProvider([{ key: 'username', required: true, type: 'string' }]);

describe('autoForm – onSubmit error handling', () => {
  test('shows a root error when onSubmit throws or rejects', async () => {
    const user = userEvent.setup();

    const view = render(
      <AutoForm
        onSubmit={() => {
          throw new Error('API failed');
        }}
        schema={usernameProvider}
        withSubmit
      />
    );

    await user.type(screen.getByLabelText(USERNAME_LABEL), 'alice');
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
    await waitFor(() => {
      expect(screen.getByText(/api failed/iu)).toBeVisible();
    });

    view.unmount();
    render(
      <AutoForm onSubmit={() => Promise.reject(new Error('Network error'))} schema={usernameProvider} withSubmit />
    );

    await user.type(screen.getByLabelText(USERNAME_LABEL), 'bob');
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
    await waitFor(() => {
      expect(screen.getByText(/network error/iu)).toBeVisible();
    });
  });

  test('ignores submits from outside the form while a submission is in flight', async () => {
    const user = userEvent.setup();
    const waiting = Promise.withResolvers<undefined>();
    const first = Promise.withResolvers<undefined>();
    const second = Promise.withResolvers<undefined>();
    let submissions = 0;
    async function save() {
      submissions += 1;
      if (submissions === 1) {
        first.resolve(undefined);
        await waiting.promise;
      } else {
        second.resolve(undefined);
      }
    }

    render(
      <>
        <AutoForm
          defaultValues={{ username: 'alice' }}
          formProps={{ id: 'external-submit-form' }}
          onSubmit={save}
          schema={usernameProvider}
        />
        <button form="external-submit-form" type="submit">
          Save
        </button>
      </>
    );

    await user.dblClick(screen.getByRole('button', { name: 'Save' }));
    await first.promise;
    expect(submissions).toBe(1);
    waiting.reject(new Error('Save failed'));
    expect(await screen.findByText('Save failed')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await second.promise;
    expect(submissions).toBe(2);
  });

  test('aborts superseded and unmounted submit contexts and active provider validation', async () => {
    const user = userEvent.setup();
    const submitted = Promise.withResolvers<AbortSignal>();
    const resubmitted = Promise.withResolvers<AbortSignal>();
    const firstRequest = Promise.withResolvers<undefined>();
    const secondRequest = Promise.withResolvers<undefined>();
    let count = 0;
    async function onSubmit(_values: unknown, _form: unknown, context: AutoFormSubmitContext) {
      count += 1;
      if (count === 1) {
        submitted.resolve(context.signal);
        await firstRequest.promise;
      } else {
        resubmitted.resolve(context.signal);
        await secondRequest.promise;
      }
    }

    const view = render(<AutoForm onSubmit={onSubmit} schema={usernameProvider} withSubmit />);
    await user.type(screen.getByLabelText(USERNAME_LABEL), 'alice');
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
    const first = await submitted.promise;
    firstRequest.resolve(undefined);
    await waitFor(() => expect(screen.getByRole('button', { name: SUBMIT_BUTTON })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
    const second = await resubmitted.promise;

    expect(first.aborted).toBe(true);
    expect(second.aborted).toBe(false);

    view.unmount();

    expect(second.aborted).toBe(true);
    secondRequest.resolve(undefined);

    cleanup();
    const validating = Promise.withResolvers<AbortSignal | undefined>();
    let finishValidation: (() => void) | undefined;
    const provider: SchemaProvider = {
      getDefaultValues: () => ({ username: 'alice' }),
      parseSchema: () => ({ fields: [{ key: 'username', required: true, type: 'string' }] }),
      validateSchema: (_values, context) =>
        new Promise((resolve) => {
          validating.resolve(context?.signal);
          finishValidation = () => resolve({ data: { username: 'alice' }, success: true });
        }),
    };
    const viewValidation = render(
      <AutoForm
        schema={provider}
        stepper={{
          steps: [
            { id: 'identity', title: 'Identity' },
            { id: 'review', title: 'Review' },
          ],
        }}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    const validationSignal = await validating.promise;
    viewValidation.unmount();

    expect(validationSignal?.aborted).toBe(true);
    finishValidation?.();
  });
});
