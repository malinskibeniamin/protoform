import { create } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { createValidator } from "@bufbuild/protovalidate";
import { describe, expect, it } from "@rstest/core";

import {
  KitchenSinkEnvironment,
  type SubmitKitchenSinkFormRequest,
  SubmitKitchenSinkFormRequestSchema,
} from "../gen/protoform/examples/v1/forms_pb.js";

function buildValidRequest() {
  return create(SubmitKitchenSinkFormRequestSchema, {
    acknowledgeRisk: true,
    approvalTicket: "CHG-123456",
    changedFields: { paths: ["services", "rollout_percentages"] },
    dryRun: false,
    environment: KitchenSinkEnvironment.PRODUCTION,
    estimatedEventsPerDay: 10_000_000n,
    labels: {
      "data-classification": "restricted",
      owner: "platform-team",
    },
    maxDowntime: { seconds: 300n },
    monthlyBudget: 4800,
    notification: {
      case: "notificationWebhook",
      value: "https://hooks.example.com/deployments",
    },
    organizationSlug: "northstar-platform",
    policyContext: {
      changeFreeze: false,
      source: "kitchen-sink",
    },
    rateLimits: { api: 1000, worker: 250 },
    regions: ["eu-west1", "us-central1"],
    rolloutPercentages: [5, 25, 50, 100],
    services: [
      {
        dependencies: ["worker"],
        healthPath: "/ready",
        monthlyCostPerReplica: 400,
        name: "api",
        primaryRegion: "eu-west1",
        publicEndpoint: true,
        replicas: 3,
      },
      {
        healthPath: "/healthz",
        monthlyCostPerReplica: 250,
        name: "worker",
        primaryRegion: "us-central1",
        replicas: 3,
      },
    ],
    windowEnd: timestampFromDate(new Date("2026-08-01T12:00:00Z")),
    windowStart: timestampFromDate(new Date("2026-08-01T10:00:00Z")),
  });
}

describe("kitchen-sink CEL contract", () => {
  it("accepts a request that satisfies every cross-collection policy", () => {
    const result = createValidator().validate(SubmitKitchenSinkFormRequestSchema, buildValidRequest());

    expect(
      result.kind,
      result.kind === "invalid"
        ? result.violations.map((violation) => `${violation.ruleId}: ${violation.message}`).join("\n")
        : result.error?.message
    ).toBe("valid");
  });

  it.each<{
    expectedMessage: string;
    expectedRule: string;
    mutate: (request: SubmitKitchenSinkFormRequest) => void;
    name: string;
  }>([
    {
      expectedMessage: "Services, dependencies, regions, and rate limits must form one valid deployment graph.",
      expectedRule: "kitchen_sink.graph.integrity",
      mutate: (request) => {
        const worker = request.services.find((service) => service.name === "worker");
        if (!worker) {
          throw new Error("Expected the worker fixture.");
        }
        worker.dependencies = ["api"];
      },
      name: "a direct service dependency cycle",
    },
    {
      expectedMessage:
        "Production requires two regions, three replicas per service, an owner label, a change ticket, and risk acknowledgement.",
      expectedRule: "kitchen_sink.production.policy",
      mutate: (request) => {
        request.acknowledgeRisk = false;
      },
      name: "an incomplete production approval",
    },
    {
      expectedMessage: "Each service must fit within an equal share of the monthly budget.",
      expectedRule: "kitchen_sink.budget.envelope",
      mutate: (request) => {
        request.monthlyBudget = 1000;
      },
      name: "an over-budget service allocation",
    },
    {
      expectedMessage: "The change window must include both timestamps, run forward, and last no more than four hours.",
      expectedRule: "kitchen_sink.change.window",
      mutate: (request) => {
        request.windowEnd = timestampFromDate(new Date("2026-08-01T09:00:00Z"));
      },
      name: "a backwards change window",
    },
    {
      expectedMessage:
        "Live public deployments require a webhook; other live deployments require one notification route.",
      expectedRule: "kitchen_sink.notification.routing",
      mutate: (request) => {
        request.notification = { case: undefined };
      },
      name: "a missing live-deployment notification",
    },
    {
      expectedMessage: "The rollout must begin at 5%.",
      expectedRule: "kitchen_sink.rollout.sequence",
      mutate: (request) => {
        request.rolloutPercentages = [25, 100];
      },
      name: "an invalid progressive rollout sequence",
    },
  ])("rejects $name", ({ expectedMessage, expectedRule, mutate }) => {
    const request = buildValidRequest();
    mutate(request);

    const result = createValidator().validate(SubmitKitchenSinkFormRequestSchema, request);

    expect(result.kind).toBe("invalid");
    if (result.kind !== "invalid") {
      throw new Error(`Expected invalid, received ${result.kind}.`);
    }
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expectedMessage,
          ruleId: expectedRule,
        }),
      ])
    );
  });
});
