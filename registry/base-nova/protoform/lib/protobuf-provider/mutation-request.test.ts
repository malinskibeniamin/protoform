import { create } from "@bufbuild/protobuf";
import { FieldMaskSchema } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "@rstest/core";

import { BookSchema, LibraryService } from "../../../../../conformance/gen/protoform/conformance/v1/aip_pb.js";
import { composeCreateRequest, composeDeleteRequest, composeUpdateRequest } from "./mutation-request.js";

describe("descriptor-driven mutation request composers", () => {
  const book = create(BookSchema, {
    displayName: "Domain Modeling",
    etag: "etag-1",
    name: "publishers/acme/books/domain-modeling",
  });

  it("composes standard create request controls around a resource", () => {
    const request = composeCreateRequest(LibraryService.method.createBook, {
      parent: "publishers/acme",
      requestId: "00000000-0000-4000-8000-000000000001",
      resource: book,
      resourceId: "domain-modeling",
      validateOnly: true,
    });

    expect(request).toMatchObject({
      book,
      bookId: "domain-modeling",
      parent: "publishers/acme",
      requestId: "00000000-0000-4000-8000-000000000001",
      validateOnly: true,
    });
  });

  it("composes update and delete controls without performing an RPC", () => {
    const updateMask = create(FieldMaskSchema, { paths: ["display_name"] });

    expect(
      composeUpdateRequest(LibraryService.method.updateBook, {
        requestId: "00000000-0000-4000-8000-000000000002",
        resource: book,
        updateMask,
      })
    ).toMatchObject({ book, requestId: "00000000-0000-4000-8000-000000000002", updateMask });

    expect(
      composeDeleteRequest(LibraryService.method.deleteBook, {
        etag: book.etag,
        name: book.name,
        validateOnly: true,
      })
    ).toMatchObject({ etag: "etag-1", name: book.name, validateOnly: true });
  });

  it("rejects a descriptor whose standard method shape is ambiguous", () => {
    expect(() =>
      composeDeleteRequest(LibraryService.method.getBook, {
        name: book.name,
      })
    ).toThrow(/expected Delete/i);
  });
});
