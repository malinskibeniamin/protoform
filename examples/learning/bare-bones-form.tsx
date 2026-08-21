"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/registry/base-nova/protoform/components/alert";
import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";

import { type BareBonesForm, BareBonesFormSchema } from "../gen/protoform/examples/v1/bare_bones_pb.js";

export function BareBonesFormExample() {
  const [submittedName, setSubmittedName] = useState<string>();

  return (
    <div className="space-y-6">
      <AutoForm<BareBonesForm>
        onSubmit={(values) => setSubmittedName(values.name)}
        schema={BareBonesFormSchema}
        withSubmit
      />
      {submittedName ? (
        <Alert role="status">
          <AlertDescription>Submitted: {submittedName}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
