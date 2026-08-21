import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const TanStackInteropDemo = lazy(async () => {
  const module = await import("../registry/base-nova/protoform/demo/catalog/tanstack-form");
  return { default: module.TanstackFormDemo };
});

export default function TanStackInteropDemoIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading TanStack Form interop demo" />}>
      <TanStackInteropDemo />
    </Suspense>
  );
}
