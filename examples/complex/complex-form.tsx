"use client";

import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/registry/base-nova/protoform/components/alert";
import { AutoForm, type AutoFormStep } from "@/registry/base-nova/protoform/components/auto-form";
import { applyServerFieldErrors } from "../apply-server-errors.js";
import { createFormExamplesTransport } from "../browser-transport.js";
import {
  ApiKeyCredentialsSchema,
  CloudProvider,
  FormExamplesService,
  type SubmitComplexFormRequest,
  SubmitComplexFormRequestSchema,
} from "../gen/protoform/examples/v1/forms_pb.js";
import { ComplexReviewSummary } from "./complex-review-summary.js";

export const client = "only";

const steps: AutoFormStep[] = [
  {
    description: "Identify the environment and its owner.",
    id: "project",
    title: "Project",
  },
  {
    description: "Choose where and how the environment runs.",
    id: "runtime",
    title: "Runtime",
  },
  {
    description: "Select one authentication method.",
    id: "access",
    title: "Access",
  },
  {
    description: "Add approval context and submit the request.",
    id: "review",
    title: "Review",
  },
];

export default function ComplexFormExample({
  baseUrl,
  initialProjectId = "launch-demo",
}: {
  baseUrl?: string;
  initialProjectId?: string;
}) {
  const [result, setResult] = React.useState<{
    environmentId: string;
    status: string;
  }>();
  const rpcClient = createClient(FormExamplesService, createFormExamplesTransport(baseUrl));
  const defaultValues = create(SubmitComplexFormRequestSchema, {
    approvalTicket: "OPS-142",
    credentials: {
      case: "apiKey",
      value: create(ApiKeyCredentialsSchema, { apiKey: "example-api-key" }),
    },
    dryRun: true,
    ownerEmail: "owner@example.com",
    projectId: initialProjectId,
    provider: CloudProvider.GCP,
    region: "eu-west1",
    replicas: 3,
  });

  async function handleSubmit(
    values: SubmitComplexFormRequest,
    form: UseFormReturn<Record<string, unknown>, unknown, SubmitComplexFormRequest>
  ) {
    setResult(undefined);
    try {
      const response = await rpcClient.submitComplexForm(values);
      setResult({
        environmentId: response.environmentId,
        status: response.status,
      });
    } catch (error) {
      if (!applyServerFieldErrors(error, SubmitComplexFormRequestSchema, form)) {
        throw error;
      }
    }
  }

  return (
    <div className="space-y-6">
      <AutoForm<SubmitComplexFormRequest>
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        renderSummary={(payload) => <ComplexReviewSummary payload={payload} />}
        schema={SubmitComplexFormRequestSchema}
        showSummary
        stepper={{ steps }}
        withSubmit
      />
      {result ? (
        <Alert role="status">
          <AlertTitle>Environment request accepted</AlertTitle>
          <AlertDescription>
            {result.environmentId} · {result.status}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
