"use client";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base-nova/protoform/components/alert";
import { Button } from "@/registry/base-nova/protoform/components/button";
import type { Book } from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb";

export function BookDetail({
  book,
  error,
  isPending,
  onBack,
  onDelete,
  onEdit,
  onRetry,
}: {
  book?: Book | undefined;
  error?: string | undefined;
  isPending: boolean;
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onRetry: () => void;
}) {
  if (isPending) {
    return <p aria-live="polite">Loading book…</p>;
  }
  if (error || !book) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Book not loaded</AlertTitle>
        <AlertDescription className="gap-3">
          {error ?? "The book no longer exists."}
          <Button onClick={onRetry} type="button" variant="outline">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <section aria-labelledby="book-detail-title" className="space-y-6">
      <Button onClick={onBack} type="button" variant="ghost">
        Back to books
      </Button>
      <div className="space-y-2">
        <h2 className="font-semibold text-3xl" id="book-detail-title">
          {book.displayName}
        </h2>
        <p className="font-mono text-muted-foreground text-sm">{book.isbn}</p>
        <p className="text-sm">{book.note || "No note yet."}</p>
      </div>
      <dl className="grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Resource name</dt>
          <dd className="break-all font-mono">{book.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Etag</dt>
          <dd className="font-mono">{book.etag}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onEdit} type="button">
          Edit book
        </Button>
        <Button onClick={onDelete} type="button" variant="destructive-outline">
          Delete book
        </Button>
      </div>
    </section>
  );
}
