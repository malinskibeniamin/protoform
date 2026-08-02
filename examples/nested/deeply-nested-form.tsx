"use client";

import { create } from "@bufbuild/protobuf";

import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";

import {
  type SubmitDeeplyNestedFormRequest,
  SubmitDeeplyNestedFormRequestSchema,
} from "../gen/protoform/examples/v1/forms_pb.js";

export const client = "only";

const defaultValues = create(SubmitDeeplyNestedFormRequestSchema, {
  architecture: {
    networks: [
      {
        name: "private-core",
        subnets: [
          {
            cidr: "10.42.0.0/24",
            name: "application",
            routes: [
              {
                destinationCidr: "0.0.0.0/0",
                metadata: { managedBy: "network-team" },
                nextHop: "egress-gateway",
              },
            ],
          },
        ],
      },
    ],
    workloads: [
      {
        containers: [
          {
            containerImage: "registry.example.com/platform/api:v3",
            environment: {
              LOG_LEVEL: "info",
              REGION: "eu-west1",
            },
            name: "api",
            ports: [
              {
                containerPort: 8080,
                name: "http",
                protocol: "TCP",
              },
            ],
          },
        ],
        healthCheck: {
          case: "http",
          value: { path: "/ready", port: 8080 },
        },
        name: "control-plane",
        resources: {
          autoscaling: {
            maximumReplicas: 20,
            minimumReplicas: 3,
            targetCpuUtilization: 65,
          },
          cpuCores: 2,
          memoryMebibytes: 2048,
        },
      },
    ],
  },
  delivery: {
    stages: [
      {
        approvals: [{ group: "platform-owners", requiredApprovers: 2 }],
        name: "production",
        observability: {
          alertChannels: ["platform-on-call"],
          dashboards: {
            service: "https://observability.example.com/d/api",
          },
        },
        rolloutStrategy: {
          case: "canary",
          value: { trafficPercentages: [5, 25, 50, 100] },
        },
      },
    ],
  },
  extensionPolicy: {
    audit: { retentionDays: 365 },
    featureGates: ["adaptive-scaling", "regional-failover"],
  },
  labels: { owner: "platform-team", tier: "critical" },
  organization: {
    governance: {
      escalationChain: [
        { email: "on-call@example.com", name: "Platform on-call" },
      ],
      primaryOwner: {
        email: "owner@example.com",
        name: "Ada Lovelace",
      },
    },
    organizationSlug: "northstar-platform",
  },
});

export default function DeeplyNestedFormExample() {
  return (
    <AutoForm<SubmitDeeplyNestedFormRequest>
      defaultValues={defaultValues}
      schema={SubmitDeeplyNestedFormRequestSchema}
      testId="deeply-nested-form"
    />
  );
}
