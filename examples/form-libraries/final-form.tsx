"use client";

import { createClient } from "@connectrpc/connect";
import { FORM_ERROR } from "final-form";
import React from "react";
import { Field as FinalField, Form as FinalForm } from "react-final-form";
import { Alert, AlertDescription, AlertTitle } from "@/registry/base-nova/protoform/components/alert";
import { Button } from "@/registry/base-nova/protoform/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/registry/base-nova/protoform/components/field";
import { Input } from "@/registry/base-nova/protoform/components/input";
import { createFinalFormValidator, standardSchemaIssuesToFormErrors } from "@/registry/base-nova/protoform/lib/core";
import { createFormExamplesTransport } from "../browser-transport.js";
import { FormExamplesService } from "../gen/protoform/examples/v1/forms_pb.js";
import {
  type BasicFormValues,
  firstServerErrorField,
  initialProfileValues,
  mapProfileServerErrors,
  profileSchema,
  splitErrorMessages,
} from "./profile-form.js";

const validate = createFinalFormValidator(profileSchema, {
  rootErrorKey: FORM_ERROR,
});

function mapSubmissionErrors(error: unknown) {
  const serverErrors = mapProfileServerErrors(error);
  const issues = [
    ...serverErrors.displayName.map((message) => ({
      message,
      path: ["displayName"],
    })),
    ...serverErrors.email.map((message) => ({
      message,
      path: ["email"],
    })),
    ...serverErrors.root.map((message) => ({ message, path: [] })),
  ];
  return {
    errors: standardSchemaIssuesToFormErrors(issues, {
      rootErrorKey: FORM_ERROR,
    }),
    firstField: firstServerErrorField(serverErrors),
  };
}

export function FinalFormExample({ baseUrl }: { baseUrl?: string }) {
  const idPrefix = React.useId();
  const [profileId, setProfileId] = React.useState<string>();
  const client = createClient(FormExamplesService, createFormExamplesTransport(baseUrl));

  return (
    <FinalForm<BasicFormValues>
      initialValues={initialProfileValues}
      onSubmit={async (values) => {
        setProfileId(undefined);
        const result = await profileSchema["~standard"].validate(values);
        if (result.issues) {
          return { [FORM_ERROR]: "Form values changed after validation." };
        }
        try {
          const response = await client.submitBasicForm(result.value);
          setProfileId(response.profileId);
          return;
        } catch (error) {
          const submission = mapSubmissionErrors(error);
          if (submission.firstField) {
            const fieldId = `${idPrefix}-${submission.firstField}`;
            document.querySelector<HTMLElement>(`#${CSS.escape(fieldId)}`)?.focus();
          }
          return submission.errors;
        }
      }}
      validate={validate}
    >
      {({ error, handleSubmit, submitError, submitting }) => {
        const rootErrors = splitErrorMessages(submitError ?? error);
        return (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup>
              <FinalField<string> name="displayName">
                {({ input, meta }) => {
                  const { name, onBlur, onChange, onFocus, value } = input;
                  const errors = splitErrorMessages(
                    meta.submitError ?? (meta.touched || meta.submitFailed ? meta.error : undefined)
                  );
                  return (
                    <Field data-invalid={errors.length > 0}>
                      <FieldLabel htmlFor={`${idPrefix}-${input.name}`} required>
                        Display name
                      </FieldLabel>
                      <Input
                        aria-invalid={errors.length > 0 || undefined}
                        id={`${idPrefix}-${name}`}
                        name={name}
                        onBlur={onBlur}
                        onChange={onChange}
                        onFocus={onFocus}
                        placeholder="Ada Lovelace"
                        value={value}
                      />
                      <FieldError errors={errors} />
                    </Field>
                  );
                }}
              </FinalField>

              <FinalField<string> name="email">
                {({ input, meta }) => {
                  const { name, onBlur, onChange, onFocus, value } = input;
                  const errors = splitErrorMessages(
                    meta.submitError ?? (meta.touched || meta.submitFailed ? meta.error : undefined)
                  );
                  return (
                    <Field data-invalid={errors.length > 0}>
                      <FieldLabel htmlFor={`${idPrefix}-${input.name}`} required>
                        Email
                      </FieldLabel>
                      <Input
                        aria-invalid={errors.length > 0 || undefined}
                        id={`${idPrefix}-${name}`}
                        name={name}
                        onBlur={onBlur}
                        onChange={onChange}
                        onFocus={onFocus}
                        placeholder="ada@example.com"
                        type="email"
                        value={value}
                      />
                      <FieldError errors={errors} />
                    </Field>
                  );
                }}
              </FinalField>
            </FieldGroup>

            {rootErrors.length > 0 ? (
              <Alert variant="destructive">
                <AlertTitle>Submission failed</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {rootErrors.map(({ message }) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}

            <Button isLoading={submitting} type="submit">
              Create profile
            </Button>

            {profileId ? (
              <Alert role="status">
                <AlertTitle>Profile created</AlertTitle>
                <AlertDescription>{profileId}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        );
      }}
    </FinalForm>
  );
}
