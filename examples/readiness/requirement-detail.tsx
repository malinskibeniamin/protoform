import type { ReadinessRequirement } from "../../readiness/profile.js";

export function RequirementDetail({ requirement }: { requirement: ReadinessRequirement }) {
  if (requirement.status === "verified" || requirement.status === "optional") {
    return (
      <p className="m-0 text-muted-foreground text-xs">
        Evidence: <code className="break-all">{requirement.evidence.file}</code> · {requirement.evidence.testName}
      </p>
    );
  }
  if (requirement.status === "missing") {
    return (
      <p className="m-0 text-sm">
        <strong>Next test:</strong> {requirement.nextTest}
      </p>
    );
  }
  if (requirement.status === "deferred" || requirement.status === "unsupported") {
    return (
      <div className="space-y-2 text-sm">
        <p className="m-0 text-muted-foreground">{requirement.rationale}</p>
        <p className="m-0">
          <strong>Next test:</strong> {requirement.nextTest}
        </p>
      </div>
    );
  }
  return <p className="m-0 text-muted-foreground text-sm">{requirement.rationale}</p>;
}
