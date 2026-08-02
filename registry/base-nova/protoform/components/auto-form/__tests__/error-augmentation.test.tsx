import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createMockProvider } from './test-utils';
import { AutoForm } from '../index';

describe('AutoForm – regex error augmentation', () => {
  it('appends example to regex validation errors when field has example configured', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([{ key: 'resourceId', type: 'string', required: true }], {}, (values) => {
      const v = (values as Record<string, unknown>).resourceId as string;
      if (!/^[a-f0-9-]{36}$/.test(v ?? '')) {
        return {
          success: false,
          errors: [{ path: ['resourceId'], message: 'Must match regex pattern `^[a-f0-9-]{36}$`' }],
        };
      }
      return { success: true, data: values };
    });

    render(
      <AutoForm
        defaultValues={{ resourceId: 'bad' }}
        fieldConfig={{
          resourceId: {
            customData: { example: '123e4567-e89b-12d3-a456-426614174000' },
          },
        }}
        formOptions={{ mode: 'all' }}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      const errorEl = screen.getByText(/example: 123e4567/i);
      expect(errorEl).toBeInTheDocument();
    });
  });

  it('passes non-regex errors through unchanged', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([{ key: 'name', type: 'string', required: true }], {}, (values) => {
      const v = (values as Record<string, unknown>).name as string;
      if ((v ?? '').length < 5) {
        return {
          success: false,
          errors: [{ path: ['name'], message: 'Must be at least 5 characters' }],
        };
      }
      return { success: true, data: values };
    });

    render(
      <AutoForm
        defaultValues={{ name: 'ab' }}
        fieldConfig={{
          name: {
            customData: { example: 'protoform' },
          },
        }}
        formOptions={{ mode: 'all' }}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/must be at least 5 characters/i)).toBeInTheDocument();
    });

    // The example should NOT be appended to non-regex errors
    expect(screen.queryByText(/example: protoform/i)).not.toBeInTheDocument();
  });

  it('passes regex errors through unchanged when no example is configured', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([{ key: 'code', type: 'string', required: true }], {}, (values) => {
      const v = (values as Record<string, unknown>).code as string;
      if (!/^[A-Z]{3}$/.test(v ?? '')) {
        return {
          success: false,
          errors: [{ path: ['code'], message: 'Must match regex pattern `^[A-Z]{3}$`' }],
        };
      }
      return { success: true, data: values };
    });

    render(<AutoForm defaultValues={{ code: 'bad' }} formOptions={{ mode: 'all' }} schema={schema} withSubmit />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/must match regex pattern/i)).toBeInTheDocument();
    });

    // No example text should appear since none was configured
    expect(screen.queryByText(/example:/i)).not.toBeInTheDocument();
  });
});
