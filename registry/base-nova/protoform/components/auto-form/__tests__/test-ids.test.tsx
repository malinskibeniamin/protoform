import '@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AutoFormExampleSchema } from '@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb';

import { createMockProvider } from './test-utils';
import { AutoForm } from '../index';

if (!HTMLElement.prototype.hasPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
    value: () => false,
  });
}

if (!HTMLElement.prototype.setPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    value: () => undefined,
  });
}

if (!HTMLElement.prototype.releasePointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    value: () => undefined,
  });
}

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

describe('AutoForm – test IDs', () => {
  it('defaults the root test id prefix to autoform', () => {
    const schema = createMockProvider([{ key: 'username', type: 'string', required: true }]);

    render(<AutoForm schema={schema} withSubmit />);

    expect(screen.getByTestId('autoform')).toBeInTheDocument();
    expect(screen.getByTestId('autoform-field-username')).toBeInTheDocument();
    expect(screen.getByTestId('autoform-field-username-control')).toBeInTheDocument();
  });

  it('emits stable field, help, and option test ids for zod forms', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: 'username', type: 'string', required: true },
      {
        key: 'provider',
        type: 'select',
        required: true,
        options: [
          ['aws', 'Aws'],
          ['gcp', 'Gcp'],
          ['azure', 'Azure'],
        ],
      },
      {
        key: 'region',
        type: 'select',
        required: true,
        options: [
          ['us-east-1', 'Us East 1'],
          ['us-west-2', 'Us West 2'],
          ['eu-west-1', 'Eu West 1'],
        ],
      },
      {
        key: 'channels',
        type: 'array',
        required: false,
        schema: [
          {
            key: '0',
            type: 'select',
            required: true,
            options: [
              ['email', 'Email'],
              ['slack', 'Slack'],
              ['pagerduty', 'Pagerduty'],
            ],
          },
        ],
      },
    ]);

    render(
      <AutoForm
        defaultValues={{
          channels: ['email'],
          provider: 'aws',
          region: 'us-east-1',
          username: 'registry-user',
        }}
        fieldConfig={{
          provider: {
            customData: {
              ui: {
                help: 'Choose a provider.',
                optionGroups: [
                  {
                    label: 'Cloud',
                    options: [
                      { label: 'AWS', value: 'aws' },
                      { label: 'GCP', value: 'gcp' },
                      { label: 'Azure', value: 'azure' },
                    ],
                  },
                ],
              },
            },
            description: 'Used to scope cloud resources.',
          },
          region: {
            customData: {
              ui: {
                optionGroups: [
                  {
                    label: 'AWS',
                    options: [
                      { label: 'us-east-1', value: 'us-east-1' },
                      { label: 'us-west-2', value: 'us-west-2' },
                    ],
                  },
                ],
              },
            },
            fieldType: 'combobox',
          },
        }}
        schema={schema}
        testId="deploy-form"
        withSubmit
      />
    );

    expect(screen.getByTestId('deploy-form')).toBeInTheDocument();
    expect(screen.getByTestId('deploy-form-field-provider')).toBeInTheDocument();
    expect(screen.getByTestId('deploy-form-field-provider-help')).toBeInTheDocument();
    expect(screen.getByTestId('deploy-form-field-provider-description')).toBeInTheDocument();

    await user.click(screen.getByTestId('deploy-form-field-provider-control'));

    expect(await screen.findByTestId('deploy-form-field-provider-group-cloud')).toBeInTheDocument();
    expect(await screen.findByTestId('deploy-form-field-provider-option-aws')).toBeInTheDocument();

    await user.click(screen.getByTestId('deploy-form-field-region-control'));
    await user.clear(screen.getByTestId('deploy-form-field-region-control'));

    expect(await screen.findByTestId('deploy-form-field-region-group-aws')).toBeInTheDocument();
    expect(await screen.findByTestId('deploy-form-field-region-option-us-west-2')).toBeInTheDocument();

    await user.click(screen.getByTestId('deploy-form-field-channels-control'));
    await user.click(screen.getByTestId('deploy-form-field-channels-option-slack'));

    expect(screen.getByTestId('deploy-form-field-channels-selected-slack')).toBeInTheDocument();
  });

  it('emits stable ids for collections and modes', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: 'accountName', type: 'string', required: true },
      {
        key: 'tags',
        type: 'array',
        required: false,
        schema: [{ key: '0', type: 'string', required: true }],
      },
      {
        key: 'extraSettings',
        type: 'object',
        required: true,
        schema: [{ key: 'retries', type: 'number', required: true }],
      },
      { key: 'targetRegion', type: 'string', required: true },
    ]);

    render(
      <AutoForm
        defaultValues={{
          accountName: 'registry-ui',
          extraSettings: { retries: 2 },
          tags: ['primary'],
          targetRegion: 'us-west-2',
        }}
        fieldConfig={{
          extraSettings: {
            fieldType: 'json',
          },
        }}
        modes={['advanced', 'json']}
        schema={schema}
        showSummary
        testId="wizard-form"
        withSubmit
      />
    );

    expect(screen.getByTestId('wizard-form-summary')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-form-field-account-name-control')).toBeInTheDocument();

    await user.click(screen.getByTestId('wizard-form-field-tags-add'));

    expect(screen.getByTestId('wizard-form-field-tags-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-form-field-tags-remove-1')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-form-field-extra-settings-control')).toBeInTheDocument();

    await user.click(screen.getByTestId('wizard-form-tab-json'));

    expect(screen.getByTestId('wizard-form-panel-json')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-form-json-editor')).toBeInTheDocument();
  });

  it('emits the same path-based ids for protobuf descriptors', () => {
    render(
      <AutoForm
        defaultValues={buildValidProtoDefaults()}
        schema={AutoFormExampleSchema}
        testId="proto-form"
        withSubmit
      />
    );

    expect(screen.getByTestId('proto-form-field-username-control')).toBeInTheDocument();
    expect(screen.getByTestId('proto-form-field-primary-email-control')).toBeInTheDocument();
    expect(screen.getByTestId('proto-form-field-preferred-contact-control')).toBeInTheDocument();
  });
});
