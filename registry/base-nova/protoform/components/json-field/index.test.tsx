import { afterEach, describe, expect, rs } from '@rstest/core';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Toaster, toast } from '@/components/ui/toast';

import { JSONField } from '.';

afterEach(() => {
  act(() => toast.close());
});

describe('JSONField accessibility', () => {
  test('labels the fallback editor for deeply nested JSON and opens an unconstrained array in JSON mode', async () => {
    render(
      <JSONField
        maxDepth={1}
        onChange={rs.fn()}
        schema={{
          properties: {
            audit: {
              properties: { retentionDays: { type: 'number' } },
              type: 'object',
            },
          },
          type: 'object',
        }}
        value={{ audit: { retentionDays: 30 } }}
      />
    );

    expect(screen.getByRole('textbox', { name: 'Audit JSON' })).toBeVisible();

    cleanup();
    render(<JSONField onChange={rs.fn()} schema={{ type: 'array' }} value={['overview', 3, true]} />);

    expect(await screen.findByRole('textbox', { name: 'JSON value' })).toHaveValue('[\n  "overview",\n  3,\n  true\n]');
  });

  test('shows rejected custom option creation instead of losing the error', async () => {
    const user = userEvent.setup();
    const createOption = rs
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('Creation failed'))
      .mockResolvedValue(undefined);
    render(
      <JSONField
        customFields={[{ fieldName: 'region', options: [], onCreateOption: createOption }]}
        onChange={rs.fn()}
        schema={{ type: 'object', properties: { region: { type: 'string' } } }}
        value={{ region: '' }}
      />
    );
    await user.type(screen.getByRole('combobox'), 'new');
    await user.click(await screen.findByRole('option', { name: /create.*new/iu }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Creation failed');
    await user.clear(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 'next');
    await user.click(await screen.findByRole('option', { name: /create.*next/iu }));
    expect(createOption).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  test('shows a success toast after copying JSON', async () => {
    const user = userEvent.setup();

    render(
      <Toaster>
        <JSONField onChange={rs.fn()} schema={{ type: 'object' }} value={{ region: 'us-east1' }} />
      </Toaster>
    );

    await user.click(screen.getByRole('button', { name: 'Copy JSON' }));

    expect(await screen.findByText('JSON copied')).toBeVisible();
  });
});
