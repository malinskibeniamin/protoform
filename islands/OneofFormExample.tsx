import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const OneofFormExample = lazy(async () => {
  const module = await import("../examples/learning/oneof-form");
  return { default: module.default };
});

export default function OneofFormExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading oneof example" />}>
      <OneofFormExample />
    </Suspense>
  );
}
