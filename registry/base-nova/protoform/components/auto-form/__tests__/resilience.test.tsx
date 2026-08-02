import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createMockProvider } from './test-utils';
import { AutoForm } from '../index';
import type { SchemaProvider } from '../core-types';

const SUBMIT_BUTTON = /submit/i;
const USERNAME_LABEL = /username/i;

const usernameProvider = createMockProvider([{ key: 'username', type: 'string', required: true }]);

describe('AutoForm – onSubmit error handling', () => {
  it('shows root error when onSubmit throws', async () => {
    const user = userEvent.setup();

    render(
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
      expect(screen.getByText(/api failed/i)).toBeInTheDocument();
    });
  });

  it('shows root error when onSubmit rejects', async () => {
    const user = userEvent.setup();

    render(
      <AutoForm onSubmit={() => Promise.reject(new Error('Network error'))} schema={usernameProvider} withSubmit />
    );

    await user.type(screen.getByLabelText(USERNAME_LABEL), 'bob');
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('aborts the previous submit context before a newer attempt', async () => {
    const user = userEvent.setup();
    const signals: AbortSignal[] = [];
    const onSubmit = vi.fn(async (_values, _form, context) => {
      signals.push(context.signal);
      await Promise.resolve();
    });

    render(<AutoForm onSubmit={onSubmit} schema={usernameProvider} withSubmit />);
    await user.type(screen.getByLabelText(USERNAME_LABEL), 'alice');
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));

    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
  });

  it('aborts active submission when the form unmounts', async () => {
    const user = userEvent.setup();
    let signal: AbortSignal | undefined;
    let finish: (() => void) | undefined;
    const onSubmit = vi.fn(
      (_values, _form, context) =>
        new Promise<void>((resolve) => {
          signal = context.signal;
          finish = resolve;
        })
    );
    const view = render(<AutoForm onSubmit={onSubmit} schema={usernameProvider} withSubmit />);

    await user.type(screen.getByLabelText(USERNAME_LABEL), 'alice');
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    view.unmount();

    expect(signal?.aborted).toBe(true);
    finish?.();
  });

  it('aborts active provider validation when the form unmounts', async () => {
    const user = userEvent.setup();
    let validationSignal: AbortSignal | undefined;
    let finishValidation: (() => void) | undefined;
    const provider: SchemaProvider = {
      getDefaultValues: () => ({ username: 'alice' }),
      parseSchema: () => ({ fields: [{ key: 'username', type: 'string', required: true }] }),
      validateSchema: (_values, context) =>
        new Promise((resolve) => {
          validationSignal = context?.signal;
          finishValidation = () => resolve({ data: { username: 'alice' }, success: true });
        }),
    };
    const view = render(
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
    await waitFor(() => expect(validationSignal).toBeDefined());
    view.unmount();

    expect(validationSignal?.aborted).toBe(true);
    finishValidation?.();
  });
});
