"use client";

import { useState } from "react";

import {
  Alert,
  AlertDescription,
} from "@/registry/base-nova/protoform/components/alert";
import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";

import {
  type OneofForm,
  OneofFormSchema,
} from "../gen/protoform/examples/v1/oneof_form_pb.js";

export const client = "only";

export default function OneofFormExample() {
  const [submittedContact, setSubmittedContact] = useState<string>();

  return (
    <div className="space-y-6">
      <AutoForm<OneofForm>
        onFieldChange={() => setSubmittedContact(undefined)}
        onSubmit={(values) => {
          if (values.contact.case !== undefined) {
            setSubmittedContact(
              `${values.contact.case}: ${values.contact.value}`
            );
          }
        }}
        schema={OneofFormSchema}
        withSubmit
      />
      {submittedContact ? (
        <Alert role="status">
          <AlertDescription>Submitted {submittedContact}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
