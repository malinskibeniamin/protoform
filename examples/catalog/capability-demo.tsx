"use client";

import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base-nova/protoform/components/alert";
import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";
import { Badge } from "@/registry/base-nova/protoform/components/badge";

import { getDemo } from "./demo-catalog.js";
import { getDemoSchema } from "./demo-schemas.js";

const engineLabels = {
  "final-form": "Final Form",
  formik: "Formik",
  "react-hook-form": "React Hook Form",
  "tanstack-form": "TanStack Form",
} as const;

const SENSITIVE_PREVIEW_KEY = /password|secret|apiKey|privateKey|credential|inputToken/iu;

function formatSubmittedValue(value: Record<string, unknown>): string {
  return JSON.stringify(
    value,
    (key, nestedValue: unknown) => {
      if (SENSITIVE_PREVIEW_KEY.test(key)) {
        return "[redacted]";
      }
      if (typeof nestedValue === "bigint") {
        return nestedValue.toString();
      }
      if (nestedValue instanceof Uint8Array) {
        return Array.from(nestedValue);
      }
      return nestedValue;
    },
    2
  );
}

export function CapabilityDemo({ demoId }: { demoId: string }) {
  const demo = getDemo(demoId);
  const [submittedValue, setSubmittedValue] = useState<string>();

  if (!demo) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Demo unavailable</AlertTitle>
        <AlertDescription>This demo is unavailable.</AlertDescription>
      </Alert>
    );
  }

  const { defaultValues, schema } = getDemoSchema(demo.schemaKey);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="primary-inverted">{engineLabels[demo.engine]}</Badge>
        <Badge variant="outline">Live protobuf contract</Badge>
      </div>
      <p className="text-muted-foreground text-sm">{demo.tryIt}</p>
      <AutoForm
        defaultValues={defaultValues}
        formOptions={{ mode: "onBlur", reValidateMode: "onChange" }}
        onFieldChange={() => setSubmittedValue(undefined)}
        onSubmit={(values) => setSubmittedValue(formatSubmittedValue(values))}
        schema={schema}
        testId={`demo-${demo.slug}`}
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
