import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const ReadinessDashboard = lazy(async () => {
  const module = await import("../examples/readiness/readiness-dashboard");
  return { default: module.ReadinessDashboard };
});

export default function ReadinessDashboardIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading readiness dashboard" />}>
      <ReadinessDashboard />
    </Suspense>
  );
}
