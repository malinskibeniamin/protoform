import { http } from "@buf/googleapis_googleapis.bufbuild_es/google/api/annotations_pb.js";
import { HttpRuleSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/api/http_pb.js";
import {
  OperationInfoSchema,
  OperationSchema,
  operation_info,
} from "@buf/googleapis_googleapis.bufbuild_es/google/longrunning/operations_pb.js";
import {
  create,
  type DescMessage,
  type DescMethod,
  setExtension,
} from "@bufbuild/protobuf";
import {
  MethodDescriptorProtoSchema,
  MethodOptionsSchema,
} from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";

import {
  BookSchema,
  CreateBookRequestSchema,
  DeleteBookRequestSchema,
  GetBookRequestSchema,
} from "../../../../../conformance/gen/protoform/conformance/v1/aip_pb.js";
import { FormExamplesService } from "../../../../../examples/gen/protoform/examples/v1/forms_pb.js";
import { getProtoMethodWorkflow } from "./method-workflow.js";

interface MethodFixture {
  body?: string;
  input: DescMessage;
  methodKind?: DescMethod["methodKind"];
  name: string;
  operation?: { metadataType: string; responseType: string };
  output?: DescMessage;
  path?: string;
  verb?: "delete" | "get" | "patch" | "post";
}

function createMethodFixture({
  body,
  input,
  methodKind = "unary",
  name,
  operation,
  output = BookSchema,
  path,
  verb,
}: MethodFixture): DescMethod {
  const options = create(MethodOptionsSchema);
  if (verb && path) {
    setExtension(
      options,
      http,
      create(HttpRuleSchema, {
        body,
        pattern: { case: verb, value: path },
      })
    );
  }
  if (operation) {
    setExtension(
      options,
      operation_info,
      create(OperationInfoSchema, operation)
    );
  }

  return {
    ...FormExamplesService.method.submitBasicForm,
    input,
    localName: `${name[0]?.toLowerCase()}${name.slice(1)}`,
    methodKind,
    name,
    output,
    proto: create(MethodDescriptorProtoSchema, {
      inputType: input.typeName,
      name,
      options,
      outputType: output.typeName,
      serverStreaming: methodKind === "server_streaming",
    }),
  };
}

describe("getProtoMethodWorkflow", () => {
  it("classifies standard unary methods and their path, query, and body fields", () => {
    const get = getProtoMethodWorkflow(
      createMethodFixture({
        input: GetBookRequestSchema,
        name: "GetBook",
        path: "/v1/{name=publishers/*/books/*}",
        verb: "get",
      })
    );
    const createBook = getProtoMethodWorkflow(
      createMethodFixture({
        body: "book",
        input: CreateBookRequestSchema,
        name: "CreateBook",
        path: "/v1/{parent=publishers/*}/books",
        verb: "post",
      })
    );
    const batchGet = getProtoMethodWorkflow(
      createMethodFixture({
        input: GetBookRequestSchema,
        name: "BatchGetBooks",
      })
    );

    expect(get).toMatchObject({
      category: "standard",
      execution: "unary",
      httpBindings: [
        {
          bodyFields: [],
          method: "GET",
          path: "/v1/{name=publishers/*/books/*}",
          pathFields: ["name"],
          queryFields: [],
        },
      ],
    });
    expect(createBook.httpBindings).toEqual([
      {
        bodyFields: ["book"],
        method: "POST",
        path: "/v1/{parent=publishers/*}/books",
        pathFields: ["parent"],
        queryFields: ["book_id", "request_id", "validate_only"],
      },
    ]);
    expect(batchGet.category).toBe("batch");
    expect(get.method.input).toBe(GetBookRequestSchema);
  });

  it("classifies custom long-running workflows and exposes operation types", () => {
    const workflow = getProtoMethodWorkflow(
      createMethodFixture({
        body: "*",
        input: DeleteBookRequestSchema,
        name: "ArchiveBook",
        operation: {
          metadataType: "ArchiveBookMetadata",
          responseType: "ArchiveBookResponse",
        },
        output: OperationSchema,
        path: "/v1/{name=publishers/*/books/*}:archive",
        verb: "post",
      })
    );

    expect(workflow).toMatchObject({
      category: "custom",
      execution: "long-running",
      operation: {
        metadataType: "ArchiveBookMetadata",
        responseType: "ArchiveBookResponse",
      },
    });
    expect(workflow.httpBindings[0]).toMatchObject({
      bodyFields: ["etag", "request_id", "validate_only"],
      pathFields: ["name"],
      queryFields: [],
    });
  });

  it("marks streaming RPCs as non-form workflows", () => {
    const workflow = getProtoMethodWorkflow(
      createMethodFixture({
        input: GetBookRequestSchema,
        methodKind: "server_streaming",
        name: "WatchBooks",
      })
    );

    expect(workflow).toMatchObject({
      category: "custom",
      execution: "streaming",
      httpBindings: [],
    });
  });
});
