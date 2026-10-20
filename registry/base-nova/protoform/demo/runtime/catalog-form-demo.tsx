'use client';

import type { DescMethod } from '@bufbuild/protobuf';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AutoForm } from '@/registry/base-nova/protoform/components/auto-form';
import { getDemoSchema } from './demo-schemas';
import { formatSubmittedValue } from './format-submitted-value';

export function CatalogFormDemo({
  description,
  method,
  schemaKey,
}: {
  description: string;
  method?: DescMethod;
  schemaKey: Parameters<typeof getDemoSchema>[0];
}) {
  const [submittedValue, setSubmittedValue] = useState<string>();
  const { defaultValues, schema: demoSchema } = getDemoSchema(schemaKey);
  const schema = method?.input ?? demoSchema;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="primary-inverted">React Hook Form</Badge>
        <Badge variant="outline">Live protobuf contract</Badge>
        {method ? <Badge variant="outline">{method.methodKind} RPC</Badge> : null}
      </div>
      {method ? (
        <fieldset
          aria-label="RPC method shape"
          className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2"
        >
          <div>
            <p className="font-medium text-foreground">{method.name}</p>
            <p className="text-muted-foreground">Generated method descriptor</p>
          </div>
          <dl className="grid gap-2">
            <div>
              <dt className="font-medium text-foreground">Input</dt>
              <dd className="break-all text-muted-foreground">{method.input.typeName}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Output</dt>
              <dd className="break-all text-muted-foreground">{method.output.typeName}</dd>
            </div>
          </dl>
        </fieldset>
      ) : null}
      <p className="text-muted-foreground text-sm">{description}</p>
      <AutoForm
        defaultValues={defaultValues}
        formOptions={{ mode: 'onBlur', reValidateMode: 'onChange' }}
        onFieldChange={() => setSubmittedValue(undefined)}
        onSubmit={(values) => setSubmittedValue(formatSubmittedValue(values))}
        schema={schema}
        withSubmit
      />
      {submittedValue ? (
        <Alert role="status" variant="success">
          <AlertTitle>Submitted protobuf value</AlertTitle>
          <AlertDescription>
            <pre className="max-h-80 max-w-full overflow-auto whitespace-pre-wrap text-xs">{submittedValue}</pre>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
