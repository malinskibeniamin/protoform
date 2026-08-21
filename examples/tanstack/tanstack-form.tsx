"use client";

import { createClient } from "@connectrpc/connect";
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/registry/base-nova/protoform/components/alert";
import { Button } from "@/registry/base-nova/protoform/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/registry/base-nova/protoform/components/field";
import { Input } from "@/registry/base-nova/protoform/components/input";
import { useProtoForm } from "@/registry/base-nova/protoform/hooks/use-proto-form-tanstack";
import { createFormExamplesTransport } from "../browser-transport.js";
import { FormExamplesService, SubmitBasicFormRequestSchema } from "../gen/protoform/examples/v1/forms_pb.js";

function fieldErrorMessage(error: unknown): string | undefined {
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    const message = Reflect.get(error, "message");
    return typeof message === "string" ? message : undefined;
  }
  return;
}

export function TanStackFormExample({ baseUrl }: { baseUrl?: string }) {
  const [profileId, setProfileId] = React.useState<string>();
  const [rootErrors, setRootErrors] = React.useState<string[]>([]);
  const client = createClient(FormExamplesService, createFormExamplesTransport(baseUrl));
  const form = useProtoForm(SubmitBasicFormRequestSchema, {
    defaultValues: {
      displayName: "",
      email: "",
    },
    onSubmit: async ({ value }) => {
      setProfileId(undefined);
      setRootErrors([]);
      try {
        const response = await client.submitBasicForm(form.createMessage(value));
        setProfileId(response.profileId);
      } catch (error) {
        const result = form.setServerErrors(error);
        const messages = result.unmapped.map((violation) => `${violation.field}: ${violation.description}`);
        if (!result.handled && result.context.message) {
          messages.unshift(result.context.message);
        }
        if (!result.handled && messages.length === 0) {
          messages.push(error instanceof Error ? error.message : "The request could not be sent.");
        }
        setRootErrors(messages);
      }
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit().catch((error: unknown) => {
          setRootErrors([error instanceof Error ? error.message : "The request could not be sent."]);
        });
      }}
    >
      <FieldGroup>
        <form.Field name="displayName">
          {(field) => {
            const invalid = !field.state.meta.isValid;
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name} required>
                  Display name
                </FieldLabel>
                <Input
                  aria-invalid={invalid || undefined}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Ada Lovelace"
                  value={field.state.value}
                />
                <FieldError>{field.state.meta.errors.map(fieldErrorMessage).filter(Boolean).join("\n")}</FieldError>
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const invalid = !field.state.meta.isValid;
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name} required>
                  Email
                </FieldLabel>
                <Input
                  aria-invalid={invalid || undefined}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="ada@example.com"
                  type="email"
                  value={field.state.value}
                />
                <FieldError>{field.state.meta.errors.map(fieldErrorMessage).filter(Boolean).join("\n")}</FieldError>
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      {rootErrors.length ? (
        <Alert variant="destructive">
          <AlertTitle>Submission failed</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {rootErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button isLoading={isSubmitting} type="submit">
            Create profile
          </Button>
        )}
      </form.Subscribe>

      {profileId ? (
        <Alert role="status">
          <AlertTitle>Profile created</AlertTitle>
          <AlertDescription>{profileId}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
