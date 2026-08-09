"use client";

import { createClient } from "@connectrpc/connect";
import { Formik, type FormikErrors } from "formik";
import React from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base-nova/protoform/components/alert";
import { Button } from "@/registry/base-nova/protoform/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/base-nova/protoform/components/field";
import { Input } from "@/registry/base-nova/protoform/components/input";
import { createFormikValidator } from "@/registry/base-nova/protoform/lib/core";
import { createFormExamplesTransport } from "../browser-transport.js";
import { FormExamplesService } from "../gen/protoform/examples/v1/forms_pb.js";
import {
  type BasicFormValues,
  firstServerErrorField,
  initialProfileValues,
  joinErrorMessages,
  mapProfileServerErrors,
  profileSchema,
  splitErrorMessages,
} from "./profile-form.js";

const validate = createFormikValidator(profileSchema);

function readStatusMessages(status: unknown): string[] {
  return Array.isArray(status)
    ? status.filter((message): message is string => typeof message === "string")
    : [];
}

export function FormikExample({ baseUrl }: { baseUrl?: string }) {
  const idPrefix = React.useId();
  const [profileId, setProfileId] = React.useState<string>();
  const client = createClient(
    FormExamplesService,
    createFormExamplesTransport(baseUrl)
  );

  return (
    <Formik<BasicFormValues>
      initialValues={initialProfileValues}
      onSubmit={async (values, helpers) => {
        setProfileId(undefined);
        helpers.setStatus(undefined);
        const result = await profileSchema["~standard"].validate(values);
        if (result.issues) {
          helpers.setStatus(["Form values changed after validation."]);
          return;
        }
        try {
          const response = await client.submitBasicForm(result.value);
          setProfileId(response.profileId);
        } catch (error) {
          const serverErrors = mapProfileServerErrors(error);
          const fieldErrors: FormikErrors<BasicFormValues> = {};
          const displayName = joinErrorMessages(serverErrors.displayName);
          const email = joinErrorMessages(serverErrors.email);
          if (displayName) {
            fieldErrors.displayName = displayName;
          }
          if (email) {
            fieldErrors.email = email;
          }
          helpers.setErrors(fieldErrors);
          helpers.setStatus(serverErrors.root);
          const firstField = firstServerErrorField(serverErrors);
          if (firstField) {
            document.getElementById(`${idPrefix}-${firstField}`)?.focus();
          }
        }
      }}
      validate={validate}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        status,
        touched,
        values,
      }) => {
        const rootErrors = readStatusMessages(status);
        const displayNameErrors = touched.displayName
          ? splitErrorMessages(errors.displayName)
          : [];
        const emailErrors = touched.email
          ? splitErrorMessages(errors.email)
          : [];

        return (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={displayNameErrors.length > 0}>
                <FieldLabel htmlFor={`${idPrefix}-displayName`} required>
                  Display name
                </FieldLabel>
                <Input
                  aria-invalid={displayNameErrors.length > 0 || undefined}
                  id={`${idPrefix}-displayName`}
                  name="displayName"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Ada Lovelace"
                  value={values.displayName}
                />
                <FieldError errors={displayNameErrors} />
              </Field>

              <Field data-invalid={emailErrors.length > 0}>
                <FieldLabel htmlFor={`${idPrefix}-email`} required>
                  Email
                </FieldLabel>
                <Input
                  aria-invalid={emailErrors.length > 0 || undefined}
                  id={`${idPrefix}-email`}
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="ada@example.com"
                  type="email"
                  value={values.email}
                />
                <FieldError errors={emailErrors} />
              </Field>
            </FieldGroup>

            {rootErrors.length > 0 ? (
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

            <Button isLoading={isSubmitting} type="submit">
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
    </Formik>
  );
}
