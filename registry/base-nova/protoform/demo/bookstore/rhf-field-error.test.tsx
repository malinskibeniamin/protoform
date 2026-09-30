import { BadRequestSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { Code, ConnectError } from "@connectrpc/connect";
import { expect, test } from "@rstest/core";
import { act, render, renderHook, screen } from "@testing-library/react";
import { ErrorMessage } from "react-hook-form";
import { Field, FieldError } from "@/components/ui/field";
import { useProtoForm } from "@/registry/base-nova/protoform/hooks/use-proto-form";
import { BookFormBinding } from "../runtime/gen/protoform/conformance/v1/aip_form";

test("renders and clears mapped server errors from the form control without a FormProvider", () => {
  const { result } = renderHook(() => useProtoForm(BookFormBinding.descriptor, { serverPathPrefix: "book" }));
  render(
    <Field>
      <ErrorMessage as={FieldError} control={result.current.control} name="displayName" />
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
  expect(screen.getByRole("alert")).toHaveTextContent("Choose a different title.");

  act(() => result.current.clearErrors("displayName"));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
