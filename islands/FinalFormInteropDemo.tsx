import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const FinalFormInteropDemo = lazy(async () => {
  const module = await import("../registry/base-nova/protoform/demo/catalog/final-form");
  return { default: module.FinalFormDemo };
});

export default function FinalFormInteropDemoIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading Final Form interop demo" />}>
      <FinalFormInteropDemo />
    </Suspense>
  );
}
