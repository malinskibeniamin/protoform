'use client';

import { useState } from 'react';
import { AutoForm } from '@/registry/base-nova/protoform/components/auto-form';
import type { SchemaProvider } from '@/registry/base-nova/protoform/components/auto-form/core-types';

const schema: SchemaProvider = {
  getDefaultValues: () => ({
    email: 'hello@protoform.dev',
    newsletter: true,
    notes: 'Start simple: schema in, shadcn form out.',
  }),
  parseSchema: () => ({
    fields: [
      { key: 'email', type: 'string', required: true, fieldConfig: { fieldType: 'email', label: 'Work email' } },
      { key: 'newsletter', type: 'boolean', required: false, fieldConfig: { fieldType: 'switch', label: 'Subscribe' } },
      {
        key: 'notes',
        type: 'string',
        required: false,
        fieldConfig: {
          description: 'AutoForm renders native shadcn-style controls while you keep the source code.',
          fieldType: 'textarea',
          label: 'Notes',
        },
      },
    ],
  }),
  validateSchema: (values) => ({ data: values, success: true }),
};

export function AutoFormBasicDemo() {
  const [submittedValue, setSubmittedValue] = useState<string>();

  return (
    <div className="space-y-4">
      <AutoForm
        onSubmit={(values) => {
          setSubmittedValue(JSON.stringify(values, null, 2));
        }}
        schema={schema}
        testId="basic-auto-form"
        withSubmit
      />
      {submittedValue ? <pre className="overflow-auto rounded-md border bg-muted p-4 text-xs">{submittedValue}</pre> : null}
    </div>
  );
}
