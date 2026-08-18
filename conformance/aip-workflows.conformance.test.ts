// @vitest-environment node

import { FieldBehavior } from "@buf/googleapis_googleapis.bufbuild_es/google/api/field_behavior_pb.js";
import { create, type DescMessage } from "@bufbuild/protobuf";
import { describe, expect, it } from "vitest";
import {
  getProtoPartialResult,
  getProtoPolicyPreviewPlan,
  getProtoPurgePlan,
} from "../registry/base-nova/protoform/lib/protobuf-provider/aip-client-workflow.js";
import {
  createProtoFormSchema,
  getProtoFieldBehaviors,
  getProtoFieldCustomData,
  getProtoResourceMetadata,
  parseProtoSchema,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import {
  CommitPolicyExperimentRequestSchema,
  CreateWriteBookJobRequestSchema,
  ExportBooksRequestSchema,
  ImportBooksMetadataSchema,
  ImportBooksRequestSchema,
  ListBooksRequestSchema,
  ListBooksResponseSchema,
  PolicyExperimentSchema,
  PurgeBooksRequestSchema,
  PurgeBooksResponseSchema,
  RunWriteBookJobRequestSchema,
  StartPreviewPolicyExperimentRequestSchema,
  StopPreviewPolicyExperimentRequestSchema,
  WriteBookJobSchema,
} from "./gen/protoform/conformance/v1/aip_pb.js";

function field(schema: ReturnType<typeof parseProtoSchema>, key: string) {
  const match = schema.fields.find((candidate) => candidate.key === key);
  if (!match) {
    throw new Error(`Missing ${key}.`);
  }
  return match;
}

async function issues(schema: DescMessage, values: Record<string, unknown>) {
  return (await createProtoFormSchema(schema)["~standard"].validate(values)).issues;
}

describe("AIP workflow form conformance", () => {
  it("models AIP-152 Job configuration and Run request forms", () => {
    expect(getProtoResourceMetadata(WriteBookJobSchema)).toMatchObject({
      patterns: ["publishers/{publisher}/writeBookJobs/{write_book_job}"],
      type: "library.protoform.dev/WriteBookJob",
    });
    expect(parseProtoSchema(CreateWriteBookJobRequestSchema).fields.map((candidate) => candidate.key)).toEqual([
      "parent",
      "writeBookJob",
      "writeBookJobId",
    ]);
    expect(parseProtoSchema(RunWriteBookJobRequestSchema).fields).toMatchObject([{ key: "name", required: true }]);
  });

  it("models AIP-153 import and export source choices plus partial failures", async () => {
    const importSchema = parseProtoSchema(ImportBooksRequestSchema);
    const exportSchema = parseProtoSchema(ExportBooksRequestSchema);

    expect(field(importSchema, "source")).toMatchObject({
      required: true,
      type: "oneof",
    });
    expect(field(importSchema, "source").schema?.map(({ key }) => key)).toEqual(["cloudStorageSource", "inlineSource"]);
    expect(field(exportSchema, "destination").schema?.map(({ key }) => key)).toEqual([
      "cloudStorageDestination",
      "archiveDestination",
    ]);
    expect(getProtoFieldCustomData(field(parseProtoSchema(ImportBooksMetadataSchema), "partialFailures"))?.hidden).toBe(
      true
    );
    expect(
      await issues(ImportBooksRequestSchema, {
        parent: "publishers/acme",
      })
    ).toBeDefined();
    expect(
      await issues(ImportBooksRequestSchema, {
        parent: "publishers/acme",
        source: {
          case: "cloudStorageSource",
          value: { uri: "gs://imports/books.ndjson" },
        },
      })
    ).toBeUndefined();
  });

  it("enforces AIP-159 cross-collection and AIP-217 partial-result controls", async () => {
    expect(parseProtoSchema(ListBooksRequestSchema).fields.map(({ key }) => key)).toEqual([
      "parent",
      "pageSize",
      "pageToken",
      "filter",
      "orderBy",
      "returnPartialSuccess",
      "showDeleted",
    ]);
    expect(
      await issues(ListBooksRequestSchema, {
        filter: "state=ACTIVE",
        parent: "publishers/-",
        returnPartialSuccess: true,
      })
    ).toBeUndefined();
    expect(
      await issues(ListBooksRequestSchema, {
        orderBy: "display_name",
        parent: "publishers/-",
      })
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "order by is unavailable when reading across collections",
        }),
      ])
    );
    expect(
      await issues(ListBooksRequestSchema, {
        parent: "publishers/acme",
        returnPartialSuccess: true,
      })
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "partial success is available only when reading across collections",
        }),
      ])
    );

    expect(getProtoFieldBehaviors(ListBooksResponseSchema.field.unreachable)).toContain(FieldBehavior.UNORDERED_LIST);
    expect(
      getProtoPartialResult(
        create(ListBooksResponseSchema, {
          unreachable: ["publishers/unavailable"],
        })
      )
    ).toMatchObject({
      complete: false,
      recovery: [
        {
          label: "Retry unavailable",
          resourceName: "publishers/unavailable",
        },
      ],
    });
  });

  it("models the AIP-165 purge preview and destructive confirmation", async () => {
    const request = parseProtoSchema(PurgeBooksRequestSchema);
    expect(request.fields).toMatchObject([
      { key: "parent", required: true },
      { key: "filter", required: true },
      { key: "force", required: false },
    ]);
    expect(await issues(PurgeBooksRequestSchema, { parent: "publishers/acme" })).toBeDefined();
    expect(
      getProtoPurgePlan(
        { filter: "state=DELETED", force: false },
        create(PurgeBooksResponseSchema, {
          purgeCount: 1,
          purgeSample: ["publishers/acme/books/old"],
        })
      )
    ).toMatchObject({
      confirmationRequired: false,
      mode: "preview",
      sample: ["publishers/acme/books/old"],
    });
  });

  it("models AIP-236 policy experiments and distinguishes preview from commit", async () => {
    const experiment = parseProtoSchema(PolicyExperimentSchema);
    expect(field(experiment, "policy").required).toBe(true);
    expect(getProtoFieldCustomData(field(experiment, "previewMetadata"))?.hidden).toBe(true);
    expect(field(experiment, "annotations").type).toBe("map");
    for (const schema of [StartPreviewPolicyExperimentRequestSchema, StopPreviewPolicyExperimentRequestSchema]) {
      expect(parseProtoSchema(schema).fields).toMatchObject([{ key: "name", required: true }]);
    }
    expect(parseProtoSchema(CommitPolicyExperimentRequestSchema).fields).toMatchObject([
      { key: "name", required: true },
      { key: "etag", required: true },
      { key: "parentEtag", required: false },
    ]);
    expect(
      await issues(CommitPolicyExperimentRequestSchema, {
        name: "projects/p/locations/l/policies/x/experiments/e",
      })
    ).toBeDefined();
    expect(getProtoPolicyPreviewPlan("start-preview")).toMatchObject({
      confirmationRequired: false,
      enforcesPolicy: false,
    });
    expect(getProtoPolicyPreviewPlan("commit")).toMatchObject({
      confirmationRequired: true,
      enforcesPolicy: true,
    });
  });
});
