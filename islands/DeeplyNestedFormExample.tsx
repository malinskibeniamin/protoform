import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const DeeplyNestedFormExample = lazy(async () => {
  const module = await import("../examples/nested/deeply-nested-form");
  return { default: module.default };
});

export default function DeeplyNestedFormExampleIsland() {
  return (
    <Suspense
      fallback={<ExampleLoading label="Loading deeply nested example" />}
    >
      <DeeplyNestedFormExample />
    </Suspense>
  );
}
