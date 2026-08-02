import {
  getReadinessSummary,
  type ReadinessCategory,
  type ReadinessRequirement,
} from "./profile.js";

export function formatReadinessReport(
  requirements: readonly ReadinessRequirement[],
  categories: readonly ReadinessCategory[]
): string {
  const summary = getReadinessSummary(requirements);
  const requiredSummary = getReadinessSummary(
    requirements.filter((requirement) => requirement.level === "required")
  );
  const lines = [
    "Protoform production readiness",
    `Overall: ${summary.percentage}% (${summary.verified}/${summary.applicable})`,
    `Required: ${requiredSummary.percentage}% (${requiredSummary.verified}/${requiredSummary.applicable})`,
    `Production ready: ${summary.productionReady ? "yes" : "no"}`,
    `Release gate: ${summary.releaseReady ? "passing" : "failing"}`,
    `Open: ${summary.missing} missing, ${summary.deferred} deferred, ${summary.unsupported} unsupported`,
    `Excluded: ${summary.external} external, ${summary.optional} optional, ${summary.outOfTarget} out of target, ${summary.superseded} superseded`,
    "",
  ];

  for (const category of categories) {
    const categorySummary = getReadinessSummary(
      requirements.filter((requirement) => requirement.category === category.id)
    );
    lines.push(
      `${category.title}: ${categorySummary.percentage}% (${categorySummary.verified}/${categorySummary.applicable})`
    );
  }

  lines.push("", "Open work:");
  const initialLineCount = lines.length;
  for (const requirement of requirements) {
    if (
      requirement.status === "missing" ||
      requirement.status === "deferred" ||
      requirement.status === "unsupported"
    ) {
      lines.push(
        `- ${requirement.id}: [${requirement.status}] ${requirement.nextTest}`
      );
    }
  }
  if (lines.length === initialLineCount) {
    lines.push("- none");
  }

  return lines.join("\n");
}
