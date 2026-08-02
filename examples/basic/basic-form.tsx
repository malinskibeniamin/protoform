"use client";

import { TransportProvider, useMutation } from "@connectrpc/connect-query";
import { createConnectTransport } from "@connectrpc/connect-web";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import type { UseFormReturn } from "react-hook-form";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base-nova/protoform/components/alert";
import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";
import { applyServerFieldErrors } from "../apply-server-errors.js";
import {
  FormExamplesService,
  type SubmitBasicFormRequest,
  SubmitBasicFormRequestSchema,
} from "../gen/protoform/examples/v1/forms_pb.js";

export const client = "only";

export default function ServerErrorFormExample({
  baseUrl = "http://127.0.0.1:55012",
}: {
  baseUrl?: string;
}) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [transport] = React.useState(() => createConnectTransport({ baseUrl }));

  return (
    <TransportProvider transport={transport}>
      <QueryClientProvider client={queryClient}>
        <ServerErrorFormMutation />
      </QueryClientProvider>
    </TransportProvider>
  );
}

function ServerErrorFormMutation() {
  const [profileId, setProfileId] = React.useState<string>();
  const mutation = useMutation(FormExamplesService.method.submitBasicForm);

  async function handleSubmit(
    values: SubmitBasicFormRequest,
    form: UseFormReturn<
      Record<string, unknown>,
      unknown,
      SubmitBasicFormRequest
    >
  ) {
    setProfileId(undefined);
    try {
      const response = await mutation.mutateAsync(values);
      setProfileId(response.profileId);
    } catch (error) {
      if (!applyServerFieldErrors(error, SubmitBasicFormRequestSchema, form)) {
        throw error;
      }
    }
  }

  return (
    <div aria-busy={mutation.isPending} className="space-y-6">
      <AutoForm<SubmitBasicFormRequest>
        onSubmit={handleSubmit}
        schema={SubmitBasicFormRequestSchema}
        withSubmit
      />
      {profileId ? (
        <Alert role="status">
          <AlertTitle>Profile created</AlertTitle>
          <AlertDescription>{profileId}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
