"use client";

import { create, isMessage } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import React from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base-nova/protoform/components/alert";
import {
  AutoForm,
  type AutoFormStep,
} from "@/registry/base-nova/protoform/components/auto-form";
import {
  Heading,
  Text,
} from "@/registry/base-nova/protoform/components/typography";

import {
  KitchenSinkEnvironment,
  type SubmitKitchenSinkFormRequest,
  SubmitKitchenSinkFormRequestSchema,
} from "../gen/protoform/examples/v1/forms_pb.js";

export const client = "only";

const steps: AutoFormStep[] = [
  {
    description: "Set ownership, environment, and 64-bit traffic scale.",
    id: "identity",
    title: "Identity",
  },
  {
    description: "Model regions, services, dependencies, and endpoints.",
    id: "topology",
    title: "Topology",
  },
  {
    description:
      "Apply labels, rate limits, budget, and dynamic policy context.",
    id: "policy",
    title: "Policy",
  },
  {
    description: "Define rollout stages, change window, and downtime.",
    id: "rollout",
    title: "Rollout",
  },
  {
    description: "Confirm approval, notifications, and changed fields.",
    id: "review",
    title: "Review",
  },
];

const defaultValues = create(SubmitKitchenSinkFormRequestSchema, {
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

function KitchenSinkSummary({ payload }: { payload: unknown }) {
  if (!isMessage(payload, SubmitKitchenSinkFormRequestSchema)) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-2xl border bg-background p-5 shadow-xs">
      <Heading level={3}>Policy summary</Heading>
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <Text className="text-muted-foreground" variant="small">
            Regions
          </Text>
          <p className="font-medium">{payload.regions.length}</p>
        </div>
        <div>
          <Text className="text-muted-foreground" variant="small">
            Services
          </Text>
          <p className="font-medium">{payload.services.length}</p>
        </div>
        <div>
          <Text className="text-muted-foreground" variant="small">
            Rollout stages
          </Text>
          <p className="font-medium">
            {payload.rolloutPercentages.join(" → ")}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default function KitchenSinkFormExample() {
  const [acceptedOrganization, setAcceptedOrganization] =
    React.useState<string>();

  return (
    <div className="space-y-6">
      <AutoForm<SubmitKitchenSinkFormRequest>
        defaultValues={defaultValues}
        formOptions={{ mode: "all" }}
        onSubmit={(values) => {
          setAcceptedOrganization(values.organizationSlug);
        }}
        renderSummary={(payload) => <KitchenSinkSummary payload={payload} />}
        schema={SubmitKitchenSinkFormRequestSchema}
        showSummary
        stepper={{ steps }}
        testId="kitchen-sink-form"
        withSubmit
      />
      {acceptedOrganization ? (
        <Alert role="status">
          <AlertTitle>Policy accepted</AlertTitle>
          <AlertDescription>
            {acceptedOrganization} satisfies every kitchen-sink rule.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
