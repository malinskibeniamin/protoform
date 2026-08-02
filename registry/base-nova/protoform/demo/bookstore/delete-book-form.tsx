"use client";

import { create } from "@bufbuild/protobuf";
import { useMutation } from "@connectrpc/connect-query";
import type { ReactNode } from "react";

import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";
import { Button } from "@/registry/base-nova/protoform/components/button";
import type { Book } from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb";
import {
  DeleteBookRequestSchema,
  LibraryService,
} from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb";
import { DeleteBookRequestFormBinding } from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_form";

interface DeleteBookFormProps {
  book: Book;
  onCancel: () => void;
  onDeleted: () => void;
}

function DeleteSubmitButton({
  disabled,
  testId,
}: {
  children: ReactNode;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <Button
      disabled={disabled}
      testId={testId}
      type="submit"
      variant="destructive"
    >
      {disabled ? "Deleting…" : "Delete book"}
    </Button>
  );
}

const deleteUiComponents = { SubmitButton: DeleteSubmitButton };

export function DeleteBookForm({
  book,
  onCancel,
  onDeleted,
}: DeleteBookFormProps) {
  const mutation = useMutation(LibraryService.method.deleteBook);

  async function deleteBook() {
    await mutation.mutateAsync({ etag: book.etag, name: book.name });
    onDeleted();
  }

  return (
    <section aria-labelledby="delete-book-title" className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-semibold text-2xl" id="delete-book-title">
          Delete book
        </h2>
        <p className="text-muted-foreground text-sm">
          Delete <strong>{book.displayName}</strong>? AutoForm renders the
          generated delete request; app-owned copy provides the confirmation.
        </p>
      </div>
      <AutoForm
        defaultValues={create(DeleteBookRequestSchema, {
          etag: book.etag,
          name: book.name,
        })}
        fieldConfig={{
          etag: { customData: { hidden: true } },
          name: { customData: { hidden: true } },
          requestId: { customData: { hidden: true } },
          validateOnly: { customData: { hidden: true } },
        }}
        onSubmit={deleteBook}
        schema={DeleteBookRequestFormBinding.descriptor}
        uiComponents={deleteUiComponents}
        withSubmit
      />
      <Button onClick={onCancel} type="button" variant="outline">
        Cancel
      </Button>
      {mutation.error ? (
        <p className="text-destructive text-sm">{mutation.error.message}</p>
      ) : null}
    </section>
  );
}
