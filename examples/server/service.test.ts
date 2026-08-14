import { BadRequestSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { create } from "@bufbuild/protobuf";
import { Code, ConnectError } from "@connectrpc/connect";
import { describe, expect, it } from "vitest";
import {
  BookSchema,
  BookState,
  CreateBookRequestSchema,
  DeleteBookRequestSchema,
  ExpungeBookRequestSchema,
  GetBookRequestSchema,
  ListBooksRequestSchema,
  UndeleteBookRequestSchema,
  UpdateBookRequestSchema,
} from "../../conformance/gen/protoform/conformance/v1/aip_pb.js";
import {
  SubmitBasicFormRequestSchema,
  SubmitComplexFormRequestSchema,
} from "../gen/protoform/examples/v1/forms_pb.js";
import { createLibraryService, formExamplesService } from "./service.js";

async function expectConnectCode(
  action: () => unknown | Promise<unknown>,
  code: Code
): Promise<void> {
  try {
    await action();
    throw new Error(`Expected Connect error ${code}.`);
  } catch (error) {
    expect(ConnectError.from(error).code).toBe(code);
  }
}

describe("form example service", () => {
  it("accepts the basic form and returns a stable profile id", async () => {
    const response = await formExamplesService.submitBasicForm(
      create(SubmitBasicFormRequestSchema, {
        displayName: "Ada Lovelace",
        email: "ada@example.com",
        role: "Platform engineer",
      })
    );

    expect(response).toMatchObject({
      displayName: "Ada Lovelace",
      profileId: "profiles/ada-lovelace",
    });
  });

  it("returns structured field details for business validation failures", async () => {
    const request = create(SubmitComplexFormRequestSchema, {
      approvalTicket: "OPS-42",
      ownerEmail: "owner@example.com",
      projectId: "taken-project",
      provider: 1,
      region: "eu-west1",
      replicas: 3,
    });

    try {
      await formExamplesService.submitComplexForm(request);
      throw new Error("Expected the request to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(ConnectError);
      const connectError = ConnectError.from(error);
      expect(
        connectError.findDetails(BadRequestSchema)[0]?.fieldViolations
      ).toMatchObject([
        {
          description: "Choose a different project id.",
          field: "project_id",
        },
      ]);
    }
  });
});

describe("library demo service", () => {
  it("runs isolated create, get, list, update, and delete workflows", async () => {
    const service = createLibraryService();
    const parent = "publishers/visitor-a";

    const initial = await service.listBooks(
      create(ListBooksRequestSchema, { parent })
    );
    expect(initial.books).toHaveLength(2);

    const created = await service.createBook(
      create(CreateBookRequestSchema, {
        book: create(BookSchema, {
          displayName: "The Protoform Handbook",
          isbn: "9783161484100",
          note: "A practical guide.",
        }),
        bookId: "protoform-handbook",
        parent,
      })
    );
    expect(created).toMatchObject({
      displayName: "The Protoform Handbook",
      isbn: "9783161484100",
      name: `${parent}/books/protoform-handbook`,
    });
    expect(created.etag).not.toBe("");

    expect(
      service.getBook(create(GetBookRequestSchema, { name: created.name }))
    ).toMatchObject({ uid: created.uid });

    const updated = await service.updateBook(
      create(UpdateBookRequestSchema, {
        book: create(BookSchema, {
          ...created,
          displayName: "The Protoform Field Guide",
        }),
        updateMask: { paths: ["displayName"] },
      })
    );
    expect(updated.displayName).toBe("The Protoform Field Guide");
    expect(updated.isbn).toBe(created.isbn);
    expect(updated.etag).not.toBe(created.etag);

    const unmasked = await service.updateBook(
      create(UpdateBookRequestSchema, {
        book: create(BookSchema, {
          ...updated,
          displayName: "The Protoform reference",
        }),
      })
    );
    expect(unmasked.displayName).toBe("The Protoform reference");
    expect(unmasked.note).toBe(updated.note);

    const sparselyUnmasked = await service.updateBook(
      create(UpdateBookRequestSchema, {
        book: create(BookSchema, {
          displayName: "The sparse Protoform reference",
          etag: unmasked.etag,
          name: unmasked.name,
        }),
      })
    );
    expect(sparselyUnmasked.displayName).toBe("The sparse Protoform reference");
    expect(sparselyUnmasked.note).toBe(unmasked.note);

    const deleted = await service.deleteBook(
      create(DeleteBookRequestSchema, {
        etag: sparselyUnmasked.etag,
        name: sparselyUnmasked.name,
      })
    );
    expect(deleted).toMatchObject({
      name: sparselyUnmasked.name,
      state: BookState.DELETED,
    });
    expect(deleted.deleteTime).toBeDefined();
    expect(deleted.purgeTime).toBeDefined();
    expect(
      service.getBook(
        create(GetBookRequestSchema, { name: sparselyUnmasked.name })
      ).state
    ).toBe(BookState.DELETED);
    expect(
      (
        await service.listBooks(create(ListBooksRequestSchema, { parent }))
      ).books.some((book) => book.name === sparselyUnmasked.name)
    ).toBe(false);
    expect(
      (
        await service.listBooks(
          create(ListBooksRequestSchema, { parent, showDeleted: true })
        )
      ).books.some((book) => book.name === sparselyUnmasked.name)
    ).toBe(true);

    const restored = await service.undeleteBook(
      create(UndeleteBookRequestSchema, { name: sparselyUnmasked.name })
    );
    expect(restored.state).toBe(BookState.ACTIVE);
    expect(restored.deleteTime).toBeUndefined();
    expect(restored.purgeTime).toBeUndefined();

    await service.expungeBook(
      create(ExpungeBookRequestSchema, { name: sparselyUnmasked.name })
    );
    expect(() =>
      service.getBook(
        create(GetBookRequestSchema, { name: sparselyUnmasked.name })
      )
    ).toThrowError(ConnectError);
  });

  it("isolates visitor libraries and rejects stale or immutable updates", async () => {
    const service = createLibraryService();
    const firstParent = "publishers/visitor-a";
    const secondParent = "publishers/visitor-b";
    const first = await service.listBooks(
      create(ListBooksRequestSchema, { parent: firstParent })
    );
    const second = await service.listBooks(
      create(ListBooksRequestSchema, { parent: secondParent })
    );
    expect(first.books[0]?.name).toContain(firstParent);
    expect(second.books[0]?.name).toContain(secondParent);

    const [book] = first.books;
    if (!book) {
      throw new Error("Expected a seeded book.");
    }
    try {
      service.updateBook(
        create(UpdateBookRequestSchema, {
          book: create(BookSchema, {
            ...book,
            etag: "stale",
            isbn: "9780131103627",
          }),
          updateMask: { paths: ["isbn"] },
        })
      );
      throw new Error("Expected the immutable update to fail.");
    } catch (error) {
      expect(ConnectError.from(error).code).toBe(Code.InvalidArgument);
    }
  });

  it("uses current AIP lifecycle error codes for soft deletion", async () => {
    const service = createLibraryService();
    const parent = "publishers/visitor-a";
    const [book] = (
      await service.listBooks(create(ListBooksRequestSchema, { parent }))
    ).books;
    if (!book) {
      throw new Error("Expected a seeded book.");
    }

    await expectConnectCode(
      () =>
        service.deleteBook(
          create(DeleteBookRequestSchema, {
            etag: "stale",
            name: book.name,
          })
        ),
      Code.Aborted
    );
    const deleted = await service.deleteBook(
      create(DeleteBookRequestSchema, { etag: book.etag, name: book.name })
    );
    await expectConnectCode(
      () =>
        service.deleteBook(
          create(DeleteBookRequestSchema, { name: book.name })
        ),
      Code.NotFound
    );
    expect(
      await service.deleteBook(
        create(DeleteBookRequestSchema, {
          allowMissing: true,
          name: book.name,
        })
      )
    ).toEqual(deleted);

    await service.undeleteBook(
      create(UndeleteBookRequestSchema, { name: book.name })
    );
    await expectConnectCode(
      () =>
        service.undeleteBook(
          create(UndeleteBookRequestSchema, { name: book.name })
        ),
      Code.AlreadyExists
    );
    await service.expungeBook(
      create(ExpungeBookRequestSchema, { name: book.name })
    );
    await expectConnectCode(
      () =>
        service.expungeBook(
          create(ExpungeBookRequestSchema, { name: book.name })
        ),
      Code.NotFound
    );
  });
});
