"use client";

import { MailIcon } from "lucide-react";
import type { AutoFormFieldProps } from "../core-types";
import { EMAIL_FIELD_PATTERN, getFieldUiConfig } from "../helpers";
import type { FieldTypeDefinition } from "../registry";
import { StringLikeInput, useFieldTestIds } from "./shared";

function EmailFieldComponent(props: AutoFormFieldProps) {
  const testIds = useFieldTestIds(props.id);

  return (
    <StringLikeInput
      error={props.error}
      icon={<MailIcon className="size-4" />}
      id={props.id}
      inputProps={props.inputProps}
      placeholder={getFieldUiConfig(props.field).placeholder}
      testId={testIds.control}
      type="email"
    />
  );
}

export { EmailFieldComponent };

export const emailFieldDefinition: FieldTypeDefinition = {
  component: EmailFieldComponent,
  match: (field, context) =>
    field.type === "string" && (context.inputType === "email" || EMAIL_FIELD_PATTERN.test(context.identity)),
  name: "email",
  priority: 20,
};
