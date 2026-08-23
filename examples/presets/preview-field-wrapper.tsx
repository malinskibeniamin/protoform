import type { FieldWrapperProps } from "@/registry/base-nova/protoform/components/auto-form/core-types";
import { Field, FieldContent, FieldError, FieldLabel } from "@/registry/base-nova/protoform/components/field";

export function PreviewFieldWrapper({ children, error, field, id, label }: FieldWrapperProps) {
  return (
    <Field className="gap-2" data-invalid={Boolean(error)} data-layout="stacked">
      <FieldLabel className="gap-1.5" htmlFor={id}>
        <span className="font-medium text-sm">{label}</span>
        {field.required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </FieldLabel>
      <FieldContent className="min-w-0 gap-2">
        {children}
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  );
}
