"use client";

import { useMutation } from "@connectrpc/connect-query";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/registry/base-nova/protoform/components/alert";
import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";
import { applyServerFieldErrors } from "../apply-server-errors.js";
import {
  FormExamplesService,
  type SubmitBasicFormRequest,
  SubmitBasicFormRequestSchema,
} from "../gen/protoform/examples/v1/forms_pb.js";

export function ServerErrorFormMutation() {
  const [profileId, setProfileId] = useState<string>();
  const mutation = useMutation(FormExamplesService.method.submitBasicForm);

  async function handleSubmit(
    values: SubmitBasicFormRequest,
    form: UseFormReturn<Record<string, unknown>, unknown, SubmitBasicFormRequest>
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
      <AutoForm<SubmitBasicFormRequest> onSubmit={handleSubmit} schema={SubmitBasicFormRequestSchema} withSubmit />
      {profileId ? (
        <Alert role="status">
          <AlertTitle>Profile created</AlertTitle>
          <AlertDescription>{profileId}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
