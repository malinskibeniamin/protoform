import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const CapabilityDemo = lazy(async () => {
  const module = await import("../examples/catalog/capability-demo");
  return { default: module.CapabilityDemo };
});

export default function CapabilityDemoIsland({ demoId }: { demoId: string }) {
  return (
    <Suspense fallback={<ExampleLoading label="Loading capability demo" />}>
      <CapabilityDemo demoId={demoId} />
    </Suspense>
  );
}
