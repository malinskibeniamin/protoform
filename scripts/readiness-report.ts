import {
  getReadinessSummary,
  readinessCategories,
  readinessProfile,
  readinessRequirements,
} from "../readiness/profile.js";
import { formatReadinessReport } from "../readiness/report.js";

const asJson = process.argv.includes("--json");
const requireReady = process.argv.includes("--require-ready");
const requireReleaseReady = process.argv.includes("--require-release-ready");
const summary = getReadinessSummary(readinessRequirements);

if (asJson) {
  console.log(
    JSON.stringify(
      {
        categories: readinessCategories.map((category) => ({
          ...category,
          summary: getReadinessSummary(
            readinessRequirements.filter(
              (requirement) => requirement.category === category.id
            )
          ),
        })),
        profile: readinessProfile,
        requirements: readinessRequirements,
        summary,
      },
      null,
      2
    )
  );
} else {
  console.log(
    formatReadinessReport(readinessRequirements, readinessCategories)
  );
}

if (requireReady && !summary.productionReady) {
  process.exitCode = 1;
}

if (requireReleaseReady && !summary.releaseReady) {
  process.exitCode = 1;
}
