import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import '@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations';

import { AutoFormExampleSchema } from '@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb';

import { createMockProvider } from './test-utils';
import { AutoForm } from '../index';

const SWITCH_TO_FORM_BUTTON = /switch to form/i;

const buildValidProtoDefaults = () => ({
  username: 'protoform_admin',
  primaryEmail: 'forms@protoform.com',
  homepageUrl: 'https://protoform.com',
  resourceId: '123e4567-e89b-12d3-a456-426614174000',
  bio: 'A protobuf-backed form with Buf reflection and Protovalidate.',
  age: 34,
  employeeNumber: '4001',
  storageQuotaBytes: '4096',
  accessTier: 3,
  shippingAddress: {
    lineOne: '500 Harbor Way',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 1,
  },
  tags: ['forms'],
  labels: [{ key: 'team', value: 'frontend' }],
  officeLocations: [
    {
      key: 'hq',
      value: {
        lineOne: '500 Harbor Way',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 1,
      },
    },
  ],
  preferredContact: {
    case: 'preferredEmail',
    value: 'forms@protoform.com',
  },
  createdAt: '2026-03-17T09:00',
  reminderInterval: '300s',
  writablePaths: ['profile'],
  avatarBytes: 'AQIDBA==',
  minimumThreshold: 5,
  maximumThreshold: 10,
});

describe('AutoForm – field rendering', () => {
  it('groups root fields into section rows and anchors the submit action on the right', () => {
    const schema = createMockProvider([{ key: 'name', type: 'string', required: true }]);

    render(<AutoForm schema={schema} withSubmit />);

    expect(screen.getByLabelText(/name/i).closest('[data-slot="auto-form-field-row"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Submit' }).parentElement).toHaveAttribute(
      'data-slot',
      'auto-form-actions'
    );
  });

  it('defaults bounded numeric fields to a slider plus number input', () => {
    const schema = createMockProvider([{ key: 'latitude', type: 'number', required: true }]);

    render(
      <AutoForm
        defaultValues={{ latitude: 12 }}
        fieldConfig={{
          latitude: {
            inputProps: {
              max: 90,
              min: -90,
            },
          },
        }}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /latitude/i })).toBeInTheDocument();
  });

  it('drops redundant fallback helper copy', () => {
    render(<AutoForm defaultValues={buildValidProtoDefaults()} schema={AutoFormExampleSchema} withSubmit />);

    expect(screen.queryByText(/this field is required\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/use 2-40 characters\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/use 0-0 characters\./i)).not.toBeInTheDocument();
  });

  it('allows object fields to render with the JSONField via fieldType override', () => {
    const schema = createMockProvider([
      {
        key: 'extraSettings',
        type: 'object',
        required: true,
        schema: [{ key: 'retries', type: 'number', required: true }],
      },
    ]);

    render(
      <AutoForm
        defaultValues={{
          extraSettings: {
            retries: 2,
          },
        }}
        fieldConfig={{
          extraSettings: {
            fieldType: 'json',
          },
        }}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByRole('button', { name: SWITCH_TO_FORM_BUTTON })).toBeInTheDocument();
  });

  it('exposes the selected state on compact radio cards', () => {
    const schema = createMockProvider(
      [
        {
          key: 'environment',
          options: [
            ['development', 'Development'],
            ['staging', 'Staging'],
            ['production', 'Production'],
          ],
          required: true,
          type: 'select',
        },
      ],
      { environment: 'production' }
    );

    render(<AutoForm schema={schema} />);

    const productionOption = screen.getByRole('radio', { name: 'Production' });
    expect(productionOption.tagName).toBe('BUTTON');
    expect(productionOption.closest('label')).toBeNull();
    expect(productionOption).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('radio', { name: 'Development' })).toHaveAttribute('data-selected', 'false');
    expect(productionOption?.parentElement?.className).toContain('sm:grid-cols-2');
  });
});
