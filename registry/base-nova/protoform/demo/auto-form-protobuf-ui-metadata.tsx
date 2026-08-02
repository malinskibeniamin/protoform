'use client';

import { toJsonString } from '@bufbuild/protobuf';
import { useState } from 'react';

import { AutoForm } from '@/registry/base-nova/protoform/components/auto-form';
import '@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations';

import {
  type AutoFormUiMetadataExample,
  AutoFormUiMetadataExampleSchema,
} from '@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb';

const defaultValues = {
  clusterName: 'scarlet-forest-dolphin',
  provider: 1,
  region: 'us-east-2',
  enableSupportMode: false,
  supportTier: 0,
  approvalTicket: 'OPS-142',
  enableDryRun: true,
};

export function AutoFormProtobufUiMetadataDemo() {
  const [submittedValue, setSubmittedValue] = useState<string>();

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Try toggling support mode on, then move into the support step. The step itself is driven by{' '}
        <code>message_ui</code>, the contact oneof waits on a support tier, and the next button stays blocked until the
        CEL completion rule passes.
      </p>

      <AutoForm<AutoFormUiMetadataExample>
        defaultValues={defaultValues}
        formOptions={{ mode: 'all' }}
        modes={['advanced', 'json']}
        onSubmit={(values) => {
          setSubmittedValue(toJsonString(AutoFormUiMetadataExampleSchema, values, { prettySpaces: 2 }));
        }}
        schema={AutoFormUiMetadataExampleSchema}
        showSummary
        testId="proto-ui-metadata-form"
        withSubmit
      />

      {submittedValue ? (
        <pre className="overflow-auto rounded-md border bg-muted p-4 text-xs">{submittedValue}</pre>
      ) : null}
    </div>
  );
}
