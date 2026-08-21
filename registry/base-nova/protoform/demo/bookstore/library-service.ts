import { BadRequestSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { clone, create } from "@bufbuild/protobuf";
import { EmptySchema, timestampFromDate, timestampMs } from "@bufbuild/protobuf/wkt";
import { Code, ConnectError, type ServiceImpl } from "@connectrpc/connect";

import {
  type Book,
  BookSchema,
  BookState,
  type LibraryService,
} from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb";

const PARENT_PATTERN = /^publishers\/[a-z0-9][a-z0-9-]{2,63}$/;
const BOOK_ID_PATTERN = /^[a-z][a-z0-9-]{2,62}[a-z0-9]$/;
const BOOK_NAME_PATTERN = /^(publishers\/[a-z0-9][a-z0-9-]{2,63})\/books\/([a-z][a-z0-9-]{2,62}[a-z0-9])$/;
const DEFAULT_TTL_MS = 30 * 60 * 1000;
const DEFAULT_MAX_LIBRARIES = 500;
const DEFAULT_MAX_BOOKS = 20;
const UPDATABLE_BOOK_PATHS = ["display_name", "note"] as const;
type UpdatableBookPath = (typeof UPDATABLE_BOOK_PATHS)[number];

interface LibraryState {
  books: Map<string, Book>;
  expiresAt: number;
  touchedAt: number;
}

export interface LibraryServiceOptions {
  maxBooks?: number;
  maxLibraries?: number;
  now?: () => number;
  ttlMs?: number;
}

function fieldError(field: string, description: string): ConnectError {
  return new ConnectError("Review the highlighted fields.", Code.InvalidArgument, undefined, [
    {
      desc: BadRequestSchema,
      value: { fieldViolations: [{ description, field }] },
    },
  ]);
}

function connectError(code: Code, message: string): ConnectError {
  return new ConnectError(message, code);
}

function parentFromName(name: string): string {
  const match = name.match(BOOK_NAME_PATTERN);
  if (!match?.[1]) {
    throw fieldError("name", "Enter a book name such as publishers/my-library/books/my-book.");
  }
  return match[1];
}

function validateParent(parent: string): void {
  if (!PARENT_PATTERN.test(parent)) {
    throw fieldError("parent", "Enter a publisher name such as publishers/my-library.");
  }
}

function validateBookId(bookId: string): void {
  if (!BOOK_ID_PATTERN.test(bookId)) {
    throw fieldError("book_id", "Use 4–64 lowercase letters, numbers, or hyphens, starting with a letter.");
  }
}

function isUpdatableBookPath(path: string): path is UpdatableBookPath {
  return UPDATABLE_BOOK_PATHS.some((candidate) => candidate === path);
}

function populatedUpdatableBookPaths(book: Book): UpdatableBookPath[] {
  const paths: UpdatableBookPath[] = [];
  if (book.displayName !== "") {
    paths.push("display_name");
  }
  if (book.note !== undefined) {
    paths.push("note");
  }
  return paths;
}

export function createLibraryService({
  maxBooks = DEFAULT_MAX_BOOKS,
  maxLibraries = DEFAULT_MAX_LIBRARIES,
  now = Date.now,
  ttlMs = DEFAULT_TTL_MS,
}: LibraryServiceOptions = {}) {
  const libraries = new Map<string, LibraryState>();
  let version = 0;

  function nextEtag(): string {
    version += 1;
    return `v${version}`;
  }

  function makeBook(parent: string, bookId: string, displayName: string, isbn: string, note?: string) {
    const timestamp = timestampFromDate(new Date(now()));
    return create(BookSchema, {
      createTime: timestamp,
      displayName,
      etag: nextEtag(),
      isbn,
      name: `${parent}/books/${bookId}`,
      note,
      state: BookState.ACTIVE,
      uid: crypto.randomUUID(),
      updateTime: timestamp,
    });
  }

  function pruneExpired(): void {
    const currentTime = now();
    for (const [parent, library] of libraries) {
      if (library.expiresAt <= currentTime) {
        libraries.delete(parent);
        continue;
      }
      for (const [name, book] of library.books) {
        if (book.state === BookState.DELETED && book.purgeTime && timestampMs(book.purgeTime) <= currentTime) {
          library.books.delete(name);
        }
      }
    }
  }

  function seedLibrary(parent: string): LibraryState {
    const first = makeBook(
      parent,
      "designing-data-intensive-applications",
      "Designing Data-Intensive Applications",
      "9781449373320",
      "Reliable data systems and the trade-offs behind them."
    );
    const second = makeBook(
      parent,
      "domain-driven-design",
      "Domain-Driven Design",
      "9780321125217",
      "A shared language for complex software."
    );
    const currentTime = now();
    return {
      books: new Map([
        [first.name, first],
        [second.name, second],
      ]),
      expiresAt: currentTime + ttlMs,
      touchedAt: currentTime,
    };
  }

  function getLibrary(parent: string): LibraryState {
    validateParent(parent);
    pruneExpired();
    let library = libraries.get(parent);
    if (!library) {
      if (libraries.size >= maxLibraries) {
        const oldest = [...libraries.entries()].sort(([, left], [, right]) => left.touchedAt - right.touchedAt)[0]?.[0];
        if (oldest) {
          libraries.delete(oldest);
        }
      }
      library = seedLibrary(parent);
      libraries.set(parent, library);
    }
    const currentTime = now();
    library.touchedAt = currentTime;
    library.expiresAt = currentTime + ttlMs;
    return library;
  }

  function findBook(name: string) {
    const library = getLibrary(parentFromName(name));
    const book = library.books.get(name);
    if (!book) {
      throw connectError(Code.NotFound, `Book ${name} was not found.`);
    }
    return { book, library };
  }

  return {
    createBook(request) {
      validateParent(request.parent);
      validateBookId(request.bookId);
      if (!request.book) {
        throw fieldError("book", "Enter the book to create.");
      }
      if (!request.book.displayName.trim()) {
        throw fieldError("book.display_name", "Enter a book title.");
      }
      const library = getLibrary(request.parent);
      const name = `${request.parent}/books/${request.bookId}`;
      if (library.books.has(name)) {
        throw connectError(Code.AlreadyExists, `Book ${name} already exists.`);
      }
      if (library.books.size >= maxBooks) {
        throw connectError(Code.ResourceExhausted, "This temporary library has reached its book limit.");
      }
      const book = makeBook(
        request.parent,
        request.bookId,
        request.book.displayName,
        request.book.isbn,
        request.book.note
      );
      if (!request.validateOnly) {
        library.books.set(name, book);
      }
      return clone(BookSchema, book);
    },

    deleteBook(request) {
      const { book, library } = findBook(request.name);
      if (book.state === BookState.DELETED) {
        if (request.allowMissing) {
          return clone(BookSchema, book);
        }
        throw connectError(Code.NotFound, `Book ${request.name} was deleted.`);
      }
      if (request.etag && request.etag !== book.etag) {
        throw connectError(Code.Aborted, "This book changed. Refresh it before deleting.");
      }
      const deletionTime = timestampFromDate(new Date(now()));
      const deleted = clone(BookSchema, book);
      deleted.deleteTime = deletionTime;
      deleted.etag = nextEtag();
      deleted.purgeTime = timestampFromDate(new Date(now() + ttlMs));
      deleted.state = BookState.DELETED;
      deleted.updateTime = deletionTime;
      if (!request.validateOnly) {
        library.books.set(request.name, deleted);
      }
      return clone(BookSchema, deleted);
    },

    expungeBook(request) {
      const { library } = findBook(request.name);
      library.books.delete(request.name);
      return create(EmptySchema);
    },

    getBook(request) {
      return clone(BookSchema, findBook(request.name).book);
    },

    listBooks(request) {
      const library = getLibrary(request.parent);
      const filter = request.filter.trim().toLowerCase();
      const books = [...library.books.values()]
        .filter(
          (book) =>
            (request.showDeleted || book.state !== BookState.DELETED) &&
            (!filter || book.displayName.toLowerCase().includes(filter) || book.isbn.includes(filter))
        )
        .map((book) => clone(BookSchema, book));
      return { books };
    },

    undeleteBook(request) {
      const { book, library } = findBook(request.name);
      if (book.state !== BookState.DELETED) {
        throw connectError(Code.AlreadyExists, `Book ${request.name} is not deleted.`);
      }
      const restored = clone(BookSchema, book);
      restored.deleteTime = undefined;
      restored.etag = nextEtag();
      restored.purgeTime = undefined;
      restored.state = BookState.ACTIVE;
      restored.updateTime = timestampFromDate(new Date(now()));
      library.books.set(request.name, restored);
      return clone(BookSchema, restored);
    },

    updateBook(request) {
      if (!request.book) {
        throw fieldError("book", "Enter the book to update.");
      }
      const { book: current, library } = findBook(request.book.name);
      if (current.state === BookState.DELETED) {
        throw connectError(Code.FailedPrecondition, "Restore this book before updating it.");
      }
      const requestedPaths = request.updateMask?.paths;
      let paths: string[] = populatedUpdatableBookPaths(request.book);
      if (request.updateMask) {
        paths = requestedPaths?.includes("*") ? [...UPDATABLE_BOOK_PATHS] : (requestedPaths ?? []);
      }
      const normalizedPaths = paths.map((path) => (path === "displayName" ? "display_name" : path));
      const unsupported = normalizedPaths.filter((path) => !isUpdatableBookPath(path));
      if (unsupported.length > 0) {
        throw fieldError("update_mask", `These fields cannot be updated: ${unsupported.join(", ")}.`);
      }
      const updatablePaths = normalizedPaths.filter(isUpdatableBookPath);
      if (!request.book.etag || request.book.etag !== current.etag) {
        throw connectError(Code.FailedPrecondition, "This book changed. Refresh it before saving.");
      }
      if (updatablePaths.length === 0) {
        return clone(BookSchema, current);
      }
      const next = clone(BookSchema, current);
      for (const path of updatablePaths) {
        switch (path) {
          case "display_name":
            if (!request.book.displayName.trim()) {
              throw fieldError("book.display_name", "Enter a book title.");
            }
            next.displayName = request.book.displayName;
            break;
          case "note":
            next.note = request.book.note;
            break;
          default:
            throw new TypeError(`Unsupported update path: ${path satisfies never}`);
        }
      }
      next.etag = nextEtag();
      next.updateTime = timestampFromDate(new Date(now()));
      if (!request.validateOnly) {
        library.books.set(next.name, next);
      }
      return clone(BookSchema, next);
    },
  } satisfies ServiceImpl<typeof LibraryService>;
}

export const libraryService = createLibraryService();
