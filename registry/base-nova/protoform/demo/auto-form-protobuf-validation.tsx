"use client";

import { useState } from "react";

import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";
import "@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations";

import { AutoFormExampleSchema } from "@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb";

const defaultValues = {
  age: 11,
  createdAt: "",
  employeeNumber: "0",
  homepageUrl: "not-a-url",
  labels: [],
  maximumThreshold: 4,
  minimumThreshold: 12,
  preferredContact: {
    case: undefined,
    value: undefined,
  },
  primaryEmail: "oops",
  resourceId: "bad-id",
  shippingAddress: {
    city: "",
    country: 0,
    lineOne: "1",
    postalCode: "12",
    state: "",
  },
  storageQuotaBytes: "12",
  tags: [],
  username: "rp",
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
        formOptions={{ mode: "all", reValidateMode: "onChange" }}
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
