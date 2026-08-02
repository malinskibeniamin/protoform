'use client';

import { toJsonString } from '@bufbuild/protobuf';
import { useState } from 'react';

import { AutoForm } from '@/registry/base-nova/protoform/components/auto-form';
import '@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations';

import { type AutoFormExample, AutoFormExampleSchema } from '@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb';

const defaultValues = {
  username: 'protoform_admin',
  primaryEmail: 'forms@protoform.com',
  homepageUrl: 'https://protoform.com',
  resourceId: '123e4567-e89b-12d3-a456-426614174000',
  bio: 'A protobuf-backed form with Buf reflection and Protovalidate.',
  isEnabled: true,
  age: 34,
  loginCount: 12,
  reputationDelta: 4,
  employeeNumber: '4001',
  storageQuotaBytes: '4096',
  profileScore: 0.92,
  accountBalance: 2500.5,
  accessTier: 3,
  shippingAddress: {
    lineOne: '500 Harbor Way',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 1,
  },
  nickname: 'Harbor',
  middleName: 'UI',
  bonusPoints: 42,
  betaTester: true,
  tags: ['forms', 'protobuf'],
  previousAddresses: [
    {
      lineOne: '250 Redwood Ave',
      city: 'Oakland',
      state: 'CA',
      postalCode: '94607',
      country: 1,
    },
  ],
  luckyNumbers: [7, 13],
  labels: [
    { key: 'team', value: 'frontend' },
    { key: 'env', value: 'demo' },
  ],
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
  expiresAt: '2026-04-17T09:00',
  reminderInterval: '300s',
  writablePaths: ['profile', 'preferences'],
  preferences: {
    theme: 'dark',
    density: 'comfortable',
  },
  featuredValue: 'feature-rollout',
  dashboardBlocks: ['overview', 'alerts'],
  minimumThreshold: 5,
  maximumThreshold: 10,
  settings: {
    enableSupportMode: true,
    escalationLevel: 2,
    notificationChannels: [1, 3],
    nestedSettings: [
      {
        key: 'default',
        value: {
          label: 'Primary runbook',
          scheduledFor: '2026-03-18T10:00',
        },
      },
    ],
  },
};

export function AutoFormProtobufComplexDemo() {
  const [submittedValue, setSubmittedValue] = useState<string>();

  return (
    <div className="space-y-4">
      <AutoForm<AutoFormExample>
        defaultMode="simple"
        defaultValues={defaultValues}
        fieldConfig={{
          accountBalance: {
            description: 'Currency-style formatting uses InputGroup affordances instead of a raw number input.',
          },
          reminderInterval: {
            description: 'Protovalidate uses protobuf duration JSON syntax like 300s or 1.5s.',
          },
          writablePaths: {
            description: 'Field masks render as a guided paths editor.',
          },
          'settings.nestedSettings': {
            description: 'Compact key/value rows keep nested support settings easier to scan.',
          },
        }}
        formOptions={{ mode: 'all' }}
        modes={['simple', 'advanced', 'json']}
        onSubmit={(values) => {
          setSubmittedValue(toJsonString(AutoFormExampleSchema, values, { prettySpaces: 2 }));
        }}
        schema={AutoFormExampleSchema}
        showSummary
        withSubmit
      />

      {submittedValue ? (
        <pre className="overflow-auto rounded-md border bg-muted p-4 text-xs">{submittedValue}</pre>
      ) : null}
    </div>
  );
}
