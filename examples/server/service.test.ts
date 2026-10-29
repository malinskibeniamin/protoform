import { BadRequestSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js';
import { create } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';
import {
  BookSchema,
  CreateBookRequestSchema,
  DeleteBookRequestSchema,
  ExpungeBookRequestSchema,
  GetBookRequestSchema,
  ListBooksRequestSchema,
  UndeleteBookRequestSchema,
  UpdateBookRequestSchema,
} from '../../conformance/gen/protoform/conformance/v1/aip_pb.js';
import { BookState } from '../../registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb.js';
import {
  CloudProvider,
  SubmitBasicFormRequestSchema,
  SubmitComplexFormRequestSchema,
} from '../gen/protoform/examples/v1/forms_pb.js';
import { createLibraryService, formExamplesService } from './service.js';

declare const { describe, expect, test }: typeof import('bun:test');

async function expectConnectCode(action: () => unknown, code: Code): Promise<void> {
  await Promise.resolve(expect(Promise.resolve().then(action)).rejects.toMatchObject({ code }));
}

function captureConnectError(action: () => unknown): ConnectError {
  try {
    action();
  } catch (error) {
    if (error instanceof ConnectError) {
      return error;
    }
    throw error;
  }
  throw new Error('Expected the request to fail with a Connect error.');
}

describe('form example service', () => {
  test('accepts the basic form and returns a stable profile id', () => {
    const response = formExamplesService.submitBasicForm(
      create(SubmitBasicFormRequestSchema, {
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'Platform engineer',
      })
    );

    expect(response).toMatchObject({
      displayName: 'Ada Lovelace',
      profileId: 'profiles/ada-lovelace',
    });
  });

  test('returns structured field details for business validation failures', () => {
    const request = create(SubmitComplexFormRequestSchema, {
      approvalTicket: 'OPS-42',
      ownerEmail: 'owner@example.com',
      projectId: 'taken-project',
      provider: CloudProvider.AWS,
      region: 'eu-west1',
      replicas: 3,
    });

    const error = captureConnectError(() => {
      formExamplesService.submitComplexForm(request);
    });
    expect(error).toBeInstanceOf(ConnectError);
    const connectError = ConnectError.from(error);
    expect(connectError.findDetails(BadRequestSchema)[0]?.fieldViolations).toMatchObject([
      {
        description: 'Choose a different project id.',
        field: 'project_id',
      },
    ]);
  });
});

describe('library demo service', () => {
  test('runs isolated create, get, list, update, and delete workflows', () => {
    const service = createLibraryService();
    const parent = 'publishers/visitor-a';

    const initial = service.listBooks(create(ListBooksRequestSchema, { parent }));
    expect(initial.books).toHaveLength(2);

    const created = service.createBook(
      create(CreateBookRequestSchema, {
        book: create(BookSchema, {
          displayName: 'The Protoform Handbook',
          isbn: '9783161484100',
          note: 'A practical guide.',
        }),
        bookId: 'protoform-handbook',
        parent,
      })
    );
    expect(created).toMatchObject({
      displayName: 'The Protoform Handbook',
      isbn: '9783161484100',
      name: `${parent}/books/protoform-handbook`,
    });
    expect(created.etag).not.toBe('');

    expect(service.getBook(create(GetBookRequestSchema, { name: created.name }))).toMatchObject({ uid: created.uid });

    const updated = service.updateBook(
      create(UpdateBookRequestSchema, {
        book: create(BookSchema, {
          ...created,
          displayName: 'The Protoform Field Guide',
        }),
        updateMask: { paths: ['displayName'] },
      })
    );
    expect(updated.displayName).toBe('The Protoform Field Guide');
    expect(updated.isbn).toBe(created.isbn);
    expect(updated.etag).not.toBe(created.etag);

    const unmasked = service.updateBook(
      create(UpdateBookRequestSchema, {
        book: create(BookSchema, {
          ...updated,
          displayName: 'The Protoform reference',
        }),
      })
    );
    expect(unmasked.displayName).toBe('The Protoform reference');
    expect(unmasked.note).toBe(updated.note);

    const sparselyUnmasked = service.updateBook(
      create(UpdateBookRequestSchema, {
        book: create(BookSchema, {
          displayName: 'The sparse Protoform reference',
          etag: unmasked.etag,
          name: unmasked.name,
        }),
      })
    );
    expect(sparselyUnmasked.displayName).toBe('The sparse Protoform reference');
    expect(sparselyUnmasked.note).toBe(unmasked.note);

    const deleted = service.deleteBook(
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
    expect(service.getBook(create(GetBookRequestSchema, { name: sparselyUnmasked.name })).state).toBe(
      BookState.DELETED
    );
    expect(
      service
        .listBooks(create(ListBooksRequestSchema, { parent }))
        .books.some((book) => book.name === sparselyUnmasked.name)
    ).toBe(false);
    expect(
      service
        .listBooks(create(ListBooksRequestSchema, { parent, showDeleted: true }))
        .books.some((book) => book.name === sparselyUnmasked.name)
    ).toBe(true);

    const restored = service.undeleteBook(create(UndeleteBookRequestSchema, { name: sparselyUnmasked.name }));
    expect(restored.state).toBe(BookState.ACTIVE);
    expect(restored.deleteTime).toBeUndefined();
    expect(restored.purgeTime).toBeUndefined();

    service.expungeBook(create(ExpungeBookRequestSchema, { name: sparselyUnmasked.name }));
    expect(() => service.getBook(create(GetBookRequestSchema, { name: sparselyUnmasked.name }))).toThrow(ConnectError);
  });

  test('isolates visitor libraries and rejects stale or immutable updates', () => {
    const service = createLibraryService();
    const firstParent = 'publishers/visitor-a';
    const secondParent = 'publishers/visitor-b';
    const first = service.listBooks(create(ListBooksRequestSchema, { parent: firstParent }));
    const second = service.listBooks(create(ListBooksRequestSchema, { parent: secondParent }));
    expect(first.books[0]?.name).toContain(firstParent);
    expect(second.books[0]?.name).toContain(secondParent);

    const [book] = first.books;
    if (!book) {
      throw new Error('Expected a seeded book.');
    }
    const error = captureConnectError(() => {
      service.updateBook(
        create(UpdateBookRequestSchema, {
          book: create(BookSchema, {
            ...book,
            etag: 'stale',
            isbn: '9780131103627',
          }),
          updateMask: { paths: ['isbn'] },
        })
      );
    });
    expect(ConnectError.from(error).code).toBe(Code.InvalidArgument);
  });

  test('uses current AIP lifecycle error codes for soft deletion', async () => {
    const service = createLibraryService();
    const parent = 'publishers/visitor-a';
    const [book] = service.listBooks(create(ListBooksRequestSchema, { parent })).books;
    if (!book) {
      throw new Error('Expected a seeded book.');
    }

    await expectConnectCode(
      () =>
        service.deleteBook(
          create(DeleteBookRequestSchema, {
            etag: 'stale',
            name: book.name,
          })
        ),
      Code.Aborted
    );
    const deleted = service.deleteBook(create(DeleteBookRequestSchema, { etag: book.etag, name: book.name }));
    await expectConnectCode(
      () => service.deleteBook(create(DeleteBookRequestSchema, { name: book.name })),
      Code.NotFound
    );
    expect(
      service.deleteBook(
        create(DeleteBookRequestSchema, {
          allowMissing: true,
          name: book.name,
        })
      )
    ).toEqual(deleted);

    service.undeleteBook(create(UndeleteBookRequestSchema, { name: book.name }));
    await expectConnectCode(
      () => service.undeleteBook(create(UndeleteBookRequestSchema, { name: book.name })),
      Code.AlreadyExists
    );
    service.expungeBook(create(ExpungeBookRequestSchema, { name: book.name }));
    await expectConnectCode(
      () => service.expungeBook(create(ExpungeBookRequestSchema, { name: book.name })),
      Code.NotFound
    );
  });
});
