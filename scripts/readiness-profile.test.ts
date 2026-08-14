import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  getReadinessSummary,
  type ReadinessRequirement,
  readinessCategories,
  readinessProfile,
  readinessRequirements,
} from "../readiness/profile.js";
import { formatReadinessReport } from "../readiness/report.js";

const HTTPS_URL_PATTERN = /^https:\/\//;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PRODUCTION_SELF_CERTIFICATION_PATTERN =
  /is therefore.{0,8}production ready/i;
const GENERAL_AIP_NUMBERS = [
  1, 2, 3, 8, 9, 100, 111, 121, 122, 123, 124, 126, 127, 128, 129, 130, 131,
  132, 133, 134, 135, 136, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149,
  151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165,
  180, 181, 182, 185, 190, 191, 192, 193, 194, 200, 202, 203, 205, 210, 211,
  213, 214, 215, 216, 217, 231, 233, 234, 235, 236,
] as const;

describe("readiness scoring", () => {
  it("counts only applicable requirements in the percentage", () => {
    const requirements: ReadinessRequirement[] = [
      {
        category: "protobuf",
        evidence: {
          file: "conformance/example.test.ts",
          testName: "supports strings",
        },
        id: "protobuf.string",
        level: "required",
        status: "verified",
        title: "String fields",
      },
      {
        category: "protobuf",
        id: "protobuf.fixed32",
        level: "required",
        nextTest: "Round-trip fixed32 boundary values.",
        status: "missing",
        title: "Fixed-width integers",
      },
      {
        category: "aip",
        id: "aip.server-pagination",
        level: "required",
        rationale: "Server token behavior is outside a form library.",
        status: "external",
        title: "Server pagination tokens",
      },
      {
        category: "protobuf",
        id: "protobuf.services",
        level: "required",
        nextTest: "Generate a form workflow from an RPC descriptor.",
        rationale:
          "Service workflows are useful, but not part of the current release.",
        status: "deferred",
        title: "Service workflows",
      },
      {
        category: "protobuf",
        id: "protobuf.extensions",
        level: "required",
        nextTest: "Add extension-aware field discovery.",
        rationale:
          "The canonical provider does not discover proto2 extensions.",
        status: "unsupported",
        title: "Proto2 extensions",
      },
      {
        category: "protovalidate",
        id: "protovalidate.removed-option",
        level: "required",
        rationale: "The installed schema removed this option.",
        status: "superseded",
        title: "Removed option",
      },
    ];

    expect(getReadinessSummary(requirements)).toMatchObject({
      applicable: 4,
      deferred: 1,
      external: 1,
      missing: 1,
      percentage: 25,
      profileComplete: false,
      superseded: 1,
      unsupported: 1,
      verified: 1,
    });
  });

  it("publishes a unique, sourced production profile", () => {
    const ids = readinessRequirements.map((requirement) => requirement.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(readinessCategories.map((category) => category.id)).toEqual([
      "protobuf",
      "protovalidate",
      "cel",
      "aip",
      "production",
    ]);
    for (const category of readinessCategories) {
      expect(category.sourceUrl).toMatch(HTTPS_URL_PATTERN);
      expect(
        readinessRequirements.some(
          (requirement) => requirement.category === category.id
        )
      ).toBe(true);
    }
  });

  it("completes the capability profile without self-certifying release", () => {
    const summary = getReadinessSummary(readinessRequirements);

    expect(summary.percentage).toBe(100);
    expect(summary.profileComplete).toBe(true);
    expect(summary.deferred).toBe(0);
    expect(summary.unsupported).toBe(0);
    expect(
      readinessRequirements
        .filter((requirement) => requirement.status === "missing")
        .map((requirement) => requirement.id)
    ).toEqual([]);
    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
    const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(workflow).toContain("bun run ci:gate");
    expect(manifest.scripts?.["ci:gate"]).toContain("bun run readiness:gate");
    expect(manifest.scripts?.["readiness:gate"]).toContain(
      "--require-profile-complete"
    );
    expect(manifest.scripts?.["release:gate"]).toBe("bun run quality:gate");
  });

  it("rejects a profile gate with a recommended gap", () => {
    const requirements: ReadinessRequirement[] = [
      {
        category: "production",
        id: "production.recommended-gap",
        level: "recommended",
        nextTest: "Add the missing recommended evidence.",
        status: "missing",
        title: "Recommended evidence",
      },
    ];

    expect(getReadinessSummary(requirements).profileComplete).toBe(false);
  });

  it("backs every verified and optional capability with a discoverable test", () => {
    const repository = new URL("../", import.meta.url);
    const missingEvidence = readinessRequirements.flatMap((requirement) => {
      if (
        requirement.status !== "verified" &&
        requirement.status !== "optional"
      ) {
        return [];
      }
      const source = new URL(requirement.evidence.file, repository);
      if (!existsSync(source)) {
        return [`${requirement.id}: missing ${requirement.evidence.file}`];
      }
      return readFileSync(source, "utf8").includes(
        requirement.evidence.testName
      )
        ? []
        : [`${requirement.id}: missing test ${requirement.evidence.testName}`];
    });

    expect(missingEvidence).toEqual([]);
  });

  it("counts the kitchen-sink CEL contract as verified evidence", () => {
    expect(
      readinessRequirements.filter((requirement) =>
        ["cel.language-coverage", "cel.message-string"].includes(requirement.id)
      )
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          evidence: expect.objectContaining({
            file: "examples/kitchen-sink/kitchen-sink-cel.test.ts",
          }),
          id: "cel.message-string",
          status: "verified",
        }),
        expect.objectContaining({
          evidence: expect.objectContaining({
            file: "examples/kitchen-sink/kitchen-sink-cel.test.ts",
          }),
          id: "cel.language-coverage",
          status: "verified",
        }),
      ])
    );
  });

  it("tracks the complete form-relevant CEL baseline without unsupported rows", () => {
    const ids = new Map(
      readinessRequirements
        .filter((requirement) => requirement.category === "cel")
        .map((requirement) => [requirement.id, requirement.status])
    );
    const expectedIds = [
      "cel.syntax-literals",
      "cel.scalar-types",
      "cel.operators",
      "cel.conversions",
      "cel.lists-maps",
      "cel.protobuf-messages",
      "cel.enums",
      "cel.presence",
      "cel.comprehension-all",
      "cel.comprehension-exists",
      "cel.comprehension-exists-one",
      "cel.comprehension-filter",
      "cel.comprehension-map",
      "cel.strings",
      "cel.bytes",
      "cel.timestamps",
      "cel.durations",
      "cel.error-propagation",
      "cel.unknown-attributes",
      "cel.short-circuit",
      "cel.parse-plan-evaluate",
      "cel.compile-cache",
      "cel.protovalidate-message",
      "cel.protovalidate-field",
      "cel.protovalidate-predefined",
      "cel.ui-profile",
      "cel.ui-fail-closed",
      "cel.complexity-minimum",
      "cel.cost-limits",
      "cel.safe-failure",
    ];

    expect(expectedIds.filter((id) => !ids.has(id))).toEqual([]);
    expect(ids.get("cel.unknown-attributes")).toBe("verified");
    expect(ids.get("cel.cost-limits")).toBe("verified");
  });

  it("tracks every General AIP with an explicit readiness status", () => {
    const aipRequirements = readinessRequirements.filter(
      (requirement) => requirement.category === "aip"
    );
    const aipIds = aipRequirements
      .map((requirement) => requirement.id)
      .sort(
        (left, right) =>
          Number(left.replace("aip.", "")) - Number(right.replace("aip.", ""))
      );

    expect(aipIds).toEqual(
      GENERAL_AIP_NUMBERS.map((number) => `aip.${number}`)
    );
    for (const requirement of aipRequirements) {
      let expectedStandardState = "approved";
      if (requirement.id === "aip.162") {
        expectedStandardState = "draft";
      } else if (requirement.id === "aip.182") {
        expectedStandardState = "reviewing";
      }
      expect(requirement).toMatchObject({
        evidenceScope:
          requirement.status === "verified" ? "client" : "external",
        sourceUrl: `https://google.aip.dev/${requirement.id.replace("aip.", "")}`,
        standardState: expectedStandardState,
      });
    }
    expect(
      readinessCategories.find((category) => category.id === "aip")?.title
    ).toBe("AIP-aware client coverage");
    expect(
      readinessRequirements
        .filter(
          (requirement) =>
            requirement.category === "aip" &&
            ["external", "superseded"].includes(requirement.status)
        )
        .every((requirement) => Boolean(requirement.rationale))
    ).toBe(true);
  });

  it("reports the maintained v1 bridge separately from out-of-target proto2 features", () => {
    expect(
      readinessRequirements.find(
        (requirement) => requirement.id === "protobuf.v1-proto2-bridge"
      )
    ).toMatchObject({
      category: "protobuf",
      evidence: {
        file: "registry/base-nova/protoform/lib/protobuf-v1-bridge/provider.test.ts",
      },
      status: "optional",
    });
    expect(
      readinessRequirements.find(
        (requirement) => requirement.id === "protobuf.proto2-extensions"
      )
    ).toMatchObject({
      rationale: expect.stringContaining("outside the canonical v2 target"),
      status: "out-of-target",
    });

    expect(getReadinessSummary(readinessRequirements)).toMatchObject({
      applicable: 175,
      excluded: 16,
      optional: 1,
      outOfTarget: 1,
      percentage: 100,
      superseded: 1,
      verified: 175,
    });
    expect(
      readinessRequirements.find(
        (requirement) => requirement.id === "protobuf.editions-2024"
      )
    ).toMatchObject({
      evidence: {
        file: "conformance/protobuf-editions.conformance.test.ts",
        testName: "supports Edition 2024 visibility and option-only imports",
      },
      status: "verified",
    });
  });

  it("pins the upstream ranges that define the profile denominator", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8")
    ) as { dependencies?: Record<string, string> };

    expect(readinessProfile.version).toBe(3);
    expect(readinessProfile.reviewedAt).toMatch(ISO_DATE_PATTERN);
    for (const [name, range] of Object.entries(
      readinessProfile.dependencyRanges
    )) {
      expect(manifest.dependencies?.[name]).toBe(range);
    }
  });

  it("does not turn profile completeness into a release claim", () => {
    const guide = readFileSync(
      new URL(
        "../content/docs/(production)/production-readiness.mdx",
        import.meta.url
      ),
      "utf8"
    );

    expect(guide).toContain("does not certify production readiness");
    expect(guide).toContain("bun run release:gate");
    expect(guide).not.toMatch(PRODUCTION_SELF_CERTIFICATION_PATTERN);
  });

  it("formats a report with the score and next tests", () => {
    const report = formatReadinessReport(
      readinessRequirements,
      readinessCategories
    );
    const summary = getReadinessSummary(readinessRequirements);

    expect(report).toContain(
      `Overall: ${summary.percentage}% (${summary.verified}/${summary.applicable})`
    );
    expect(report).toContain(
      `Profile complete: ${summary.profileComplete ? "yes" : "no"}`
    );
    expect(report).toContain(
      "Release verification: not run (use `bun run release:gate`)"
    );
    expect(report).toContain(
      `Excluded: ${summary.external} external, ${summary.optional} optional, ${summary.outOfTarget} out of target, ${summary.superseded} superseded`
    );
    expect(report).toContain("Open work:");
    expect(report).toContain("Open work:\n- none");
    expect(report).not.toContain("aip.151:");
    expect(report).not.toContain("protobuf.services:");
    expect(report).toContain("Protobuf:");
  });
});
