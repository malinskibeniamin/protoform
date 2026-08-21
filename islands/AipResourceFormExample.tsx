import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const AipResourceFormExample = lazy(async () => {
  const module = await import("../examples/learning/aip-resource-form");
  return { default: module.AipResourceFormExample };
});

export default function AipResourceFormExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading AIP resource example" />}>
      <AipResourceFormExample />
    </Suspense>
  );
}
