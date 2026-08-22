"use client";

import { create } from "@bufbuild/protobuf";
import { createConnectQueryKey, useMutation, useTransport } from "@connectrpc/connect-query";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base-nova/protoform/components/alert";
import { Button } from "@/registry/base-nova/protoform/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/base-nova/protoform/components/field";
import { Input } from "@/registry/base-nova/protoform/components/input";
import { Textarea } from "@/registry/base-nova/protoform/components/textarea";
import { BookFormBinding } from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_form";
import {
  BookSchema,
  LibraryService,
} from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb";
import { useProtoForm } from "@/registry/base-nova/protoform/hooks/use-proto-form";

interface CreateBookFormProps {
  onCancel: () => void;
  onCreated: (name: string) => void;
  parent: string;
}

const bookIdInputPattern = String.raw`[a-z][a-z0-9\-]{2,62}[a-z0-9]`;
const BOOK_ID_PATTERN = /^[a-z][a-z0-9-]{2,62}[a-z0-9]$/u;

export function CreateBookForm({ onCancel, onCreated, parent }: CreateBookFormProps) {
  const [step, setStep] = useState<"book" | "publishing">("book");
  const [bookId, setBookId] = useState("");
  const queryClient = useQueryClient();
  const transport = useTransport();
  const mutation = useMutation(LibraryService.method.createBook);
  const form = useProtoForm(BookFormBinding.descriptor, {
    defaultValues: create(BookSchema, { displayName: "", isbn: "", note: "" }),
    mode: "onChange",
    serverPathPrefix: "book",
  });

  async function continueToPublishing() {
    const valid = await form.trigger(["displayName", "isbn"]);
    if (valid) {
      setStep("publishing");
    }
  }

  async function submitBook() {
    if (!BOOK_ID_PATTERN.test(bookId)) {
      return;
    }
    form.clearServerErrorContext();
    try {
      const response = await mutation.mutateAsync({
        book: form.createMessage(),
        bookId,
        parent,
      });
      await queryClient.invalidateQueries({
        queryKey: createConnectQueryKey({
          cardinality: undefined,
          input: { parent },
          schema: LibraryService.method.listBooks,
          transport,
        }),
      });
      onCreated(response.name);
    } catch (error) {
      form.setServerErrors(error);
    }
  }

  const titleError = form.formState.errors.displayName?.message;
  const isbnError = form.formState.errors.isbn?.message;
  const bookIdInvalid = bookId.length > 0 && !BOOK_ID_PATTERN.test(bookId);
  const {
    name: displayName,
    onBlur: handleDisplayNameBlur,
    onChange: handleDisplayNameChange,
    ref: displayNameRef,
  } = form.register("displayName");
  const { name: isbn, onBlur: handleIsbnBlur, onChange: handleIsbnChange, ref: isbnRef } = form.register("isbn");
  const { name: note, onBlur: handleNoteBlur, onChange: handleNoteChange, ref: noteRef } = form.register("note");

  return (
    <section aria-labelledby="create-book-title" className="space-y-6">
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-sm">Step {step === "book" ? "1" : "2"} of 2</p>
        <h2 className="font-semibold text-2xl" id="create-book-title">
          Create a book
        </h2>
        <p className="text-muted-foreground text-sm">
          React Hook Form state, generated Protoform binding, and protobuf CEL validation.
        </p>
      </div>

      {step === "book" ? (
        <div className="space-y-5">
          <Field data-invalid={Boolean(titleError)}>
            <FieldLabel htmlFor="create-book-title-input">Title</FieldLabel>
            <Input
              aria-invalid={Boolean(titleError)}
              id="create-book-title-input"
              name={displayName}
              onBlur={handleDisplayNameBlur}
              onChange={handleDisplayNameChange}
              ref={displayNameRef}
            />
            {titleError ? <FieldError>{titleError}</FieldError> : null}
          </Field>
          <Field data-invalid={Boolean(isbnError)}>
            <FieldLabel htmlFor="create-book-isbn">ISBN-13</FieldLabel>
            <Input
              aria-describedby={isbnError ? undefined : "create-book-isbn-help"}
              aria-invalid={Boolean(isbnError)}
              id="create-book-isbn"
              inputMode="numeric"
              name={isbn}
              onBlur={handleIsbnBlur}
              onChange={handleIsbnChange}
              placeholder="9783161484100"
              ref={isbnRef}
            />
            {isbnError ? (
              <FieldError>{isbnError}</FieldError>
            ) : (
              <FieldDescription id="create-book-isbn-help">
                Thirteen digits. The check digit is verified by the CEL rule in the proto.
              </FieldDescription>
            )}
          </Field>
          <div className="flex flex-wrap justify-between gap-3">
            <Button onClick={onCancel} type="button" variant="outline">
              Cancel
            </Button>
            <Button onClick={continueToPublishing} type="button">
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={form.handleSubmit(submitBook)}>
          <Field data-invalid={bookIdInvalid}>
            <FieldLabel htmlFor="create-book-id">Book id</FieldLabel>
            <Input
              aria-invalid={bookIdInvalid}
              id="create-book-id"
              onChange={(event) => setBookId(event.target.value)}
              pattern={bookIdInputPattern}
              required
              value={bookId}
            />
            {bookIdInvalid ? <FieldError>Use lowercase letters, numbers, and hyphens.</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="create-book-note">Note</FieldLabel>
            <Textarea
              id="create-book-note"
              name={note}
              onBlur={handleNoteBlur}
              onChange={handleNoteChange}
              ref={noteRef}
            />
          </Field>
          {mutation.error ? (
            <Alert variant="destructive">
              <AlertTitle>Book not created</AlertTitle>
              <AlertDescription>{mutation.error.message}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-wrap justify-between gap-3">
            <Button onClick={() => setStep("book")} type="button" variant="outline">
              Back
            </Button>
            <Button disabled={bookIdInvalid || bookId.length === 0} isLoading={mutation.isPending} type="submit">
              Create book
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
