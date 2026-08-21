// @rstest-environment node

import { method_signature } from "@buf/googleapis_googleapis.bufbuild_es/google/api/client_pb.js";
import { FieldBehavior } from "@buf/googleapis_googleapis.bufbuild_es/google/api/field_behavior_pb.js";
import { create, getExtension } from "@bufbuild/protobuf";
import { MethodOptionsSchema } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "@rstest/core";

import {
  getProtoFieldBehaviors,
  getProtoFieldCustomData,
  getProtoResourceMetadata,
  getProtoResourceReference,
  isSingletonProtoResource,
  parseProtoSchema,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import { getProtoMethodWorkflow } from "../registry/base-nova/protoform/lib/protobuf-provider/method-workflow.js";
import {
  BatchCreateBooksRequestSchema,
  BatchCreateBooksResponseSchema,
  BatchDeleteBooksRequestSchema,
  BatchDeleteBooksResponseSchema,
  BatchGetBooksRequestSchema,
  BatchGetBooksResponseSchema,
  BatchUpdateBooksRequestSchema,
  BatchUpdateBooksResponseSchema,
  BookRevisionSchema,
  BookSchema,
  BookState,
  CreateBookRequestSchema,
  DeleteBookRequestSchema,
  GetBookRequestSchema,
  GetProjectSettingsRequestSchema,
  LibraryService,
  ListBooksRequestSchema,
  ListBooksResponseSchema,
  ProjectSettingsSchema,
  UndeleteBookRequestSchema,
  UpdateBookRequestSchema,
  UpdateProjectSettingsRequestSchema,
} from "./gen/protoform/conformance/v1/aip_pb.js";

function field(schema: ReturnType<typeof parseProtoSchema>, key: string) {
  const match = schema.fields.find((candidate) => candidate.key === key);
  if (!match) {
    throw new Error(`Missing ${key}.`);
  }
  return match;
}

describe("Google AIP form conformance", () => {
  it("publishes current standard and soft-delete HTTP contracts", () => {
    const contracts = Object.fromEntries(
      Object.entries(LibraryService.method).map(([name, method]) => {
        const workflow = getProtoMethodWorkflow(method);
        const [binding] = workflow.httpBindings;
        return [
          name,
          {
            bodyFields: binding?.bodyFields ?? [],
            httpMethod: binding?.method,
            outputType: method.output.typeName,
            path: binding?.path,
          },
        ];
      })
    );
    const signatures = Object.fromEntries(
      Object.entries(LibraryService.method).map(([name, method]) => [
        name,
        getExtension(method.proto.options ?? create(MethodOptionsSchema), method_signature),
      ])
    );

    expect(contracts).toEqual({
      createBook: {
        bodyFields: ["book"],
        httpMethod: "POST",
        outputType: "protoform.conformance.v1.Book",
        path: "/v1/{parent=publishers/*}/books",
      },
      deleteBook: {
        bodyFields: [],
        httpMethod: "DELETE",
        outputType: "protoform.conformance.v1.Book",
        path: "/v1/{name=publishers/*/books/*}",
      },
      expungeBook: {
        bodyFields: [],
        httpMethod: "POST",
        outputType: "google.protobuf.Empty",
        path: "/v1/{name=publishers/*/books/*}:expunge",
      },
      getBook: {
        bodyFields: [],
        httpMethod: "GET",
        outputType: "protoform.conformance.v1.Book",
        path: "/v1/{name=publishers/*/books/*}",
      },
      listBooks: {
        bodyFields: [],
        httpMethod: "GET",
        outputType: "protoform.conformance.v1.ListBooksResponse",
        path: "/v1/{parent=publishers/*}/books",
      },
      undeleteBook: {
        bodyFields: [],
        httpMethod: "POST",
        outputType: "protoform.conformance.v1.Book",
        path: "/v1/{name=publishers/*/books/*}:undelete",
      },
      updateBook: {
        bodyFields: ["book"],
        httpMethod: "PATCH",
        outputType: "protoform.conformance.v1.Book",
        path: "/v1/{book.name=publishers/*/books/*}",
      },
    });
    expect(signatures).toEqual({
      createBook: ["parent,book,book_id"],
      deleteBook: ["name"],
      expungeBook: ["name"],
      getBook: ["name"],
      listBooks: ["parent"],
      undeleteBook: ["name"],
      updateBook: ["book,update_mask"],
    });
  });

  it("parses AIP-121/123 resource type, pattern, singular, and plural metadata", () => {
    expect(getProtoResourceMetadata(BookSchema)).toEqual({
      nameField: "name",
      patterns: ["publishers/{publisher}/books/{book}"],
      plural: "books",
      singular: "book",
      type: "library.protoform.dev/Book",
    });
  });

  it("keeps AIP-122 full resource names distinct from display names and create IDs", () => {
    const book = parseProtoSchema(BookSchema);
    const createBook = parseProtoSchema(CreateBookRequestSchema);

    expect(book.fields.map((candidate) => candidate.key)).toEqual(expect.arrayContaining(["name", "displayName"]));
    expect(createBook.fields.map((candidate) => candidate.key)).toEqual([
      "parent",
      "book",
      "bookId",
      "requestId",
      "validateOnly",
    ]);
    expect(getProtoResourceReference(GetBookRequestSchema.field.name)).toEqual({
      childType: undefined,
      type: "library.protoform.dev/Book",
    });
  });

  it("preserves AIP-124 parent and resource associations on request fields", () => {
    expect(getProtoResourceReference(CreateBookRequestSchema.field.parent)?.childType).toBe(
      "library.protoform.dev/Book"
    );
    expect(getProtoResourceReference(GetBookRequestSchema.field.name)?.type).toBe("library.protoform.dev/Book");
  });

  it("keeps AIP-185 API versions in the protobuf package", () => {
    expect(BookSchema.typeName).toBe("protoform.conformance.v1.Book");
  });

  it("treats AIP-148 canonical identity, display, and lifecycle fields correctly", () => {
    const parsed = parseProtoSchema(BookSchema);

    expect(field(parsed, "name").required).toBe(false);
    expect(field(parsed, "displayName").required).toBe(true);
    for (const key of ["uid", "createTime", "updateTime", "deleteTime"]) {
      expect(getProtoFieldCustomData(field(parsed, key))?.hidden).toBe(true);
    }
  });

  it("models AIP-214 expiration choices and keeps the AIP-216 state server-owned", () => {
    const parsed = parseProtoSchema(BookSchema);
    const expiration = field(parsed, "expiration");

    expect(expiration).toMatchObject({
      required: false,
      type: "oneof",
    });
    expect(expiration.schema?.map((candidate) => candidate.key)).toEqual(["expireTime", "ttl"]);
    expect(getProtoFieldCustomData(field({ fields: expiration.schema ?? [] }, "ttl"))?.inputOnly).toBe(true);
    expect(getProtoFieldCustomData(field(parsed, "state"))?.hidden).toBe(true);
  });

  it("models AIP-164 soft delete lifecycle fields and undelete identity", () => {
    const book = parseProtoSchema(BookSchema);
    const undelete = parseProtoSchema(UndeleteBookRequestSchema);

    expect(getProtoFieldCustomData(field(book, "deleteTime"))?.hidden).toBe(true);
    expect(getProtoFieldCustomData(field(book, "purgeTime"))?.hidden).toBe(true);
    expect(BookState.DELETED).toBe(3);
    expect(undelete.fields).toMatchObject([{ key: "name", required: true }]);
    expect(getProtoResourceReference(UndeleteBookRequestSchema.field.name)?.type).toBe("library.protoform.dev/Book");
  });

  it("models AIP-162 revisions as nested, server-produced snapshot resources", () => {
    const revision = parseProtoSchema(BookRevisionSchema);

    expect(getProtoResourceMetadata(BookRevisionSchema)).toEqual({
      nameField: "name",
      patterns: ["publishers/{publisher}/books/{book}/revisions/{revision}"],
      plural: "bookRevisions",
      singular: "bookRevision",
      type: "library.protoform.dev/BookRevision",
    });
    expect(getProtoFieldCustomData(field(revision, "snapshot"))?.hidden).toBe(true);
    expect(getProtoFieldCustomData(field(revision, "createTime"))?.hidden).toBe(true);
  });

  it("applies AIP-203 REQUIRED, OPTIONAL, IDENTIFIER, OUTPUT_ONLY, IMMUTABLE, and INPUT_ONLY in create and update forms", () => {
    const createBook = field(parseProtoSchema(CreateBookRequestSchema), "book");
    const updateBook = field(parseProtoSchema(UpdateBookRequestSchema), "book");
    const createFields = { fields: createBook.schema ?? [] };
    const updateFields = { fields: updateBook.schema ?? [] };

    expect(getProtoFieldBehaviors(BookSchema.field.name)).toEqual([FieldBehavior.IDENTIFIER]);
    expect(getProtoFieldCustomData(field(createFields, "name"))?.hidden).toBe(true);
    expect(field(createFields, "displayName").required).toBe(true);
    expect(getProtoFieldCustomData(field(createFields, "isbn"))?.immutable).toBe(false);
    expect(getProtoFieldCustomData(field(createFields, "inputToken"))?.inputOnly).toBe(true);
    expect(field(createFields, "note").required).toBe(false);
    expect(getProtoFieldCustomData(field(updateFields, "name"))?.immutable).toBe(true);
    expect(field(updateFields, "name").required).toBe(true);
    expect(getProtoFieldCustomData(field(updateFields, "isbn"))?.immutable).toBe(true);
    expect(getProtoFieldCustomData(field(updateFields, "uid"))?.hidden).toBe(true);

    for (const method of Object.values(LibraryService.method)) {
      for (const requestField of method.input.fields) {
        expect(
          getProtoFieldBehaviors(requestField).some((behavior) =>
            [FieldBehavior.OPTIONAL, FieldBehavior.OUTPUT_ONLY, FieldBehavior.REQUIRED].includes(behavior)
          ),
          `${method.name}.${requestField.name} needs explicit request behavior`
        ).toBe(true);
      }
    }
  });

  it("models AIP-133 Create with parent, body, resource ID, and no body name input", () => {
    const parsed = parseProtoSchema(CreateBookRequestSchema);
    const book = field(parsed, "book");

    expect(parsed.fields.map((candidate) => candidate.key)).toEqual([
      "parent",
      "book",
      "bookId",
      "requestId",
      "validateOnly",
    ]);
    expect(parsed.fields.slice(0, 3).every((candidate) => candidate.required)).toBe(true);
    expect(getProtoFieldCustomData(field({ fields: book.schema ?? [] }, "name"))?.hidden).toBe(true);
  });

  it("models AIP-155 request IDs and AIP-163 validation previews as optional mutation controls", () => {
    for (const schema of [CreateBookRequestSchema, UpdateBookRequestSchema, DeleteBookRequestSchema]) {
      const parsed = parseProtoSchema(schema);

      expect(field(parsed, "requestId").required).toBe(false);
      expect(field(parsed, "validateOnly").required).toBe(false);
    }
  });

  it("models AIP-131 Get as a field-1 full resource name with a matching reference", () => {
    const parsed = parseProtoSchema(GetBookRequestSchema);

    expect(parsed.fields).toHaveLength(1);
    expect(field(parsed, "name")).toMatchObject({
      key: "name",
      required: true,
    });
    expect(GetBookRequestSchema.field.name.number).toBe(1);
    expect(getProtoResourceReference(GetBookRequestSchema.field.name)?.type).toBe("library.protoform.dev/Book");
  });

  it("models AIP-132/158/160 List request and response fields without interpreting opaque values", () => {
    expect(parseProtoSchema(ListBooksRequestSchema).fields.map((candidate) => candidate.key)).toEqual([
      "parent",
      "pageSize",
      "pageToken",
      "filter",
      "orderBy",
      "returnPartialSuccess",
      "showDeleted",
    ]);
    expect(parseProtoSchema(ListBooksResponseSchema).fields.map((candidate) => candidate.key)).toEqual([
      "books",
      "nextPageToken",
      "unreachable",
    ]);
  });

  it("models AIP-231/233/234/235 batch request and response envelopes", () => {
    expect(parseProtoSchema(BatchGetBooksRequestSchema).fields).toMatchObject([
      { key: "parent", required: false },
      { key: "names", required: true },
    ]);
    expect(parseProtoSchema(BatchCreateBooksRequestSchema).fields.map((candidate) => candidate.key)).toEqual([
      "parent",
      "requests",
    ]);
    expect(parseProtoSchema(BatchUpdateBooksRequestSchema).fields.map((candidate) => candidate.key)).toEqual([
      "parent",
      "requests",
    ]);
    expect(parseProtoSchema(BatchDeleteBooksRequestSchema).fields.map((candidate) => candidate.key)).toEqual([
      "parent",
      "requests",
    ]);

    for (const schema of [
      BatchGetBooksResponseSchema,
      BatchCreateBooksResponseSchema,
      BatchUpdateBooksResponseSchema,
      BatchDeleteBooksResponseSchema,
    ]) {
      expect(parseProtoSchema(schema).fields.map((candidate) => candidate.key)).toEqual(["books"]);
    }
  });

  it("models AIP-135/154 Delete with full name and optional etag", () => {
    const parsed = parseProtoSchema(DeleteBookRequestSchema);

    expect(parsed.fields.map((candidate) => candidate.key)).toEqual([
      "name",
      "etag",
      "requestId",
      "validateOnly",
      "force",
      "allowMissing",
    ]);
    expect(field(parsed, "name").required).toBe(true);
    expect(field(parsed, "etag").required).toBe(false);
  });

  it("keeps AIP-134 update masks optional", () => {
    expect(field(parseProtoSchema(UpdateBookRequestSchema), "updateMask")).toMatchObject({ required: false });
    expect(field(parseProtoSchema(UpdateProjectSettingsRequestSchema), "updateMask")).toMatchObject({
      required: false,
    });
  });

  it("recognizes AIP-156 singleton resources and their Get/Update-only shapes", () => {
    expect(isSingletonProtoResource(ProjectSettingsSchema)).toBe(true);
    expect(parseProtoSchema(GetProjectSettingsRequestSchema).fields.map((candidate) => candidate.key)).toEqual([
      "name",
    ]);
    expect(parseProtoSchema(UpdateProjectSettingsRequestSchema).fields.map((candidate) => candidate.key)).toEqual([
      "projectSettings",
      "updateMask",
    ]);
  });
});
