import { BadRequestSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { Code, ConnectError } from "@connectrpc/connect";
import { ErrorMessage } from "@hookform/error-message";
import { expect, test } from "@rstest/core";
import { act, render, renderHook, screen } from "@testing-library/react";
import { Field, FieldError } from "@/components/ui/field";
import { useProtoForm } from "@/registry/base-nova/protoform/hooks/use-proto-form";
import { BookFormBinding } from "../runtime/gen/protoform/conformance/v1/aip_form";

test("renders and clears mapped server errors without a FormProvider", () => {
  const { result } = renderHook(() => useProtoForm(BookFormBinding.descriptor, { serverPathPrefix: "book" }));
  const view = render(
    <Field>
      <ErrorMessage as={FieldError} errors={result.current.formState.errors} name="displayName" />
    </Field>
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();

  act(() => {
    result.current.setServerErrors(
      new ConnectError("Review the title.", Code.InvalidArgument, {}, [
        {
          desc: BadRequestSchema,
          value: { fieldViolations: [{ description: "Choose a different title.", field: "book.display_name" }] },
        },
      ])
    );
  });
  view.rerender(
    <Field>
      <ErrorMessage as={FieldError} errors={result.current.formState.errors} name="displayName" />
    </Field>
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Choose a different title.");

  act(() => result.current.clearErrors("displayName"));
  view.rerender(
    <Field>
      <ErrorMessage as={FieldError} errors={result.current.formState.errors} name="displayName" />
    </Field>
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
