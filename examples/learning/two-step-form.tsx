"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/registry/base-nova/protoform/components/alert";
import { AutoForm, type AutoFormStep } from "@/registry/base-nova/protoform/components/auto-form";

import { type TwoStepForm, TwoStepFormSchema } from "../gen/protoform/examples/v1/two_step_pb.js";

export const client = "only";

const steps: AutoFormStep[] = [
  { id: "name", title: "Name" },
  { id: "contact", title: "Contact" },
];

export default function TwoStepFormExample() {
  const [submitted, setSubmitted] = useState<string>();

  return (
    <div className="space-y-6">
      <AutoForm<TwoStepForm>
        onFieldChange={() => setSubmitted(undefined)}
        onSubmit={(values) => setSubmitted(`${values.name}, ${values.email}`)}
        schema={TwoStepFormSchema}
        stepper={{ orientation: "vertical", steps }}
        withSubmit
      />
      {submitted ? (
        <Alert role="status">
          <AlertDescription>Submitted: {submitted}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
