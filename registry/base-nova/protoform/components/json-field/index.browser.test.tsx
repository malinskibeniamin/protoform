import { page } from '@rstest/browser';
import { afterEach, describe, expect, rs, test } from '@rstest/core';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Toaster, toast } from '@/components/ui/toast';

import { JSONField, type JSONValue } from '.';

afterEach(() => {
  act(() => toast.close());
  cleanup();
});

function JsonForm({ onSubmit }: { onSubmit: (value: JSONValue) => void }) {
  const [value, setValue] = useState<JSONValue>({ theme: 'dark' });
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <JSONField onChange={setValue} schema={{ type: 'object' }} showPlaceholder={false} value={value} />
      <Button type="submit">Save</Button>
    </form>
  );
}

test('submits the current JSON edit without waiting for a debounce', async () => {
  const user = userEvent.setup();
  const onSubmit = rs.fn();
  render(<JsonForm onSubmit={onSubmit} />);
  const editor = await screen.findByRole('textbox', { name: 'JSON value' });
  const browserEditor = page.getByRole('textbox', { name: 'JSON value' });
  await browserEditor.fill('{"theme":"light"}');
  expect(editor).toHaveTextContent('{"theme":"light"}');
  expect(editor).not.toHaveAttribute('aria-invalid', 'true');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSubmit).toHaveBeenCalledWith({ theme: 'light' });
});

test('blocks malformed drafts, describes the error, and recovers after correction', async () => {
  const user = userEvent.setup();
  const onSubmit = rs.fn();
  render(<JsonForm onSubmit={onSubmit} />);
  const editor = await screen.findByRole('textbox', { name: 'JSON value' });
  const browserEditor = page.getByRole('textbox', { name: 'JSON value' });
  await browserEditor.fill('{"theme":');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSubmit).not.toHaveBeenCalled();
  expect(editor).toHaveTextContent('{"theme":');
  expect(editor).toHaveAttribute('aria-invalid', 'true');
  expect(editor).toHaveAccessibleDescription(/Invalid JSON/u);
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid JSON');
  await browserEditor.fill('{"theme":"recovered"}');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSubmit).toHaveBeenCalledWith({ theme: 'recovered' });
  expect(editor).not.toHaveAttribute('aria-invalid', 'true');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('external resets replace malformed drafts with the last valid JSON value', async () => {
  const onChange = rs.fn();
  const props = { onChange, schema: { type: 'object' as const }, showPlaceholder: false };
  const { rerender } = render(<JSONField {...props} value={{ theme: 'dark' }} />);
  const editor = await screen.findByRole('textbox', { name: 'JSON value' });
  const browserEditor = page.getByRole('textbox', { name: 'JSON value' });
  await browserEditor.fill('{"theme":');
  expect(editor).toHaveAttribute('aria-invalid', 'true');
  rerender(<JSONField {...props} value={{ theme: 'dark' }} />);
  await expect.element(browserEditor).toHaveText(/\{\s*"theme":\s*"dark"\s*\}/u);
  expect(editor).not.toHaveAttribute('aria-invalid', 'true');
  expect(onChange).not.toHaveBeenCalled();
});

test('cannot discard a malformed nested draft by switching to JSON mode', async () => {
  const user = userEvent.setup();
  render(
    <JSONField
      maxDepth={1}
      onChange={rs.fn()}
      schema={{ type: 'object', properties: { audit: { type: 'object' } } }}
      value={{ audit: { days: 30 } }}
    />
  );
  await screen.findByRole('textbox', { name: 'Audit JSON' });
  const browserEditor = page.getByRole('textbox', { name: 'Audit JSON' });
  await browserEditor.fill('{"days":');
  await user.click(screen.getByRole('button', { name: 'Switch to JSON' }));
  expect(screen.getByRole('textbox', { name: 'Audit JSON' })).toHaveTextContent('{"days":');
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid JSON');
});

describe('JSONField accessibility', () => {
  test('names structured controls by property path, including array entries', () => {
    render(
      <JSONField
        onChange={rs.fn()}
        schema={{
          type: 'object',
          properties: {
            typeUrl: { type: 'string' },
            valueBase64: { type: 'string' },
            enabled: { type: 'boolean' },
            entries: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' } } } },
          },
        }}
        value={{ typeUrl: 'type.example.com/Record', valueBase64: '', enabled: false, entries: [{ name: 'First' }] }}
      />
    );
    expect(screen.getByRole('textbox', { name: 'typeUrl' })).toHaveValue('type.example.com/Record');
    expect(screen.getByRole('textbox', { name: 'valueBase64' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'enabled' })).not.toBeChecked();
    expect(screen.getByRole('textbox', { name: 'entries.0.name' })).toHaveValue('First');
  });

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

    expect(await screen.findByRole('textbox', { name: 'Audit JSON' })).toBeVisible();

    cleanup();
    render(<JSONField onChange={rs.fn()} schema={{ type: 'array' }} value={['overview', 3, true]} />);

    expect(await screen.findByRole('textbox', { name: 'JSON value' })).toHaveTextContent(/"overview",\s*3,\s*true/u);
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
