import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const TanStackFormExample = lazy(async () => {
  const module = await import("../examples/tanstack/tanstack-form");
  return { default: module.TanStackFormExample };
});

export default function TanStackFormExampleIsland() {
  return (
    <Suspense
      fallback={<ExampleLoading label="Loading TanStack Form example" />}
    >
      <TanStackFormExample />
    </Suspense>
  );
}
