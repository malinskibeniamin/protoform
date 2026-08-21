import { create, type DescMessage, fromJson } from "@bufbuild/protobuf";
import {
  anyPack,
  durationFromMs,
  ListValueSchema,
  StructSchema,
  timestampFromDate,
  ValueSchema,
} from "@bufbuild/protobuf/wkt";

import {
  BatchCreateBooksRequestSchema,
  BatchDeleteBooksRequestSchema,
  BatchGetBooksRequestSchema,
  BatchUpdateBooksRequestSchema,
  BookSchema,
  CommitPolicyExperimentRequestSchema,
  CreateBookRequestSchema,
  DeleteBookRequestSchema,
  ExportBooksRequestSchema,
  GetBookRequestSchema,
  ImportBooksRequestSchema,
  ListBooksRequestSchema,
  ProvisionCapacityRequestSchema,
  PurgeBooksRequestSchema,
  RunWriteBookJobRequestSchema,
  TimeRangeSchema,
  UndeleteBookRequestSchema,
  UpdateBookRequestSchema,
  UpdateProjectSettingsRequestSchema,
} from "../../conformance/gen/protoform/conformance/v1/aip_pb.js";
import {
  AnyMatrixSchema,
  CelRuleMatrixSchema,
  CollectionMatrixSchema,
  DynamicJsonMatrixSchema,
  IntegerRulesSchema,
  NumericMatrixSchema,
  PresenceMatrixSchema,
  RecursiveNodeSchema,
  StringNetworkRulesSchema,
  ValidationMatrixSchema,
  WellKnownRuleMatrixSchema,
} from "../../conformance/gen/protoform/conformance/v1/conformance_pb.js";
import { Editions2024MatrixSchema } from "../../conformance/gen/protoform/conformance/v1/editions_2024_pb.js";
import type { DemoSchemaKey } from "./demo-catalog.js";

export interface DemoSchema {
  defaultValues: Record<string, unknown>;
  schema: DescMessage;
}

const schemas = {
  any: AnyMatrixSchema,
  "batch-create": BatchCreateBooksRequestSchema,
  "batch-delete": BatchDeleteBooksRequestSchema,
  "batch-get": BatchGetBooksRequestSchema,
  "batch-update": BatchUpdateBooksRequestSchema,
  book: BookSchema,
  cel: CelRuleMatrixSchema,
  collections: CollectionMatrixSchema,
  "commit-policy": CommitPolicyExperimentRequestSchema,
  "create-book": CreateBookRequestSchema,
  "delete-book": DeleteBookRequestSchema,
  "dynamic-json": DynamicJsonMatrixSchema,
  editions: Editions2024MatrixSchema,
  "export-books": ExportBooksRequestSchema,
  "get-book": GetBookRequestSchema,
  "import-books": ImportBooksRequestSchema,
  integers: IntegerRulesSchema,
  "list-books": ListBooksRequestSchema,
  numeric: NumericMatrixSchema,
  presence: PresenceMatrixSchema,
  "provision-capacity": ProvisionCapacityRequestSchema,
  "purge-books": PurgeBooksRequestSchema,
  recursive: RecursiveNodeSchema,
  "run-job": RunWriteBookJobRequestSchema,
  "string-network": StringNetworkRulesSchema,
  "time-range": TimeRangeSchema,
  "undelete-book": UndeleteBookRequestSchema,
  "update-book": UpdateBookRequestSchema,
  "update-settings": UpdateProjectSettingsRequestSchema,
  validation: ValidationMatrixSchema,
  "well-known": WellKnownRuleMatrixSchema,
} satisfies Record<DemoSchemaKey, DescMessage>;

const validBook = {
  displayName: "The Protoform Guide",
  expiration: {
    case: "ttl",
    value: durationFromMs(86_400_000),
  },
  inputToken: "draft-token",
  isbn: "9783161484100",
  name: "publishers/acme/books/protoform-guide",
  note: "A focused compatibility demo.",
};

const validCreateBook = {
  book: validBook,
  bookId: "protoform-guide",
  parent: "publishers/acme",
  requestId: "123e4567-e89b-42d3-a456-426614174000",
  validateOnly: false,
};

const validDeleteBook = {
  etag: "W/guide-v3",
  name: "publishers/acme/books/protoform-guide",
  requestId: "123e4567-e89b-42d3-a456-426614174000",
  validateOnly: false,
};

