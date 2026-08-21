"use client";

import { createConnectQueryKey, useMutation, useTransport } from "@connectrpc/connect-query";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/registry/base-nova/protoform/components/alert";
import { Button } from "@/registry/base-nova/protoform/components/button";
import { Field, FieldError, FieldLabel } from "@/registry/base-nova/protoform/components/field";
import { Input } from "@/registry/base-nova/protoform/components/input";
import { Textarea } from "@/registry/base-nova/protoform/components/textarea";
import { BookFormBinding } from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_form";
import type { Book } from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb";
import { LibraryService } from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb";
import { useProtoForm } from "@/registry/base-nova/protoform/hooks/use-proto-form";

interface UpdateBookFormProps {
  book: Book;
  onCancel: () => void;
  onUpdated: () => void;
}

export function UpdateBookForm({ book, onCancel, onUpdated }: UpdateBookFormProps) {
  const queryClient = useQueryClient();
  const transport = useTransport();
  const mutation = useMutation(LibraryService.method.updateBook);
  const [formError, setFormError] = useState<string>();
  const form = useProtoForm(BookFormBinding.descriptor, {
    defaultValues: book,
    mode: "onChange",
    serverPathPrefix: "book",
  });

  function handleInvalid(errors: typeof form.formState.errors) {
    setFormError(`Review these fields: ${Object.keys(errors).join(", ")}.`);
  }

  async function saveChanges() {
    setFormError(undefined);
    const valid = await form.trigger(["displayName", "note"]);
    if (!valid) {
      handleInvalid(form.formState.errors);
      return;
    }
    await submitUpdate();
  }

  async function submitUpdate() {
    setFormError(undefined);
    form.clearServerErrorContext();
    const updateMask = form.createUpdateMask();
    if (updateMask.paths.length === 0) {
      setFormError("Change the title or note before saving.");
      return;
    }
    try {
      const response = await mutation.mutateAsync({
        book: form.createMessage(),
        updateMask,
      });
      queryClient.setQueryData(
        createConnectQueryKey({
          cardinality: "finite",
          input: { name: response.name },
          schema: LibraryService.method.getBook,
          transport,
        }),
        response
      );
      const parent = response.name.split("/books/")[0] ?? "";
      await queryClient.invalidateQueries({
        queryKey: createConnectQueryKey({
          cardinality: undefined,
          input: { parent },
          schema: LibraryService.method.listBooks,
          transport,
        }),
      });
      onUpdated();
    } catch (error) {
      form.setServerErrors(error);
    }
  }

  const titleError = form.formState.errors.displayName?.message;
  return (
    <section aria-labelledby="edit-book-title" className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-semibold text-2xl" id="edit-book-title">
          Edit book
        </h2>
        <p className="text-muted-foreground text-sm">
          Protoform derives the update mask. The service checks the book etag.
        </p>
      </div>
      <form className="space-y-5" onSubmit={form.handleSubmit(submitUpdate, handleInvalid)}>
        <Field data-invalid={Boolean(titleError)}>
          <FieldLabel htmlFor="update-book-title">Title</FieldLabel>
          <Input aria-invalid={Boolean(titleError)} id="update-book-title" {...form.register("displayName")} />
          {titleError ? <FieldError>{titleError}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="update-book-note">Note</FieldLabel>
          <Textarea id="update-book-note" {...form.register("note")} />
        </Field>
        {formError || mutation.error ? (
          <Alert variant="destructive">
            <AlertTitle>Changes not saved</AlertTitle>
            <AlertDescription>{formError ?? mutation.error?.message}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap justify-between gap-3">
          <Button onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
          <Button isLoading={mutation.isPending} onClick={saveChanges} type="button">
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}
