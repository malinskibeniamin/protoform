'use client';

import { useState } from 'react';

import { AutoForm } from '@/registry/base-nova/protoform/components/auto-form';
import '@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations';

import { AutoFormExampleSchema } from '@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb';

const defaultValues = {
  username: 'rp',
  primaryEmail: 'oops',
  homepageUrl: 'not-a-url',
  resourceId: 'bad-id',
  age: 11,
  employeeNumber: '0',
  storageQuotaBytes: '12',
  shippingAddress: {
    lineOne: '1',
    city: '',
    state: '',
    postalCode: '12',
    country: 0,
  },
  tags: [],
  labels: [],
  preferredContact: {
    case: undefined,
    value: undefined,
  },
  createdAt: '',
  minimumThreshold: 12,
  maximumThreshold: 4,
};

export function AutoFormProtobufValidationDemo() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        This demo starts intentionally broken so you can see field-level errors, required oneof feedback, and the
        message-level threshold rule in action.
      </p>
      <AutoForm
        defaultValues={defaultValues}
        formOptions={{ mode: 'all', reValidateMode: 'onChange' }}
        onSubmit={() => {
          setSubmitted(true);
        }}
        schema={AutoFormExampleSchema}
        withSubmit
      />
      {submitted ? (
        <p className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          Nice — everything validated and the protobuf form submitted.
        </p>
      ) : null}
    </div>
  );
}
