"use client";

import { useState } from "react";

import {
  Alert,
  AlertDescription,
} from "@/registry/base-nova/protoform/components/alert";
import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";

import {
  type CelRe2Form,
  CelRe2FormSchema,
} from "../gen/protoform/examples/v1/cel_re2_pb.js";

export const client = "only";

export default function CelRe2FormExample() {
  const [acceptedProjectId, setAcceptedProjectId] = useState<string>();

  return (
    <div className="space-y-6">
      <AutoForm<CelRe2Form>
        onFieldChange={() => setAcceptedProjectId(undefined)}
        onSubmit={(values) => setAcceptedProjectId(values.projectId)}
        schema={CelRe2FormSchema}
        withSubmit
      />
      {acceptedProjectId ? (
        <Alert role="status">
          <AlertDescription>Accepted: {acceptedProjectId}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
