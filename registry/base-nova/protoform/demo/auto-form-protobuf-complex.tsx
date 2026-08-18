"use client";

import { toJsonString } from "@bufbuild/protobuf";
import { useState } from "react";

import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";
import "@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations";

import {
  type AutoFormExample,
  AutoFormExampleSchema,
} from "@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb";

const defaultValues = {
  accessTier: 3,
  accountBalance: 2500.5,
  age: 34,
  betaTester: true,
  bio: "A protobuf-backed form with Buf reflection and Protovalidate.",
  bonusPoints: 42,
  createdAt: "2026-03-17T09:00",
  dashboardBlocks: ["overview", "alerts"],
  employeeNumber: "4001",
  expiresAt: "2026-04-17T09:00",
  featuredValue: "feature-rollout",
  homepageUrl: "https://protoform.com",
  isEnabled: true,
  labels: [
    { key: "team", value: "frontend" },
    { key: "env", value: "demo" },
  ],
  loginCount: 12,
  luckyNumbers: [7, 13],
  maximumThreshold: 10,
  middleName: "UI",
  minimumThreshold: 5,
  nickname: "Harbor",
  officeLocations: [
    {
      key: "hq",
      value: {
        city: "San Francisco",
        country: 1,
        lineOne: "500 Harbor Way",
        postalCode: "94107",
        state: "CA",
      },
    },
  ],
  preferences: {
    density: "comfortable",
    theme: "dark",
  },
  preferredContact: {
    case: "preferredEmail",
    value: "forms@protoform.com",
  },
  previousAddresses: [
    {
      city: "Oakland",
      country: 1,
      lineOne: "250 Redwood Ave",
      postalCode: "94607",
      state: "CA",
    },
  ],
  primaryEmail: "forms@protoform.com",
  profileScore: 0.92,
  reminderInterval: "300s",
  reputationDelta: 4,
  resourceId: "123e4567-e89b-12d3-a456-426614174000",
  settings: {
    enableSupportMode: true,
    escalationLevel: 2,
    nestedSettings: [
      {
        key: "default",
        value: {
          label: "Primary runbook",
          scheduledFor: "2026-03-18T10:00",
        },
      },
    ],
    notificationChannels: [1, 3],
  },
  shippingAddress: {
    city: "San Francisco",
    country: 1,
    lineOne: "500 Harbor Way",
    postalCode: "94107",
    state: "CA",
  },
  storageQuotaBytes: "4096",
  tags: ["forms", "protobuf"],
  username: "protoform_admin",
  writablePaths: ["profile", "preferences"],
};

export function AutoFormProtobufComplexDemo() {
  const [submittedValue, setSubmittedValue] = useState<string>();

  return (
    <div className="space-y-4">
      <AutoForm<AutoFormExample>
        defaultMode="simple"
        defaultValues={defaultValues}
        fieldConfig={{
          accountBalance: {
            description: "Currency-style formatting uses InputGroup affordances instead of a raw number input.",
          },
          reminderInterval: {
            description: "Protovalidate uses protobuf duration JSON syntax like 300s or 1.5s.",
          },
          "settings.nestedSettings": {
            description: "Compact key/value rows keep nested support settings easier to scan.",
          },
          writablePaths: {
            description: "Field masks render as a guided paths editor.",
          },
        }}
        formOptions={{ mode: "all" }}
        modes={["simple", "advanced", "json"]}
        onSubmit={(values) => {
          setSubmittedValue(toJsonString(AutoFormExampleSchema, values, { prettySpaces: 2 }));
        }}
        schema={AutoFormExampleSchema}
        showSummary
        withSubmit
      />

      {submittedValue ? (
        <pre className="overflow-auto rounded-md border bg-muted p-4 text-xs">{submittedValue}</pre>
      ) : null}
    </div>
  );
}
