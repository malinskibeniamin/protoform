import { Badge } from "@/registry/base-nova/protoform/components/badge";
import type { ReadinessRequirement } from "../../readiness/profile.js";

export function RequirementStatus({ status }: { status: ReadinessRequirement["status"] }) {
  if (status === "verified") {
    return <Badge variant="success-inverted">Verified</Badge>;
  }
  if (status === "optional") {
    return <Badge variant="success-outline">Verified optional</Badge>;
  }
  if (status === "missing") {
    return <Badge variant="warning-inverted">Gap</Badge>;
  }
  if (status === "deferred") {
    return <Badge variant="info-inverted">Deferred</Badge>;
  }
  if (status === "unsupported") {
    return <Badge variant="destructive-inverted">Unsupported</Badge>;
  }
  if (status === "external") {
    return <Badge variant="neutral-inverted">External</Badge>;
  }
  if (status === "out-of-target") {
    return <Badge variant="neutral-outline">Out of target</Badge>;
  }
  return <Badge variant="disabled-inverted">Superseded</Badge>;
}
