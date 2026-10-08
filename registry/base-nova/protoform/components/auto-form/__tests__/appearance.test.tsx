import { describe, expect, rs } from '@rstest/core';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutoForm } from '..';
import { createMockProvider } from './test-utils';

const profile = createMockProvider(
  [
    { fieldConfig: { label: 'Name' }, key: 'name', required: true, type: 'string' },
    {
      fieldConfig: { label: 'Address' },
      key: 'address',
      required: false,
      schema: [{ fieldConfig: { label: 'City' }, key: 'city', required: false, type: 'string' }],
      type: 'object',
    },
    {
      fieldConfig: { label: 'Contacts' },
      key: 'contacts',
      required: false,
      schema: [
        {
          key: 'contact',
          required: false,
          schema: [{ fieldConfig: { label: 'Email' }, key: 'email', required: false, type: 'string' }],
          type: 'object',
        },
      ],
      type: 'array',
    },
  ],
  { contacts: [{ email: 'a@example.com' }, { email: 'b@example.com' }] }
);

function nameFieldRoot() {
  return screen.getByRole('textbox', { name: /Name/u }).closest('[data-layout]');
}

describe('AutoForm appearance', () => {
  test('keeps the split layout, divided sections, and card array items by default', () => {
    const { container } = render(<AutoForm schema={profile} />);

    expect(nameFieldRoot()).toHaveAttribute('data-layout', 'split');
    expect(container.querySelector('[data-slot="section-body"]')).not.toHaveClass('border-l-2');
    expect(container.querySelectorAll('[data-slot="array-item"]')[0]).toHaveClass('rounded-xl');
  });

  test('stacks fields, indents section bodies, and separates array items on request', () => {
    const { container } = render(
      <AutoForm appearance={{ arrayItems: 'separated', layout: 'stacked', sections: 'indented' }} schema={profile} />
    );

    expect(nameFieldRoot()).toHaveAttribute('data-layout', 'stacked');
    expect(container.querySelector('[data-slot="section-body"]')).toHaveClass('border-l-2');
    const items = container.querySelectorAll('[data-slot="array-item"]');
    expect(items).toHaveLength(2);
    expect(items[0]).not.toHaveClass('rounded-xl');
    expect(items[0]).not.toHaveClass('border-t');
    expect(items[1]).toHaveClass('border-t');
  });
});

function singleVariant(required: boolean, customData: Record<string, unknown> = {}) {
  return createMockProvider(
    [
      {
        fieldConfig: { customData, label: 'Delivery' },
        key: 'delivery',
        required,
        schema: [
          {
            fieldConfig: { label: 'Webhook' },
            key: 'webhook',
            required: false,
            schema: [{ fieldConfig: { label: 'Endpoint' }, key: 'endpoint', required: false, type: 'string' }],
            type: 'object',
          },
        ],
        type: 'oneof',
      },
    ],
    { delivery: { case: undefined, value: undefined } }
  );
}

describe('single-variant oneofs', () => {
  test('a required oneof with one variant selects it and renders its fields without a picker', async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    render(<AutoForm onSubmit={onSubmit} schema={singleVariant(true)} withSubmit />);

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Delivery' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Webhook' })).toBeNull();
    await user.click(screen.getByRole('textbox', { name: /Endpoint/u }));
    await user.paste('https://hooks.example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      delivery: { case: 'webhook', value: { endpoint: 'https://hooks.example.com' } },
    });
  });

  test('selecting the sole required variant leaves the form clean', async () => {
    const onDirtyChange = rs.fn();
    render(<AutoForm onDirtyChange={onDirtyChange} schema={singleVariant(true)} />);

    expect(await screen.findByRole('textbox', { name: /Endpoint/u })).toBeVisible();
    expect(onDirtyChange.mock.calls.map(([dirty]) => dirty)).toEqual([false]);
  });

  test('a disabled required oneof with one variant is not selected for the user', async () => {
    const onDirtyChange = rs.fn();
    render(<AutoForm onDirtyChange={onDirtyChange} schema={singleVariant(true, { immutable: true })} />);

    await waitFor(() => expect(onDirtyChange).toHaveBeenCalled());
    expect(screen.getByRole('heading', { name: 'Delivery' })).toBeVisible();
    expect(screen.queryByRole('textbox', { name: /Endpoint/u })).toBeNull();
  });

  test('an optional oneof with one variant toggles it with a switch', async () => {
    const user = userEvent.setup();
    render(<AutoForm schema={singleVariant(false)} />);

    expect(screen.queryByRole('combobox')).toBeNull();
    const toggle = screen.getByRole('switch', { name: 'Delivery' });
    expect(screen.queryByRole('textbox', { name: /Endpoint/u })).toBeNull();
    await user.click(toggle);
    expect(screen.getByRole('textbox', { name: /Endpoint/u })).toBeVisible();
    await user.click(toggle);
    expect(screen.queryByRole('textbox', { name: /Endpoint/u })).toBeNull();
  });

  test('a oneof with several variants keeps the picker and does not repeat the variant heading', () => {
    const schema = createMockProvider(
      [
        {
          fieldConfig: { label: 'Delivery' },
          key: 'delivery',
          required: false,
          schema: [
            {
              fieldConfig: { label: 'Webhook' },
              key: 'webhook',
              required: false,
              schema: [{ fieldConfig: { label: 'Endpoint' }, key: 'endpoint', required: false, type: 'string' }],
              type: 'object',
            },
            {
              fieldConfig: { label: 'Queue' },
              key: 'queue',
              required: false,
              schema: [{ fieldConfig: { label: 'Topic' }, key: 'topic', required: false, type: 'string' }],
              type: 'object',
            },
          ],
          type: 'oneof',
        },
      ],
      { delivery: { case: 'webhook', value: { endpoint: '' } } }
    );
    render(<AutoForm schema={schema} />);

    const picker = screen.getByRole('combobox', { name: 'Delivery' });
    expect(within(picker).getByText('Webhook')).toBeVisible();
    expect(screen.getByRole('textbox', { name: /Endpoint/u })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Webhook' })).toBeNull();
  });
});
