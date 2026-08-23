import { describe, expect } from "@rstest/core";

import { auditAutoFormConfigurations, formatAutoFormAuditReport } from "../audit";
import { createMockProvider } from "./test-utils";

describe("AutoForm audit reports", () => {
  test("emits deterministic JSON and SARIF from named audit targets", () => {
    const report = auditAutoFormConfigurations([
      {
        name: "settings-form",
        schema: createMockProvider([
          {
            fieldConfig: { customData: { dataProvider: "regions" } },
            key: "region",
            required: false,
            type: "string",
          },
        ]),
        source: "src/settings-form.tsx",
      },
    ]);

    expect(JSON.parse(formatAutoFormAuditReport(report, "json"))).toMatchObject({
      diagnostics: [{ code: "missing-data-provider", target: "settings-form" }],
      version: 1,
    });

    expect(JSON.parse(formatAutoFormAuditReport(report, "sarif"))).toMatchObject({
      runs: [
        {
          results: [
            {
              level: "error",
              locations: [{ physicalLocation: { artifactLocation: { uri: "src/settings-form.tsx" } } }],
              ruleId: "missing-data-provider",
            },
          ],
          tool: { driver: { name: "protoform" } },
        },
      ],
      version: "2.1.0",
    });
  });
});
