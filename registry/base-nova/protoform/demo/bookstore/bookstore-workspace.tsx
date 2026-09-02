"use client";

import { skipToken, useQuery } from "@connectrpc/connect-query";
import { type ReactNode, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LibraryService } from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb";
import { BookDetail } from "./book-detail";
import { CreateBookForm } from "./create-book-form";
import { DeleteBookForm } from "./delete-book-form";
import { UpdateBookForm } from "./update-book-form";

type View = "create" | "delete" | "detail" | "edit" | "list";

export function BookstoreWorkspace({ onReset, parent }: { onReset: () => void; parent: string }) {
  const [view, setView] = useState<View>("list");
  const [selectedName, setSelectedName] = useState<string>();
  const [filter, setFilter] = useState("");
  const list = useQuery(LibraryService.method.listBooks, { filter, parent });
  const detail = useQuery(LibraryService.method.getBook, selectedName ? { name: selectedName } : skipToken);

  function openBook(name: string) {
    setSelectedName(name);
    setView("detail");
  }

  function returnToList() {
    setSelectedName(undefined);
    setView("list");
  }

  function resetLibrary() {
    returnToList();
    setFilter("");
    onReset();
  }

  function handleDeleted() {
    returnToList();
    return list.refetch();
  }

  const selected = detail.data;
  let listContent: ReactNode;
  if (list.isPending) {
    listContent = <p aria-live="polite">Loading books…</p>;
  } else if (list.error) {
    listContent = (
      <Alert variant="destructive">
        <AlertTitle>Books not loaded</AlertTitle>
        <AlertDescription className="gap-3">
          {list.error.message}
          <Button onClick={() => list.refetch()} type="button" variant="outline">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  } else if (list.data.books.length === 0) {
    listContent = (
      <p className="rounded-lg border border-dashed p-6 text-muted-foreground text-sm">No books match this filter.</p>
    );
  } else {
    listContent = (
      <div className="grid gap-3 sm:grid-cols-2">
        {list.data.books.map((book) => (
          <Card key={book.name} size="full" variant="outlined">
            <CardHeader>
              <CardTitle level={3}>
                <Button
                  className="h-auto justify-start whitespace-normal p-0 text-left text-lg"
                  onClick={() => openBook(book.name)}
                  type="button"
                  variant="link"
                >
                  {book.displayName}
                </Button>
              </CardTitle>
              <CardDescription>{book.isbn}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-muted-foreground text-sm">{book.note || "No note yet."}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 rounded-xl border bg-background p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">5 RPCs</Badge>
            <Badge variant="outline">Generated bindings</Badge>
            <Badge variant="outline">Visitor-isolated state</Badge>
          </div>
          <h1 className="font-semibold text-3xl">Protoform library</h1>
          <p className="max-w-2xl text-muted-foreground text-sm">
            Create with an RHF stepper, edit with a field mask and etag, and confirm deletion through AutoForm.
          </p>
        </div>
        <Button onClick={resetLibrary} type="button" variant="outline">
          Reset demo
        </Button>
      </header>

      {view === "list" ? (
        <section aria-labelledby="book-list-title" className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-semibold text-2xl" id="book-list-title">
                Books
              </h2>
              <p className="text-muted-foreground text-sm">Live ListBooks results from your temporary library.</p>
            </div>
            <Button onClick={() => setView("create")} type="button">
              Create book
            </Button>
          </div>
          <Field className="max-w-md">
            <FieldLabel htmlFor="book-filter">Filter books</FieldLabel>
            <Input
              id="book-filter"
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Title or ISBN"
              type="search"
              value={filter}
            />
          </Field>
          {listContent}
        </section>
      ) : null}

      {view === "create" ? (
        <CreateBookForm onCancel={returnToList} onCreated={(name) => openBook(name)} parent={parent} />
      ) : null}

      {view === "detail" ? (
        <BookDetail
          book={selected}
          error={detail.error?.message}
          isPending={detail.isPending}
          onBack={returnToList}
          onDelete={() => setView("delete")}
          onEdit={() => setView("edit")}
          onRetry={() => detail.refetch()}
        />
      ) : null}

      {view === "edit" && selected ? (
        <UpdateBookForm book={selected} onCancel={() => setView("detail")} onUpdated={() => setView("detail")} />
      ) : null}

      {view === "delete" && selected ? (
        <DeleteBookForm book={selected} onCancel={() => setView("detail")} onDeleted={handleDeleted} />
      ) : null}
    </div>
  );
}