const validUpdateBook = {
  book: validBook,
  requestId: "123e4567-e89b-42d3-a456-426614174000",
  updateMask: { paths: ["display_name", "note"] },
  validateOnly: false,
};

function buildDefaults(schemaKey: DemoSchemaKey): Record<string, unknown> {
  switch (schemaKey) {
    case "any":
      return {
        allowedPayload: {
          typeUrl: "type.googleapis.com/google.protobuf.Struct",
          valueBase64: "",
        },
      };
    case "batch-create":
      return {
        parent: "publishers/acme",
        requests: [validCreateBook],
      };
    case "batch-delete":
      return {
        parent: "publishers/acme",
        requests: [validDeleteBook],
      };
    case "batch-get":
      return {
        names: ["publishers/acme/books/protoform-guide", "publishers/acme/books/api-design"],
        parent: "publishers/acme",
      };
    case "batch-update":
      return {
        parent: "publishers/acme",
        requests: [validUpdateBook],
      };
    case "book":
      return validBook;
    case "cel":
      return {
        booleanValue: "ok",
        child: { name: "child-primary" },
        children: [{ name: "child-one" }, { name: "child-two" }],
        messageValue: "ok",
        secondMessageValue: "ok",
        stringValue: "ok",
      };
    case "collections":
      return {
        boolKeys: [{ key: true, value: "enabled" }],
        children: [{ name: "primary" }],
        flags: [true, false],
        identifiers: ["9007199254740993"],
        int32Keys: [{ key: 1, value: "one" }],
        ratios: [0.25, 0.75],
        statuses: [1, 2],
      };
    case "commit-policy":
      return {
        etag: "W/policy-v7",
        name: "projects/acme/locations/global/policies/default/experiments/canary",
        parentEtag: "W/policy-v6",
      };
    case "create-book":
      return validCreateBook;
    case "delete-book":
      return validDeleteBook;
    case "dynamic-json": {
      const objectValue = fromJson(StructSchema, {
        enabled: true,
        theme: "dark",
      });

      return {
        anyValue: anyPack(StructSchema, objectValue),
        listValue: fromJson(ListValueSchema, ["overview", 3, true]),
        objectValue,
        scalarOrNestedValue: fromJson(ValueSchema, {
          rollout: "canary",
        }),
      };
    }
    case "editions":
      return {
        displayName: "Protoform Editions 2024",
      };
    case "export-books":
      return {
        destination: {
          case: "cloudStorageDestination",
          value: { uri: "gs://protoform-demos/books.ndjson" },
        },
        filter: "state = ACTIVE",
        parent: "publishers/acme",
      };
    case "get-book":
      return { name: "publishers/acme/books/protoform-guide" };
    case "import-books":
      return {
        isbnPrefix: "978",
        parent: "publishers/acme",
        source: {
          case: "cloudStorageSource",
          value: { uri: "gs://protoform-demos/books.ndjson" },
        },
      };
    case "integers":
      return {
        fixed32Allowed: 7,
        fixed32Const: 7,
        fixed32Denied: 7,
        fixed32Range: 7,
        fixed64Allowed: "7",
        fixed64Const: "7",
        fixed64Denied: "7",
        fixed64Range: "7",
        int32Allowed: 7,
        int32Const: 7,
        int32Denied: 7,
        int32Range: 7,
        int64Allowed: "7",
        int64Const: "7",
        int64Denied: "7",
        int64Range: "7",
        sfixed32Allowed: 7,
        sfixed32Const: 7,
        sfixed32Denied: 7,
        sfixed32Range: 7,
        sfixed64Allowed: "7",
        sfixed64Const: "7",
        sfixed64Denied: "7",
        sfixed64Range: "7",
        sint32Allowed: 7,
        sint32Const: 7,
        sint32Denied: 7,
        sint32Range: 7,
        sint64Allowed: "7",
        sint64Const: "7",
        sint64Denied: "7",
        sint64Range: "7",
        uint32Allowed: 7,
        uint32Const: 7,
        uint32Denied: 7,
        uint32Range: 7,
        uint64Allowed: "7",
        uint64Const: "7",
        uint64Denied: "7",
        uint64Range: "7",
      };
    case "list-books":
      return {
        filter: "state = ACTIVE",
        orderBy: "display_name",
        pageSize: 25,
        pageToken: "",
        parent: "publishers/acme",
        returnPartialSuccess: false,
      };
    case "numeric":
      return {
        doubleValue: 99.95,
        enabled: true,
        fixed32Value: 42,
        fixed64Value: "9007199254740993",
        floatValue: 0.75,
        int32Value: -12,
        sfixed32Value: -24,
        sfixed64Value: "-9007199254740993",
        sint32Value: -6,
        sint64Value: "-9007199254740992",
        uint32Value: 24,
      };
    case "presence":
      return {
        approved: false,
        bytesWrapper: "cHJvdG9mb3Jt",
        child: { name: "primary" },
        doubleWrapper: 3.14,
        floatWrapper: 0.75,
        int64Wrapper: "9007199254740993",
        optionalEnabled: true,
        selection: { case: "label", value: "present" },
        uint32Wrapper: 42,
        uint64Wrapper: "9007199254740994",
      };
    case "provision-capacity":
      return {
        currencyCode: "GBP",
        languageCode: "en-GB",
        regionCode: "GB",
        replicaCount: 3,
        storageGibibytes: "64",
        timeZone: "Europe/London",
      };
    case "purge-books":
      return {
        filter: "state = DELETED",
        force: false,
        parent: "publishers/acme",
      };
    case "recursive":
      return {
        child: { name: "child" },
        children: [{ name: "first" }],
        name: "root",
      };
    case "run-job":
      return { name: "publishers/acme/writeBookJobs/nightly" };
    case "string-network":
      return {
        address: "example.com:443",
        hostAndPort: "example.com:443",
        hostname: "protoform.dev",
        ip: "192.0.2.1",
        ipPrefix: "192.0.2.0/24",
        ipv4: "192.0.2.1",
        ipv4Prefix: "192.0.2.0/24",
        ipv4WithPrefixLength: "192.0.2.1/24",
        ipv6: "2001:db8::1",
        ipv6Prefix: "2001:db8::/32",
        ipv6WithPrefixLength: "2001:db8::1/32",
        ipWithPrefixLength: "192.0.2.1/24",
        protobufDotFqn: ".protoform.example.v1.Book",
        protobufFqn: "protoform.example.v1.Book",
        ulid: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
        uriReference: "/docs/examples",
      };
    case "time-range":
      return {
        endTime: timestampFromDate(new Date("2026-08-01T12:00:00Z")),
        startTime: timestampFromDate(new Date("2026-08-01T10:00:00Z")),
      };
    case "undelete-book":
      return { name: "publishers/acme/books/protoform-guide" };
    case "update-book":
      return validUpdateBook;
    case "update-settings":
      return {
        projectSettings: {
          name: "projects/acme/settings",
          theme: "system",
        },
        updateMask: { paths: ["theme"] },
      };
    case "validation":
      return {
        allowedStatus: 2,
        allowedText: "alpha",
        blockedStatus: 1,
        blockedText: "safe",
        byteLength: "éé",
        children: [{ name: "same" }],
        codePointLength: "éé",
        constStatus: 1,
        containingText: "has-middle-value",
        definedStatus: 1,
        email: "forms@protoform.dev",
        exactText: "protoform",
        labels: [{ key: "team", value: "forms" }],
        mustBeFalse: false,
        mustBeTrue: true,
        patternedText: "lowercase",
        prefixedText: "pre-value",
        suffixedText: "value-post",
        tags: ["forms"],
        tuuid: "123e4567e89b12d3a456426614174000",
        uuid: "123e4567-e89b-12d3-a456-426614174000",
      };
    case "well-known":
      return {
        allowedDuration: durationFromMs(5000),
        allowedMask: { paths: ["display_name"] },
        boundedDuration: durationFromMs(5000),
        boundedTimestamp: timestampFromDate(new Date("2030-01-01T12:00:00Z")),
        deniedDuration: durationFromMs(6000),
        deniedMask: { paths: ["display_name"] },
        exactDuration: durationFromMs(5000),
        exactMask: { paths: ["display_name"] },
        exactTimestamp: timestampFromDate(new Date("2030-01-01T00:00:00Z")),
      };
    default:
      return schemaKey satisfies never;
  }
}

export function getDemoSchema(schemaKey: DemoSchemaKey): DemoSchema {
  const schema = schemas[schemaKey];

  return {
    defaultValues: create(schema, buildDefaults(schemaKey)),
    schema,
  };
}
